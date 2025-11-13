# Hybrid Mail Service Plan

This document captures the evolving plan for delivering the hybrid local mail server + Next.js API experience requested for Herd Rhythm. It intentionally documents multiple planning passes so future contributors can trace scope decisions.

## Iteration 1 – Baseline Architecture

### Objectives
1. Land the minimal viable hybrid mail stack (LMTP handler + Prisma-backed store + Next.js API).
2. Keep language-agnostic interfaces so individual services can be rewritten later without rewiring the rest of the stack.
3. Connect inbox UI (role-specific) to the new API surface with real data, filters, and actions.

### Component Map
| Layer | Responsibility | Technology |
| --- | --- | --- |
| Mail Transport (MTA) | Accept SMTP/LMTP, route local domains to delivery agent | Postfix (existing host config) |
| Local Delivery Service | Handle LMTP over UNIX socket, parse MIME, store messages, notify | Python 3.11 + `aiosmtpd`, `asyncpg`, `redis.asyncio` |
| Storage | Persist users/messages/attachments | PostgreSQL via Prisma (Next.js) and `asyncpg` (Python) |
| Application/API | REST endpoints under `/app/api/mail/*`, SSE/WebSocket broker | Next.js 14 App Router, TypeScript |
| Notification | Publish `new_mail:<recipient_id>` events | Redis Pub/Sub with SSE fan-out |
| Event Bus Contracts | `IMailStore`, `IMailTransport`, `IMailNotifier` (TS + Py Protocols) | Shared contracts |

### Initial Work Breakdown
1. **Schema** – Extend Prisma with `MailMessage`, `MailAttachment`, indexes, enums.
2. **Interfaces** – Create mirrored TypeScript `.d.ts` and Python `Protocol` definitions.
3. **Mailcore** – Build `mailcore/` package (config helpers, Postgres store, Redis notifier, LMTP handler bootstrap + CLI).
4. **Next.js API** – Route handlers for send/inbox/message/read/delete/search/unread + SSE stream at `/api/ws/mail`.
5. **UI** – Transform `RoleInboxView` into full mail client (list/detail/composer/folders/search/Live updates) with role-theming.
6. **Tooling** – `setup.sh`, scripts for smoke test + Postfix notes, README update.

### Risks Identified
- Edge runtime limitations for true WebSockets vs SSE.
- Coordinating Python + TypeScript interface drift.
- Postfix integration clarity for contributors without root access.

## Iteration 2 – Refinements for UX & Ops Completeness

Feedback from Iteration 1 surfaced additional requirements around UX depth, observability, and notifications. Adjustments:

1. **Notification Channel** – Implement Node-side Redis subscription and expose SSE stream at `/api/ws/mail`. Document how to flip to WebSockets later if running on Edge-compatible infra.
2. **Role UX Enhancements** –
   - Dedicated `MailRoleContext` describing hero copy/highlights/automation per role
   - Animated list transitions (Tailwind `animate-in`, subtle pulses for unread)
   - Split panels (folders + list + detail) with keyboard affordances.
3. **Composer** – Inline slide-over composer with recipient autocomplete (local users) + auto-detection of local vs external routes.
4. **Search** – Server-backed full-text search with `to_tsvector` index from Prisma raw query fallback.
5. **Testing Hooks** – `scripts/test-mail-flow.ts` verifying `deliverLocal` path; LMTP smoke CLI hitting handler via STDIN.
6. **Postfix Docs** – Provide concrete snippets for `main.cf`, `master.cf`, and `transport_maps` using `/var/run/mailpipe.sock` + `mailcore/lmtp_handler.py` supervisor instructions.
7. **Setup Automation** – `setup.sh` orchestrates `npm install`, Prisma push/seed, Python venv with `requirements.txt`, and optional Redis startup check.

## Iteration 3 – Final Scope Lock & Observability Additions

To ensure "all functionalities of a mail service" and portability, the final plan incorporates:

1. **Event Log** – Extend DB with `MailEvent` table for auditing send/deliver/open actions; expose via `/api/mail/activity` later (scaffold now).
2. **Attachment Handling** – Store metadata + temporary local path with pluggable `AttachmentStore` contract (default disk-based bucket under `storage/mail`).
3. **Error Budgets** – Observability hooks: structured logging in LMTP handler, OpenTelemetry span wrappers for API routes (hooked to existing tracing utils).
4. **Security** – JWT validation middleware reused by mail routes, role-based folder visibility enforced server-side.
5. **Front-end Polish** –
   - Multi-role quick switcher from inbox header.
   - Animated unread counter + skeleton loaders.
   - EventSource reconnection logic and toast surfacing when SSE drops.
6. **Documentation** – README section summarizing architecture, LMTP runner, Redis expectations, API reference, and troubleshooting.

With Iteration 3 locked, implementation can proceed following the breakdown below. Each major artifact (schema, interfaces, mailcore, API, UI, setup/tests) will point back to this plan so future agents can validate conformity.
