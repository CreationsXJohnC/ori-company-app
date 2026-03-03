/**
 * ORI APP — Ori AI ChatBot
 * Cannabis education AI with RAG knowledge base. Educational use only.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MessageCircle,
  Send,
  Plus,
  AlertCircle,
  ChevronDown,
  Bot,
  User,
  X,
  Info,
} from 'lucide-react-native';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/theme';
import {
  useCreateChatSession,
  useChatMessages,
  useSendMessage,
} from '@/hooks/useChat';
import { useAuthStore } from '@/stores/authStore';
import { COMPLIANCE } from '@/utils/constants';
import { trackScreenView } from '@/lib/analytics';
import { formatRelativeTime } from '@/utils/formatting';
import type { ChatMessage } from '@/types';

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  const { colors, gold } = useTheme();
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const anims = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      )
    );
    Animated.parallel(anims).start();
    return () => anims.forEach((a) => a.stop());
  }, []);

  return (
    <View
      style={{
        flexDirection:   'row',
        alignItems:      'center',
        gap:             12,
        paddingVertical: 8,
        paddingLeft:     4,
      }}
    >
      <View
        style={{
          width:           34,
          height:          34,
          borderRadius:    17,
          backgroundColor: `${gold[400]}22`,
          alignItems:      'center',
          justifyContent:  'center',
        }}
      >
        <Bot size={18} color={gold[400]} />
      </View>
      <View
        style={{
          flexDirection:   'row',
          gap:             5,
          backgroundColor: colors.surface,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius:    18,
          borderBottomLeftRadius: 4,
          borderWidth:     1,
          borderColor:     colors.border,
        }}
      >
        {dots.map((dot, i) => (
          <Animated.View
            key={i}
            style={{
              width:           7,
              height:          7,
              borderRadius:    3.5,
              backgroundColor: gold[400],
              opacity:         dot,
            }}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({ message }: { message: ChatMessage }) {
  const { colors, fontFamilies, gold, forest } = useTheme();
  const isUser = message.role === 'user';

  return (
    <View
      style={{
        flexDirection:  'row',
        gap:            10,
        alignItems:     'flex-end',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        paddingVertical: 4,
      }}
    >
      {!isUser && (
        <View
          style={{
            width:           34,
            height:          34,
            borderRadius:    17,
            backgroundColor: `${gold[400]}22`,
            alignItems:      'center',
            justifyContent:  'center',
            flexShrink:      0,
          }}
        >
          <Bot size={18} color={gold[400]} />
        </View>
      )}

      <View
        style={{
          maxWidth:        '78%',
          gap:             4,
          alignItems:      isUser ? 'flex-end' : 'flex-start',
        }}
      >
        <View
          style={{
            backgroundColor:     isUser ? gold[400] : colors.surface,
            paddingHorizontal:   16,
            paddingVertical:     12,
            borderRadius:        18,
            borderBottomLeftRadius:  isUser ? 18 : 4,
            borderBottomRightRadius: isUser ? 4  : 18,
            borderWidth:         isUser ? 0 : 1,
            borderColor:         colors.border,
          }}
        >
          <Text
            style={{
              fontFamily: fontFamilies.bodyRegular,
              fontSize:   15,
              lineHeight: 22,
              color:      isUser ? '#ffffff' : colors.textPrimary,
            }}
          >
            {message.content}
          </Text>
        </View>
        <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 10, color: colors.textTertiary, paddingHorizontal: 4 }}>
          {formatRelativeTime(message.created_at)}
        </Text>
      </View>

      {isUser && (
        <View
          style={{
            width:  34,
            height: 34,
            borderRadius: 17,
            backgroundColor: colors.surfaceAlt,
            alignItems:  'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <User size={18} color={colors.textSecondary} />
        </View>
      )}
    </View>
  );
}

// ─── Disclaimer Banner ────────────────────────────────────────────────────────
function DisclaimerBanner({ onDismiss }: { onDismiss: () => void }) {
  const { colors, fontFamilies, gold } = useTheme();

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom:     8,
        backgroundColor:  `${gold[400]}12`,
        borderRadius:     12,
        padding:          12,
        flexDirection:    'row',
        alignItems:       'flex-start',
        gap:              8,
        borderWidth:      1,
        borderColor:      `${gold[400]}30`,
      }}
    >
      <Info size={15} color={gold[400]} style={{ marginTop: 1 }} />
      <Text style={{ flex: 1, fontFamily: fontFamilies.bodyRegular, fontSize: 12, color: gold[400], lineHeight: 18 }}>
        {COMPLIANCE.educationalDisclaimer}
      </Text>
      <TouchableOpacity onPress={onDismiss} hitSlop={8}>
        <X size={14} color={gold[400]} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Suggested Prompts ────────────────────────────────────────────────────────
const SUGGESTED_PROMPTS = [
  'What is the endocannabinoid system?',
  'Explain the difference between indica and sativa',
  'What are terpenes and why do they matter?',
  'How does CBD differ from THC?',
  'What are some beginner-friendly cannabis options?',
  'Tell me about cannabis history in DC',
];

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const { colors, fontFamilies, gold, forest } = useTheme();
  const toast   = useToast();
  const user    = useAuthStore((s) => s.user);
  const listRef = useRef<FlatList>(null);

  const [sessionId, setSessionId]               = useState<string | null>(null);
  const [inputText, setInputText]               = useState('');
  const [showDisclaimer, setShowDisclaimer]     = useState(true);
  const [assistantContent, setAssistantContent] = useState<string>('');

  const { data: messages, isLoading: messagesLoading } = useChatMessages(sessionId);
  const { mutateAsync: createSession, isPending: creatingSession } = useCreateChatSession();

  const { sendMessage, isStreaming } = useSendMessage({
    sessionId:  sessionId ?? '',
    onComplete: (text) => {
      setAssistantContent('');
    },
    onError: (err) => {
      toast.error('Ori AI Error', err.message ?? 'Failed to get response. Please try again.');
    },
  });

  useEffect(() => {
    trackScreenView('Chat');
    // Auto-create a session on first mount
    handleNewSession();
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleNewSession = useCallback(async () => {
    if (!user) return;
    try {
      const session = await createSession(undefined);
      setSessionId(session.id);
      setInputText('');
    } catch (err: any) {
      toast.error('Could not start chat', err.message);
    }
  }, [user, createSession, toast]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || !sessionId || isStreaming) return;
    setInputText('');
    await sendMessage(text);
  }, [inputText, sessionId, isStreaming, sendMessage]);

  const handleSuggestedPrompt = useCallback((prompt: string) => {
    if (!sessionId || isStreaming) return;
    sendMessage(prompt);
  }, [sessionId, isStreaming, sendMessage]);

  const allMessages = messages ?? [];
  const showSuggestions = allMessages.length === 0 && !messagesLoading;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >

        {/* ── Header ───────────────────────────────────────── */}
        <View
          style={{
            flexDirection:     'row',
            alignItems:        'center',
            justifyContent:    'space-between',
            paddingHorizontal: 20,
            paddingVertical:   14,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width:           40,
                height:          40,
                borderRadius:    20,
                backgroundColor: `${gold[400]}22`,
                alignItems:      'center',
                justifyContent:  'center',
              }}
            >
              <Bot size={22} color={gold[400]} />
            </View>
            <View>
              <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 20, color: colors.textPrimary }}>Ori</Text>
              <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 12, color: colors.textSecondary }}>
                Cannabis Education Guide
              </Text>
            </View>
          </View>

          {/* New Chat button */}
          <TouchableOpacity
            onPress={handleNewSession}
            disabled={creatingSession}
            style={{
              flexDirection:   'row',
              alignItems:      'center',
              gap:             6,
              paddingHorizontal: 12,
              paddingVertical:   7,
              borderRadius:    20,
              backgroundColor: colors.surfaceAlt,
              borderWidth:     1,
              borderColor:     colors.border,
            }}
          >
            <Plus size={14} color={colors.textSecondary} />
            <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 12, color: colors.textSecondary }}>
              New Chat
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Disclaimer ───────────────────────────────────── */}
        {showDisclaimer && <DisclaimerBanner onDismiss={() => setShowDisclaimer(false)} />}

        {/* ── Messages ─────────────────────────────────────── */}
        {messagesLoading ? (
          <LoadingSpinner full />
        ) : (
          <FlatList
            ref={listRef}
            data={allMessages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              padding:     16,
              gap:         4,
              flexGrow:    1,
              paddingBottom: 12,
            }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              showSuggestions ? (
                <View style={{ gap: 20, paddingBottom: 24 }}>
                  {/* Welcome message */}
                  <View style={{ alignItems: 'center', gap: 16, paddingTop: 24 }}>
                    <View
                      style={{
                        width:           72,
                        height:          72,
                        borderRadius:    36,
                        backgroundColor: `${gold[400]}20`,
                        borderWidth:     2,
                        borderColor:     `${gold[400]}44`,
                        alignItems:      'center',
                        justifyContent:  'center',
                      }}
                    >
                      <Bot size={36} color={gold[400]} />
                    </View>
                    <View style={{ alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 22, color: colors.textPrimary, textAlign: 'center' }}>
                        Hello, I'm Ori
                      </Text>
                      <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, maxWidth: 280 }}>
                        Your cannabis education guide. Ask me about cannabis history, science, terpenes, cannabinoids, and more.
                      </Text>
                    </View>
                  </View>

                  {/* Suggested prompts */}
                  <View style={{ gap: 10 }}>
                    <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 13, color: colors.textTertiary, letterSpacing: 0.5 }}>
                      SUGGESTED TOPICS
                    </Text>
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <TouchableOpacity
                        key={prompt}
                        onPress={() => handleSuggestedPrompt(prompt)}
                        style={{
                          backgroundColor:  colors.surface,
                          borderWidth:      1,
                          borderColor:      colors.border,
                          borderRadius:     14,
                          padding:          14,
                          flexDirection:    'row',
                          alignItems:       'center',
                          justifyContent:   'space-between',
                          gap:              10,
                        }}
                      >
                        <Text style={{ flex: 1, fontFamily: fontFamilies.bodyRegular, fontSize: 14, color: colors.textPrimary, lineHeight: 20 }}>
                          {prompt}
                        </Text>
                        <Send size={14} color={gold[400]} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : null
            }
            renderItem={({ item }) => <MessageBubble message={item} />}
            ListFooterComponent={isStreaming ? <TypingIndicator /> : null}
          />
        )}

        {/* ── Input Bar ────────────────────────────────────── */}
        <View
          style={{
            padding:         16,
            paddingBottom:   Platform.OS === 'ios' ? 24 : 16,
            borderTopWidth:  1,
            borderTopColor:  colors.border,
            backgroundColor: colors.background,
            gap:             8,
          }}
        >
          {/* Educational disclaimer — compact */}
          {!showDisclaimer && (
            <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 10, color: colors.textTertiary, textAlign: 'center' }}>
              For educational purposes only · Not medical advice · Consult your physician
            </Text>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
            <View
              style={{
                flex:            1,
                backgroundColor: colors.surfaceAlt,
                borderRadius:    22,
                borderWidth:     1.5,
                borderColor:     colors.border,
                paddingHorizontal: 16,
                paddingVertical:   10,
                minHeight:       44,
                maxHeight:       120,
              }}
            >
              <TextInput
                style={{
                  fontFamily:   fontFamilies.bodyRegular,
                  fontSize:     15,
                  color:        colors.textPrimary,
                  lineHeight:   22,
                  outlineWidth: 0,
                } as any}
                placeholder="Ask Ori about cannabis…"
                placeholderTextColor={colors.textTertiary}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={1000}
                returnKeyType="send"
                onSubmitEditing={handleSend}
                editable={!isStreaming}
                onKeyPress={(e: any) => {
                  if (Platform.OS === 'web' && e.nativeEvent?.key === 'Enter' && !e.nativeEvent?.shiftKey) {
                    e.preventDefault?.();
                    handleSend();
                  }
                }}
              />
            </View>

            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim() || isStreaming}
              style={{
                width:           48,
                height:          48,
                borderRadius:    24,
                backgroundColor: inputText.trim() && !isStreaming ? gold[400] : colors.surfaceAlt,
                alignItems:      'center',
                justifyContent:  'center',
                borderWidth:     1,
                borderColor:     inputText.trim() && !isStreaming ? gold[400] : colors.border,
              }}
            >
              <Send
                size={20}
                color={inputText.trim() && !isStreaming ? '#ffffff' : colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
