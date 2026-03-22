# money-saver-mono — Monorepo (agents)

## Project identity

This is a **pnpm monorepo** personal finance tracker with two apps and three shared packages:

- `apps/web` — TanStack Start web app (Vercel)
- `apps/mobile` — Expo Router mobile app (iOS/Android)
- `packages/db` — Drizzle + Neon (web only — all server-side DB access)
- `packages/validations` — Shared Zod schemas + constants (mobile + api-client; web has its own in `src/lib/`)
- `packages/api-client` — Fetch client + TanStack Query hooks (mobile only)

Identify which app or package you are editing before writing code. Rules differ between `apps/web` and `apps/mobile`. App-specific instructions: **`apps/web/AGENTS.md`**, **`apps/mobile/AGENTS.md`**.

---

## Design & UI (canonical)

- **Visual design system** (fonts, color tokens, components, Tailwind usage): **`DESIGN_SYSTEM.md`** (repo root).  
  Do not duplicate token tables here — when colors, typography, or component chrome change, update **`DESIGN_SYSTEM.md`** and the referenced code paths in its “File Locations” section.

---

## Package manager

- **Always use `pnpm`**. Never suggest `npm install`, `yarn add`, or `npx expo install`.
- Run `pnpm install` from the **monorepo root** to keep `pnpm-lock.yaml` consistent.
- To add a package to a specific workspace:

  ```bash
  pnpm add <pkg> --filter mobile
  pnpm add <pkg> --filter web
  pnpm add -D <pkg> --filter mobile
  ```

- Never create `package-lock.json` or `yarn.lock` files. If you see `package-lock.json` in a workspace, delete it and run `pnpm install` from root.

---

## Shared packages

### `packages/validations`

- Used by **mobile** and **api-client** (not web — web has its own `src/lib/validation.ts`)
- Package name: `@money-saver/validations`
- Do NOT add web-specific or Node.js-specific imports here

### `packages/api-client`

- Used by **mobile only**
- Package name: `@money-saver/api-client`
- `client.ts` — `apiRequest<T>()` — handles base URL, auth header, error parsing
- Base URL from `process.env.EXPO_PUBLIC_API_URL`
- Covers: transactions, cashflow, categories. When adding recurring-transactions or connections, add the fetch function + TanStack Query hook and export from `index.ts`
- Do NOT add React Native-specific or Node.js-specific imports

### `packages/db`

- Used by **web only** — never imported by mobile or api-client
- Package name: `@money-saver/db`
- Web imports `db` and schema tables from `@money-saver/db` for all server-side data access

---

## API design (web REST endpoints)

All REST routes are in `apps/web/src/routes/api/` and authenticated via Clerk Bearer token. When adding new API features:

1. Add the route handler in `apps/web/src/routes/api/`
2. Authenticate with: `const { userId } = await getAuth(request)` — return 401 if null
3. Add the corresponding fetch function in `packages/api-client/src/`
4. Add the TanStack Query hook in the same file
5. Export from `packages/api-client/src/index.ts`

**Existing API domains:** transactions, cashflow, categories, recurring-transactions, connections.

---

## TypeScript

- All files must be TypeScript (`.ts` / `.tsx`)
- Strict mode is enabled in all workspaces
- Use Zod for runtime validation — infer types with `z.infer<typeof schema>`
- Prefer explicit return types on exported functions

---

## File naming conventions

- React components: `PascalCase.tsx`
- Utilities / hooks: `camelCase.ts`
- Expo Router routes: `kebab-case.tsx` or `index.tsx` for directory index
- Route groups: `(group-name)/` (parentheses, no URL segment)
- Dynamic routes: `[param].tsx`

---

## Environment variables

### `apps/web/.env`

```
DATABASE_URL=          # Neon connection string
CLERK_SECRET_KEY=      # sk_...
CLERK_PUBLISHABLE_KEY= # pk_...
```

### `apps/mobile/.env`

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=  # pk_...
EXPO_PUBLIC_API_URL=                # https://your-app.vercel.app
```

- All Expo env vars must be prefixed with `EXPO_PUBLIC_`
- For local iOS simulator: `EXPO_PUBLIC_API_URL=http://localhost:3000`
- For Android emulator: use Mac's LAN IP, not `localhost`

---

## Common mistakes to avoid

| Mistake | Correct approach |
|--------|------------------|
| `npm install` or `npx expo install` | `pnpm add` |
| Importing `@money-saver/db` in mobile | Use `@money-saver/api-client` |
| Placing `package-lock.json` in workspace | Delete it, run `pnpm install` from root |
| `@clerk/clerk-expo` | Use `@clerk/expo` (new package name) |
