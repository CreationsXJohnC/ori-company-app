/**
 * ORI APP — Typography Design Tokens
 *
 * Brand font: Archivo (Google Fonts) — single family, all weights
 * Hierarchy per brand book:
 *   Heading    = Bold (700)
 *   Subheading = Regular (400)
 *   Body       = Light (300)
 *   Caption    = Thin (100)
 */

import { Platform } from 'react-native';

// ─── Font Family Definitions ──────────────────────────────────────────────────
export const fontFamilies = {
  // Brand font: Archivo — heading weights
  headingBold:    'Archivo-Bold',
  headingRegular: 'Archivo-Regular',
  headingItalic:  'Archivo-Italic',

  // Brand font: Archivo — body weights
  bodyThin:       'Archivo-Thin',
  bodyLight:      'Archivo-Light',
  bodyRegular:    'Archivo-Regular',
  bodyMedium:     'Archivo-Medium',
  bodySemiBold:   'Archivo-SemiBold',
  bodyBold:       'Archivo-Bold',

  // Monospace — for reservation codes, QR data
  mono: Platform.select({
    ios: 'Courier New',
    android: 'monospace',
    default: 'Courier New',
  }) as string,
} as const;

// ─── Font Size Scale ──────────────────────────────────────────────────────────
export const fontSizes = {
  '2xs':  10,
  xs:     12,
  sm:     14,
  base:   16,
  lg:     18,
  xl:     20,
  '2xl':  24,
  '3xl':  28,
  '4xl':  34,
  '5xl':  42,
  '6xl':  52,
} as const;

// ─── Line Height Scale ────────────────────────────────────────────────────────
export const lineHeights = {
  tight:   1.2,
  snug:    1.35,
  normal:  1.5,
  relaxed: 1.625,
  loose:   1.75,
} as const;

// ─── Letter Spacing ───────────────────────────────────────────────────────────
export const letterSpacings = {
  tighter: -0.5,
  tight:   -0.25,
  normal:   0,
  wide:     0.25,
  wider:    0.5,
  widest:   1.5,
} as const;

// ─── Semantic Text Styles ─────────────────────────────────────────────────────
export const textStyles = {
  // Display — hero headlines
  displayLarge: {
    fontFamily:    fontFamilies.headingBold,
    fontSize:      fontSizes['5xl'],
    lineHeight:    fontSizes['5xl'] * lineHeights.tight,
    letterSpacing: letterSpacings.tight,
  },
  displayMedium: {
    fontFamily:    fontFamilies.headingBold,
    fontSize:      fontSizes['4xl'],
    lineHeight:    fontSizes['4xl'] * lineHeights.tight,
    letterSpacing: letterSpacings.tight,
  },

  // Heading
  h1: {
    fontFamily:    fontFamilies.headingBold,
    fontSize:      fontSizes['3xl'],
    lineHeight:    fontSizes['3xl'] * lineHeights.snug,
    letterSpacing: letterSpacings.tight,
  },
  h2: {
    fontFamily:    fontFamilies.headingBold,
    fontSize:      fontSizes['2xl'],
    lineHeight:    fontSizes['2xl'] * lineHeights.snug,
  },
  h3: {
    fontFamily:    fontFamilies.headingRegular,
    fontSize:      fontSizes.xl,
    lineHeight:    fontSizes.xl * lineHeights.snug,
  },
  h4: {
    fontFamily:    fontFamilies.headingRegular,
    fontSize:      fontSizes.lg,
    lineHeight:    fontSizes.lg * lineHeights.snug,
  },

  // Body
  bodyLarge: {
    fontFamily: fontFamilies.bodyLight,
    fontSize:   fontSizes.lg,
    lineHeight: fontSizes.lg * lineHeights.relaxed,
  },
  body: {
    fontFamily: fontFamilies.bodyLight,
    fontSize:   fontSizes.base,
    lineHeight: fontSizes.base * lineHeights.relaxed,
  },
  bodySmall: {
    fontFamily: fontFamilies.bodyLight,
    fontSize:   fontSizes.sm,
    lineHeight: fontSizes.sm * lineHeights.relaxed,
  },

  // Label / UI
  labelLarge: {
    fontFamily:    fontFamilies.bodySemiBold,
    fontSize:      fontSizes.base,
    lineHeight:    fontSizes.base * lineHeights.normal,
    letterSpacing: letterSpacings.wide,
  },
  label: {
    fontFamily:    fontFamilies.bodyMedium,
    fontSize:      fontSizes.sm,
    lineHeight:    fontSizes.sm * lineHeights.normal,
    letterSpacing: letterSpacings.wide,
  },
  labelSmall: {
    fontFamily:    fontFamilies.bodyMedium,
    fontSize:      fontSizes.xs,
    lineHeight:    fontSizes.xs * lineHeights.normal,
    letterSpacing: letterSpacings.wider,
  },

  // Caption
  caption: {
    fontFamily: fontFamilies.bodyThin,
    fontSize:   fontSizes.xs,
    lineHeight: fontSizes.xs * lineHeights.normal,
  },

  // Mono — reservation codes, QR text
  mono: {
    fontFamily:    fontFamilies.mono,
    fontSize:      fontSizes.sm,
    lineHeight:    fontSizes.sm * lineHeights.relaxed,
    letterSpacing: letterSpacings.wide,
  },
} as const;
