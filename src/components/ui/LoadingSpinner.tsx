/**
 * ORI APP — Loading Spinner + Skeleton Components
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';

// ─── Spinner ──────────────────────────────────────────────────────────────────
interface SpinnerProps {
  size?:  'small' | 'large';
  color?: string;
  full?:  boolean; // fill parent container
}

export function LoadingSpinner({ size = 'large', color, full = false }: SpinnerProps) {
  const { colors } = useTheme();
  const spinnerColor = color ?? colors.accent;

  if (full) {
    return (
      <View
        style={{
          flex:            1,
          alignItems:      'center',
          justifyContent:  'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size={size} color={spinnerColor} />
      </View>
    );
  }

  return <ActivityIndicator size={size} color={spinnerColor} />;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
interface SkeletonProps {
  width?:       number | `${number}%`;
  height:       number;
  borderRadius?: number;
}

export function Skeleton({ width = '100%', height, borderRadius = 8 }: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.4, { duration: 800 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.surfaceAlt,
        },
      ]}
    />
  );
}

// ─── Product Card Skeleton ────────────────────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <View style={{ gap: 8 }}>
      <Skeleton height={180} borderRadius={14} />
      <Skeleton height={16} width="70%" />
      <Skeleton height={12} width="50%" />
      <Skeleton height={20} width="35%" />
    </View>
  );
}

export default LoadingSpinner;
