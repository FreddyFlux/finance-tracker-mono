# money-saver-mono — Project Documentation

## Quick Start

1. **Install dependencies** (from monorepo root):
   ```bash
   pnpm install
   ```

2. **Set up environment variables** — copy `.env.example` to `.env` in `apps/web` and `apps/mobile`, then fill in your values.

3. **Run the web app**:
   ```bash
   pnpm --filter web dev
   ```

4. **Run the mobile app** (in a separate terminal):
   ```bash
   pnpm --filter mobile start
   ```

---

## Overview

A cross-platform personal finance tracker built as a **pnpm monorepo** with:
- `apps/web` — TanStack Start web app (deployed on Vercel)
- `apps/mobile` — Expo Router mobile app (iOS/Android via Expo Go / dev builds)
- `packages/db` — Drizzle ORM schema + Neon serverless client (used by web app for all DB access)
- `packages/validations` — Shared Zod schemas and constants (mobile + api-client; web has its own in `src/lib/`)
- `packages/api-client` — Typed fetch client + TanStack Query hooks (mobile only)

---

## Monorepo Structure

```
money-saver-mono/
├── pnpm-workspace.yaml          # Declares apps/* and packages/*
├── package.json                 # Root — no dependencies, just scripts
├── pnpm-lock.yaml               # Single lockfile for entire monorepo
├── apps/
│   ├── web/                     # TanStack Start web app
│   │   ├── src/
│   │   │   ├── routes/          # File-based routes (TanStack Router)
│   │   │   │   └── api/         # REST API routes consumed by mobile
│   │   │   ├── data/            # Server functions (createServerFn — web only)
│   │   │   └── lib/             # Utilities, validation (web-specific)
│   │   └── package.json         # name: "web"
│   └── mobile/                  # Expo Router mobile app
│       ├── app/                 # Expo Router file-based routes
│       │   ├── _layout.tsx      # Root layout: ClerkProvider + global.css import
│       │   ├── index.tsx        # Public landing / sign-in screen
│       │   └── (authed)/        # Route group — all routes require auth
│       │       ├── _layout.tsx  # Auth guard: useAuth → Redirect if not signed in
│       │       └── dashboard/   # Dashboard screens
│       ├── global.css           # Tailwind directives (@tailwind base/components/utilities)
│       ├── tailwind.config.js   # NativeWind preset, content: app/** + components/**
│       ├── babel.config.js      # babel-preset-expo with jsxImportSource: nativewind
│       ├── metro.config.js      # SVG transformer → withNativeWind → module.exports
│       ├── nativewind-env.d.ts  # /// <reference types="nativewind/types" />
│       ├── app.json             # scheme: money-saver, plugins: [expo-router]
│       └── package.json         # name: "mobile", main: "expo-router/entry"
└── packages/
    ├── db/                      # name: "@money-saver/db"
    │   └── src/
    │       ├── index.ts         # Neon + Drizzle client export
    │       └── schema.ts        # All table definitions
    ├── validations/             # name: "@money-saver/validations"
    │   └── src/
    │       ├── constants.ts     # Shared constants (categories, etc.)
    │       ├── validation.ts    # Shared Zod schemas
    │       └── index.ts         # re-exports both
    └── api-client/              # name: "@money-saver/api-client"
        └── src/
            ├── client.ts        # apiRequest() fetch wrapper with auth header
            ├── transactions.ts  # TanStack Query hooks for transactions
            ├── cashflow.ts      # TanStack Query hooks for cashflow
            ├── categories.ts    # TanStack Query hooks for categories
            └── index.ts        # re-exports all
```

---

## Tech Stack

### Web (`apps/web`)
| Concern | Library |
|---------|---------|
| Framework | TanStack Start (file-based SSR/SSG on Vite) |
| Routing | TanStack Router (file-based, `routes/` dir) |
| Database | Neon (serverless Postgres) + Drizzle ORM |
| Auth | Clerk (`@clerk/tanstack-start`) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Forms | react-hook-form + Zod |
| Data fetching | TanStack Query + `createServerFn` |
| Charts | Recharts |
| Deployment | Vercel |

