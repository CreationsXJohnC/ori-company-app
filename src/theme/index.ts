/**
 * ORI APP — Theme System Entry Point
 *
 * Usage:
 *   import { useTheme } from '@/theme'
 *   const { colors, isDark } = useTheme();
 *
 * OR use Tailwind className props directly — the design tokens
 * in tailwind.config.js map 1:1 to these values.
 */

import { useColorScheme } from 'react-native';
import { light, dark, forest, gold, warm, semantic, gradients } from './colors';
import { fontFamilies, fontSizes, textStyles } from './typography';

export * from './colors';
export * from './typography';

// ─── Spacing Scale (4px base grid) ───────────────────────────────────────────
export const spacing = {
  0:    0,
  0.5:  2,
  1:    4,
  1.5:  6,
  2:    8,
  2.5:  10,
  3:    12,
  3.5:  14,
  4:    16,
  5:    20,
  6:    24,
  7:    28,
  8:    32,
  9:    36,
  10:   40,
  11:   44,
  12:   48,
  14:   56,
  16:   64,
  20:   80,
  24:   96,
} as const;

// ─── Border Radius Scale ──────────────────────────────────────────────────────
export const radii = {
  none:  0,
  sm:    4,
  DEFAULT: 8,
  md:    10,
  lg:    14,
  xl:    18,
  '2xl': 24,
  '3xl': 32,
  full:  9999,
} as const;

// ─── Shadow Presets ───────────────────────────────────────────────────────────
export const shadows = {
  sm: {
    shadowColor:   '#000000',
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius:  3,
    elevation:     2,
  },
  DEFAULT: {
    shadowColor:   '#000000',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius:  6,
    elevation:     4,
  },
  md: {
    shadowColor:   '#000000',
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius:  16,
    elevation:     8,
  },
  lg: {
    shadowColor:   '#000000',
    shadowOffset:  { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius:  32,
    elevation:     16,
  },
  gold: {
    shadowColor:   '#C8922A',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius:  12,
    elevation:     6,
  },
} as const;

// ─── Animation Durations ──────────────────────────────────────────────────────
export const durations = {
  fast:    150,
  normal:  250,
  slow:    400,
  slower:  600,
} as const;

// ─── Z-Index Scale ────────────────────────────────────────────────────────────
export const zIndex = {
  base:    0,
  above:   1,
  dropdown: 100,
  sticky:  200,
  overlay: 300,
  modal:   400,
  toast:   500,
} as const;

// ─── Theme Hook ───────────────────────────────────────────────────────────────
export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? dark : light;

  return {
    colors,
    isDark,
    colorScheme,
    forest,
    gold,
    warm,
    semantic,
    gradients,
    spacing,
    radii,
    shadows,
    fontFamilies,
    fontSizes,
    textStyles,
    durations,
    zIndex,
  };
}

export type Theme = ReturnType<typeof useTheme>;
