
## 2024-03-20 - Memoizing derived data in high-frequency React components
**Learning:** In Electron applications where React components receive real-time stats updating multiple times per second (like `liveStats`), expensive array filtering, sorting, and map iterations for chart data directly in the render function will block the main thread.
**Action:** Always wrap heavy derived state computations (like SVG wave paths or aggregate statistics) in `useMemo` specifically targeting the slower-moving dependency (like `stats` history) to isolate them from high-frequency state updates.
## 2024-03-21 - Preventing cascading re-renders in Electron React apps
**Learning:** In Electron applications where real-time stats (`liveStats`) update multiple times per second, passing these stats from a parent `App` down to child components that perform heavy data derivations (like `Analytics` and `Heatmap`) will cause unnecessary, expensive re-renders even if the child components only depend on a slower-moving prop (like `stats`).
**Action:** Always wrap heavy child components in `React.memo()` when their parent receives high-frequency state updates to isolate them and prevent CPU spikes and main thread blocking.
