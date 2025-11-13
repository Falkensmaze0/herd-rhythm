# Repository Guidelines

## Project Structure & Module Organization
- `src/pages` defines Next.js routes; keep page components lean and move data fetching, auth, and mutations into `src/lib` helpers or hooks in `src/contexts`.
- Shared UI belongs in `src/components`, styling tokens in `src/styles` and `tailwind.config.ts`, and reusable config/constants under `src/config` and `src/data`. Import via `@/` (e.g., `import { Button } from "@/components/ui/button"`).
- Assets live in `public/`, and Prisma schema plus seeds stay in `prisma/`. Update `middleware.ts` for new protected routes and `instrumentation.ts` whenever tracing spans or exporters change.
- Operational scripts sit in `scripts/` (see `scripts/cold-start.ts`); keep any one-off utilities there for discoverability.

## Build, Test, and Development Commands
- `npm run dev` starts Next on `http://localhost:3000` using `.env`.
- `npm run build` and `npm run start` create and serve the production bundle; run both before deployment-reviewed work.
- `npm run lint` applies the shared ESLint config—treat warnings as failures unless you note an exception in review.
- `npm run db:push` syncs Prisma schema, `npm run db:seed` replays `prisma/seed.ts`.
- `node test-prisma-connection.mjs` and `node api_box_test.js` provide smoke checks for database and API plumbing. `npm run cold-start` runs `scripts/cold-start.ts` to validate provisioning flows.
- `npm run db:seed` automatically runs `prisma db push` first so new columns (e.g., widget preferences) exist before inserting seed data; keep this coupling intact when adjusting seed logic.

## Coding Style & Naming Conventions
- TypeScript + ES modules with 2-space indentation. Prefer named exports and keep server-only helpers in `.server.ts`.
- Components/contexts use `PascalCase`, hooks `useCamelCase`, helpers `camelCase`, constants `UPPER_SNAKE`.
- Centralize styling through Tailwind tokens before adding custom CSS; rely on the `@/` alias to avoid brittle relative paths.

## Testing Guidelines
- Store `*.test.ts(x)` beside their modules or mirror the tree under `src/tests`. Use React Testing Library for UI and mock Prisma via `MockAuthService`.
- Exercise smoke scripts (`node test-prisma-connection.mjs`, `node api_box_test.js`) plus `npm run lint` whenever you touch auth, routing (`src/pages/index.tsx`), or persistence. Document any new env vars in the PR.

## Auto-Save & Widget Persistence
- Use `useUserSettings` for any persistence touching profile, inbox, layout, or widget toggles; pass `{ silent: true }` for background saves to avoid duplicate toasts.
- For form-like experiences, wrap `form.watch()` with `useAutoSave` (see `src/components/profile/RoleProfileView.tsx`) and provide an inline status indicator (`Saving…`, `Auto-save failed`, etc.).
- Widget-based surfaces should write to `widgetPreferences` via `updateSettings({ widgetPreferences: { [widgetId]: { enabled, scope, settings } } })` so new widgets inherit defaults defined in `src/data/roleSettings.ts` and Prisma seeds.
- When adding new widgets, define them in `ROLE_SETTINGS`, ensure their defaults map in `buildDefaultWidgetPreferences`, and add any custom settings shape to the API schema before shipping.

## Commit & Pull Request Guidelines
- Follow the imperative subject style with optional scopes (`feat/dashboard: add KPI drilldowns`) and reference issues in the body when relevant.
- PRs must summarize intent, list validation commands, and attach screenshots/GIFs for UI work. Highlight schema, env, middleware, or instrumentation updates so reviewers know to rerun Prisma and rotate secrets; request a domain reviewer before merging.
- After every major feature, routing, or infra change, update `AGENTS.md` (and link it from the PR) so contributors always have current guidance.

## Security & Configuration Tips
- Copy `.env.example` when onboarding, keep secrets outside Git, and only expose intentional client values via `NEXT_PUBLIC_*`.
- When roles or routing rules change, update `middleware.ts`, session helpers, and confirm tracing exporters in `instrumentation.ts` still target the correct endpoints.
