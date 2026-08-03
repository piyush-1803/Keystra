## 2024-05-24 - React Component Memoization
**Learning:** Found that the React components (like `Dashboard.jsx`) do not use `useMemo` for expensive derived calculations, even though they receive `liveStats` that updates multiple times per second. This causes significant re-render bottlenecks.
**Action:** When working on performance optimizations in frontend React applications receiving high-frequency updates, ALWAYS wrap expensive derived state calculations in `useMemo`.
