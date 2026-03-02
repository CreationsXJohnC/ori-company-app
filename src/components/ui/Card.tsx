/**
 * ORI APP — Card Component
 */

import React from 'react';
import { View, TouchableOpacity, type ViewProps, type TouchableOpacityProps } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface CardProps extends ViewProps {
  children:   React.ReactNode;
  elevated?:  boolean;
  padding?:   number;
}

interface PressableCardProps extends CardProps {
  onPress:    () => void;
}

export function Card({ children, elevated = false, padding = 16, style, ...rest }: CardProps) {
  const { colors, shadows } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius:    16,
          borderWidth:     1,
          borderColor:     colors.border,
          padding,
          ...(elevated ? shadows.md : shadows.sm),
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

export function PressableCard({
  children,
  onPress,
  elevated = false,
  padding = 16,
  style,
  ...rest
}: PressableCardProps) {
  const { colors, shadows } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      activeOpacity={1}
      style={[
        animatedStyle,
        {
          backgroundColor: colors.surface,
          borderRadius:    16,
          borderWidth:     1,
          borderColor:     colors.border,
          padding,
          ...(elevated ? shadows.md : shadows.sm),
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </AnimatedTouchable>
  );
}

export default Card;
