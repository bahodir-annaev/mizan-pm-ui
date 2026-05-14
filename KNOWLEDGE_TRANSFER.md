# Knowledge Transfer: AI Project Management Dashboard UI

A comprehensive onboarding guide for new contributors.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Getting Started](#2-getting-started)
3. [Tech Stack](#3-tech-stack)
4. [Repository Layout](#4-repository-layout)
5. [Routing & Pages](#5-routing--pages)
6. [State Management & Contexts](#6-state-management--contexts)
7. [Data & API Layer](#7-data--api-layer)
8. [Type System](#8-type-system)
9. [Authentication](#9-authentication)
10. [Component Architecture](#10-component-architecture)
11. [Theming & Styling](#11-theming--styling)
12. [Internationalisation (i18n)](#12-internationalisation-i18n)
13. [Real-time (WebSocket)](#13-real-time-websocket)
14. [Finance Module](#14-finance-module)
15. [Key Patterns & Conventions](#15-key-patterns--conventions)
16. [Build & Tooling](#16-build--tooling)
17. [Current Status & Known Gaps](#17-current-status--known-gaps)

---

## 1. Project Overview

A full-featured, client-side project management dashboard with:

- Multi-level task hierarchies (projects → tasks → subtasks)
- Kanban board, Gantt chart, and table views
- Time tracking, budget management, team workload
- Finance module (invoices, expenses, payroll, P&L, cash flow)
- Client management, analytics dashboards
- Real-time updates via WebSocket
- 5 switchable UI themes, 3-language i18n

The app is **frontend-only with a mock/real toggle**: all services branch on a `VITE_USE_MOCK` env flag. With the flag on, data comes from in-memory mock objects; with it off, the app hits a REST API at `VITE_API_URL`.

---

## 2. Getting Started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle
npm run test       # vitest (single run)
npm run test:watch # vitest watch mode
```

**Environment variables** (create a `.env` at the project root):

| Variable              | Default                          | Purpose                   |
|-----------------------|----------------------------------|---------------------------|
| `VITE_API_URL`        | `http://localhost:3000/api/v1`   | REST API base URL         |
| `VITE_WS_URL`         | `http://localhost:3000`          | WebSocket server URL      |
| `VITE_DEV_API_TARGET` | `http://localhost:3000`          | Vite dev proxy target     |
| `VITE_USE_MOCK`       | `true`                           | Use mock data (no backend)|

There is **no linter or formatter** configured. No test coverage requirements currently.

---

## 3. Tech Stack

| Layer | Library | Notes |
|---|---|---|
| Framework | React 18.3 | Concurrent mode, Suspense-ready |
| Build | Vite 6.3 | ES modules, `"type": "module"` |
| Language | TypeScript | Strict, no `any` by convention |
| Routing | React Router v7 | `createBrowserRouter` |
| Server state | TanStack Query v5 | Caching, invalidation, optimistic updates |
| HTTP | Axios 1.13 | JWT interceptor, token refresh queue |
| WebSocket | Socket.io-client 4.8 | Real-time task/project events |
| UI primitives | shadcn/ui (48 components) | Radix UI-based, in `src/app/components/ui/` |
| UI extras | Material-UI v7 | Icons, dialog, card — coexists with shadcn |
| Icons | Lucide React | Primary icon set |
| Charts | Recharts 2.15 | Bar, line, area, pie |
| CSS | Tailwind CSS v4 | Via `@tailwindcss/vite` (no PostCSS needed) |
| Forms | react-hook-form 7 | All form state management |
| Drag & drop | react-dnd 16 | Task reordering |
| Animation | Framer Motion 12 (motion) | Transitions, micro-animations |
| Date utils | date-fns 3.6 | Formatting, calculations |
| Testing | Vitest + Testing Library | Minimal coverage currently |

---

## 4. Repository Layout

```
src/
├── main.tsx                    # Entry point — mounts <Providers />
├── types/
│   ├── api.ts                  # Backend-aligned DTOs & enums
│   └── domain.ts               # Frontend display types (post-mapping)
├── lib/
│   ├── config.ts               # API_BASE_URL, WS_URL, USE_MOCK_DATA
│   ├── api-client.ts           # Axios instance + JWT interceptor
│   ├── auth-storage.ts         # In-memory access token helpers
│   ├── websocket.ts            # Socket.io manager
│   └── mappers/                # API ↔ Domain type transformations
│       ├── project.mapper.ts
│       ├── task.mapper.ts
│       ├── user.mapper.ts
│       ├── team.mapper.ts
│       ├── client.mapper.ts
│       ├── time-entry.mapper.ts
│       └── index.ts            # Re-exports all mappers
├── services/                   # One service file per feature domain
├── hooks/
│   ├── api/                    # TanStack Query custom hooks
│   │   └── query-keys.ts       # Centralized query key factory
│   ├── useWebSocket.ts
│   └── useRealtimeUpdates.ts
├── mocks/                      # Static mock data
├── contexts/                   # Global contexts (TimeTracking, MediaPlayer)
├── utils/                      # Shared utilities (buildTree, formatting)
├── styles/
│   ├── index.css               # Tailwind entry + global resets
│   ├── theme.css               # 40+ CSS custom property definitions
│   └── themes.css              # 5 theme variant overrides
└── app/
    ├── providers.tsx           # Full provider hierarchy wrapper
    ├── router.tsx              # Route definitions
    ├── AppLayout.tsx           # Authenticated shell (Sidebar + Header + Outlet)
    ├── App.tsx                 # Legacy view-switcher (kept for reference)
    ├── auth/                   # Auth pages + ProtectedRoute
    ├── contexts/               # App-scoped contexts (Budget, Overlay, Translation)
    ├── hooks/                  # App-scoped hooks
    ├── components/             # 80+ shared UI components
    │   ├── ui/                 # shadcn/ui primitives (do not edit)
    │   ├── figma/              # Figma-generated components
    │   ├── finance/            # Finance module components
    │   └── teams/              # Team-specific components
    ├── pages/                  # Route-level page components
    │   └── finance/            # Finance sub-pages
    └── utils/                  # App-specific utilities
```

**Rule of thumb for file placement:**
- Put things in `src/app/` if they are specific to the React application shell (pages, layout, routes).
- Put things in `src/` (root level) if they are reusable infrastructure (services, hooks, mappers, types, utils).

---

## 5. Routing & Pages

Routing uses `createBrowserRouter` (React Router v7). All authenticated routes are children of `AppLayout`, which enforces auth via `ProtectedRoute`.

### Public routes
| Path | Component |
|---|---|
| `/login` | `LoginPage` |
| `/register` | `RegisterPage` |
| `/forgot-password` | `ForgotPasswordPage` |
| `/reset-password` | `ResetPasswordPage` |

### Authenticated routes (children of `AppLayout`)
| Path | Component |
|---|---|
| `/` | Redirects → `/tasks` |
| `/dashboard` | `DashboardPage` |
| `/projects` | `ProjectsPage` |
| `/projects/:id` | `ProjectDetailPage` |
| `/tasks` | `TasksPage` |
| `/analytics` | `AnalyticsPage` |
| `/team` | `TeamPage` |
| `/clients` | `ClientsPage` |
| `/settings` | `SettingsPage` |
| `/finance` | Redirects → `/finance/invoices` |
| `/finance/invoices` | `InvoicesPage` |
| `/finance/expenses` | `ExpensesPage` |
| `/finance/transactions` | `TransactionsPage` |
| `/finance/payroll` | `PayrollPage` |
| `/finance/purchase-orders` | `PurchaseOrdersPage` |
| `/finance/budget-lines` | `BudgetLinesPage` |
| `/finance/summary` | `FinancialSummaryPage` (read-only) |
| `/finance/profit-loss` | `ProfitLossPage` (read-only) |
| `/finance/cash-flow` | `CashFlowPage` (read-only) |

### AppLayout

`src/app/AppLayout.tsx` renders `<Sidebar>` + `<Header>` + `<Outlet>`. It also calls `useRealtimeUpdates()` once so WebSocket event handlers are registered for the whole authenticated session.

---

## 6. State Management & Contexts

There is **no Redux or Zustand** — all global state is React Context.

### Provider hierarchy (`src/app/providers.tsx`)

```
QueryClientProvider       ← TanStack Query (staleTime: 60s, retry: 1)
  TranslationProvider     ← i18n
    OverlayProvider       ← modal/overlay lifecycle
      BudgetProvider      ← project budget tracking (10B cap)
        AuthProvider      ← JWT session, login/logout
          TimeTrackingProvider  ← active timer state
            RouterProvider      ← React Router
```

### Context summary

| Context | Location | Purpose |
|---|---|---|
| `TranslationContext` | `src/app/contexts/` | i18n — en / ru / uz, 150+ keys |
| `OverlayContext` | `src/app/contexts/` | Centralized modal registration, body scroll lock |
| `BudgetContext` | `src/app/contexts/` | Global project budget with 10B soft cap |
| `AuthContext` | `src/app/auth/` | JWT session, refresh flow, socket reconnect |
| `TimeTrackingContext` | `src/contexts/` | Timer start/stop with optimistic updates |
| `MediaPlayerContext` | `src/contexts/` | Task media/video playback state |

### When to use which

- **Component-local UI state** → `useState` / `useReducer`
- **Server data** (fetched, cached) → TanStack Query hooks in `src/hooks/api/`
- **Cross-component app state** → pick the appropriate Context above
- **Do not add new global contexts** unless absolutely necessary — prefer co-locating state or lifting it to the nearest common ancestor.

---

## 7. Data & API Layer

### Configuration — `src/lib/config.ts`

```ts
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';
export const WS_URL       = import.meta.env.VITE_WS_URL  ?? 'http://localhost:3000';
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK === 'true';
```

### HTTP client — `src/lib/api-client.ts`

Axios instance with two interceptors:

1. **Request** — attaches `Authorization: Bearer <token>` from in-memory storage.
2. **Response** — unwraps the `{ data, meta, errors }` envelope and handles 401s:
   - On 401, hits `/auth/refresh` (refresh token in httpOnly cookie).
   - Queues concurrent requests while refresh is in flight, then retries them.
   - On refresh failure, calls `logout()` and redirects to `/login`.

### Services — `src/services/`

One file per feature domain. Every service function follows this pattern:

```ts
export async function getProjects(params?: ProjectQueryParams): Promise<Project[]> {
  if (USE_MOCK_DATA) {
    return mockProjects.filter(...);
  }
  const response = await apiClient.get<ApiProject[]>('/projects', { params });
  return response.data.map(mapApiProjectToDomain);
}
```

| File | Responsibilities |
|---|---|
| `project.service.ts` | CRUD, member management, pinning |
| `task.service.ts` | CRUD, tree building, filtering |
| `task-features.service.ts` | Comments, checklists, participants |
| `team.service.ts` | Team CRUD, member management |
| `user.service.ts` | Profile, auth status |
| `client.service.ts` | Client CRUD, contacts |
| `analytics.service.ts` | Aggregated metrics data |
| `time-tracking.service.ts` | Timer start/stop, time entries |
| `budget.service.ts` | Budget records |
| `notification.service.ts` | Notifications list, mark-read |
| `search.service.ts` | Global search across entities |
| `finance.service.ts` | Exchange rates, overhead, equipment, hourly rates |
| `file.service.ts` | Upload / download |

### TanStack Query hooks — `src/hooks/api/`

Wrap service calls. Components **never call services directly** — always go through a query hook.

```ts
// Good
const { data: projects, isLoading } = useProjects();

// Bad — don't call services in components
const projects = await projectService.getProjects();
```

**Query key factory** (`query-keys.ts`) provides a single source of truth for cache keys, enabling precise invalidation:

```ts
queryClient.invalidateQueries({ queryKey: queryKeys.tasks.byProject(projectId) });
```

**Mutation hooks** use `onSuccess` callbacks to invalidate related queries, keeping the cache fresh automatically.

---

## 8. Type System

Two separate type layers are intentional — they decouple the API contract from the UI representation.

### `src/types/api.ts` — Backend types

- Enums mirroring backend values: `ProjectStatus`, `TaskStatus`, `TaskPriority`, `WorkType`, etc.
- DTO shapes: `CreateProjectDto`, `UpdateTaskDto`, `LoginDto`, etc.
- Response envelope: `ApiResponse<T>`, `PaginationMeta`, `ApiError`
- Raw entity shapes returned by the API: `ApiProject`, `ApiTask`, `ApiUser`, etc.

### `src/types/domain.ts` — Frontend types

- Display-oriented types: `Project`, `Task`, `TreeTask`, `TeamMember`, `Client`, `TimeEntry`
- All dates are JS `Date` objects (not ISO strings)
- Status/priority fields are human-readable strings (not enums)
- Finance types: `Invoice`, `Expense`, `Transaction`, `PayrollRecord`, `PurchaseOrder`, `BudgetLine`

### Mappers — `src/lib/mappers/`

Transform API types → Domain types on the way in. Never pass raw `ApiXxx` types to UI components.

```
ApiProject  →  project.mapper.ts  →  Project
ApiTask     →  task.mapper.ts     →  Task
ApiUser     →  user.mapper.ts     →  AuthUser
```

---

## 9. Authentication

**Flow:**
1. User submits credentials → `POST /auth/login`
2. Server returns `{ accessToken }` in body + sets `refreshToken` as httpOnly cookie
3. Access token stored **in memory** via `src/lib/auth-storage.ts` (not localStorage — prevents XSS token theft)
4. On page reload: `AuthContext` automatically attempts `POST /auth/refresh` to restore session from cookie
5. On 401: Axios interceptor triggers refresh; all in-flight requests are queued and retried after

**Key files:**
- `src/app/auth/AuthContext.tsx` — `useAuth()` hook, `login()`, `register()`, `logout()`
- `src/lib/auth-storage.ts` — `getAccessToken()`, `setAccessToken()`, `clearTokens()`
- `src/app/auth/ProtectedRoute.tsx` — Redirects unauthenticated users to `/login`

**Socket reconnection:** `AuthContext` calls `connectSocket()` on successful login/refresh and `disconnectSocket()` on logout, keeping the WebSocket session in sync with auth state.

---

## 10. Component Architecture

### Shared utility components (`src/app/components/`)

| Component | Purpose |
|---|---|
| `Sidebar.tsx` | Navigation, project list, pinning, collapse |
| `Header.tsx` | Search, theme switcher, language, notifications, user menu |
| `ProjectTable.tsx` | Project list with inline editing |
| `WorksTable.tsx` | Task table — nested hierarchy, drag-and-drop, inline cells |
| `BoardView.tsx` | Kanban view of tasks |
| `GanttView.tsx` | Gantt/timeline chart |
| `FilterBar.tsx` | Multi-filter panel for projects and tasks |
| `TaskDetailModal.tsx` | Full task edit form |
| `AddProjectModal.tsx` | Create/edit project |
| `AddTaskModal.tsx` | Create/edit task |
| `EditClientModal.tsx` | Client form |
| `NotificationBell.tsx` | Unread-count badge dropdown |
| `GlobalSearch.tsx` | Live search with results grouped by type |
| `QueryWrapper.tsx` | Consistent loading / error / empty states for any async list |
| `StatCard.tsx` | Metric card (label, value, icon, iconColor, children slot) |
| `ModalHeader.tsx` | Reusable modal chrome: title + close button + border |
| `UserAvatar.tsx` | Wraps shadcn `Avatar`; exports `getInitials(name)` |
| `ErrorBoundary.tsx` | React error boundary |
| `SearchInput.tsx` | Styled search input with icon + clear button |

### Editable cell pattern

Inline editing is used heavily in tables. A family of components handles it:

- `EditableCell` — generic cell that toggles between display and input
- `EditableWorkCell` — task-specific variant
- `EditableProjectCell` — project-specific variant
- `EditableSubtask` — subtask row with inline controls

These components contain the `onBlur`/`onKeyDown` save logic themselves. Do not re-implement this pattern; extend these components if new field types are needed.

### Overlay management

When opening a modal, register it with `OverlayContext` via `useOverlayManager()`. This:
- Tracks the stack of open overlays
- Locks `document.body` scroll while any overlay is open
- Allows nested modals to close in order (Escape key respects the stack)

Never use raw `document.body.style.overflow` in components — always go through the context.

### shadcn/ui components (`src/app/components/ui/`)

These are local copies of Radix-based primitives. **Do not edit them directly.** When upgrading, re-run the shadcn CLI. When you need a new primitive, add it via `npx shadcn@latest add <component>`.

---

## 11. Theming & Styling

### Theme system

Five themes are defined entirely via CSS custom properties on the `<html>` element's `data-theme` attribute:

| Theme key | Description |
|---|---|
| `light-soft` | Soft light palette |
| `dark-calm` | Default dark theme |
| `graphite-blue` | Dark with blue accents |
| `warm-sand` | Warm neutral light |
| `abba-brand` | Brand-specific palette |

The active theme is persisted to `localStorage` under the key `app-theme`.

### CSS variable structure (`src/styles/theme.css` + `themes.css`)

40+ variables, grouped by purpose:

```css
--bg-primary        /* Page background */
--bg-surface        /* Cards, panels */
--bg-elevated       /* Elevated surfaces, popovers */
--border-subtle     /* Default borders */
--text-primary      /* Body text */
--text-muted        /* Secondary/placeholder text */
--status-active     /* Task/project status colors */
--priority-high     /* Priority indicator colors */
/* ... */
```

Always use CSS variables for colors — **never hardcode** `#hex` or `rgb()` values in components.

### Tailwind CSS v4

- Configured via the Vite plugin, **no `tailwind.config.js` or PostCSS** required.
- Utility classes are the primary styling mechanism in JSX.
- For values that don't map to Tailwind utilities, use inline `style={{ '--var': value }}` or add to the CSS files above.

---

## 12. Internationalisation (i18n)

**Context:** `TranslationContext` in `src/app/contexts/`

**Supported languages:** English (`en`), Russian (`ru`), Uzbek (`uz`)

**Usage:**

```tsx
const { t, language, setLanguage } = useTranslation();
// t('key') returns the string for the active language
```

**150+ translation keys** cover all user-facing strings. When adding new UI text:

1. Add the key to all three language objects in `TranslationContext`.
2. Use `t('your.key')` in the component — never hardcode visible strings.

The active language is persisted in `localStorage`.

---

## 13. Real-time (WebSocket)

**Library:** Socket.io-client 4.8

**Manager:** `src/lib/websocket.ts`
- `connectSocket(token)` — opens the connection with JWT auth
- `disconnectSocket()` — closes cleanly
- `joinProjectRoom(projectId)` — subscribes to project-specific events
- `onWsEvent(event, handler)` — registers event listeners

**Hook:** `src/hooks/useRealtimeUpdates.ts`
- Called **once** in `AppLayout.tsx`
- Listens for server events (`task:updated`, `project:updated`, etc.)
- On each event, calls `queryClient.invalidateQueries(...)` with the appropriate key from `query-keys.ts`
- This means UI components automatically re-render with fresh data — no manual refresh needed

**When `VITE_USE_MOCK=true`:** `connectSocket()` is a no-op; WebSocket is fully skipped.

---

## 14. Finance Module

A self-contained sub-application under `/finance`. Six manually-managed pages and three auto-calculated report pages.

### Manual/CRUD pages

Each has: stats bar, search, CRUD table, Add/Edit modal, CSV import with preview dialog, Delete confirm.

- `InvoicesPage` — invoice tracking
- `ExpensesPage` — expense records
- `TransactionsPage` — transaction log
- `PayrollPage` — payroll records
- `PurchaseOrdersPage` — purchase orders
- `BudgetLinesPage` — budget line items

### Read-only report pages

Auto-calculated, no edit or import controls. Display an "Auto-calculated" badge and last-updated timestamp.

- `FinancialSummaryPage` — KPI overview
- `ProfitLossPage` — P&L with Recharts bar/line charts
- `CashFlowPage` — Cash flow with area charts

### Finance types (`src/types/domain.ts`)

`Invoice`, `Expense`, `Transaction`, `PayrollRecord`, `PurchaseOrder`, `BudgetLine` — each with a corresponding status enum.

### Sidebar

Finance pages appear in a collapsible section in `Sidebar.tsx`, using the same collapse pattern as the Projects section.

---

## 15. Key Patterns & Conventions

### Task hierarchy

Tasks are stored flat by the API and converted to a tree client-side:

```ts
// src/utils/buildTree.ts
const tree = buildTree(flatTasks); // Task[] → TreeTask[]
```

`TreeTask` extends `Task` with a `children: TreeTask[]` array. The `WorksTable` and `BoardView` consume this tree shape.

### Column configuration

The `useColumnConfig(tableId)` hook manages which columns are visible and in what order for each table. Configuration is persisted in `localStorage`. Tables that support column customisation receive a `<ColumnConfigPanel>` trigger in their toolbar.

### Query invalidation flow

```
User action (create/update/delete)
  → mutation hook (useCreateTask, etc.)
    → service call (task.service.ts)
      → onSuccess: queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
        → affected components re-render with fresh data automatically
```

### Optimistic updates (time tracking)

`TimeTrackingContext` applies an optimistic state update before the API call resolves, then reverts on error. This makes the timer feel instantaneous even on slow connections.

### Error boundaries

Wrap page-level components in `<ErrorBoundary>` to prevent a broken widget from crashing the whole dashboard.

---

## 16. Build & Tooling

### Vite config (`vite.config.ts`)

- React plugin with Fast Refresh
- Tailwind CSS Vite plugin
- Path alias: `@` → `./src`
- Dev server proxy: `/api/*` and `/socket.io/*` → `VITE_DEV_API_TARGET`

This means during development you can call `/api/v1/projects` from the frontend and it transparently proxies to your backend — no CORS issues.

### TypeScript

Strict mode is recommended. The codebase uses explicit return types on service functions and mapper functions. Avoid `any`.

### Testing

Vitest + happy-dom + `@testing-library/react` are installed. Coverage is minimal — integration-level tests are the priority when adding tests. **Do not mock the API client in tests** unless absolutely necessary; prefer testing against the mock data layer (`USE_MOCK_DATA=true`).

---

## 17. Current Status & Known Gaps

| Area | Status |
|---|---|
| Service layer (all domains) | Complete |
| TanStack Query hooks | Complete |
| Finance module | Complete |
| Auth flow | Complete |
| Real-time WebSocket | Wired up, no active events from mock backend |
| `AnalyticsPage` | Still uses inline mock data (not wired to `useAnalytics` hooks) |
| `TeamPage` | Partially wired to `useTeams()` |
| `SettingsPage` | Not wired to API hooks |
| `EmployeeProfile` | Not wired to API hooks |
| Prefetch on hover | Not implemented |
| `<QueryWrapper>` adoption | Partial — some list views still handle loading/error inline |
| `<StatCard>` adoption | Partial — `DashboardPage` and `AnalyticsPage` still use custom card markup |
| Test coverage | Very low — only smoke tests |
| PWA | Planned (`PWA_PLAN.md` exists), not yet implemented |

### Priorities for new contributors

1. Wire `AnalyticsPage` to `useAnalytics` hooks (drop inline mock data).
2. Adopt `<QueryWrapper>` in remaining list views for consistent loading/error UX.
3. Adopt `<StatCard>` in `DashboardPage` and `AnalyticsPage`.
4. Expand test coverage starting with service-layer unit tests.
5. Implement PWA (see `PWA_PLAN.md`).
