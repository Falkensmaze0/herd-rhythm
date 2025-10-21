## [Unreleased] - 2025-10-21
- Major dashboard UX upgrade: The Manager Dashboard now features intelligent, interactive components for visualizing profits, spending, workforce, overdue items, and ML-ready projections.
- New "Time Window" selector allows users to analyze dashboard KPIs over monthly/quarterly/yearly ranges seamlessly.
- Domain-specific highlights and modular charts improve clarity, interactivity, and insight for operational decision-making.

## [Type Export Enhancement] - 2025-10-21
- Improved compatibility with strict TypeScript settings (`isolatedModules`) by updating type re-exports in `src/types/index.ts`.
- Developers can now confidently use `ManagerAnalytics` throughout the codebase via `@/types`.
- This enables simpler, safer imports across dashboard and analytics features.