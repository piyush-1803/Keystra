
## 2024-03-20 - Memoizing derived data in high-frequency React components
**Learning:** In Electron applications where React components receive real-time stats updating multiple times per second (like `liveStats`), expensive array filtering, sorting, and map iterations for chart data directly in the render function will block the main thread.
**Action:** Always wrap heavy derived state computations (like SVG wave paths or aggregate statistics) in `useMemo` specifically targeting the slower-moving dependency (like `stats` history) to isolate them from high-frequency state updates.

## 2024-08-10 - Memoizing tabbed child components in high-frequency React contexts
**Learning:** In Electron applications with high-frequency state updates in parent components (like `App.jsx` receiving `liveStats` multiple times per second), child components like `Analytics` or `Heatmap` that only consume slower-updating props (like historical `stats`) will unnecessarily re-render on every keystroke, causing severe performance degradation.
**Action:** Always wrap these non-frequently updating child components in `React.memo()` to prevent cascading re-renders driven by their parent's high-frequency state.
