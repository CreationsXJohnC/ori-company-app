/**
 * ORI APP — Badge Component
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/theme';

type BadgeVariant = 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  label:    string;
  variant?: BadgeVariant;
  dot?:     boolean;
  size?:    'sm' | 'md';
}

export function Badge({ label, variant = 'primary', dot = false, size = 'md' }: BadgeProps) {
  const { colors, semantic, fontFamilies } = useTheme();

  const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
    primary: { bg: `${colors.primary}22`, text: colors.primary },
    accent:  { bg: `${colors.accent}22`,  text: colors.accent  },
    success: { bg: `${semantic.success}22`, text: semantic.success },
    warning: { bg: `${semantic.warning}22`, text: semantic.warning },
    error:   { bg: `${semantic.error}22`,   text: semantic.error   },
    info:    { bg: `${semantic.info}22`,    text: semantic.info    },
    neutral: { bg: colors.surfaceAlt,       text: colors.textSecondary },
  };

  const vs = variantStyles[variant];
  const fontSize = size === 'sm' ? 10 : 12;
  const px = size === 'sm' ? 6 : 8;
  const py = size === 'sm' ? 2 : 3;

  return (
    <View
      style={{
        flexDirection:    'row',
        alignItems:       'center',
        backgroundColor:  vs.bg,
        paddingHorizontal: px,
        paddingVertical:  py,
        borderRadius:     100,
        gap:              4,
        alignSelf:        'flex-start',
      }}
    >
      {dot && (
        <View
          style={{
            width:           6,
            height:          6,
            borderRadius:    3,
            backgroundColor: vs.text,
          }}
        />
      )}
      <Text
        style={{
          fontFamily:    fontFamilies.bodyMedium,
          fontSize,
          color:         vs.text,
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// Notification bubble (number badge on icons)
export function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null;
  const { colors, fontFamilies } = useTheme();
  return (
    <View
      style={{
        position:         'absolute',
        top:              -4,
        right:            -4,
        backgroundColor:  colors.accent,
        borderRadius:     10,
        minWidth:         18,
        height:           18,
        alignItems:       'center',
        justifyContent:   'center',
        paddingHorizontal: 4,
      }}
    >
      <Text
        style={{
          fontFamily: fontFamilies.bodyBold,
          fontSize:   10,
          color:      colors.accentText,
        }}
      >
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
}

export default Badge;
