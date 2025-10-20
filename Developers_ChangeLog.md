## [Unreleased] – 2025-10-20

- Resolved all blocking TypeScript build errors, focusing on:
  - Dynamic backend filter object typing (Record<string, unknown> instead of {}) in API handlers
  - Explicit casting of nested property objects to comply with type-safe assignment (e.g., date ranges in filters)
  - Correct usage of async/fetch in React pages (fixed stray string, ensured valid async code)
- Confirmed stable production build and runtime, with all role landings and API endpoints reachable
- New standard: Always use explicit, extensible typing for dynamic objects in backend/TypeScript to avoid future assignment and mutation errors

## Latest UI Updates

- Refactored `RoleLanding` (admin): Added a glassy, modular command surface header. Contains executive summary, quick navigation (Overview, Profile, Settings), and Log Out button with contextual UX.
- Fixed tab overflow: Adjusted `<TabsList>` container to use `w-full`, `flex-wrap`, and `overflow-hidden`, ensuring tabs never overflow for roles with many module tabs and mobile/small screens.
- Uses `useAuth` for context-aware logout and greeting in the RoleLanding header.
- No business logic or API change—strictly UI/flow improvements for admin and multi-role extensibility.

...previous changelog entries...

## Latest Architectural Refactors

- **Modular Authentication Refactor**: Split AuthService into server-only (`AuthService.server.ts`) and client stub (`AuthService.ts`) to prevent server code leaks into the client bundle. All client-side auth now routes through API endpoints (`/api/auth/*`), ensuring no direct service calls.
- **API Route Normalization**: Updated `/api/auth/login.ts` to import server-only AuthService, handling login with proper session/cookie management via Prisma/PostgreSQL.
- **Context Updates**: Refactored `AuthContext.tsx` to use fetch calls to API routes for all auth actions (register, login, session validation, logout, password reset). Removed direct AuthService dependencies and added role-based redirection logic via a configuration map.
- **Webpack Configuration Fixes**: Corrected `next.config.mjs` to use ESM imports and proper client fallbacks for Node.js modules like Buffer and Crypto, resolving "require is not defined" crashes.
- **Server-Client Boundary Enforcement**: Added universal stubs and server-only modules with clear comments outlining code boundaries, improving security and maintainability.
- **Error Handling Enhancements**: Implemented defensive try/catch blocks and detailed error responses in API routes and context, with UI feedback via toasts.
- **Database Integration**: Ensured full PostgreSQL/Prisma integration for auth persistence, with .env verification for secrets and connections.

## Code-Level Changes

- Renamed and split `AuthService.ts` into `AuthService.server.ts` (server logic) and `AuthService.ts` (client stub).
- Added new API endpoints: `/api/auth/register.ts`, `/api/auth/reset.ts`, `/api/auth/reset/confirm.ts`, `/api/auth/logout.ts` (pending full implementation).
- Updated imports across files to use server-only modules where applicable.
- Introduced role-route map in `AuthContext.tsx` for extensible redirection.
- Fixed Next.js config to handle ESM and client-side polyfills.

## Dependencies and Environment

- Confirmed .env setup for DATABASE_URL and auth secrets.
- Prisma migrations and seeding integrated for dev/prod consistency.

## Testing and Debugging

- Resolved client bundle crashes by enforcing API-first calls.
- Planned runtime tests for all auth flows, including role-based redirects and session sync.

## Future Extensions

- Implement 2FA placeholders.
- Add admin-specific auth features.
- Optimize for production deployment with Vercel/Prisma.
