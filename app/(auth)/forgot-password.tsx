/**
 * ORI APP — Forgot Password Screen
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, Send } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/theme';
import { useAuthStore } from '@/stores/authStore';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/utils/validation';

export default function ForgotPasswordScreen() {
  const router  = useRouter();
  const { colors, fontFamilies, gold, forest, warm } = useTheme();
  const sendReset = useAuthStore((s) => s.sendPasswordReset);
  const toast   = useToast();
  const [sent, setSent] = useState(false);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await sendReset(data.email);
      setSent(true);
    } catch (err: any) {
      toast.error('Failed', err.message ?? 'Could not send reset email.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: forest[950] }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 12 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={8}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A2E1F', alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowLeft size={20} color={warm[100]} />
        </TouchableOpacity>
        <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 22, color: warm[100] }}>
          Reset Password
        </Text>
      </View>

      <View style={{ flex: 1, padding: 24, gap: 24 }}>
        {sent ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: `${gold[500]}18`, borderWidth: 2, borderColor: `${gold[500]}44`, alignItems: 'center', justifyContent: 'center' }}>
              <Send size={36} color={gold[500]} />
            </View>
            <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 24, color: warm[100], textAlign: 'center' }}>
              Check Your Inbox
            </Text>
            <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 15, color: '#8FAF96', textAlign: 'center', lineHeight: 23 }}>
              We sent a password reset link to your email. Check your inbox and follow the link to reset your password.
            </Text>
            <Button label="Back to Sign In" variant="secondary" size="lg" fullWidth onPress={() => router.push('/(auth)/sign-in')} />
          </View>
        ) : (
          <>
            <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 15, color: '#8FAF96', lineHeight: 23 }}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email Address"
                  required
                  placeholder="jane@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                  leftIcon={<Mail size={18} color={colors.textTertiary} />}
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                />
              )}
            />

            <Button
              label="Send Reset Link"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
              onPress={handleSubmit(onSubmit)}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
