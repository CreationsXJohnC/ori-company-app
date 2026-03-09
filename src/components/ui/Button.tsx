/**
 * ORI APP — Button Component
 * Variants: primary (gold), secondary (outlined), ghost, danger
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  type TouchableOpacityProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useTheme } from '@/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize    = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  label:       string;
  variant?:    ButtonVariant;
  size?:       ButtonSize;
  isLoading?:  boolean;
  leftIcon?:   React.ReactNode;
  rightIcon?:  React.ReactNode;
  fullWidth?:  boolean;
  haptic?:     boolean;
  style?:      StyleProp<ViewStyle>;
}

export function Button({
  label,
  variant    = 'primary',
  size       = 'md',
  isLoading  = false,
  leftIcon,
  rightIcon,
  fullWidth  = false,
  haptic     = true,
  disabled,
  onPress,
  style,
  ...rest
}: ButtonProps) {
  const { colors, fontFamilies } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = async (e: Parameters<NonNullable<TouchableOpacityProps['onPress']>>[0]) => {
    if (haptic && Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(e);
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const isDisabled = disabled || isLoading;

  // ── Variant Styles ──────────────────────────────────────────────────────────
  const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
    primary:   { bg: colors.accent,   text: colors.accentText },
    secondary: { bg: 'transparent',   text: colors.primary, border: colors.primary },
    ghost:     { bg: 'transparent',   text: colors.textSecondary },
    danger:    { bg: '#E59F63',       text: '#FFFFFF' },
  };

  // ── Size Styles ─────────────────────────────────────────────────────────────
  const sizeStyles: Record<ButtonSize, { px: number; py: number; fontSize: number; radius: number }> = {
    sm: { px: 14, py: 8,  fontSize: 13, radius: 8  },
    md: { px: 20, py: 13, fontSize: 15, radius: 12 },
    lg: { px: 24, py: 16, fontSize: 17, radius: 14 },
  };

  const vs = variantStyles[variant];
  const ss = sizeStyles[size];

  return (
    <AnimatedTouchable
      style={[
        animatedStyle,
        {
          backgroundColor:  isDisabled ? (vs.bg === 'transparent' ? 'transparent' : `${vs.bg}88`) : vs.bg,
          paddingHorizontal: ss.px,
          paddingVertical:   ss.py,
          borderRadius:      ss.radius,
          borderWidth:       vs.border ? 1.5 : 0,
          borderColor:       vs.border ? (isDisabled ? `${vs.border}66` : vs.border) : undefined,
          flexDirection:     'row',
          alignItems:        'center',
          justifyContent:    'center',
          alignSelf:         fullWidth ? 'stretch' : 'auto',
          gap:               8,
          opacity:           isDisabled ? 0.65 : 1,
        },
        style,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={1}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={vs.text}
        />
      ) : (
        <>
          {leftIcon && <View>{leftIcon}</View>}
          <Text
            style={{
              color:      isDisabled ? `${vs.text}88` : vs.text,
              fontSize:   ss.fontSize,
              fontFamily: fontFamilies.bodySemiBold,
              letterSpacing: 0.2,
            }}
          >
            {label}
          </Text>
          {rightIcon && <View>{rightIcon}</View>}
        </>
      )}
    </AnimatedTouchable>
  );
}

export default Button;
