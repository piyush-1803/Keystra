## 2024-03-22 - Dashboard Performance Optimization
**Learning:** The Dashboard component receives `liveStats` from `App.jsx` which updates multiple times per second during active typing. Before this optimization, this caused extensive array operations (filter, reduce, map) and SVG path calculations to run on every keystroke, which could block the main thread and drop frames.
**Action:** Always wrap heavy data processing and chart path generation in `useMemo` hooks when working with real-time metric components in this app.
