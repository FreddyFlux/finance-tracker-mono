# money-saver Design System

> Derived from the **Purple Mood Board** (Freepik #6155040)
> Vibe: Editorial · Jewel-toned · Confident · Warm-accented

---

## Fonts

| Role              | Family             | Weights                  |
| ----------------- | ------------------ | ------------------------ |
| Display / Numbers | Cormorant Garamond | 400, 500, 600 (+ italic) |
| Body / UI         | DM Sans            | 300, 400, 500            |

**Web** — load via Google Fonts in `apps/web/src/styles/globals.css`  
**Mobile** — use `expo-google-fonts` packages:

- `@expo-google-fonts/cormorant-garamond`
- `@expo-google-fonts/dm-sans`

---

## Color Tokens

### Primary — Violet

| Token        | Hex       | Usage                                |
| ------------ | --------- | ------------------------------------ |
| `violet-900` | `#1A1235` | Dark nav/shell background            |
| `violet-800` | `#2D1F5E` | Deep headings                        |
| `violet-700` | `#3D2B7A` | Primary text on light                |
| `violet-600` | `#5B3FA8` | Primary interactive (buttons, links) |
| `violet-500` | `#7B5CC8` | Progress bars, chart fill            |
| `violet-400` | `#9B7DE0` | Hover states, secondary accent       |
| `violet-300` | `#B89FD8` | Muted text on dark                   |
| `violet-200` | `#D4C4F0` | Borders on dark                      |
| `violet-100` | `#EAE0FB` | Tinted backgrounds, badges           |
| `violet-50`  | `#F7F3FE` | Subtle page tint                     |

### Accent — Amber

| Token       | Hex       | Usage                          |
| ----------- | --------- | ------------------------------ |
| `amber-700` | `#B8720A` | Dark amber text                |
| `amber-600` | `#D48B0F` | Amber body text                |
| `amber-500` | `#F5A623` | CTA buttons, income indicators |
| `amber-400` | `#FFBE4D` | Highlights on dark backgrounds |
| `amber-300` | `#FFD07A` | Soft amber accents             |
| `amber-100` | `#FFF4DC` | Amber tinted card              |
| `amber-50`  | `#FFFBF0` | Amber page tint                |

### Support — Lilac

| Token       | Hex       | Usage                    |
| ----------- | --------- | ------------------------ |
| `lilac-600` | `#8B6BBF` | Secondary category color |
| `lilac-400` | `#C9BAEF` | Lilac borders / accents  |
| `lilac-200` | `#E6DEFF` | Soft lilac backgrounds   |
| `lilac-50`  | `#F4F0FF` | Lilac card fill          |

### Support — Pink

| Token      | Hex       | Usage                  |
| ---------- | --------- | ---------------------- |
| `pink-500` | `#D966A8` | Subscriptions category |
| `pink-300` | `#EE9ECD` | Pink accents           |
| `pink-100` | `#FCE8F5` | Pink badge / card tint |

### Semantic

| Token     | Hex       | Usage                       |
| --------- | --------- | --------------------------- |
| `success` | `#1D9E75` | Income, positive delta      |
| `danger`  | `#D85A30` | Expenses over budget        |
| `warning` | `#F5A623` | Budget alerts (= amber-500) |
| `info`    | `#5B3FA8` | Info states (= violet-600)  |

### Neutrals

| Token      | Hex       | Usage                    |
| ---------- | --------- | ------------------------ |
| `gray-900` | `#1A1630` | Default body text        |
| `gray-600` | `#5A5468` | Secondary text           |
| `gray-400` | `#8A849A` | Muted / placeholder text |
| `gray-200` | `#DDD8EE` | Borders, dividers        |
| `gray-100` | `#F0EDF8` | Background surfaces      |
| `gray-50`  | `#FAFAF9` | Page background          |

---

## Spacing & Shape

| Token         | Value   | Usage                        |
| ------------- | ------- | ---------------------------- |
| `radius-sm`   | `6px`   | Small elements (badges)      |
| `radius-md`   | `10px`  | Inputs, buttons, small cards |
| `radius-lg`   | `16px`  | Cards, panels                |
| `radius-xl`   | `24px`  | Hero sections, modals        |
| `radius-pill` | `999px` | Pills, full-round buttons    |

---

## Typography Scale

| Name           | Family                    | Size    | Weight | Usage                                |
| -------------- | ------------------------- | ------- | ------ | ------------------------------------ |
| Display        | Cormorant Garamond        | 42px    | 600    | Hero headlines                       |
| Display Italic | Cormorant Garamond italic | 42px    | 400    | Accent headlines                     |
| H1             | Cormorant Garamond        | 24px    | 500    | Page titles                          |
| H2             | Cormorant Garamond        | 18px    | 500    | Section titles                       |
| Body           | DM Sans                   | 14px    | 400    | General body text                    |
| Caption        | DM Sans                   | 11px    | 400    | Meta, timestamps                     |
| Overline       | DM Sans                   | 10px    | 500    | Category labels (uppercase, tracked) |
| Number         | Cormorant Garamond        | 28–32px | 600    | Metric values                        |

---

## Component Patterns

### Cards

- **Default**: white bg, `0.5px solid gray-200` border, `radius-lg`, `shadow-sm`
- **Dark**: `violet-900` bg, `violet-700` border — used for hero metrics
- **Tinted Lilac**: `lilac-50` bg, `violet-200` border — informational
- **Tinted Amber**: `amber-50` bg, `amber-300` border — spend / budget warnings

### Buttons

- **Primary**: `violet-600` fill, white text, `radius-pill`, `12px 24px` padding
- **CTA / Amber**: `amber-500` fill, `violet-900` text, `radius-pill` — use for key financial actions
- **Outline**: transparent, `violet-300` border, `violet-600` text
- **Ghost**: transparent, `gray-200` border, `gray-600` text

### Badges

All use `radius-pill`, `10px` font, 500 weight:

- `violet-100` bg / `violet-700` text — general / income
- `amber-100` bg / `amber-700` text — savings / goals
- `#E1F5EE` bg / `#0F6E56` text — success / paid
- `#FAECE7` bg / `#993C1D` text — danger / overdue
- `pink-100` bg / `#8B3570` text — subscriptions

### Transaction Rows

- 38×38 icon tile: `radius-md`, category-tinted bg
- Name: 13px, 500 weight, `gray-900`
- Category + date: 11px, `gray-400`
- Amount: `font-display`, 15px, 600 — negative = `violet-700`, positive = `success`

### Progress Bars

- Track: 6px tall, `gray-100` bg, `radius-pill`
- Fill: Violet spend categories, amber for budget alerts

### Data Visualization Colors (in order)

1. `violet-500` — primary category
2. `lilac-600` — secondary category
3. `amber-500` — tertiary / budget
4. `pink-500` — subscriptions
5. `success` (#1D9E75) — income

---

## App Shell

- **Navbar**: `violet-900` background
- **Logo**: Cormorant Garamond 18px, white + `amber-400` dot accent
- **Nav items**: 11px DM Sans, inactive = `violet-300`, active = white 500 weight
- **Page bg**: `gray-50`
- **Content max-width**: 1200px centered

---

## File Locations in Monorepo

| File                   | Path                                        |
| ---------------------- | ------------------------------------------- |
| Web CSS tokens         | `apps/web/src/styles/globals.css`           |
| Mobile Tailwind config | `apps/mobile/tailwind.config.js`            |
| Shared token reference | `packages/validations/src/design-tokens.ts` |

---

## Related agent documentation

| Document | Purpose |
| -------- | ------- |
| `AGENTS.md` | Monorepo layout, packages, API design, env vars |
| `apps/web/AGENTS.md` | Web stack (TanStack Start, Tailwind v4, Clerk) |
| `apps/mobile/AGENTS.md` | Mobile stack (Expo, NativeWind, Clerk) |
| `docs/ai/AGENT-DOCS-PLAN.md` | How agent docs stay aligned with Cursor and Claude Code |

**Split of concerns:** update **`DESIGN_SYSTEM.md`** for fonts, colors, and UI patterns; update **`AGENTS.md`** (and app `AGENTS.md`) for architecture, packages, and API workflows.

---

## Key Rules for AI/Cursor

1. **Never use Inter, Roboto, or Arial** — always Cormorant Garamond (display) + DM Sans (body)
2. **Violet is primary, amber is accent** — never the reverse for primary actions
3. **Positive cashflow = `success` green**, negative = `violet-700` (NOT red — we avoid alarming color for normal spend)
4. **Danger red only for overdue/over-budget** states
5. **Dark cards (`violet-900`) should always pair amber numbers** — never violet numbers on violet bg
6. **All Tailwind classes on web use `v4` syntax** (no `theme()` function needed — CSS vars available directly)
7. **All Tailwind classes on mobile use `v3` config** via `tailwind.config.js` extension — NativeWind v4 requirement
8. **Mobile never imports `@money-saver/db`** — only via API through `@money-saver/api-client`
