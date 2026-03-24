// packages/validations/src/design-tokens.ts
// money-saver Design System — Shared Token Reference
// Import in both web and mobile for type-safe token access
// Derived from the Purple Mood Board (Freepik #6155040)
//
// Usage:
//   import { colors, radius, typography } from '@money-saver/validations/design-tokens'
//
// COLOR USAGE:
//   Income/Positive:  amber-600 (#D48B0F)
//   Expense/Negative: pink-500 (#D966A8)
//   Success (paid):   success (#1D9E75) - NOT for income
//   Danger:           danger (#D85A30) - overdue/over-budget only

// ── Color Tokens ────────────────────────────────────────────────────────────

export const colors = {
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

  lilac: {
    50:  '#F4F0FF',
    100: '#EDE5FF',
    200: '#E6DEFF',
    400: '#C9BAEF',
    600: '#8B6BBF',
  },

  pink: {
    100: '#FCE8F5',
    300: '#EE9ECD',
    500: '#D966A8',
  },

  gray: {
    50:  '#FAFAF9',
    100: '#F0EDF8',
    200: '#DDD8EE',
    300: '#C4BEDD',
    400: '#8A849A',
    600: '#5A5468',
    900: '#1A1630',
  },

  semantic: {
    success:      '#1D9E75',  // Paid status, under budget (NOT for income)
    successLight: '#E1F5EE',
    danger:       '#D85A30',  // Overdue, over-budget ONLY
    dangerLight:  '#FAECE7',
    warning:      '#F5A623',  // Budget alerts
    warningLight: '#FFF4DC',
    info:         '#5B3FA8',  // Info states
    infoLight:    '#EAE0FB',
  },
} as const;

// ── Category Colors (for charts and transaction icons) ───────────────────────
// NOTE: Income uses amber, Expense uses pink (revised from original green/violet)

export const categoryColors = {
  food:           { bg: colors.violet[100], text: colors.violet[700], fill: colors.violet[500] },
  transport:      { bg: colors.lilac[200],  text: colors.lilac[600],  fill: colors.lilac[600]  },
  entertainment:  { bg: colors.amber[100],  text: colors.amber[700],  fill: colors.amber[500]  },
  subscriptions:  { bg: colors.pink[100],   text: '#8B3570',          fill: colors.pink[500]   },
  income:         { bg: colors.amber[100],  text: colors.amber[700],  fill: colors.amber[600]  },
  expense:        { bg: colors.pink[100],   text: '#8B3570',          fill: colors.pink[500]   },
  savings:        { bg: colors.amber[100],  text: colors.amber[700],  fill: colors.amber[400]  },
  health:         { bg: colors.lilac[50],   text: colors.lilac[600],  fill: colors.lilac[400]  },
  other:          { bg: colors.gray[100],   text: colors.gray[600],   fill: colors.gray[400]   },
} as const;

// ── Chart Color Sequence ─────────────────────────────────────────────────────
// Use in order for multi-series charts

export const chartColors = [
  colors.amber[500],    // #F5A623 — income / positive
  colors.pink[500],     // #D966A8 — expense / negative
  colors.violet[500],   // #7B5CC8 — primary category
  colors.lilac[600],    // #8B6BBF — secondary category
  colors.semantic.success, // #1D9E75 — paid / under budget
  colors.violet[300],   // #B89FD8 — muted extra
  colors.amber[300],    // #FFD07A — muted extra
] as const;

// ── Border Radius ────────────────────────────────────────────────────────────

export const radius = {
  sm:   6,
  md:   10,
  lg:   16,
  xl:   24,
  pill: 9999,
} as const;

// ── Typography ───────────────────────────────────────────────────────────────

export const typography = {
  fontFamily: {
    display: 'CormorantGaramond_600SemiBold',
    displayMedium: 'CormorantGaramond_500Medium',
    displayItalic: 'CormorantGaramond_400Regular_Italic',
    body: 'DMSans_400Regular',
    bodyMedium: 'DMSans_500Medium',
    bodyLight: 'DMSans_300Light',
  },

  fontSize: {
    '2xs':   10,
    xs:      11,
    sm:      13,
    base:    14,
    md:      15,
    lg:      16,
    xl:      18,
    '2xl':   24,
    '3xl':   28,
    '4xl':   32,
    display: 42,
  },

  lineHeight: {
    tight:  1.1,
    snug:   1.25,
    normal: 1.5,
    relaxed: 1.6,
  },

  fontWeight: {
    light:   '300',
    regular: '400',
    medium:  '500',
    semibold: '600',
  },
} as const;

// ── Spacing ──────────────────────────────────────────────────────────────────

export const spacing = {
  0:    0,
  1:    4,
  2:    8,
  3:    12,
  4:    16,
  5:    20,
  6:    24,
  7:    28,
  8:    32,
  9:    36,
  10:   40,
  12:   48,
  14:   56,
  16:   64,
  20:   80,
  24:   96,
} as const;

// ── Shadow Tokens (for React Native) ─────────────────────────────────────────

export const shadows = {
  sm: {
    shadowColor: '#2C1864',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#2C1864',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#2C1864',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 8,
  },
} as const;

// ── Type helpers ─────────────────────────────────────────────────────────────

export type ColorToken = typeof colors;
export type CategoryKey = keyof typeof categoryColors;
export type RadiusKey = keyof typeof radius;
