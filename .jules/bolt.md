## 2024-05-18 - React.useMemo optimization for Dashboard
**Learning:** In frontend (React) components receiving `liveStats` update very frequently (e.g., multiple times per second). Any derived data calculations in these components must be memoized using `useMemo` to prevent performance bottlenecks and blocked main threads.
**Action:** Applied `useMemo` on heavy list operations like `todaySessions`, `todayKeysCount`, `controlPoints`, `maxSpeed`, `maxVolume` and `recentSessions` in `Dashboard.jsx`.
