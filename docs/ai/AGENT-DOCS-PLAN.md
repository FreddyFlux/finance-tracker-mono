# Agent documentation — money-saver-mono

This document describes how **Claude Code**, **Cursor**, and **human-edited** markdown stay aligned, and how to keep docs current as the repo grows.

---

## Status (implemented)

| Artifact | Role |
| -------- | ---- |
| **`AGENTS.md`** (repo root) | Canonical **monorepo** rules: identity, `pnpm`, shared packages, API design, TypeScript, env, naming, mistakes. **Points to `DESIGN_SYSTEM.md`** for UI — do not duplicate token tables. |
| **`apps/web/AGENTS.md`** | Web-only: TanStack Start, Tailwind v4/shadcn, Clerk, DB, REST, API domains. |
| **`apps/mobile/AGENTS.md`** | Mobile-only: Expo, NativeWind, api-client, forms, navigation. |
| **`DESIGN_SYSTEM.md`** (repo root) | Canonical **visual** design: fonts, colors, components, file paths for CSS/config. |
| **`CLAUDE.md`** (root) | Imports `@AGENTS.md`. Nested **`apps/web/CLAUDE.md`** / **`apps/mobile/CLAUDE.md`** import the matching app `AGENTS.md` for subdirectory sessions. |
| **`.cursor/rules/*.mdc`** | **Wrappers**: YAML (`description`, `globs`, `alwaysApply`) + **`@…`** to canonical markdown — **no long duplicated prose** in `.mdc` bodies. |

---

## Why nested docs (chosen approach)

- **Shared truth** for packages, API design, and env lives in **`AGENTS.md`**.
- **Web vs mobile differences** (stack, styling version, forms) live in **`apps/web/AGENTS.md`** and **`apps/mobile/AGENTS.md`** so PRs stay scoped and context is smaller when you only touch one app.
- **Visual design** stays in **`DESIGN_SYSTEM.md`** so tokens and “Purple Mood Board” rules are edited once; **`.cursor/rules/design-system.mdc`** references **`@DESIGN_SYSTEM.md`** (same pattern as other rules).

---

## Tool behavior (quick reference)

| Tool | What to edit | What not to duplicate |
| ---- | ------------ | --------------------- |
| **Claude Code** | `AGENTS.md`, app `AGENTS.md`, `DESIGN_SYSTEM.md`, nested `CLAUDE.md` imports | Full prose inside `CLAUDE.md` (keep imports only) |
| **Cursor** | Same markdown files | Full guides inside `.mdc` — use `@file` only ([Cursor Rules](https://cursor.com/docs/context/rules)) |
| **Claude** | `@path` imports in `CLAUDE.md` ([Anthropic memory / imports](https://docs.anthropic.com/en/docs/claude-code/memory)) | — |

---

## `.cursor/rules` map

| Rule file | Loads | When |
| --------- | ----- | ---- |
| `monorepo.mdc` | `@AGENTS.md` | `alwaysApply: true`, broad globs |
| `web.mdc` | `@apps/web/AGENTS.md` | Files under `apps/web/**` |
| `mobile.mdc` | `@apps/mobile/AGENTS.md` | Files under `apps/mobile/**` |
| `design-system.mdc` | `@DESIGN_SYSTEM.md` | `alwaysApply: true`, `**/*.{tsx,ts,css}` |

---

## Maintenance — keeping docs up to date

### Golden rules

1. **One home per concern** — Packages/API/env → **`AGENTS.md`**. Web stack → **`apps/web/AGENTS.md`**. Mobile stack → **`apps/mobile/AGENTS.md`**. Colors/fonts/UI → **`DESIGN_SYSTEM.md`**.
2. **`.mdc` files are pointers** — Change YAML if scope changes (e.g. new glob). If you need new prose, add it to the **referenced `.md` file**, not inside the `.mdc` body.
3. **`CLAUDE.md` is imports + short titles** — Bump nested `CLAUDE.md` only if you add another app or change import paths.

### When you change…

| Change | Update |
| ------ | ------ |
| New package, script, or filter in `pnpm` | `AGENTS.md` (Package manager) |
| New REST domain or api-client pattern | `AGENTS.md` (API design) + relevant app `AGENTS.md` if usage differs |
| New env var | `AGENTS.md` (Environment variables) |
| Web-only stack (router, auth, data) | `apps/web/AGENTS.md` |
| Mobile-only (Expo, hooks, forms) | `apps/mobile/AGENTS.md` |
| New color, font, or component token | **`DESIGN_SYSTEM.md`** + code paths listed in its “File Locations” section |
| Tailwind / globals / `tailwind.config.js` structure | **`DESIGN_SYSTEM.md`** and the paths listed there |

### PR / review checklist (lightweight)

- [ ] If the PR changes **behavior** agents should know (API, env, stack), at least one of **`AGENTS.md`** / **`apps/web/AGENTS.md`** / **`apps/mobile/AGENTS.md`** is updated.
- [ ] If the PR changes **UI**, **`DESIGN_SYSTEM.md`** (and `design-tokens.ts` / CSS if applicable) is updated.
- [ ] No new **long** copy was added only under **`.cursor/rules`** without a matching `.md` source.

### If docs drift

- **Cursor**: Rules should still `@`-reference the same files — if behavior diverges, search the repo for duplicated paragraphs and consolidate into the canonical `.md`.
- **Claude**: Run `/memory` (or your version’s equivalent) to confirm which `CLAUDE.md` / imports loaded.

---

## Alternatives (not the default here)

- **Single root `AGENTS.md` only** — Fewer files, larger default context; fine for small teams.
- **Import everything in root `CLAUDE.md`** — `@AGENTS.md` + both app files every session; increases tokens vs nested `CLAUDE.md` only under `apps/web` / `apps/mobile`.

---

## What not to do

- Maintain parallel **full** copies of the same content in `CLAUDE.md`, `AGENTS.md`, `DESIGN_SYSTEM.md`, and `.mdc`.
- Put **architecture** only in `DESIGN_SYSTEM.md` — keep **`AGENTS.md`** as the place for packages, API, and env (design file already links back).

---

## Summary

| Concern | Canonical file |
| ------- | ---------------- |
| Monorepo + API + env | `AGENTS.md` |
| Web app | `apps/web/AGENTS.md` |
| Mobile app | `apps/mobile/AGENTS.md` |
| Visual design | `DESIGN_SYSTEM.md` |
| Cursor scoping | `.cursor/rules/*.mdc` (frontmatter + `@`) |
| Claude Code entry | `CLAUDE.md` + nested `CLAUDE.md` |

This keeps **one editable source per scope** while **Cursor** and **Claude Code** both read the same text.
