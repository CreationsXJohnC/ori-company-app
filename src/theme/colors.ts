/**
 * ORI APP — Color Design Tokens
 *
 * HOW TO SWAP BRAND COLORS:
 * 1. Update the hex values in the `brand` and `accent` objects below.
 * 2. The rest of the system references these tokens, so everything updates automatically.
 * 3. Full Tailwind config is in /tailwind.config.js — keep both in sync.
 *
 * PLACEHOLDER STATUS: Using professional defaults until brand kit is received.
 */

// ─── Primary Brand Palette (Deep Forest Green) ───────────────────────────────
export const forest = {
  50:  '#f0f7f2',
  100: '#d9eee0',
  200: '#b3dcc2',
  300: '#80c49e',
  400: '#4da87a',
  500: '#2d8a5c',
  600: '#1f6a45',
  700: '#1a5238',
  800: '#163f2c',
  900: '#0d2619',
  950: '#0D1B12',
} as const;

// ─── Accent Palette (Warm Gold) ──────────────────────────────────────────────
export const gold = {
  50:  '#fdf9ec',
  100: '#faf0cc',
  200: '#f4de95',
  300: '#eec85a',
  400: '#e6b02e',
  500: '#C8922A',
  600: '#a5721f',
  700: '#845419',
  800: '#6b4117',
  900: '#593617',
  950: '#321c09',
} as const;

// ─── Warm Neutral Palette ────────────────────────────────────────────────────
export const warm = {
  50:  '#FAFAF7',
  100: '#F5F0E8',
  200: '#EAE4D8',
  300: '#D4CCB9',
  400: '#B8AE98',
  500: '#9A8E77',
  600: '#7D7060',
  700: '#635849',
  800: '#4A4136',
  900: '#322B22',
  950: '#1A1510',
} as const;

// ─── Semantic Color Tokens ────────────────────────────────────────────────────
export const semantic = {
  success:        '#22C55E',
  successLight:   '#DCFCE7',
  warning:        '#F59E0B',
  warningLight:   '#FEF3C7',
  error:          '#EF4444',
  errorLight:     '#FEE2E2',
  info:           '#3B82F6',
  infoLight:      '#DBEAFE',
} as const;

// ─── Light Mode Tokens ────────────────────────────────────────────────────────
export const light = {
  background:     warm[50],        // #FAFAF7
  backgroundAlt:  '#F0EDE5',
  surface:        '#FFFFFF',
  surfaceAlt:     warm[100],       // #F5F0E8
  surfaceHover:   warm[200],
  textPrimary:    forest[950],     // #0D1B12
  textSecondary:  '#4A6355',
  textTertiary:   '#7A9488',
  textDisabled:   warm[400],
  textInverse:    warm[50],
  border:         warm[300],       // #D4CCB9
  borderFocus:    gold[500],
  primary:        forest[700],     // #1a5238
  primaryHover:   forest[800],
  primaryText:    '#FFFFFF',
  accent:         gold[500],       // #C8922A
  accentHover:    gold[600],
  accentText:     forest[950],
  tabBar:         '#FFFFFF',
  tabBarBorder:   warm[200],
  tabActive:      forest[700],
  tabInactive:    warm[500],
  overlay:        'rgba(13,27,18,0.5)',
  badge:          gold[500],
} as const;

// ─── Dark Mode Tokens ─────────────────────────────────────────────────────────
export const dark = {
  background:     forest[950],     // #0D1B12
  backgroundAlt:  '#0F1F14',
  surface:        '#1A2E1F',       // #1A2E1F
  surfaceAlt:     '#243425',
  surfaceHover:   '#2F4233',
  textPrimary:    warm[100],       // #F5F0E8
  textSecondary:  '#8FAF96',
  textTertiary:   '#5F8A6A',
  textDisabled:   '#3D5945',
  textInverse:    forest[950],
  border:         '#2A4A35',
  borderFocus:    gold[500],
  primary:        forest[500],     // #2d8a5c
  primaryHover:   forest[400],
  primaryText:    '#FFFFFF',
  accent:         gold[500],       // #C8922A
  accentHover:    gold[400],
  accentText:     forest[950],
  tabBar:         '#0F1F14',
  tabBarBorder:   '#1E3525',
  tabActive:      gold[500],
  tabInactive:    '#3D5945',
  overlay:        'rgba(0,0,0,0.75)',
  badge:          gold[500],
} as const;

// ─── Gradient Presets ─────────────────────────────────────────────────────────
export const gradients = {
  // Welcome / hero screen
  heroDark:    [forest[950], '#162A1C', '#0A1510'] as const,
  heroLight:   [warm[50], '#EDF4F0', '#E0EDE5'] as const,
  // Card overlays
  cardOverlay: ['transparent', 'rgba(13,26,18,0.85)'] as const,
  // Gold shimmer
  goldShimmer: [gold[600], gold[500], gold[300]] as const,
  // Green accent
  greenAccent: [forest[700], forest[500]] as const,
} as const;

export type ColorScheme = 'light' | 'dark';
export type ThemeColors = typeof light | typeof dark;