### Mobile (`apps/mobile`)
| Concern | Library |
|---------|---------|
| Framework | Expo SDK 55 |
| Routing | Expo Router v4 (file-based, `app/` dir) |
| Styling | NativeWind v4 + Tailwind CSS **v3** (v4 NOT supported by NativeWind) |
| Auth | `@clerk/expo` + `expo-secure-store` (token cache) |
| Data fetching | TanStack Query v5 |
| Forms | react-hook-form + Zod (use `<Controller>` — no `register()` in RN) |
| UI primitives | `@rn-primitives/slot`, `@rn-primitives/types` |
| Icons | `lucide-react-native` + `react-native-svg` |
| Charts | `victory-native` + `react-native-gesture-handler` |
| Date picker | `@react-native-community/datetimepicker` |
| Toasts | `burnt` |
| Utilities | `date-fns`, `numeral` |

### Shared Packages
| Package | Used by | Purpose |
|---------|---------|---------|
| `@money-saver/db` | web only | Drizzle schema + Neon client (all server-side DB access) |
| `@money-saver/validations` | mobile, api-client | Zod schemas, constants (web has its own validation in `src/lib/`) |
| `@money-saver/api-client` | mobile only | Typed fetch client + TanStack Query hooks |

---

## Critical Architecture Rules

### 1. Mobile NEVER imports `@money-saver/db`
The db package uses Node.js APIs (`@neondatabase/serverless`, `dotenv`) that are not available in React Native. Mobile **only** talks to the backend via REST API calls through `@money-saver/api-client`. The web app imports `db` and schema tables from `@money-saver/db` for all server-side data access.

### 2. Web server functions (`createServerFn`) are NOT portable
Files in `apps/web/src/data/` use TanStack Start's `createServerFn` which is a web-only bundler concept. These cannot be used in the mobile app.

### 3. The mobile app calls the web app's REST API
`apps/web/src/routes/api/` contains the REST endpoints. The mobile app hits these via `@money-saver/api-client`. The base URL is set via `EXPO_PUBLIC_API_URL` in `apps/mobile/.env`.

### 4. Package manager: pnpm only — never npm or yarn
Always run `pnpm install` from the **monorepo root**. Never run `npm install` or `npx expo install` inside a workspace — this creates a `package-lock.json` and breaks the monorepo lockfile.

```bash
# ✅ Correct — from monorepo root
pnpm add <package> --filter mobile

# ✅ Also correct — from apps/mobile
pnpm add <package>

# ❌ Never do this
npm install <package>
npx expo install <package>
```

### 5. Tailwind version split
- `apps/web` uses **Tailwind CSS v4**
- `apps/mobile` uses **Tailwind CSS v3** (NativeWind v4 requires v3, not v4)

### 6. NativeWind className usage
NativeWind compiles `className` props at build time via the Babel plugin. Always use `className` (not `style`) for Tailwind utilities in mobile components:
```tsx
// ✅ Correct
<View className="flex-1 bg-white px-4">

// ❌ Wrong — bypasses NativeWind
<View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 16 }}>
```

### 7. metro.config.js mutation order
SVG transformer config must be set **before** `withNativeWind`, not after:
```js
const config = getDefaultConfig(__dirname);
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer'); // FIRST
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];
module.exports = withNativeWind(config, { input: './global.css' }); // LAST
```

---

## Environment Variables

### `apps/web/.env`
```
DATABASE_URL=postgresql://...         # Neon connection string
CLERK_SECRET_KEY=sk_...
CLERK_PUBLISHABLE_KEY=pk_...
```

### `apps/mobile/.env`
```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
EXPO_PUBLIC_API_URL=https://your-app.vercel.app
# For local dev on iOS simulator: http://localhost:3000
# For Android emulator: http://192.168.x.x:3000 (your Mac's local IP)
```

---

## REST API Endpoints (web → consumed by mobile)

