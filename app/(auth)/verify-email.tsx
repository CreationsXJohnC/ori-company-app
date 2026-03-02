/**
 * ORI APP — Email Verification Screen
 * Shown after sign-up. Prompts user to check their inbox.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/theme';
import { supabase } from '@/lib/supabase';

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const router = useRouter();
  const { fontFamilies, gold, forest, warm } = useTheme();
  const toast  = useToast();
  const [resending, setResending] = useState(false);
  const [resent, setResent]       = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type:  'signup',
        email: email ?? '',
        options: { emailRedirectTo: 'oriapp://verify-email' },
      });
      if (error) throw error;
      setResent(true);
      toast.success('Email Sent', 'Check your inbox for the verification link.');
    } catch (err: any) {
      toast.error('Failed to Resend', err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: forest[950] }}>
      <View style={{ flex: 1, padding: 28, alignItems: 'center', justifyContent: 'center', gap: 32 }}>

        {/* Icon */}
        <View
          style={{
            width:           100,
            height:          100,
            borderRadius:    50,
            backgroundColor: `${gold[500]}18`,
            borderWidth:     2,
            borderColor:     `${gold[500]}44`,
            alignItems:      'center',
            justifyContent:  'center',
          }}
        >
          <Mail size={44} color={gold[500]} />
        </View>

        {/* Copy */}
        <View style={{ alignItems: 'center', gap: 12 }}>
          <Text
            style={{
              fontFamily:  fontFamilies.headingBold,
              fontSize:    28,
              color:       warm[100],
              textAlign:   'center',
              letterSpacing: -0.5,
            }}
          >
            Check Your Email
          </Text>
          <Text
            style={{
              fontFamily: fontFamilies.bodyRegular,
              fontSize:   16,
              color:      '#8FAF96',
              textAlign:  'center',
              lineHeight: 24,
            }}
          >
            We sent a verification link to
          </Text>
          <Text
            style={{
              fontFamily: fontFamilies.bodySemiBold,
              fontSize:   16,
              color:      gold[400],
              textAlign:  'center',
            }}
          >
            {email}
          </Text>
          <Text
            style={{
              fontFamily: fontFamilies.bodyRegular,
              fontSize:   14,
              color:      '#5F8A6A',
              textAlign:  'center',
              lineHeight: 21,
              marginTop:  8,
            }}
          >
            Click the link in the email to verify your account.
            Your confirmation email includes our 21+ compliance statement.
          </Text>
        </View>

        {/* Resend */}
        <View style={{ gap: 12, width: '100%' }}>
          {resent ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <CheckCircle size={18} color="#22C55E" />
              <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 14, color: '#22C55E' }}>
                Verification email resent!
              </Text>
            </View>
          ) : (
            <Button
              label="Resend Verification Email"
              variant="secondary"
              size="lg"
              fullWidth
              isLoading={resending}
              leftIcon={<RefreshCw size={16} color={gold[400]} />}
              onPress={handleResend}
            />
          )}

          <TouchableOpacity
            onPress={() => router.push('/(auth)/sign-in')}
            style={{ alignItems: 'center', paddingVertical: 12 }}
          >
            <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 15, color: '#8FAF96' }}>
              Back to Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
