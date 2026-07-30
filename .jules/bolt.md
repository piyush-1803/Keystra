## 2024-05-18 - React Re-render Bottleneck with liveStats
**Learning:** Components receiving `liveStats` in this architecture update multiple times per second (on every keystroke). Any derived data calculations in these components (like iterating over all past sessions) run synchronously on every update, which can quickly block the main thread and degrade the typing experience.
**Action:** Always wrap derived data calculations that depend on static or less-frequently changing props (like `stats`) in a `useMemo` hook to prevent redundant O(n) operations during rapid `liveStats` updates.
