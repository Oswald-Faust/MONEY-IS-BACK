# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Edwin** (branded as "Money Is Back") is a French-first SaaS productivity hub: workspaces, projects, tasks, routines, objectives, ideas, file drive, messaging system, secure credential vault, and WhatsApp AI assistant. Pricing in euros.

The `busted-data/` sibling directory is a reference snapshot — not the active codebase.

## Development Commands

```bash
npm run dev      # Dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint

node scripts/create-admin.mjs  # Create admin@moneyisback.com / AdminPassword123! in MongoDB
```

No test framework configured.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5** (strict)
- **Tailwind CSS v4** via `@tailwindcss/postcss` — no `tailwind.config.js`, uses `@theme` directive in CSS
- **MongoDB + Mongoose 9** — cached connection at `src/lib/mongodb.ts` via global variable
- **Zustand 5** with `persist` middleware — two stores, both in localStorage
- **Stripe** — ad-hoc pricing (no Stripe Products), checkout sessions, webhooks
- **Vercel Blob** — Drive file storage
- **Custom JWT auth** — `next-auth` is installed but NOT used
- **Nodemailer** — SMTP email with configurable templates (Hostinger SMTP default)
- **Framer Motion** — animations on landing page
- **lucide-react** — icons throughout the app
- **OpenAI** — audio transcription for WhatsApp voice messages

## Route Groups

| Group | Paths | Notes |
|---|---|---|
| `(auth)` | `/login`, `/register`, `/onboarding`, `/join/[token]`, `/auth/google/*` | Unauthenticated |
| `(dashboard)` | `/dashboard`, `/projects/[id]`, `/tasks`, `/objectives/[id]`, `/ideas`, `/routines`, `/calendar`, `/messages`, `/drive`, `/secure-ids`, `/invite`, `/upgrade`, `/settings` | Wrapped in `AuthGuard` |
| `(admin)` | `/admin/dashboard`, `/admin/users/[id]`, `/admin/workspaces/[id]`, `/admin/subscriptions`, `/admin/logs`, `/admin/access` | role === 'admin' only |
| `(public)` | `/`, `/pricing`, `/about`, `/blog`, `/docs`, `/contact`, `/partners`, `/careers`, `/help`, `/community`, `/status`, `/api-docs` | Landing & marketing |

Landing page components are under `src/app/test-3/components/`.

## Authentication

- `src/middleware.ts` is **intentionally disabled** (passes all through)
- Client-side protection via `AuthGuard` component in the `(dashboard)` layout
- JWT stored in Zustand `useAuthStore` → persisted to localStorage as `auth-storage`
- API routes verify `Authorization: Bearer <token>` via `src/lib/auth.ts` → `verifyAuth()`
- JWT payload: `{ userId, email, role }`, 7-day expiry, signed with `JWT_SECRET`
- Auth cookie `auth-token` also set (non-httpOnly)
- Google OAuth available via `/api/auth/google/start` → `/api/auth/google/callback`

## State Management

Two Zustand stores, both persisted:

**`useAuthStore`** (`auth-storage`):
- `user`, `token`, `isAuthenticated`, `isLoading`
- Methods: `setAuth()`, `logout()`, `updateUser()`, `setLoading()`

**`useAppStore`** (`project-hub-storage`):
- All domain data: `workspaces`, `currentWorkspace`, `projects`, `currentProject`, `tasks`, `routines`, `objectives`, `ideas`, `driveFiles`, `driveFolders`
- UI state: `sidebarCollapsed`, `isMobileMenuOpen`, `isAiAssistantOpen`, `activeView`
- Modal booleans: `isProjectModalOpen`, `isTaskModalOpen`, `isRoutineModalOpen`, `isObjectiveModalOpen`, `isIdeaModalOpen`, `isWorkspaceModalOpen`, `isUploadModalOpen`, `isCreateFolderModalOpen`, `isSearchModalOpen`, `isCreateUserModalOpen` + their related IDs
- Methods: full CRUD for each entity (set, add, update, delete)
- Modal state is NOT persisted (only domain data + UI prefs are)

## Data Models (`src/models/`)

Relationship chain: `User` → `Workspace` → `Project` → `Task`

All models use `mongoose.models` caching pattern to prevent re-registration.

