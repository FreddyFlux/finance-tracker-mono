// apps/mobile/tailwind.config.js
// NativeWind v4 — requires Tailwind CSS v3
// money-saver Design System tokens
// Derived from the Purple Mood Board (Freepik #6155040)

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      // ── Fonts ──────────────────────────────────────────────────────────────
      // Load via expo-google-fonts in your _layout.tsx:
      //   import { useFonts } from 'expo-font'
      //   import { CormorantGaramond_400Regular, ... } from '@expo-google-fonts/cormorant-garamond'
      //   import { DMSans_400Regular, ... } from '@expo-google-fonts/dm-sans'
      fontFamily: {
        display: ['CormorantGaramond_600SemiBold', 'serif'],
        'display-italic': ['CormorantGaramond_400Regular_Italic', 'serif'],
        'display-medium': ['CormorantGaramond_500Medium', 'serif'],
        body:    ['DMSans_400Regular', 'sans-serif'],
        'body-medium': ['DMSans_500Medium', 'sans-serif'],
        'body-light':  ['DMSans_300Light', 'sans-serif'],
        sans:    ['DMSans_400Regular', 'sans-serif'],
      },

      // ── Colors ─────────────────────────────────────────────────────────────
      colors: {
        // Primary — Violet
        violet: {
          50:  '#F7F3FE',
          100: '#EAE0FB',
          200: '#D4C4F0',
          300: '#B89FD8',
          400: '#9B7DE0',
          500: '#7B5CC8',
          600: '#5B3FA8',
          700: '#3D2B7A',
          800: '#2D1F5E',
          900: '#1A1235',
        },

        // Accent — Amber
        amber: {
          50:  '#FFFBF0',
          100: '#FFF4DC',
          200: '#FFE8A8',
          300: '#FFD07A',
          400: '#FFBE4D',
          500: '#F5A623',
          600: '#D48B0F',
          700: '#B8720A',
        },

        // Support — Lilac
        lilac: {
          50:  '#F4F0FF',
          100: '#EDE5FF',
          200: '#E6DEFF',
          400: '#C9BAEF',
          600: '#8B6BBF',
        },

        // Support — Pink
        pink: {
          100: '#FCE8F5',
          300: '#EE9ECD',
          500: '#D966A8',
        },

        // Semantic
        success:       '#1D9E75',
        'success-bg':  '#E1F5EE',
        danger:        '#D85A30',
        'danger-bg':   '#FAECE7',
        warning:       '#F5A623',
        'warning-bg':  '#FFF4DC',
        info:          '#5B3FA8',
        'info-bg':     '#EAE0FB',

        // Neutrals (purple-tinted grays to match the mood board)
        gray: {
          50:  '#FAFAF9',
          100: '#F0EDF8',
          200: '#DDD8EE',
          300: '#C4BEDD',
          400: '#8A849A',
          600: '#5A5468',
          900: '#1A1630',
        },

        muted: '#F0EDF8',
        'muted-foreground': '#5A5468',
      },

      // ── Border Radius ──────────────────────────────────────────────────────
      borderRadius: {
        sm:   '6px',
        md:   '10px',
        lg:   '16px',
        xl:   '24px',
        pill: '9999px',
        // Keep Tailwind defaults too
        DEFAULT: '4px',
        full:    '9999px',
      },

      // ── Shadows ────────────────────────────────────────────────────────────
      // NativeWind maps these to React Native shadow props
      boxShadow: {
        sm: '0 1px 4px rgba(44, 24, 100, 0.08)',
        md: '0 4px 16px rgba(44, 24, 100, 0.12)',
        lg: '0 8px 32px rgba(44, 24, 100, 0.18)',
      },

      // ── Font Sizes ─────────────────────────────────────────────────────────
      fontSize: {
        '2xs':   ['10px', { lineHeight: '14px' }],
        xs:      ['11px', { lineHeight: '16px' }],
        sm:      ['13px', { lineHeight: '20px' }],
        base:    ['14px', { lineHeight: '22px' }],
        md:      ['15px', { lineHeight: '24px' }],
        lg:      ['16px', { lineHeight: '26px' }],
        xl:      ['18px', { lineHeight: '28px' }],
        '2xl':   ['24px', { lineHeight: '32px' }],
        '3xl':   ['28px', { lineHeight: '36px' }],
        '4xl':   ['32px', { lineHeight: '40px' }],
        display: ['42px', { lineHeight: '48px' }],
      },

      // ── Spacing ─────────────────────────────────────────────────────────────
      spacing: {
        '4.5': '18px',
        '5.5': '22px',
        '13':  '52px',
        '15':  '60px',
        '18':  '72px',
      },
    },
  },

  plugins: [],
};