All endpoints are in `apps/web/src/routes/api/` and require a Clerk Bearer token.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/transactions` | List transactions (query: `month`, `year`) |
| POST | `/api/transactions` | Create transaction |
| GET | `/api/transactions/:id` | Get single transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| GET | `/api/transactions/years-range` | Get min/max years with data |
| GET | `/api/cashflow` | Annual cashflow (query: `year`) |
| GET | `/api/categories` | All categories |
| GET | `/api/recurring-transactions` | List recurring transactions |
| POST | `/api/recurring-transactions` | Create recurring transaction |
| PUT | `/api/recurring-transactions/:id` | Update recurring transaction |
| DELETE | `/api/recurring-transactions/:id` | Delete recurring transaction |
| PATCH | `/api/recurring-transactions/:id` | Toggle `isActive` |
| GET | `/api/connections` | List connections |
| POST | `/api/connections` | Send connection request |
| GET | `/api/connections/requests` | Pending requests |
| PATCH | `/api/connections/:id` | Accept/reject request |
| DELETE | `/api/connections/:id` | Remove connection |

---

## Authentication Flow (Mobile)

1. `app/_layout.tsx` wraps everything in `<ClerkProvider>` with `tokenCache` using `expo-secure-store`
2. `app/index.tsx` is the public landing/sign-in page
3. `app/(authed)/_layout.tsx` guards all authenticated routes — redirects to `/` if `!isSignedIn`
4. API calls use `useAuth().getToken()` to get the Clerk JWT and pass it as `Authorization: Bearer <token>` via `apiRequest(path, { token })`

---

## Mobile App Route Structure (planned)

```
app/
├── _layout.tsx                     # ClerkProvider, global.css
├── index.tsx                       # Sign-in / landing
└── (authed)/
    ├── _layout.tsx                 # Auth guard
    └── dashboard/
        ├── _layout.tsx             # Tab navigator or stack
        ├── index.tsx               # Dashboard overview / cashflow chart
        ├── transactions/
        │   └── index.tsx           # Transactions list + add form
        └── connections/
            └── index.tsx           # Connections list
```

---

## Development Commands

```bash
# Install all dependencies (from monorepo root)
pnpm install

# Run web app
pnpm --filter web dev
# or
cd apps/web && pnpm dev

# Run mobile app
pnpm --filter mobile start
# or
cd apps/mobile && pnpm expo start --clear

# Add a package to mobile
pnpm add <pkg> --filter mobile

# Add a package to web
pnpm add <pkg> --filter web

# Add a dev dependency to mobile
pnpm add -D <pkg> --filter mobile

# Seed database (from web app, requires DATABASE_URL in apps/web/.env)
pnpm --filter web db:seed
```

---

## Known Gotchas & Lessons Learned

- **Never `pnpm dlx tailwindcss init`** — Tailwind v3 has no standalone binary in pnpm. Create `tailwind.config.js` manually.
- **Never run `npx expo install`** in a pnpm monorepo — causes `Cannot find module './utils/autoAddConfigPlugins.js'` error.
- **`package-lock.json` in workspace apps** — if you see it, delete it immediately (e.g. `rm apps/web/package-lock.json`) and run `pnpm install` from the monorepo root. Never run `npm install` inside a workspace.
- **`react-hook-form` in React Native**: use `<Controller>` wrapper instead of `register()`. The `register()` API is DOM-only.
- **Fonts**: use `expo-font` + `useFonts()` hook instead of `@fontsource/*` packages.
- **Android emulator + local dev server**: `localhost` doesn't resolve. Use your Mac's LAN IP (e.g. `192.168.1.x`).
- **`@clerk/clerk-expo` vs `@clerk/expo`**: the correct package for Expo is `@clerk/expo` (the old `@clerk/clerk-expo` is deprecated).
- **`react-native-reanimated` version**: must match Expo SDK. SDK 55 uses `4.2.1` — do not manually upgrade.
- **Expo Go vs dev builds**: Expo Go works for most development, but packages with native modules (like `react-native-gesture-handler` with custom config) may require a dev build.

---

## Related Documentation

- **[User Connections](apps/web/USER_CONNECTIONS.md)** — Security model, API endpoints, and usage for the connections feature
- **[Web Improvements](apps/web/IMPROVEMENTS.md)** — Code quality patterns, shared components, and utilities in the web app

## Cursor Rules

AI rules live in `.cursor/rules/`:
- `monorepo.mdc` — Package manager, shared packages, API design (always applies)
- `mobile.mdc` — Expo, NativeWind, api-client (when editing `apps/mobile/**`)
- `web.mdc` — TanStack Start, db access (when editing `apps/web/**`)

The web app also has `apps/web/.cursorrules` for detailed TanStack Start conventions.
