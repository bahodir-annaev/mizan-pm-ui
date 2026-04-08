# Performance Profiling Guide — Project Management Dashboard UI

## 1. Bundle Analysis (Start Here)

The biggest wins usually come from bundle size. Run this without installing anything extra:

```bash
npx vite-bundle-visualizer
```

Or for a more detailed view, add the rollup plugin temporarily:

```bash
npm install --save-dev rollup-plugin-visualizer
```

Then edit `vite.config.ts`:

```ts
import { visualizer } from 'rollup-plugin-visualizer'

// inside plugins array:
visualizer({ open: true, gzip: true, filename: 'bundle-stats.html' })
```

Run `npm run build` — it opens an interactive treemap showing every chunk. **Look for:** MUI icons (`@mui/icons-material`) being a common blocker since it imports the entire icon set.

---

## 2. React DevTools Profiler (Render Performance)

1. Install the [React Developer Tools](https://chromewebstore.google.com/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) Chrome extension
2. `npm run dev` → open the app
3. Open DevTools → **Profiler** tab → click Record
4. Perform the action you want to measure (e.g., switching to the Tasks view, dragging a card)
5. Stop recording

**What to look for in this app:**
- `WorksTable` / `BoardView` — these render many rows/cards with `EditableCell` components; any re-render of the parent re-renders all children
- `EmployeeProjectMatrix` — matrix renders can be expensive; look for unnecessary full re-renders
- `DashboardPage` — multiple chart components via Recharts; check if they re-render on unrelated state changes

**Flamegraph tip:** Gray bars = didn't re-render. Yellow/orange = rendered. Click any bar to see why it rendered (props changed, hooks changed, etc.).

---

## 3. TanStack Query DevTools (Data Fetching)

Already installed in this project. It's available in dev mode via the floating button (bottom-right corner of the app).

**What to check:**
- Query states: `fresh` vs `stale` vs `fetching` — stale queries re-fetch on window focus by default
- Cache hits: if the same query key is fetched multiple times, you may be missing a `staleTime`
- Background refetch frequency — `useNotifications` polls every 60s; verify it's not causing cascade re-renders

---

## 4. Chrome Performance Tab (Frame Timing)

For jank during scrolling, drag-and-drop (react-dnd), or animations (Framer Motion):

1. Open DevTools → **Performance** tab
2. Click **Record** → reproduce the interaction → Stop
3. Look at the **Frames** row for red frames (>16ms = dropped frames)
4. Expand **Main** thread to see long tasks (red triangles = blocking >50ms)

**Specific interactions to test in this app:**
- Dragging a task card in BoardView
- Scrolling WorksTable with many rows
- Opening/closing modals (OverlayContext + Framer Motion animations)

---

## 5. Lighthouse (Overall Score)

```
Chrome DevTools → Lighthouse tab → Mode: Navigation → Categories: Performance → Analyze
```

Run it on `http://localhost:5173` after `npm run dev`. Key metrics:

| Metric | What it measures |
|--------|-----------------|
| **FCP** | First Contentful Paint — when login/skeleton appears |
| **LCP** | Largest Contentful Paint — when main content loads |
| **TBT** | Total Blocking Time — JS blocking the main thread |
| **CLS** | Cumulative Layout Shift — elements jumping around |

> Run in an **Incognito window** with extensions disabled for accurate results.

---

## 6. Network Tab (API / Mock Data Timing)

Even in mock mode, this reveals if any requests are slow or duplicated:

1. DevTools → **Network** tab → check **Disable cache**
2. Filter by `Fetch/XHR`
3. Hard-reload the app

**In this app:** With `VITE_USE_MOCK=true` there are no real API calls, but you can still see WebSocket handshake timing and any unexpected requests.

---

## 7. Quick Wins to Check First

Based on this app's stack:

- **MUI icons:** Replace `import { SomeIcon } from '@mui/icons-material'` with `import SomeIcon from '@mui/icons-material/SomeIcon'` (direct path import) — can cut 300KB+
- **Recharts:** Only import the specific chart types used, not the barrel export
- **React.memo:** Wrap `EditableCell`, `EditableWorkCell` — they're rendered in loops and rarely need to re-render when siblings change
- **Framer Motion:** The `motion` package is 110KB+ gzip; audit whether all animations are necessary or if CSS transitions can replace simple ones
- **Code splitting:** `AnalyticsPage` and `TeamPage` load Recharts + heavy components — good candidates for `React.lazy()` + `Suspense`

---

---

## 8. Memory Leak Detection

### Step 1 — Heap snapshot comparison

1. Open DevTools → **Memory** tab
2. Select **Heap snapshot** → click **Take snapshot**
3. Use the app for 5–10 minutes (switch views, open/close modals, let the 60s notification poll run a few cycles)
4. Take a **second snapshot**

Switch the dropdown from "Summary" to **"Comparison"** — it shows what was allocated and not collected. Look for growing counts on `EventEmitter`, `Socket`, `Closure`, or React component names.

### Step 2 — Allocation timeline

**Memory** tab → **Allocation instrumentation on timeline** → Record for ~3 minutes while using the app. Blue bars = allocations. If bars never shrink, GC isn't collecting — that's a leak.

### Likely causes in this app

**1. `onWsEvent` silent no-op** (`src/lib/websocket.ts:72-75`)
If `socket` is `null` when `onWsEvent` is called (socket connects after mount), the returned unsubscribe is a no-op. A reconnect can register new listeners without the old ones being removed.

**2. Framer Motion `MotionValue` accumulation**
Animated components hold `MotionValue` objects. Modals and overlays that mount/unmount frequently via `OverlayContext` can accumulate these if the component doesn't fully unmount.

**3. `refetchInterval` with no `gcTime`**
`useNotifications` and `useUnreadCount` poll every 60s with no `gcTime` set — cached response data is never evicted. Same issue applies to analytics hooks.

**4. `DndProvider` recreated on navigation**
`DndProvider` is mounted inside `BoardView`. Switching projects remounts it, and the old HTML5Backend may not fully clean up its DOM listeners.

### Mitigations

Add `gcTime` to polling queries in `src/hooks/api/useNotifications.ts`:

```ts
refetchInterval: 60000,
gcTime: 5 * 60 * 1000,       // evict from cache after 5 min of inactivity
refetchIntervalInBackground: false,  // pause polling when tab is hidden
```

Apply the same `gcTime` to analytics hooks (currently only have `staleTime`).

Move `DndProvider` up to the app level so it isn't recreated on navigation.

Audit for uncleaned intervals and listeners in component code:

```bash
grep -rn "setInterval\|addEventListener" src/app/components/
```

### Validating the fix

1. Heap snapshot before
2. Navigate all views 3–4 times, open/close several modals
3. Heap snapshot after → **Comparison** view
4. `Closure` and `EventEmitter` delta counts near zero = leaks resolved

---

## Workflow Recommendation

```
Bundle size check → React Profiler on heaviest views → Lighthouse score → Memory leak check → iterate
```

Start with bundle analysis since it's the fastest to do and usually yields the most improvement.
