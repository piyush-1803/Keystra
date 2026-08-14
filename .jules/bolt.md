
## 2024-03-20 - Memoizing derived data in high-frequency React components
**Learning:** In Electron applications where React components receive real-time stats updating multiple times per second (like `liveStats`), expensive array filtering, sorting, and map iterations for chart data directly in the render function will block the main thread.
**Action:** Always wrap heavy derived state computations (like SVG wave paths or aggregate statistics) in `useMemo` specifically targeting the slower-moving dependency (like `stats` history) to isolate them from high-frequency state updates.

## 2024-08-14 - React.memo for high-frequency state updates
**Learning:** In the Keystra React app, components like `Analytics` and `Heatmap` receive the `stats` prop which updates infrequently. However, their parent `App` component receives `liveStats` which updates multiple times per second, causing cascading re-renders of all child components.
**Action:** Always wrap heavy child components in `React.memo()` if they depend on low-frequency props but are rendered by a parent receiving high-frequency state updates.
