## 2026-07-31 - [Dashboard Stats Memoization]
**Learning:** In React components that receive frequently updating props (like live typing metrics updating multiple times a second), performing array manipulations and object reductions directly in the render body creates severe performance bottlenecks.
**Action:** Use `useMemo` to wrap all heavy derived state calculations (e.g., aggregating sessions, calculating max values, computing SVG chart paths) so they only re-run when the base data (historical stats) changes, rather than on every high-frequency render trigger (live stats updates).