| Model | Key Fields |
|---|---|
| `User` | firstName, lastName, email, password (bcrypt), authProvider (password\|google), googleId, avatar, profileColor, role (user\|admin\|moderator\|support), workspaces[], preferences{theme,language,notifications}, driveAccess |
| `Workspace` | name, owner, members[{user, role}], useCase, stripeCustomerId, subscriptionId, subscriptionPlan (starter\|pro\|team\|business\|enterprise), subscriptionStatus, subscriptionInterval, subscriptionEnd |
| `Project` | name, color, icon, workspace, owner, members[{user, role}], securePassword (bcrypt optional), status (active\|archived\|paused), settings.isPublic |
| `Task` | title, project, projectName, projectColor, assignees[], creator, priority (important\|less_important\|waiting), status (todo\|in_progress\|review\|done), dueDate, subtasks[], attachments[], comments[], order |
| `Routine` | title, project, creator, assignee, days{mon-sun booleans}, time (HH:MM), duration, isActive, completedDates[] |
| `Objective` | title, project, workspace, creator, assignees[], targetDate, progress (0-100), checkpoints[], status (not_started\|in_progress\|completed\|cancelled), priority (low\|medium\|high) |
| `Idea` | title, content, project, workspace, creator, assignees[], tags[], status (raw\|standby\|in_progress\|implemented\|archived), votes[], comments[] |
| `SecureId` | title, link, username, password (AES-256-CBC, select:false), notes, category, project, owner, sharedWith[] |
| `DriveFile` | name, type (MIME), size, url (Vercel Blob), project, folderId, owner |
| `DriveFolder` | name, project, parentId (hierarchical), owner |
| `Message` | sender, recipient, conversation, content, attachments[{type: task\|objective\|file\|folder, id, name}], read, readBy[], deletedForSender, deletedForRecipient |
| `Conversation` | name, type: group, workspace, creator, members[{user, role: admin\|member}], lastMessage |
| `Invitation` | email, workspace, role, token (unique), inviter, status (pending\|accepted\|expired), expiresAt, projectIds[] |
| `GlobalSettings` | permissions{createProject, deleteProject, inviteMembers, driveAccess, allowedFileTypes[]} |
| `SystemLog` | user, action, details, status (info\|warning\|error\|success), ip |
| `EmailTemplate` | name, subject, body (HTML), type, automationKey (welcome\|payment\|invitation…), variables[] |
| `EmailConfig` | smtp{host, port, secure, user, pass, from}, automations{onRegister, onPayment, onInvitation…} |
| `EmailCampaign` | name, subject, body, status (draft\|sending\|sent\|failed), audience{type, customEmails}, stats{total, sent, failed} |
| `EmailSendLog` | to, subject, status, category, templateId, campaignId, userId, errorMessage, sentAt |
| `AIConversation` | workspace, user, phone (WhatsApp), title, lastMessage, messageCount, status |
| `AIMessage` | conversation, role (user\|assistant), content, metadata{intent, payload} |
| `WhatsAppLink` | workspace, user, phone, waUserId, label, isActive, lastInboundAt — unique indexes on (workspace,user), (workspace,phone), (workspace,waUserId) |
| `WhatsAppPendingAction` | workspace, user, phone, intent (task\|objective\|idea), payload{title,description,projectName…}, missingFields[], expiresAt |

### Security

- **Passwords:** bcrypt salt 12 — user passwords + optional project `securePassword`
- **SecureId vault:** AES-256-CBC via `src/lib/encryption.ts`, key from `ENCRYPTION_KEY` (32-byte hex), stored as `iv:encryptedText`
- **Access roles:** workspace/project members are admin|editor|visitor
- **File upload:** 50MB max, type whitelist configurable in `GlobalSettings`

## API Routes (`src/app/api/`)

All routes return `{ success, data/error }`. Auth via `Authorization: Bearer <token>`.

**Auth:** `/auth/login` (POST), `/auth/register` (POST), `/auth/me` (GET), `/auth/change-password` (POST), `/auth/verify-password` (POST), `/auth/google/start`, `/auth/google/callback`

**CRUD** (GET+POST on collection, GET+PUT+DELETE on `/[id]`): `/workspaces`, `/projects`, `/tasks`, `/routines`, `/objectives`, `/ideas`, `/secure-ids`, `/drive/files`, `/drive/folders`, `/messages`, `/conversations`

**Members:** `POST /workspaces/members`, `POST /projects/members`, `GET/POST /conversations/[id]/members`

**Messaging:** `GET/POST /messages` (direct), `GET /messages/contacts`, `POST /messages/read`, `GET/POST /conversations/[id]/messages`

**Drive:** `POST /upload` — multipart form, stores to Vercel Blob, checks `GlobalSettings.permissions.driveAccess`

**Stripe:** `POST /stripe/checkout` (creates session, ad-hoc pricing), `POST /stripe/webhook`

**AI & WhatsApp:**
- `POST /api/ai/whatsapp/webhook` — Meta webhook (GET = verify token, POST = inbound messages)
- `POST /api/ai/whatsapp/test` — Test without Meta integration
- `POST /api/ai/whatsapp/links` — Link phone number to workspace
- `POST /api/ai/whatsapp/outbound` — Send outbound message
- `GET/POST /api/ai/conversations[/[id]/messages]` — AI conversation history
- `POST /api/ai/objectives/generate` — AI-generated objectives
- `GET /api/ai/search` — AI-powered search

**Admin only:** `/admin/stats`, `/admin/users`, `/admin/workspaces`, `/admin/subscriptions`, `/admin/logs`, `/admin/settings`, `/admin/projects/access`, `/admin/emails/*` (campaigns, templates, logs, analytics, test, settings)

**Other:** `GET /search` (global cross-resource), `POST /contact`, `POST /invitations/validate`, `POST /invitations/accept`, `POST /debug/seed-users`

