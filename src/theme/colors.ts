/**
 * ORI APP — Color Design Tokens
 *
 * Brand palette (confirmed):
 *   Green  #7EBF94  — primary brand color (sage green)
 *   Purple #AE93C1  — secondary accent (muted lavender)
 *   Orange #E59F63  — CTA / warm accent (peach-orange)
 *   Yellow #F4EAA9  — highlight / cream (pale gold)
 *
 * HOW TO SWAP:
 * 1. Update hex values below.
 * 2. Tailwind config in /tailwind.config.js must stay in sync (same values).
 */

// ─── Primary Brand Palette (Sage Green) ──────────────────────────────────────
export const forest = {
  50:  '#f1f9f4',
  100: '#dff0e6',
  200: '#bddfc8',
  300: '#96c9ac',
  400: '#7EBF94', // Brand green
  500: '#5caa7b',
  600: '#448962',
  700: '#336e4c',
  800: '#27543b',
  900: '#1b3d29',
  950: '#0e2116', // Dark mode background
} as const;

// ─── CTA / Warm Accent Palette (Peach-Orange) ────────────────────────────────
export const gold = {
  50:  '#fdf7f0',
  100: '#faeadb',
  200: '#f5d1af',
  300: '#ecb37c',
  400: '#E59F63', // Brand orange
  500: '#d98540',
  600: '#c06a2e',
  700: '#9e5222',
  800: '#7e401e',
  900: '#663319',
  950: '#3a1b0c',
} as const;

// ─── Secondary Accent Palette (Muted Lavender) ───────────────────────────────
export const purple = {
  50:  '#f7f4fb',
  100: '#ede7f4',
  200: '#d8cde9',
  300: '#c2add9',
  400: '#AE93C1', // Brand purple
  500: '#9378ab',
  600: '#785d91',
  700: '#604a78',
  800: '#4c3a61',
  900: '#3b2c4d',
  950: '#221a2d',
} as const;

// ─── Highlight Palette (Cream Yellow) ────────────────────────────────────────
export const yellow = {
  50:  '#fefdf5',
  100: '#faf6e0',
  200: '#F4EAA9', // Brand yellow (very light — use as background/highlight)
  300: '#edd871',
  400: '#e4c43e',
  500: '#d4ad26',
  600: '#b08f1c',
  700: '#8d7117',
  800: '#725a15',
  900: '#5c4913',
  950: '#33280c',
} as const;

// ─── Warm Neutral Palette (Cream-based) ──────────────────────────────────────
export const warm = {
  50:  '#FAFAF7',
  100: '#F5F2EB',
  200: '#EAE5D6',
  300: '#D4CDB7',
  400: '#B8AE95',
  500: '#9A9077',
  600: '#7C7360',
  700: '#625C49',
  800: '#494437',
  900: '#322E25',
  950: '#1C1913',
} as const;

// ─── Semantic Color Tokens (brand-only palette) ───────────────────────────────
export const semantic = {
  success:      forest[400],              // #7EBF94 Ori Green
  successLight: `${forest[400]}20`,
  warning:      gold[400],               // #E59F63 Ori Orange
  warningLight: `${gold[400]}20`,
  error:        gold[400],               // #E59F63 Ori Orange
  errorLight:   `${gold[400]}20`,
  info:         purple[400],             // #AE93C1 Ori Purple
  infoLight:    `${purple[400]}20`,
} as const;

// ─── Light Mode Tokens (brand-only: #7EBF94 #AE93C1 #E59F63 #F4EAA9 #ffffff) ─
export const light = {
  background:     '#ffffff',
  backgroundAlt:  yellow[200],           // #F4EAA9 Ori Yellow
  surface:        '#ffffff',
  surfaceAlt:     yellow[200],           // #F4EAA9 Ori Yellow
  surfaceHover:   `${forest[400]}1A`,    // Ori Green 10%
  textPrimary:    forest[400],           // #7EBF94 Ori Green
  textSecondary:  purple[400],           // #AE93C1 Ori Purple
  textTertiary:   gold[400],             // #E59F63 Ori Orange
  textDisabled:   `${purple[400]}80`,    // Ori Purple 50%
  textInverse:    '#ffffff',
  border:         yellow[200],           // #F4EAA9 Ori Yellow
  borderFocus:    forest[400],           // #7EBF94 Ori Green
  primary:        forest[400],           // #7EBF94 Ori Green
  primaryHover:   `${forest[400]}CC`,    // Ori Green 80%
  primaryText:    '#ffffff',
  accent:         gold[400],             // #E59F63 Ori Orange
  accentHover:    `${gold[400]}CC`,      // Ori Orange 80%
  accentText:     '#ffffff',
  tabBar:         '#ffffff',
  tabBarBorder:   yellow[200],           // #F4EAA9 Ori Yellow
  tabActive:      forest[400],           // #7EBF94 Ori Green
  tabInactive:    purple[400],           // #AE93C1 Ori Purple
  overlay:        'rgba(126,191,148,0.4)',
  badge:          gold[400],             // #E59F63 Ori Orange
} as const;

// ─── Dark Mode Tokens ─────────────────────────────────────────────────────────
export const dark = {
  background:     forest[950],           // deepest brand-derived bg
  backgroundAlt:  '#111d15',
  surface:        '#162c1e',
  surfaceAlt:     '#1e3828',
  surfaceHover:   `${forest[400]}1A`,    // Ori Green 10%
  textPrimary:    '#ffffff',
  textSecondary:  forest[400],           // #7EBF94 Ori Green
  textTertiary:   purple[400],           // #AE93C1 Ori Purple
  textDisabled:   `${purple[400]}60`,    // Ori Purple 38%
  textInverse:    forest[950],
  border:         `${forest[400]}30`,    // Ori Green 19%
  borderFocus:    forest[400],           // #7EBF94 Ori Green
  primary:        forest[400],           // #7EBF94 Ori Green
  primaryHover:   `${forest[400]}CC`,    // Ori Green 80%
  primaryText:    '#ffffff',
  accent:         gold[400],             // #E59F63 Ori Orange
  accentHover:    `${gold[400]}CC`,      // Ori Orange 80%
  accentText:     '#ffffff',
  tabBar:         '#111d15',
  tabBarBorder:   `${forest[400]}30`,    // Ori Green 19%
  tabActive:      forest[400],           // #7EBF94 Ori Green
  tabInactive:    purple[400],           // #AE93C1 Ori Purple
  overlay:        'rgba(0,0,0,0.70)',
  badge:          gold[400],             // #E59F63 Ori Orange
} as const;

// ─── Gradient Presets ─────────────────────────────────────────────────────────
export const gradients = {
  heroDark:    [forest[950], '#162c1e', '#0a1a10'] as const,
  heroLight:   ['#ffffff', yellow[200], `${forest[400]}10`] as const,
  cardOverlay: ['transparent', 'rgba(0,0,0,0.75)'] as const,
  goldShimmer: [gold[400], yellow[200], gold[400]] as const,
  greenAccent: [forest[400], purple[400]] as const,
} as const;

export type ColorScheme = 'light' | 'dark';
export type ThemeColors = typeof light | typeof dark;
