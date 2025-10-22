## [Unreleased] - 2025-10-21

- Major dashboard UX upgrade: The Manager Dashboard now features intelligent, interactive components for visualizing profits, spending, workforce, overdue items, and ML-ready projections.
- New "Time Window" selector allows users to analyze dashboard KPIs over monthly/quarterly/yearly ranges seamlessly.
- Domain-specific highlights and modular charts improve clarity, interactivity, and insight for operational decision-making.
- Added context-aware neon glowing input box at the bottom of every tab in the main dashboard UI. The input passes user role, parent tab, and prompt to the backend AI endpoint.
- Each tab's input dynamically sends its context to the backend, enabling distinctly personalized responses.
- Backend API endpoint implemented for prompt forwarding; ready for scalable AI agent integration.
- New Python LLM service (FastAPI) is available, responding as "you're batman", scalable and modularly designed to support live, role-aware completions.- Added context-aware neon glowing input box at the bottom of every tab in the main dashboard UI. The input passes user role, parent tab, and prompt to the backend AI endpoint.
- Each tab's input dynamically sends its context to the backend, enabling distinctly personalized responses.
- Backend API endpoint implemented for prompt forwarding; ready for scalable AI agent integration.
- New Python LLM service (FastAPI) is available, responding as "you're batman", scalable and modularly designed to support live, role-aware completions.

## Feature: Global Dark/Light Mode Support

- The entire application now supports a global dark/light theme.
- Theme can be toggled at any time via the theme switcher (top right of screen).
- Theme choice persists (remembers user preference and system default).
- All backgrounds, cards, text, sidebars, and controls now maintain high contrast and soothing colors in both modes.
- UI updates instantly and consistently on theme toggle.

- Enhancement: Fixed ReminderCalendar component to use array-join for className declarations, resolving previous build errors caused by template string syntax issues. Dark/light theming now works reliably across all calendar day cells and reminder entries.