## WhatsApp AI Integration (`src/lib/whatsapp/`)

Flow: Meta webhook → `orchestrator.ts` → AI intent detection → entity creation or multi-turn clarification

- **`client.ts`** — Cloud API v23.0: `sendWhatsAppTextMessage()`, `sendWhatsAppReplyButtons()`, `isWhatsAppConfigured()`
- **`orchestrator.ts`** — `processWhatsAppMessage()`: resolves phone→workspace via `WhatsAppLink`, calls Claude/AI for intent (task|objective|idea), stores `WhatsAppPendingAction` for multi-turn flows, sends quick reply buttons
- **`actions.ts`** — `createTaskFromWhatsApp()`, `createObjectiveFromWhatsApp()`, `createIdeaFromWhatsApp()`
- **`normalize.ts`** — E.164 phone normalization

Audio messages are transcribed via OpenAI (`src/lib/ai/audio.ts`) before processing.

## Subscription Plans (`src/lib/limits.ts`)

| Plan | maxProjects | maxWorkspaces | maxMembers | storageGB | maxIds |
|---|---|---|---|---|---|
| starter (free) | 1 | 1 | 3 | 2 | 5 |
| pro | ∞ | 1 | 5 | ∞ | ∞ |
| team | ∞ | 4 | 10 | ∞ | ∞ |
| business | alias team | | | | |
| enterprise | ∞ | ∞ | ∞ | ∞ | ∞ |

**Pricing (ad-hoc Stripe, euros):**
- Pro: €9.99/mois ou €89.90/an
- Team: €29.99/mois ou €249.90/an

**Webhook events handled:** `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

## Design System

**Dark-first** with `next-themes` light mode toggle.

**CSS variables** (`src/app/globals.css`):
- `--bg-primary/secondary/tertiary` — backgrounds
- `--text-main/dim/muted` — text hierarchy
- `--glass-bg / --glass-border` — glass morphism (very subtle in dark mode)
- `--accent-primary: #6366f1` (indigo) — accent app
- `--accent-secondary: #8b5cf6` (purple)
- `--color-neon-cyan: #00FFB2` — landing page accent uniquement
- `--sidebar-w: 280px / --sidebar-coll: 80px`
- `.glass-card`, `.btn-primary`, `.priority-important/less/waiting` — utility classes

**Font:** Inter (Google Fonts). **Path alias:** `@/*` → `./src/*`. **Icons:** lucide-react exclusively.

## i18n

Custom React context at `src/lib/i18n/`. Default locale: **fr** (French). Stored in `mib-locale` localStorage key.

```tsx
const { locale, setLocale, t } = useTranslation();
// t.common.login, t.dashboard.*, t.pricing.*, etc.
```

Translation files: `src/lib/i18n/translations/fr.ts` and `en.ts`. Comments and variable names in the codebase are often in French.

## Email System (`src/lib/mail.ts`)

- Nodemailer SMTP (configurable via `EmailConfig` model, default Hostinger port 465)
- Templates stored in MongoDB (`EmailTemplate`), rendered with variable interpolation
- All sends logged to `EmailSendLog`
- Automation triggers: `onRegister`, `onPayment`, `onWorkspaceAction`, `onInvitation`, `onWorkspaceWelcome`
- Campaign audience types: `all_users`, `admins`, `notifications_enabled`, `recent_users`, `custom_emails`

## Key Utility Files

| File | Purpose |
|---|---|
| `src/lib/mongodb.ts` | Cached Mongoose connection (global variable pattern) |
| `src/lib/auth.ts` | `verifyAuth(req)` → `{ userId, email, role }` |
| `src/lib/encryption.ts` | AES-256-CBC encrypt/decrypt for SecureId vault |
| `src/lib/limits.ts` | `PLAN_LIMITS` object + `PlanName` type |
| `src/lib/stripe.ts` | Initialized Stripe instance |
| `src/lib/mail.ts` | Email sending + template rendering + logging |
| `src/lib/i18n/` | React i18n context + fr/en translation files |
| `src/lib/whatsapp/` | WhatsApp Cloud API client + AI orchestrator |
| `src/lib/ai/` | AI utilities (context, access, audio transcription) |

## Required Environment Variables

```
MONGODB_URI
JWT_SECRET
ENCRYPTION_KEY              # 32-byte hex for AES-256-CBC
BLOB_READ_WRITE_TOKEN       # Vercel Blob
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_PRO_MONTHLY / YEARLY
STRIPE_PRICE_BUSINESS_MONTHLY / YEARLY

# Google OAuth
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET

# WhatsApp (optional)
WHATSAPP_VERIFY_TOKEN
WHATSAPP_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_GRAPH_API_VERSION  # default: v23.0
WHATSAPP_DEFAULT_WORKSPACE_ID  # dev/testing only
WHATSAPP_DEFAULT_USER_ID       # dev/testing only

# OpenAI (WhatsApp voice messages)
OPENAI_API_KEY
OPENAI_TRANSCRIPTION_MODEL  # default: gpt-4o-mini-transcribe
```
