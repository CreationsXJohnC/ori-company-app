/**
 * ORI APP — Sign Up Screen
 * Full registration form with 21+ compliance gate.
 */

import React, { useRef, useState } from 'react';
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
import { ArrowLeft, User, Mail, Phone, Lock, FileText, MapPin } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Divider } from '@/components/ui/Divider';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/theme';
import { useAuthStore } from '@/stores/authStore';
import { signUpSchema, type SignUpFormData } from '@/utils/validation';
import { COMPLIANCE, LINKS } from '@/utils/constants';
import { Linking } from 'react-native';

export default function SignUpScreen() {
  const router  = useRouter();
  const { colors, fontFamilies, gold, forest, warm } = useTheme();
  const signUp  = useAuthStore((s) => s.signUp);
  const toast   = useToast();

  const emailRef     = useRef<TextInput>(null);
  const phoneRef     = useRef<TextInput>(null);
  const passwordRef  = useRef<TextInput>(null);
  const confirmRef   = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName:       '',
      email:          '',
      phone:          '',
      password:       '',
      confirmPassword:'',
      patientId:      '',
      patientState:   '',
      is21Plus:       false,
      agreeToTerms:   false,
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      await signUp(data);
      router.push({
        pathname: '/(auth)/verify-email',
        params:   { email: data.email },
      });
    } catch (err: any) {
      toast.error('Sign Up Failed', err.message ?? 'Please try again.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: forest[950] }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
          <Text
            style={{
              fontFamily: fontFamilies.headingBold,
              fontSize:   22,
              color:      warm[100],
            }}
          >
            Create Account
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 24, paddingBottom: 48, gap: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 21+ Banner */}
          <View
            style={{
              backgroundColor: `${gold[500]}18`,
              borderWidth:     1,
              borderColor:     `${gold[500]}40`,
              borderRadius:    12,
              padding:         14,
              flexDirection:   'row',
              alignItems:      'center',
              gap:             10,
            }}
          >
            <Text style={{ fontSize: 18 }}>🔞</Text>
            <Text
              style={{
                flex:       1,
                fontFamily: fontFamilies.bodyMedium,
                fontSize:   13,
                color:      gold[300],
                lineHeight: 19,
              }}
            >
              {COMPLIANCE.ageGate}
            </Text>
          </View>

          {/* Full Name */}
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, value, ref } }) => (
              <Input
                ref={ref}
                label="Full Name"
                required
                placeholder="Jane Smith"
                autoCapitalize="words"
                autoComplete="name"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                leftIcon={<User size={18} color={colors.textTertiary} />}
                value={value}
                onChangeText={onChange}
                error={errors.fullName?.message}
              />
            )}
          />

          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                ref={emailRef}
                label="Email Address"
                required
                placeholder="jane@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
                leftIcon={<Mail size={18} color={colors.textTertiary} />}
                value={value}
                onChangeText={onChange}
                error={errors.email?.message}
              />
            )}
          />

          {/* Phone */}
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <Input
                ref={phoneRef}
                label="Phone Number"
                required
                placeholder="(202) 555-0100"
                keyboardType="phone-pad"
                autoComplete="tel"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                leftIcon={<Phone size={18} color={colors.textTertiary} />}
                value={value}
                onChangeText={onChange}
                error={errors.phone?.message}
              />
            )}
          />

          {/* Password */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                ref={passwordRef}
                label="Password"
                required
                placeholder="Min. 8 characters, 1 uppercase, 1 number"
                isPassword
                autoComplete="new-password"
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
                leftIcon={<Lock size={18} color={colors.textTertiary} />}
                value={value}
                onChangeText={onChange}
                error={errors.password?.message}
              />
            )}
          />

          {/* Confirm Password */}
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <Input
                ref={confirmRef}
                label="Confirm Password"
                required
                placeholder="Re-enter password"
                isPassword
                autoComplete="new-password"
                returnKeyType="done"
                leftIcon={<Lock size={18} color={colors.textTertiary} />}
                value={value}
                onChangeText={onChange}
                error={errors.confirmPassword?.message}
              />
            )}
          />

          <Divider label="Optional — Medical Patient Info" />

          {/* Patient ID */}
          <Controller
            control={control}
            name="patientId"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Medical Patient ID"
                placeholder="DC ABCD-12345"
                autoCapitalize="characters"
                leftIcon={<FileText size={18} color={colors.textTertiary} />}
                value={value ?? ''}
                onChangeText={onChange}
                hint="Optional. Helps us verify your medical patient status."
              />
            )}
          />

          {/* Patient State */}
          <Controller
            control={control}
            name="patientState"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Patient ID State"
                placeholder="DC"
                autoCapitalize="characters"
                maxLength={2}
                leftIcon={<MapPin size={18} color={colors.textTertiary} />}
                value={value ?? ''}
                onChangeText={onChange}
                hint="State that issued your medical cannabis card."
              />
            )}
          />

          <Divider />

          {/* 21+ Checkbox */}
          <Controller
            control={control}
            name="is21Plus"
            render={({ field: { onChange, value } }) => (
              <Checkbox
                checked={value as boolean}
                onChange={onChange}
                error={errors.is21Plus?.message}
                label={
                  <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 14, color: warm[100], lineHeight: 20 }}>
                    <Text style={{ fontFamily: fontFamilies.bodySemiBold }}>
                      {COMPLIANCE.ageConfirm}
                    </Text>
                    {' '}I understand that cannabis is for adults 21+ and medical patients only.
                  </Text>
                }
              />
            )}
          />

          {/* Terms Checkbox */}
          <Controller
            control={control}
            name="agreeToTerms"
            render={({ field: { onChange, value } }) => (
              <Checkbox
                checked={value as boolean}
                onChange={onChange}
                error={errors.agreeToTerms?.message}
                label={
                  <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 14, color: warm[100], lineHeight: 20 }}>
                    I agree to the{' '}
                    <Text
                      style={{ color: gold[400], textDecorationLine: 'underline' }}
                      onPress={() => Linking.openURL(LINKS.terms)}
                    >
                      Terms of Service
                    </Text>
                    {' '}and{' '}
                    <Text
                      style={{ color: gold[400], textDecorationLine: 'underline' }}
                      onPress={() => Linking.openURL(LINKS.privacy)}
                    >
                      Privacy Policy
                    </Text>
                  </Text>
                }
              />
            )}
          />

          {/* Submit */}
          <Button
            label="Create Account"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            onPress={handleSubmit(onSubmit)}
            style={{ marginTop: 8 }}
          />

          {/* Sign In Link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
            <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 14, color: '#8FAF96' }}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
              <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 14, color: gold[400] }}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
