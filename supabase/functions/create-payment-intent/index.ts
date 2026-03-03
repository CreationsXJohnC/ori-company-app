/**
 * ORI APP — Supabase Edge Function: create-payment-intent
 * Creates a Stripe PaymentIntent server-side for merch checkout.
 * Called by the mobile client via lib/stripe.ts → invokeFunction().
 *
 * Environment variables (set in Supabase Dashboard → Settings → Edge Functions):
 *   STRIPE_SECRET_KEY   — sk_live_... or sk_test_...
 *   SUPABASE_URL        — auto-injected
 *   SUPABASE_SERVICE_ROLE_KEY — auto-injected
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-name',
};

serve(async (req: Request) => {
  // Handle CORS preflight
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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Parse body ────────────────────────────────────────────────────────────
    const { orderId, amount, currency = 'usd' } = await req.json();

    if (!orderId || !amount || typeof amount !== 'number' || amount < 50) {
      return new Response(JSON.stringify({ error: 'Invalid request: orderId and amount (cents, min $0.50) required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the order belongs to this user (service role to bypass RLS for lookup)
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: order, error: orderError } = await serviceSupabase
      .from('orders')
      .select('id, user_id, total, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (order.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (order.status !== 'pending') {
      return new Response(JSON.stringify({ error: 'Order already processed' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Create Stripe PaymentIntent ───────────────────────────────────────────
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-12-18.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // must be integer cents
      currency,
      metadata: {
        order_id: orderId,
        user_id: user.id,
      },
      automatic_payment_methods: { enabled: true },
      description: `Ori Clothing & Co — Order #${orderId.slice(-8).toUpperCase()}`,
    });

    // Store payment intent ID on the order
    await serviceSupabase
      .from('orders')
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq('id', orderId);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: unknown) {
    console.error('[create-payment-intent] Error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
