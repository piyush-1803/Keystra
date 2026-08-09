
## 2024-03-20 - Memoizing derived data in high-frequency React components
**Learning:** In Electron applications where React components receive real-time stats updating multiple times per second (like `liveStats`), expensive array filtering, sorting, and map iterations for chart data directly in the render function will block the main thread.
**Action:** Always wrap heavy derived state computations (like SVG wave paths or aggregate statistics) in `useMemo` specifically targeting the slower-moving dependency (like `stats` history) to isolate them from high-frequency state updates.

## 2026-08-09 - Memoizing entire child components in high-frequency React apps
**Learning:** In applications where parent components (like `App.jsx`) process high-frequency IPC events (e.g., `liveStats`), all child components re-render by default. If those child components perform complex DOM updates or charting (like `Analytics` or `Heatmap`), it can cause significant performance bottlenecks and blocked threads.
**Action:** Use `React.memo()` to wrap heavy child components that don't depend on the high-frequency state, isolating them from unnecessary cascading re-renders when the parent updates.
