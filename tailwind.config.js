/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // ─────────────────────────────────────────────────────────────
      // ORI DESIGN TOKENS — swap these when brand kit is received
      // Primary brand green palette (placeholder — update with brand hex)
      // ─────────────────────────────────────────────────────────────
      colors: {
        // Deep forest greens — primary brand palette
        forest: {
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
          950: '#0D1B12', // Background dark (primary bg)
        },
        // Warm gold accent palette
        gold: {
          50:  '#fdf9ec',
          100: '#faf0cc',
          200: '#f4de95',
          300: '#eec85a',
          400: '#e6b02e',
          500: '#C8922A', // Primary accent
          600: '#a5721f',
          700: '#845419',
          800: '#6b4117',
          900: '#593617',
          950: '#321c09',
        },
        // Warm neutrals for text and surfaces
        warm: {
          50:  '#FAFAF7', // Light background
          100: '#F5F0E8', // Light text primary
          200: '#EAE4D8',
          300: '#D4CCB9',
          400: '#B8AE98',
          500: '#9A8E77',
          600: '#7D7060',
          700: '#635849',
          800: '#4A4136',
          900: '#322B22',
          950: '#1A1510',
        },
        // Surface colors
        surface: {
          light:      '#FFFFFF',
          'light-2':  '#F5F3EE',
          dark:       '#1A2E1F', // Card surface on dark bg
          'dark-2':   '#243425', // Elevated surface on dark bg
          'dark-3':   '#2F4233', // Higher elevation
        },
        // Status colors
        success: '#22C55E',
        warning: '#F59E0B',
        error:   '#EF4444',
        info:    '#3B82F6',
      },
      fontFamily: {
        // Placeholder: swap file names in assets/fonts/ and update these
        heading: ['PlayfairDisplay-Bold', 'Georgia', 'serif'],
        'heading-regular': ['PlayfairDisplay-Regular', 'Georgia', 'serif'],
        'heading-italic': ['PlayfairDisplay-Italic', 'Georgia', 'serif'],
        body: ['Inter-Regular', 'System', 'sans-serif'],
        'body-medium': ['Inter-Medium', 'System', 'sans-serif'],
        'body-semibold': ['Inter-SemiBold', 'System', 'sans-serif'],
        'body-bold': ['Inter-Bold', 'System', 'sans-serif'],
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
