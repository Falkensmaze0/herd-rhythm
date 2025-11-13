# Herd Rhythm

## Project info

**URL**: https://lovable.dev/projects/ebbbc4cc-9cf5-4537-9cfa-684297ec4ded

Changes made via Lovable will be committed automatically to this repo.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

Need more detail on structure, scripts, and review expectations? See [AGENTS.md](AGENTS.md) for the full contributor guide.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Next.js
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Prisma
- PostgreSQL

## Backend API & Database

The application now exposes a RESTful API powered by Next.js API routes and backed by a PostgreSQL database via Prisma. The primary endpoints are:

| Route                    | Methods                         | Description                                                |
| ------------------------ | ------------------------------- | ---------------------------------------------------------- |
| `/api/cows`              | `GET`, `POST`                   | List cows or create a new cow record.                      |
| `/api/cows/[id]`         | `GET`, `PUT`, `DELETE`          | Retrieve, update, or remove a specific cow.                |
| `/api/reminders`         | `GET`, `POST`                   | Manage reminder collection.                                |
| `/api/reminders/[id]`    | `GET`, `PATCH`, `PUT`, `DELETE` | Work with a single reminder, including completion updates. |
| `/api/sync-methods`      | `GET`, `POST`                   | Manage synchronization protocol definitions.               |
| `/api/sync-methods/[id]` | `GET`, `PUT`, `DELETE`          | View or modify a specific synchronization method.          |
| `/api/analytics`         | `GET`                           | Returns dashboard analytics calculated from live data.     |

### Local setup

1. Copy the example environment file and update the `DATABASE_URL` with your PostgreSQL connection string:

   ```sh
   cp .env.example .env
   ```

2. Install dependencies (once registry access is available) and generate the Prisma client:

   ```sh
   npm install
   npx prisma generate
   ```

3. Create the database schema and seed it with the sample herd data:

   ```sh
   npm run db:push
   npm run db:seed
   ```

4. Start the development server:

   ```sh
   npm run dev
   ```

The sample seed mirrors the original mock data so the UI continues to display meaningful analytics immediately.

### Deploying to Vercel

