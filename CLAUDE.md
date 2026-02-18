# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Edwin** (branded as "Money Is Back") is a SaaS productivity hub — workspaces, projects, tasks, routines, objectives, ideas, a file drive, a messaging system, and a secure credential vault. Target audience is French-speaking (primary) with English support. Pricing is in euros.

The `busted-data/` sibling directory is a reference snapshot of an earlier state — not the active codebase.

## Development Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint

node scripts/create-admin.mjs  # Create admin@moneyisback.com in MongoDB
```

No test framework is configured.

## Architecture

### Stack
- **Next.js 16** (App Router) + **React 19** + **TypeScript 5** (strict)
- **Tailwind CSS v4** (via `@tailwindcss/postcss`, not the classic config file)
- **MongoDB + Mongoose 9** — cached connection in `src/lib/mongodb.ts`
- **Zustand 5** with `persist` middleware for all client state
- **Stripe** — subscriptions, checkout sessions, webhooks
- **Vercel Blob** — Drive file storage
- Custom JWT auth (NOT next-auth despite the package being installed)

### Route Groups

| Group | Path | Purpose |
|---|---|---|
| `(auth)` | `/login`, `/register`, `/onboarding`, `/join/[token]` | Unauthenticated pages |
| `(dashboard)` | `/dashboard`, `/tasks/[id]`, `/projects/[id]`, `/drive`, `/secure-ids`, `/settings`, etc. | Main app, wrapped in `AuthGuard` |
| `(admin)` | `/admin/**` | Admin panel |
| `(public)` | `/`, `/pricing`, `/about`, `/blog`, etc. | Landing & marketing pages |

### Authentication Pattern
- Middleware (`src/middleware.ts`) is **intentionally disabled** — it passes all requests through.
- Protection is handled client-side by the `AuthGuard` component in the `(dashboard)` layout.
- JWT tokens are stored in Zustand (`useAuthStore`, persisted to `localStorage` as `auth-storage`).
- All API routes verify `Authorization: Bearer <token>` via `src/lib/auth.ts` → `verifyAuth()`.

### State Management
Two Zustand stores, both persisted:
- `useAuthStore` → `auth-storage` (user, token, isAuthenticated)
- `useAppStore` → `project-hub-storage` (workspaces, projects, tasks, routines, objectives, drive files, modal state, etc.)

### Data Models (`src/models/`)
Key relationships: `User` → `Workspace` → `Project` → `Task`. Notable models:
- **SecureId** — AES-256-CBC encrypted credential vault (`src/lib/encryption.ts`)
- **SystemLog** — admin audit log
- **GlobalSettings** — admin-controlled feature flags

### Subscription Plans (`src/lib/limits.ts`)
`starter` (free) → `pro` → `team` → `enterprise`. Limits enforced on project count, workspace count, members, and storage.

### i18n
Custom React context in `src/lib/i18n/`. Translations in `src/lib/i18n/translations/en.ts` and `fr.ts`. Comments and variable names in the codebase are often in French.

## Design System
- Dark-first, with light mode via `next-themes`.
- CSS custom properties defined in `src/app/globals.css`: `--bg-primary/secondary/tertiary`, `--text-main/dim/muted`, `--glass-bg/border`, `--accent-primary` (`#6366f1` indigo).
- Landing page accent: `#00FFB2` (cyan-green neon).
- Glass morphism aesthetic; `Inter` font.
- Path alias: `@/*` → `./src/*`.

## Required Environment Variables

```
MONGODB_URI
JWT_SECRET
ENCRYPTION_KEY          # 32-byte hex, for SecureId AES-256-CBC
BLOB_READ_WRITE_TOKEN   # Vercel Blob
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_PRO_MONTHLY / YEARLY
STRIPE_PRICE_BUSINESS_MONTHLY / YEARLY
```
