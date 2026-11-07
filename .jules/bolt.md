
## 2024-03-20 - Memoizing derived data in high-frequency React components
**Learning:** In Electron applications where React components receive real-time stats updating multiple times per second (like `liveStats`), expensive array filtering, sorting, and map iterations for chart data directly in the render function will block the main thread.
**Action:** Always wrap heavy derived state computations (like SVG wave paths or aggregate statistics) in `useMemo` specifically targeting the slower-moving dependency (like `stats` history) to isolate them from high-frequency state updates.

## 2024-11-20 - Memoizing whole React components receiving frequent prop updates on parent but not directly
**Learning:** Even if a component only receives slow-updating props (like `stats`), it will re-render if its parent component updates frequently (like due to a `liveStats` listener updating parent state multiple times per second). If the child components contain heavy calculations for rendering (like `Analytics` and `Heatmap`), this will block the main thread and severely impact typing performance in the app.
**Action:** Identify expensive components rendered by frequently-updating parents, and wrap them in `React.memo()` to prevent them from re-rendering unless their specific props change. Also make sure to add clear explanatory comments on *why* this optimization was added to fulfill the Bolt persona.

## 2024-11-20 - Memoizing heavy JSX sub-trees to isolate high-frequency props
**Learning:** When a component (like `Dashboard`) must receive high-frequency props (like `liveStats`) to update live metrics, wrapping the entire component in `React.memo` is ineffective because the prop changes trigger a re-render anyway. If the component also contains heavy, static UI elements (like complex SVG charts or long lists), these elements will re-render unnecessarily on every keystroke, causing severe main-thread lag.
**Action:** Identify the specific blocks of expensive JSX that do not depend on the high-frequency props. Wrap these JSX blocks in a `useMemo` hook, returning the JSX directly. Pass only the slower-moving derived data variables (e.g. `todaySessions`, `wavePath`) in the dependency array. This technique effectively isolates the live metrics updates from the heavy rendering workload, ensuring the UI remains smooth during high-frequency events.
