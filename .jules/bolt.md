
## 2024-03-20 - Memoizing derived data in high-frequency React components
**Learning:** In Electron applications where React components receive real-time stats updating multiple times per second (like `liveStats`), expensive array filtering, sorting, and map iterations for chart data directly in the render function will block the main thread.
**Action:** Always wrap heavy derived state computations (like SVG wave paths or aggregate statistics) in `useMemo` specifically targeting the slower-moving dependency (like `stats` history) to isolate them from high-frequency state updates.
## 2024-03-21 - Memoizing React components to prevent cascading high-frequency updates
**Learning:** In React applications with a global parent state that receives very high-frequency updates (such as `liveStats` in `App.jsx`), child components that perform expensive data processing will be needlessly re-rendered on every update, blocking the main thread, unless explicitly memoized.
**Action:** Always use `React.memo()` around heavy child components (like `Analytics` and `Heatmap`) to prevent cascading re-renders when a parent component updates frequently with state that the child components do not use.
