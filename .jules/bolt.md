## 2026-08-04 - React Memoization on High Frequency Props
**Learning:** `liveStats` (high frequency prop updating multiple times per second via IPC from Electron) was causing expensive recalculations of static props (`stats`) inside React functional components on every single render. This O(N) array iteration for historical sessions blocking the main thread can lead to UI stutter.
**Action:** Always wrap heavy derived data calculations that depend on static or low-frequency props in `useMemo` when a component also accepts high-frequency props.
