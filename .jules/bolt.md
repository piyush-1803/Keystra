## 2024-08-02 - React Component `liveStats` Re-renders
**Learning:** Components receiving frequent updates like `liveStats` (multiple times per second via websockets/IPC) can block the main thread if they contain expensive data transformations (filtering, sorting, path building) in the render path.
**Action:** Always memoize derived state that depends on slower-moving data (like `stats`) using `useMemo` in components that also receive high-frequency state updates to prevent redundant work on every tick.
