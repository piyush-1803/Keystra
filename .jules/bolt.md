
## 2024-03-20 - Memoizing derived data in high-frequency React components
**Learning:** In Electron applications where React components receive real-time stats updating multiple times per second (like `liveStats`), expensive array filtering, sorting, and map iterations for chart data directly in the render function will block the main thread.
**Action:** Always wrap heavy derived state computations (like SVG wave paths or aggregate statistics) in `useMemo` specifically targeting the slower-moving dependency (like `stats` history) to isolate them from high-frequency state updates.

## 2024-11-20 - Memoizing whole React components receiving frequent prop updates on parent but not directly
**Learning:** Even if a component only receives slow-updating props (like `stats`), it will re-render if its parent component updates frequently (like due to a `liveStats` listener updating parent state multiple times per second). If the child components contain heavy calculations for rendering (like `Analytics` and `Heatmap`), this will block the main thread and severely impact typing performance in the app.
**Action:** Identify expensive components rendered by frequently-updating parents, and wrap them in `React.memo()` to prevent them from re-rendering unless their specific props change. Also make sure to add clear explanatory comments on *why* this optimization was added to fulfill the Bolt persona.

## 2024-11-20 - Memoizing heavy UI components vs inline useMemo
**Learning:** Trying to use `useMemo` on a massive chunk of inline JSX containing complex logic (like early returns or extensive branching) can accidentally violate the Rules of Hooks if hooks are placed incorrectly after returns, or result in fragile, unreadable code with a huge dependency array.
**Action:** When a high-frequency component (like one receiving `liveStats`) renders heavy, static UI sections, do not use a massive inline `useMemo` block. Instead, extract the heavy UI into a separate sub-component (e.g., `<BentoGrid />`) outside of the main component function, and wrap that sub-component in `React.memo()`. This prevents unnecessary re-renders, adheres to React best practices for readability, and avoids violating hook rules.
