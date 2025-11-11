The suggested edits should follow the existing changelog format and be placed in the appropriate section.

## [Unreleased] – 2025-10-20

- Resolved all blocking TypeScript build errors, focusing on:
  - Dynamic backend filter object typing (Record<string, unknown> instead of {}) in API handlers
  - Explicit casting of nested property objects to comply with type-safe assignment (e.g., date ranges in filters)
  - Correct usage of async/fetch in React pages (fixed stray string, ensured valid async code)
- Confirmed stable production build and runtime, with all role landings and API endpoints reachable
- New standard: Always use explicit, extensible typing for dynamic objects in backend/TypeScript to avoid future assignment and mutation errors

## Latest UI Updates- Injected NeonPromptInput into each tab panel in RoleLanding, passing user role and tab context. Modular, easy to extend per tab/user.

- Created src/components/ui/NeonPromptInput.tsx with prop-driven appearance, theme neon glow, and async submission to backend.
- Implemented /api/ai-agent-proxy Next.js endpoint, designed for role/tab/prompt transfer; future-proof for remote proxying.
- Added Python FastAPI microservice accepting tab/user context and prompt, system prompt is set to "you're batman". External LLM API base/key are configured via env; all agent logic is modular.
- Docs and .env.example for Python microservice generated.// ... existing content ...

## Feature: Global Dark/Light Mode Support

- The entire application now supports a global dark/light theme.
- Theme can be toggled at any time via the theme switcher (top right of screen).
- Theme choice persists (remembers user preference and system default).
- All backgrounds, cards, text, sidebars, and controls now maintain high contrast and soothing colors in both modes.
- UI updates instantly and consistently on theme toggle.

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

## [Unreleased]

- Refactored `src/components/dashboards/ManagerDashboard.tsx` to use modular, intelligent components: `TimeWindowSelector`, `PerformanceHighlights`, `CostBreakdownChart`, `WorkforceCapacityChart`, `ProjectionInsights`.
- Added `src/types/manager.ts` with strict/typed ManagerAnalytics interface for maintainability and clearer frontend-backend contract.
- Created highly reusable UI logic for time-window selection and analytics, increasing maintainability and testability.
- Deprecated hard-coded card UI in favor of domain-specific, prop-driven dashboards.
- Documented integration points for future ML and backend analytics enhancements.

---

This updated changelog now accurately reflects the changes made to the ManagerDashboard component, as well as the addition of a new type file. The suggested edits have been placed in the appropriate section of the existing changelog format.

- Refactored `src/components/reminders/ReminderCalendar.tsx`:
- Replaced template literals in JSX className attributes with an array of class tokens joined by space. This avoids JSX/TSX parsing issues, improves build safety, and aligns class logic with the theme/token system.
- Ensured reminder cell and day cell classNames are safely constructed for reliable dark/light theme integration.
- Confirmed 100% tokenized color usage for all ReminderCalendar UI elements.
- Successful build with theme infrastructure fully operational.
