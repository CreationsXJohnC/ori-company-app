/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  // 'class' allows NativeWind to programmatically sync dark mode with
  // react-native's Appearance API. Without this, NativeWind defaults to
  // 'media' (CSS media query only) and throws when any code tries to
  // manually set the color scheme.
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // ─────────────────────────────────────────────────────────────
      // ORI DESIGN TOKENS — swap these when brand kit is received
      // Primary brand green palette (placeholder — update with brand hex)
      // ─────────────────────────────────────────────────────────────
      colors: {
        // Primary brand — Sage Green (#7EBF94)
        forest: {
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
        },
        // CTA / warm accent — Peach-Orange (#E59F63)
        gold: {
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
        },
        // Secondary accent — Muted Lavender (#AE93C1)
        purple: {
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
        },
        // Highlight — Cream Yellow (#F4EAA9)
        yellow: {
          50:  '#fefdf5',
          100: '#faf6e0',
          200: '#F4EAA9', // Brand yellow (use as bg highlight)
          300: '#edd871',
          400: '#e4c43e',
          500: '#d4ad26',
          600: '#b08f1c',
          700: '#8d7117',
          800: '#725a15',
          900: '#5c4913',
          950: '#33280c',
        },
        // Warm neutrals (cream-based)
        warm: {
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
        },
        // Surface colors
        surface: {
          light:      '#FFFFFF',
          'light-2':  '#F5F2EB',
          dark:       '#162c1e',
          'dark-2':   '#1e3828',
          'dark-3':   '#254a34',
        },
        // Status colors
        success: '#22C55E',
        warning: '#F59E0B',
        error:   '#EF4444',
        info:    '#3B82F6',
      },
      fontFamily: {
        // Brand font: Archivo (Google Fonts) — all weights
        heading:         ['Archivo-Bold', 'sans-serif'],
        'heading-regular': ['Archivo-Regular', 'sans-serif'],
        'heading-italic':  ['Archivo-Italic', 'sans-serif'],
        body:            ['Archivo-Light', 'sans-serif'],
        'body-thin':     ['Archivo-Thin', 'sans-serif'],
        'body-regular':  ['Archivo-Regular', 'sans-serif'],
        'body-medium':   ['Archivo-Medium', 'sans-serif'],
        'body-semibold': ['Archivo-SemiBold', 'sans-serif'],
        'body-bold':     ['Archivo-Bold', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
        xs:    ['12px', { lineHeight: '16px' }],
        sm:    ['14px', { lineHeight: '20px' }],
        base:  ['16px', { lineHeight: '24px' }],
        lg:    ['18px', { lineHeight: '28px' }],
        xl:    ['20px', { lineHeight: '30px' }],
        '2xl': ['24px', { lineHeight: '34px' }],
        '3xl': ['28px', { lineHeight: '38px' }],
        '4xl': ['34px', { lineHeight: '44px' }],
        '5xl': ['42px', { lineHeight: '52px' }],
        '6xl': ['52px', { lineHeight: '62px' }],
      },
      spacing: {
        px:  '1px',
        0.5: '2px',
        1:   '4px',
        1.5: '6px',
        2:   '8px',
        2.5: '10px',
        3:   '12px',
        3.5: '14px',
        4:   '16px',
        5:   '20px',
        6:   '24px',
        7:   '28px',
        8:   '32px',
        9:   '36px',
        10:  '40px',
        11:  '44px',
        12:  '48px',
        14:  '56px',
        16:  '64px',
        20:  '80px',
        24:  '96px',
        28:  '112px',
        32:  '128px',
      },
      borderRadius: {
        none: '0',
        sm:   '4px',
        DEFAULT: '8px',
        md:   '10px',
        lg:   '14px',
        xl:   '18px',
        '2xl':'24px',
        '3xl':'32px',
        full: '9999px',
      },
      boxShadow: {
        sm:  '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
        DEFAULT: '0 4px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.10)',
        md:  '0 8px 16px rgba(0,0,0,0.18), 0 4px 6px rgba(0,0,0,0.12)',
        lg:  '0 16px 32px rgba(0,0,0,0.22), 0 8px 16px rgba(0,0,0,0.14)',
        xl:  '0 24px 48px rgba(0,0,0,0.28), 0 12px 24px rgba(0,0,0,0.18)',
        'gold-sm': '0 2px 8px rgba(200,146,42,0.25)',
        'gold-md': '0 4px 16px rgba(200,146,42,0.35)',
        'green-sm': '0 2px 8px rgba(30,100,70,0.30)',
      },
    },
  },
  plugins: [],
};
