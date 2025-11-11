# Repository Guidelines

## Project Structure & Module Organization
- `src/pages` handles Next.js routing; keep page components small and push auth/data logic into services or hooks.
- `src/components`, `src/styles`, and `tailwind.config.ts` store shared UI primitives—import them via `@/` instead of deep relative paths.
- `src/lib`, `src/config`, `src/data`, and `src/contexts` hold utilities, constants, and shared state; Prisma schema/migrations live in `prisma/`, and static assets sit under `public/`.
- Update `middleware.ts` and `instrumentation.ts` whenever you add protected routes or tracing.

## Build, Test, and Development Commands
- `npm run dev` starts the Next dev server on `http://localhost:3000` using values from `.env`.
- `npm run build` and `npm run start` generate and serve the production bundle; run both before merging deployment work.
- `npm run lint` enforces the repo ESLint config; do not leave warnings unresolved without a note in code review.
- `npm run db:push` syncs `prisma/schema.prisma`, `npm run db:seed` replays `prisma/seed.ts`, and `node test-prisma-connection.mjs` plus `node api_box_test.js` give quick smoke checks after schema or API changes.

## Coding Style & Naming Conventions
- Use TypeScript, ES modules, and 2-space indentation; prefer named exports and the `@/` alias for anything under `src/`.
- Components/contexts use `PascalCase`, hooks `useCamelCase`, helpers `camelCase`, and constants `UPPER_SNAKE`.
- Keep stateful server helpers in `.server.ts` files, colocate schemas and adapters inside `src/lib`, and centralize styling through Tailwind tokens before adding custom CSS.

## Testing Guidelines
- Store tests as `*.test.ts(x)` beside their modules or inside `src/tests`; mirror the folder structure for discoverability.
- Mock Prisma via `MockAuthService` and exercise UI with React Testing Library so suites stay deterministic.
- Expand the smoke scripts (`test-prisma-connection.*`, `api_box_test.js`) when touching auth, routing (`src/pages/index.tsx`), or persistence, and document required env vars.

## Commit & Pull Request Guidelines
- Follow the existing imperative style with optional scopes (`feat/dashboard: migrate to modular dashboard blocks`); reference issues in the body when relevant.
- PRs must summarize intent, list validation commands (`npm run lint`, `node test-prisma-connection.mjs`), and attach screenshots or GIFs for UI-facing work.
- Highlight schema, env, or instrumentation adjustments so reviewers know to rerun Prisma and rotate secrets; request a domain reviewer before merging.

## Security & Configuration Tips
- Copy `.env.example` when onboarding and keep secrets outside Git; only expose values through the `NEXT_PUBLIC_*` prefix intentionally.
- Whenever roles or access rules change, update `middleware.ts` plus session helpers, and confirm the tracing exporters in `instrumentation.ts` still point to the right endpoints.
