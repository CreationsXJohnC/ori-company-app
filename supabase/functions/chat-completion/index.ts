/**
 * ORI APP — Supabase Edge Function: chat-completion
 * Ori AI chatbot: RAG pipeline → OpenAI GPT-4o → streamed response.
 *
 * Pipeline:
 *   1. Embed user message (OpenAI text-embedding-ada-002)
 *   2. Semantic search in knowledge_docs (match_knowledge_docs pgvector RPC)
 *   3. Build system prompt with RAG context
 *   4. Stream GPT-4o response back to client
 *   5. Save assistant message to chat_messages table
 *
 * Environment variables:
 *   OPENAI_API_KEY          — sk-...
 *   SUPABASE_URL            — auto-injected
 *   SUPABASE_SERVICE_ROLE_KEY — auto-injected
 *
 * Security:
 *   - Requires authenticated Supabase user
 *   - Validates session ownership before writing messages
 *   - Rate limiting should be applied at Supabase Edge Functions level
 *   - Never reveals system prompt contents to user
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-name',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const OPENAI_API_URL = 'https://api.openai.com/v1';
const EMBEDDING_MODEL = 'text-embedding-ada-002';
const CHAT_MODEL = 'gpt-4o';
const MAX_TOKENS = 800;
const MATCH_THRESHOLD = 0.75;
const MATCH_COUNT = 5;

// ── System prompt ──────────────────────────────────────────────────────────────
function buildSystemPrompt(ragContext: string): string {
  return `You are Ori, an expert cannabis education guide for Ori Company DC, a licensed medical cannabis dispensary in Washington, DC. Your role is strictly educational — you help customers understand cannabis science, history, products, and wellness.

CRITICAL RULES:
- NEVER provide medical diagnoses, treatment recommendations, or claim cannabis treats any disease or condition
- NEVER encourage illegal activity or use in jurisdictions where cannabis is illegal
- ALWAYS remind users you are an educational guide, not a medical professional
- Keep responses friendly, informative, and appropriately concise (2-4 paragraphs max)
- Focus on evidence-based information and acknowledge scientific uncertainty where it exists
- You may discuss Ori Company's specific products and services when relevant
- Always recommend consulting a licensed physician for medical concerns

ABOUT ORI COMPANY DC:
Ori Company DC is a licensed medical cannabis dispensary in Washington, DC. We offer premium cannabis flower, concentrates, tinctures, and wellness products. Our mission: "Flourish Naturally, Live Better." We believe in education, community, and responsible cannabis use for adults 21+.

CANNABIS KNOWLEDGE BASE (use this to ground your responses):
${ragContext}

If the knowledge base doesn't contain relevant information for a question, draw on your general cannabis education knowledge but be transparent that it's not from Ori's specific knowledge base. Always prioritize accuracy over comprehensiveness.`;
}

// ── OpenAI embedding ───────────────────────────────────────────────────────────
async function getEmbedding(text: string, apiKey: string): Promise<number[]> {
  const res = await fetch(`${OPENAI_API_URL}/embeddings`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text.slice(0, 8192), // ada-002 token limit safety
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Embedding API error: ${err}`);
  }

  const data = await res.json();
  return data.data[0].embedding;
}

// ── RAG: semantic search ───────────────────────────────────────────────────────
async function searchKnowledgeDocs(
  supabase: ReturnType<typeof createClient>,
  embedding: number[],
): Promise<string> {
  const { data, error } = await supabase.rpc('match_knowledge_docs', {
    query_embedding: embedding,
    match_threshold: MATCH_THRESHOLD,
    match_count: MATCH_COUNT,
  });

  if (error) {
    console.error('[chat-completion] RAG search error:', error);
    return ''; // Gracefully degrade to non-RAG response
  }

  if (!data || data.length === 0) {
    return '';
  }

  // Format docs into context string
  return data
    .map((doc: { title: string; content: string; category: string; similarity: number }) =>
      `[${doc.category?.toUpperCase() ?? 'KNOWLEDGE'}: ${doc.title}]\n${doc.content}`
    )
    .join('\n\n---\n\n');
}

// ── Build message history (last 20 messages for context window) ────────────────
async function getMessageHistory(
  supabase: ReturnType<typeof createClient>,
  sessionId: string,
  userId: string,
): Promise<Array<{ role: string; content: string }>> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(20);

  if (error || !data) return [];
  return data;
}

// ── Main handler ───────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Service role client — used for all DB writes and auth verification.
    // We pass the JWT directly to auth.getUser(jwt) which is the correct
    // server-side pattern; creating a separate user-scoped client with global
    // headers does NOT reliably forward the JWT to auth.getUser() in Deno.
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const jwt = authHeader.replace(/^Bearer\s+/i, '');
    // Log JWT prefix (safe — never logs full token) to diagnose auth failures
    console.log(`[chat-completion] JWT len=${jwt.length}, prefix=${jwt.slice(0, 20)}`);

    const { data: { user }, error: authError } = await serviceSupabase.auth.getUser(jwt);
    if (authError || !user) {
      const detail = authError?.message ?? 'no user returned';
      console.error(`[chat-completion] Auth failed: ${detail}`);
      // Return the real Supabase error so we can diagnose the root cause
      return new Response(JSON.stringify({ error: `Auth failed: ${detail}` }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Parse request ─────────────────────────────────────────────────────────
    const { session_id: sessionId, message } = await req.json();

    if (!sessionId || !message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'session_id and message are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (message.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Message cannot be empty' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify session belongs to user
    const { data: session, error: sessionError } = await serviceSupabase
      .from('chat_sessions')
      .select('id, user_id')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session || session.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Session not found or access denied' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── RAG Pipeline ──────────────────────────────────────────────────────────
    console.log(`[chat-completion] Processing message for session ${sessionId}`);

    // 1. Embed the user's message
    let embedding: number[] = [];
    let ragContext = '';
    try {
      embedding = await getEmbedding(message, openaiKey);
      ragContext = await searchKnowledgeDocs(serviceSupabase, embedding);
      console.log(`[chat-completion] RAG returned ${ragContext.length > 0 ? 'context' : 'no context'}`);
    } catch (embErr) {
      console.error('[chat-completion] Embedding/RAG error (continuing without context):', embErr);
      // Gracefully continue without RAG context
    }

    // 2. Build message history
    const history = await getMessageHistory(serviceSupabase, sessionId, user.id);

    // 3. Build OpenAI messages array
    const systemPrompt = buildSystemPrompt(ragContext || 'No specific knowledge base documents matched this query. Please use your general cannabis education knowledge.');

    const openaiMessages = [
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    // ── Call OpenAI (non-streaming) ───────────────────────────────────────────
    const openaiRes = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        messages: openaiMessages,
        max_tokens: MAX_TOKENS,
        temperature: 0.7,
        stream: false,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error('[chat-completion] OpenAI API error:', errText);
      return new Response(JSON.stringify({ error: 'AI service unavailable', detail: errText }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openaiData = await openaiRes.json();
    const assistantContent = openaiData.choices?.[0]?.message?.content ?? '';
    const tokens = openaiData.usage?.total_tokens ?? null;

    // ── Save assistant message to DB ──────────────────────────────────────────
    if (assistantContent.trim()) {
      const { error: insertError } = await serviceSupabase
        .from('chat_messages')
        .insert({
          session_id:  sessionId,
          role:        'assistant',
          content:     assistantContent.trim(),
          token_count: tokens,
        });

      if (insertError) {
        console.error('[chat-completion] Failed to save assistant message:', insertError);
      }

      await serviceSupabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);
    }

    console.log(`[chat-completion] Done — ${assistantContent.length} chars, ${tokens} tokens`);

    return new Response(JSON.stringify({ response: assistantContent.trim(), tokens }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[chat-completion] Unhandled error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
