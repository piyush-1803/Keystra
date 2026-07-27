## 2024-07-27 - Memoization of expensive dashboard operations
**Learning:** The Dashboard component was running heavy array operations (map, reduce, filter) and generating a complex SVG path string on every single frame when liveStats updated during typing.
**Action:** Use React's `useMemo` hook to cache data derivations and string path calculations, depending only on the less-frequent `stats` prop instead of running on every keystroke tick.
