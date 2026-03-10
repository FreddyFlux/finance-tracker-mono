# money-saver-mono

A cross-platform personal finance tracker built as a **pnpm monorepo** with:

- **Web app** — TanStack Start (Vercel)
- **Mobile app** — Expo Router (iOS/Android)

## Quick Start

```bash
# Install dependencies (from monorepo root)
pnpm install

# Run web app
pnpm --filter web dev

# Run mobile app (separate terminal)
pnpm --filter mobile start
```

## Project Structure

| Workspace | Description |
|-----------|-------------|
| `apps/web` | TanStack Start web app |
| `apps/mobile` | Expo Router mobile app |
| `packages/db` | Drizzle ORM schema + Neon (web only) |
| `packages/validations` | Shared Zod schemas (mobile, api-client) |
| `packages/api-client` | REST API client + Query hooks (mobile only) |

## Key Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies (always from root) |
| `pnpm --filter web dev` | Start web dev server |
| `pnpm --filter mobile start` | Start Expo dev server |
| `pnpm add <pkg> --filter web` | Add package to web |
| `pnpm add <pkg> --filter mobile` | Add package to mobile |
| `pnpm --filter web db:seed` | Seed database |

## Important

- **Always use pnpm** — never `npm install` or `npx expo install` inside workspaces
- **Delete `package-lock.json`** if it appears in any workspace — run `pnpm install` from root instead
- See **[PROJECT-DOCUMENTATION.md](./PROJECT-DOCUMENTATION.md)** for full architecture, API reference, and gotchas
