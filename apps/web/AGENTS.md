# money-saver — Web app (`apps/web`)

Monorepo-wide rules: **`AGENTS.md`** (repo root). Visual design tokens: **`DESIGN_SYSTEM.md`**.

---

## Framework & routing

- **TanStack Start** with **TanStack Router** (file-based routes in `src/routes/`)
- Server functions use `createServerFn` from `@tanstack/start` — **web-only**, cannot be shared with mobile
- REST API routes live in `src/routes/api/` — consumed by the mobile app via `@money-saver/api-client`

---

## Styling & design system (web)

- **Tailwind CSS v4** + **shadcn/ui** components
- Do not use NativeWind-style patterns here — standard Tailwind only
- Fonts: `font-display` and `font-sans` per **`DESIGN_SYSTEM.md`** and `apps/web/src/styles/globals.css`
- Do not use Inter, Roboto, or Arial — see **`DESIGN_SYSTEM.md`**

---

## Auth

- Uses `@clerk/tanstack-start`
- Server functions access the user via Clerk's server SDK

---

## Database

- Uses **`@money-saver/db`** (Drizzle + Neon) — import `db` and schema tables from the shared package
- All DB access happens in server functions or API route handlers, never in client components

```ts
// ✅ Correct
import db, { transactionsTable, categoriesTable } from '@money-saver/db'
```

---

## Data fetching

- Client: TanStack Query (`useQuery`, `useMutation`)
- Server: `createServerFn` for data loading
- REST API: routes in `src/routes/api/` for mobile consumption

---

## API domains

When adding new REST endpoints, add both the route and the corresponding api-client module:

- **transactions** — CRUD, years-range
- **cashflow** — annual cashflow
- **categories** — list all
- **recurring-transactions** — CRUD, toggle isActive
- **connections** — list, send request, requests, accept/reject, remove
