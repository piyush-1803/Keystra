## 2024-07-29 - React Components receiving liveStats must useMemo
**Learning:** Components receiving `liveStats` update multiple times per second because the keystroke hook sends real-time metrics. Any component re-rendering on these live changes will block the main thread if it also recalculates heavy historical data (like SVG path mapping or looping over arrays of history data).
**Action:** Always wrap derived data calculations that depend on history `stats` inside a `useMemo` block when the component also receives `liveStats`.
