/**
 * ORI APP — Sign In Screen
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Divider } from '@/components/ui/Divider';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/theme';
import { useAuthStore } from '@/stores/authStore';
import { signInSchema, type SignInFormData } from '@/utils/validation';

export default function SignInScreen() {
  const router   = useRouter();
  const { colors, fontFamilies, gold, forest, warm } = useTheme();
  const signIn   = useAuthStore((s) => s.signIn);
  const toast    = useToast();
  const passRef  = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      await signIn(data.email, data.password);
      // Redirect handled by app/index.tsx (auth state change)
    } catch (err: any) {
      toast.error(
        'Sign In Failed',
        err.message?.includes('Invalid login')
          ? 'Incorrect email or password. Please try again.'
          : err.message ?? 'Please try again.'
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: forest[950] }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems:    'center',
            paddingHorizontal: 20,
            paddingVertical:   12,
            gap:           12,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={8}
            style={{
              width:           40,
              height:          40,
              borderRadius:    20,
              backgroundColor: '#1A2E1F',
              alignItems:      'center',
              justifyContent:  'center',
            }}
          >
            <ArrowLeft size={20} color={warm[100]} />
          </TouchableOpacity>
          <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 22, color: warm[100] }}>
            Welcome Back
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 24, gap: 20, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Tagline */}
          <Text
            style={{
              fontFamily: fontFamilies.headingItalic,
              fontSize:   17,
              color:      gold[400],
              marginBottom: 8,
            }}
          >
            Sign in to your Ori account
          </Text>

          {/* Email */}
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
                returnKeyType="next"
                onSubmitEditing={() => passRef.current?.focus()}
                leftIcon={<Mail size={18} color={colors.textTertiary} />}
                value={value}
                onChangeText={onChange}
                error={errors.email?.message}
              />
            )}
          />

          {/* Password */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                ref={passRef}
                label="Password"
                required
                placeholder="Your password"
                isPassword
                autoComplete="current-password"
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
                leftIcon={<Lock size={18} color={colors.textTertiary} />}
                value={value}
                onChangeText={onChange}
                error={errors.password?.message}
              />
            )}
          />

          {/* Forgot password */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={{ alignSelf: 'flex-end' }}
          >
            <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 14, color: gold[400] }}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <Button
            label="Sign In"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            onPress={handleSubmit(onSubmit)}
          />

          <Divider label="or" />

          {/* Sign Up Link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
            <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 14, color: '#8FAF96' }}>
              New to Ori?
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
              <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 14, color: gold[400] }}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