1. Provision a PostgreSQL database (Vercel Postgres, Neon, Supabase, etc.) and copy the connection string.
2. In your Vercel project settings, add the `DATABASE_URL` environment variable.
3. Configure the build command to run Prisma before the Next.js build if you manage the deployment manually:

   ```sh
   npx prisma generate
   npx prisma migrate deploy
   ```

   When deploying via Vercel’s Git integration, you can add these commands to the **Build Command** or a [post-install script](https://vercel.com/docs/deployments/configure-a-build#install-command) as needed.

4. Trigger a redeploy. The API routes will automatically connect to the provisioned database at runtime using the `DATABASE_URL` secret.

For Vercel Postgres specifically, ensure `?sslmode=require` is appended to the URL and enable the "Prisma" integration to manage connection pooling automatically.

## Neon Tab Input & AI Integration

Each dashboard tab now features a bottom-anchored input box with rounded corners and neon-glow styling. This input sends its prompt, the current user's role, and parent tab identity to the backend via a dedicated API endpoint:

| Route                 | Methods | Description                                                                                           |
| --------------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| `/api/ai-agent-proxy` | `POST`  | Receives `{ prompt, userRole, tabId }` from the UI. Meant for contextual, role-aware prompt handling. |

### Python LLM Service

A scalable FastAPI microservice (`batman_llm_service`) powers the LLM backend. Every request is enriched with a system prompt (`you're batman`) for distinct persona modeling. The service supports modular backend configuration via `.env`:

- `LLM_apiBase`: URL for any OpenAI-compatible endpoint
- `LLM_apiKey`: Optional, if provider requires authentication

See `batman_llm_service/README.md` for usage and deployment details.

## Hybrid Mail Delivery (Approach 3)

The project now ships with a hybrid local-delivery mail stack that implements **Approach 3: Hybrid Local Delivery Agent**. The stack is split into clearly defined layers so any component (LMTP handler, transport, API, UI) can be reimplemented without refactoring the rest of the system.

### Architecture at a Glance

| Layer | Tech | Notes |
| --- | --- | --- |
| Mail Transport | Postfix + `sendmail` shim | External SMTP still flows through Postfix. All local domains short-circuit to LMTP `/var/run/mailpipe.sock`. |
| Local Delivery Service | `mailcore/lmtp_handler.py` (Python 3.11, `aiosmtpd`, `asyncpg`) | Receives LMTP input, parses MIME, persists to Postgres, pushes Redis Pub/Sub notifications. |
| Storage | PostgreSQL via Prisma + `asyncpg` | New tables: `MailMessage`, `MailAttachment`, `MailEvent` with indexes on `(recipientId, isRead, createdAt)`. |
| Application/API | Next.js App Router | REST endpoints under `/app/api/mail/*`, SSE route at `/api/ws/mail`, Prisma-backed service layer. |
| Notification Layer | Redis Pub/Sub + SSE | LMTP handler and Next.js service publish to `user:<id>`. Browser subscribes via EventSource. |
| Interfaces | `src/interfaces/mail/*.d.ts` + `mailcore/interfaces/*.py` | Contracts for `IMailStore`, `IMailTransport`, and `IMailNotifier` ensure language neutrality. |

### API Surface

| Route | Method | Description |
| --- | --- | --- |
| `/api/mail/send` | `POST` | Validate + send message. Local recipients short-circuit to DB/Redis; external recipients shell out to `sendmail`. |
| `/api/mail/inbox` | `GET` | Fetch inbox/sent/archived/trash slices with unread filters. |
| `/api/mail/[id]` | `GET`, `DELETE` | Retrieve or soft-delete a single message. |
| `/api/mail/[id]/read` | `PATCH` | Toggle read/unread status. |
| `/api/mail/search` | `GET` | Full text search via PostgreSQL `to_tsvector`. |
| `/api/mail/unread_count` | `GET` | Quick unread + priority counts for UI badges. |
| `/api/ws/mail` | `GET` (SSE) | Subscribes the browser to Redis Pub/Sub (`user:<id>`) for `new_mail` events. |

### Setup & Tooling

1. Copy `.env.example` ➜ `.env` and ensure `DATABASE_URL`, `REDIS_URL`, and `LOCAL_MAIL_DOMAIN` are set.
2. Run the consolidated bootstrap script:

   ```sh
   ./setup.sh
   ```

   This installs Node deps, pushes + seeds Prisma schema, and provisions a Python virtualenv (`.venv-mailcore`) with LMTP requirements.

3. Start services:

   ```sh
   npm run dev                                  # Next.js UI + API
   source .venv-mailcore/bin/activate
   python mailcore/lmtp_handler.py              # LMTP handler (listens on LMTP_SOCKET)
   ```

4. Optional smoke test for internal delivery:

   ```sh
   npm run mail:test
   ```

   The script sends a message from `manager-001` to `admin@farm.com` using the real service layer and asserts the admin inbox reflects it.

### Postfix → LMTP integration

Update `/etc/postfix/main.cf` to short-circuit the local domain:

```cf
virtual_transport = lmtp:unix:/var/run/mailpipe.sock
virtual_mailbox_domains = farm.com
```

Add a service entry in `/etc/postfix/master.cf`:

```cf
lmtp      unix  -       -       n       -       -       lmtp
  -o lmtp_overquota_warn_percent=80
```

Use `systemd` or `supervisord` to keep `mailcore/lmtp_handler.py` running so the socket is always available.

### Front-end Inbox Experience

The `role=menuitem` inbox now surfaces the full mail client:

- Role-aware copy, highlights, and automation summaries pulled from `src/data/roleInboxCopy.ts`.
- Split-pane UI with animated message list, keyboard-friendly selection, inline search, and saved view buttons.
- Slide-out composer (React Hook Form) with automatic detection of local vs external recipients.
- Attachment previews, contextual actions (mark read/unread, delete), and live unread digest cards.
- Background SSE stream (`useMailStream`) that invalidates React Query caches and surfaces toasts on delivery events.

Each piece relies on the shared `useMail` hook, ensuring the UI stays synchronized with the REST endpoints and Redis stream without manual state wrangling.
