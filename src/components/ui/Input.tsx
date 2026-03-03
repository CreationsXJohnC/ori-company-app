/**
 * ORI APP — Input Component
 * Styled form input with label, error state, and icon slots.
 */

import React, { useState, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  type TextInputProps,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '@/theme';

interface InputProps extends TextInputProps {
  label?:       string;
  error?:       string;
  hint?:        string;
  leftIcon?:    React.ReactNode;
  rightIcon?:   React.ReactNode;
  isPassword?:  boolean;
  required?:    boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      isPassword = false,
      required,
      ...rest
    },
    ref
  ) => {
    const { colors, fontFamilies } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const borderColor = error
      ? '#E59F63'
      : isFocused
      ? colors.accent
      : colors.border;

    return (
      <View style={{ gap: 4 }}>
        {label && (
          <View style={{ flexDirection: 'row', gap: 2 }}>
            <Text
              style={{
                fontFamily: fontFamilies.bodyMedium,
                fontSize:   14,
                color:      colors.textSecondary,
              }}
            >
              {label}
            </Text>
            {required && (
              <Text style={{ color: '#E59F63', fontSize: 14 }}>*</Text>
            )}
          </View>
        )}

        <View
          style={{
            flexDirection:   'row',
            alignItems:      'center',
            backgroundColor: colors.surfaceAlt,
            borderWidth:     1.5,
            borderColor,
            borderRadius:    12,
            paddingHorizontal: 14,
            gap:             10,
          }}
        >
          {leftIcon && (
            <View style={{ opacity: isFocused ? 1 : 0.6 }}>{leftIcon}</View>
          )}

          <TextInput
            ref={ref}
            style={{
              flex:         1,
              fontFamily:   fontFamilies.bodyRegular,
              fontSize:     16,
              color:        colors.textPrimary,
              paddingVertical: 13,
              // Remove default outline on web
              outlineWidth: 0,
            } as any}
            placeholderTextColor={colors.textTertiary}
            secureTextEntry={isPassword && !showPassword}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...rest}
          />

          {isPassword ? (
            <TouchableOpacity
              onPress={() => setShowPassword((p) => !p)}
              hitSlop={8}
            >
              {showPassword ? (
                <EyeOff size={18} color={colors.textTertiary} />
              ) : (
                <Eye size={18} color={colors.textTertiary} />
              )}
            </TouchableOpacity>
          ) : (
            rightIcon && <View>{rightIcon}</View>
          )}
        </View>

        {error && (
          <Text
            style={{
              fontFamily: fontFamilies.bodyRegular,
              fontSize:   12,
              color:      '#E59F63',
            }}
          >
            {error}
          </Text>
        )}

        {hint && !error && (
          <Text
            style={{
              fontFamily: fontFamilies.bodyRegular,
              fontSize:   12,
              color:      colors.textTertiary,
            }}
          >
            {hint}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
export default Input;
