
## 2024-03-20 - Memoizing derived data in high-frequency React components
**Learning:** In Electron applications where React components receive real-time stats updating multiple times per second (like `liveStats`), expensive array filtering, sorting, and map iterations for chart data directly in the render function will block the main thread.
**Action:** Always wrap heavy derived state computations (like SVG wave paths or aggregate statistics) in `useMemo` specifically targeting the slower-moving dependency (like `stats` history) to isolate them from high-frequency state updates.

## 2024-11-20 - Memoizing whole React components receiving frequent prop updates on parent but not directly
**Learning:** Even if a component only receives slow-updating props (like `stats`), it will re-render if its parent component updates frequently (like due to a `liveStats` listener updating parent state multiple times per second). If the child components contain heavy calculations for rendering (like `Analytics` and `Heatmap`), this will block the main thread and severely impact typing performance in the app.
**Action:** Identify expensive components rendered by frequently-updating parents, and wrap them in `React.memo()` to prevent them from re-rendering unless their specific props change. Also make sure to add clear explanatory comments on *why* this optimization was added to fulfill the Bolt persona.

## 2024-11-21 - Memoizing UTC date strings safely across midnight boundaries
**Learning:** In high-frequency render components (like `Dashboard` updating via `liveStats`), generating `new Date().toISOString()` on every render causes massive string allocation and object creation overhead, pressing the garbage collector. However, memoizing it with an empty dependency array (`[]`) causes the date to become permanently stale across midnight boundaries.
**Action:** Use `Math.floor(Date.now() / 86400000)` (the number of UTC days since epoch) as the dependency for the `useMemo` hook. This safely prevents instantiating `new Date()` multiple times per second, while guaranteeing the cached value updates correctly at UTC midnight.
