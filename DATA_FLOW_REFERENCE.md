# Data Flow Reference Book

> How data travels from the backend API to the screen — using **TasksPage** as the running example.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Layer-by-Layer Walkthrough](#2-layer-by-layer-walkthrough)
   - [Layer 0 — Environment & Bootstrap](#layer-0--environment--bootstrap)
   - [Layer 1 — HTTP Client](#layer-1--http-client-srclibapi-clientts)
   - [Layer 2 — Type Contracts](#layer-2--type-contracts)
   - [Layer 3 — Mapper](#layer-3--mapper-srclibmappers)
   - [Layer 4 — Service](#layer-4--service-srcservicestask-servicets)
   - [Layer 5 — Query Keys](#layer-5--query-keys-srchooksapiquery-keysts)
   - [Layer 6 — React Query Hook](#layer-6--react-query-hook-srchooksapiusетаsksts)
   - [Layer 7 — Page / UI Component](#layer-7--page--ui-component-srcapppagestablepagepagestablepagetsx)
3. [Mutation (Write) Flow](#3-mutation-write-flow)
4. [Real-Time Updates via WebSocket](#4-real-time-updates-via-websocket)
5. [Mock vs Real Mode](#5-mock-vs-real-mode)
6. [Full Request Lifecycle Diagram](#6-full-request-lifecycle-diagram)
7. [File Map Quick Reference](#7-file-map-quick-reference)

---

## 1. Architecture Overview

```
Browser
  └── Providers (QueryClient, Auth, Router, ...)
        └── AppLayout  ← calls useRealtimeUpdates()
              └── TasksPage
                    ├── useAllTasks()        ← hook
                    │     └── taskService.getAllTasks()   ← service
                    │           └── apiClient.get('/tasks')  ← axios
                    │                 └── Backend REST API
                    └── useUpdateTask()      ← mutation hook
```

Data flows **down** through layers on read, and **up** through the same layers on write.

---

## 2. Layer-by-Layer Walkthrough

### Layer 0 — Environment & Bootstrap

**File:** [src/lib/config.ts](src/lib/config.ts)

```ts
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';
export const WS_URL       = import.meta.env.VITE_WS_URL  ?? 'http://localhost:3000';
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK === 'true';
```

Set these in `.env`:

| Variable         | Purpose                                    |
|------------------|--------------------------------------------|
| `VITE_API_URL`   | Base URL for all REST calls                |
| `VITE_WS_URL`    | Socket.IO server URL                       |
| `VITE_USE_MOCK`  | `"true"` → services return local mock data |

**File:** [src/app/providers.tsx](src/app/providers.tsx)

The app root wraps everything in a single `QueryClient` with shared defaults:

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,          // data is "fresh" for 1 minute
      retry: 1,                   // retry failed requests once
      refetchOnWindowFocus: false,
    },
  },
});
```

Provider nesting order (outermost → innermost):

```
QueryClientProvider
  TranslationProvider
    MediaPlayerProvider
      OverlayProvider
        BudgetProvider
          AuthProvider
            RouterProvider
```

---

### Layer 1 — HTTP Client

**File:** [src/lib/api-client.ts](src/lib/api-client.ts)

A single Axios instance used by every service:

```ts
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,   // sends the httpOnly refresh-token cookie
  headers: { 'Content-Type': 'application/json' },
});
```

**Two interceptors are attached:**

#### Request interceptor — attach JWT

```
Every outgoing request
  → reads in-memory access token (src/app/auth/auth-storage.ts)
  → sets Authorization: Bearer <token>
```

The token is kept **in memory only** (not localStorage) to prevent XSS token theft.

#### Response interceptor — unwrap envelope + handle 401

```
Every incoming response
  → if body has shape { data: ... }, unwrap and replace response.data
  → if 401 and not already retrying:
       1. call POST /auth/refresh (sends httpOnly cookie automatically)
       2. receive new accessToken, store in memory
       3. replay original request with new token
       4. if refresh also fails → clear tokens + redirect to /login
```

Concurrent 401s are queued and replayed together once the single refresh resolves.

---

### Layer 2 — Type Contracts

Two separate type namespaces keep API shape and UI shape decoupled.

**File:** [src/types/api.ts](src/types/api.ts) — **Backend-aligned types**

```ts
// What the REST API returns
export interface ApiTask {
  id: string;
  status: TaskStatus;      // e.g. 'IN_PROGRESS'  (enum key)
  priority: TaskPriority;  // e.g. 'HIGH'
  assignee?: ApiUser;
  // ...
}

// What you send to create/update
export interface CreateTaskDto { title, status, priority, projectId, ... }
export interface UpdateTaskDto { title?, status?, priority?, ... }

// Filter params for GET /tasks
export interface TaskFilterParams { projectId?, status?, priority?, ... }
```

**File:** [src/types/domain.ts](src/types/domain.ts) — **Frontend display types**

```ts
// What UI components consume
export interface Task {
  id: string;
  status: string;    // e.g. 'In Progress'  (human-readable label)
  statusKey: string; // e.g. 'IN_PROGRESS'  (backend enum, for mutations)
  priority: string;  // e.g. 'High'
  priorityKey: string;
  assignee?: TaskAssignee;
  // ...
}
```

The `statusKey` / `priorityKey` fields let you display friendly labels while still sending the right enum value back to the API.

---

### Layer 3 — Mapper

**File:** [src/lib/mappers/task.mapper.ts](src/lib/mappers/task.mapper.ts)

Converts `ApiTask` → `Task` (and back for mutations):

```ts
export function mapApiTaskToTask(api: ApiTask): Task {
  return {
    id:          api.id,
    status:      STATUS_DISPLAY[api.status] ?? api.status,  // 'IN_PROGRESS' → 'In Progress'
    statusKey:   api.status,
    priority:    PRIORITY_DISPLAY[api.priority] ?? api.priority,
    priorityKey: api.priority,
    assignee:    api.assignee ? mapApiUserToTaskAssignee(api.assignee) : undefined,
    subtasks:    api.subtasks?.map(mapApiTaskToTask),       // recursive
    // legacy aliases kept for backwards compatibility
    dateStart:   api.startDate,
    dateEnd:     api.dueDate,
    // ...
  };
}
```

Mappers live in [src/lib/mappers/](src/lib/mappers/) and are re-exported from the index:

| Mapper file           | Maps                         |
|-----------------------|------------------------------|
| `task.mapper.ts`      | `ApiTask` ↔ `Task`           |
| `project.mapper.ts`   | `ApiProject` ↔ `Project`     |
| `user.mapper.ts`      | `ApiUser` ↔ `TeamMember`     |
| `client.mapper.ts`    | `ApiClient` ↔ `Client`       |
| `time-entry.mapper.ts`| `ApiTimeEntry` ↔ `TimeEntry` |

---

### Layer 4 — Service

**File:** [src/services/task.service.ts](src/services/task.service.ts)

Services are **plain async functions** (not classes). Each function:
1. Checks `USE_MOCK_DATA` — if true, returns local mock data immediately.
2. Calls `apiClient` with the right HTTP method and path.
3. Passes the response through the mapper.

```ts
export async function getAllTasks(params?: TaskFilterParams): Promise<Task[]> {
  if (USE_MOCK_DATA) {
    return MOCK_WORKS as unknown as Task[];   // src/mocks/tasks.ts
  }
  const { data } = await apiClient.get<ApiTask[]>('/tasks', { params });
  return data.map(mapApiTaskToTask);
}
```

| Function           | HTTP call                        | Returns       |
|--------------------|----------------------------------|---------------|
| `getAllTasks`       | `GET /tasks`                     | `Task[]`      |
| `getProjectTasks`  | `GET /projects/:id/tasks`        | `Task[]`      |
| `getBoardTasks`    | `GET /projects/:id/tasks`        | `Task[]`      |
| `getTask`          | `GET /tasks/:id`                 | `Task`        |
| `createTask`       | `POST /tasks`                    | `Task`        |
| `updateTask`       | `PATCH /tasks/:id`               | `Task`        |
| `deleteTask`       | `DELETE /tasks/:id`              | `void`        |

---

### Layer 5 — Query Keys

**File:** [src/hooks/api/query-keys.ts](src/hooks/api/query-keys.ts)

A **key factory** gives every cached resource a unique, structured key. Keys are arrays so TanStack Query can do partial matching for invalidation.

```ts
export const queryKeys = {
  tasks: {
    all:       ['tasks'],
    list:      (params?) => ['tasks', 'list', params],
    byProject: (id)      => ['tasks', 'project', id],
    detail:    (id)      => ['tasks', 'detail', id],
    // ...
  },
};
```

**Why structured keys?**
`qc.invalidateQueries({ queryKey: ['tasks'] })` invalidates everything under `tasks.*`.
`qc.invalidateQueries({ queryKey: queryKeys.tasks.detail(id) })` targets only one item.

---

### Layer 6 — React Query Hook

**File:** [src/hooks/api/useTasks.ts](src/hooks/api/useTasks.ts)

Hooks wrap service calls in `useQuery` / `useMutation`:

```ts
// READ — fetches all tasks; result is cached under queryKeys.tasks.list(params)
export function useAllTasks(params?: TaskFilterParams) {
  return useQuery({
    queryKey: queryKeys.tasks.list(params),
    queryFn: () => taskService.getAllTasks(params),
  });
}

// READ — single task; disabled when id is empty string
export function useTask(id: string) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: () => taskService.getTask(id),
    enabled: !!id,
  });
}

// WRITE — updates cache optimistically after success
export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }) => taskService.updateTask(id, dto),
    onSuccess: (updated) => {
      // 1. Update the list cache entry for this task
      qc.setQueryData<Task[]>(queryKeys.tasks.byProject(updated.projectId), (old = []) =>
        old.map(t => t.id === updated.id ? updated : t)
      );
      // 2. Update the detail cache
      qc.setQueryData(queryKeys.tasks.detail(updated.id), updated);
    },
  });
}
```

What `useQuery` returns — key fields the UI uses:

| Field       | Meaning                                          |
|-------------|--------------------------------------------------|
| `data`      | The typed result (`Task[]`, `Task`, etc.)        |
| `isLoading` | True on first fetch (no cached data yet)         |
| `isFetching`| True whenever a background refetch is happening  |
| `isError`   | True if the last fetch threw                     |
| `error`     | The thrown error object                          |
| `refetch`   | Manually trigger a refetch                       |

---

### Layer 7 — Page / UI Component

**File:** [src/app/pages/TasksPage.tsx](src/app/pages/TasksPage.tsx)

The page calls hooks directly; no prop drilling needed:

```tsx
export function TasksPage() {
  // 1. Fetch all tasks — data is [] until loaded
  const { data: allTasks = [] } = useAllTasks();

  // 2. Fetch a single task only when selectedTaskId is set
  const { data: selectedTaskData } = useTask(selectedTaskId ?? '');

  // 3. Get the mutation function
  const updateTask = useUpdateTask();

  // 4. Trigger a mutation (e.g. drag-and-drop to new column)
  const handleTaskMove = (taskId: string, newStatus: string) => {
    updateTask.mutate({ id: taskId, dto: { status: newStatus } });
  };

  return (
    <>
      <FilterBar ... />
      {activeView === 'list'  && <WorksTable />}
      {activeView === 'board' && <BoardView tasks={allTasks} onTaskMove={handleTaskMove} />}
      {activeView === 'gantt' && <GanttView tasks={allTasks} />}
      {selectedTaskData && <TaskDetailModal task={getEnhancedTaskData()} />}
    </>
  );
}
```

`WorksTable` (list view) manages its own data fetching internally and does not receive `allTasks` as a prop — each sub-view is self-contained.

---

## 3. Mutation (Write) Flow

Using **drag-and-drop task status change** as the example:

```
User drags card to new column
  → BoardView.onTaskMove(taskId, newStatus)
      → TasksPage.handleTaskMove()
          → updateTask.mutate({ id, dto: { status: newStatus } })
              → taskService.updateTask(id, dto)
                  → apiClient.PATCH /tasks/:id  { status: 'IN_PROGRESS' }
                      → Backend processes, returns ApiTask
                  ← apiTask → mapApiTaskToTask() → Task
              ← Task returned to onSuccess
          → qc.setQueryData(byProject key, replaceInArray)   // list updated
          → qc.setQueryData(detail key, updated)             // detail updated
      ← React re-renders with new cache values automatically
```

No manual state management needed — updating the cache triggers React re-renders wherever that data is consumed.

---

## 4. Real-Time Updates via WebSocket

**File:** [src/hooks/useRealtimeUpdates.ts](src/hooks/useRealtimeUpdates.ts)
Called once in [src/app/AppLayout.tsx](src/app/AppLayout.tsx).

When the backend emits a Socket.IO event, the hook **invalidates** the corresponding query key, causing TanStack Query to re-fetch in the background:

| WS Event        | Cache invalidated                              |
|-----------------|------------------------------------------------|
| `task:created`  | `tasks.byProject(id)`, `tasks.tree(id)`        |
| `task:updated`  | `tasks.detail(id)`, `tasks.byProject(id)`      |
| `task:deleted`  | `tasks.byProject(id)`, `tasks.tree(id)`        |
| `project:created` | `projects.list()`                            |
| `project:updated` | `projects.detail(id)`, `projects.list()`     |
| `time:logged`   | `tasks.time(id)`, `users.myTime()`, `analytics.overview()` |

`invalidateQueries` marks the data stale and refetches if there is an active subscriber (i.e., the relevant component is mounted).

---

## 5. Mock vs Real Mode

Controlled by `VITE_USE_MOCK` in `.env`:

```
VITE_USE_MOCK=true   → services skip the network, return src/mocks/*.ts data
VITE_USE_MOCK=false  → services call the real API, WebSocket connects
```

The mock branch is inside each service function, so the hook and UI layers are **identical** in both modes. The mapper is also bypassed in mock mode (mock data is already in `Task` shape).

Mock data files:

| File                     | Provides                    |
|--------------------------|-----------------------------|
| `src/mocks/tasks.ts`     | `MOCK_WORKS`, `MOCK_BOARD_TASKS` |
| `src/mocks/projects.ts`  | `MOCK_PROJECTS`             |
| `src/mocks/employees.ts` | `MOCK_EMPLOYEES`            |
| `src/mocks/clients.ts`   | `MOCK_CLIENTS`              |

---

## 6. Full Request Lifecycle Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                          BROWSER                                     │
│                                                                      │
│  TasksPage                                                           │
│    useAllTasks()                                                     │
│      │                                                               │
│      ▼                                                               │
│  TanStack QueryClient                                                │
│    key: ['tasks','list',params]                                      │
│    staleTime: 60s  (from providers.tsx defaults)                     │
│      │  cache HIT? → return cached data immediately                  │
│      │  cache MISS or stale? → call queryFn                          │
│      ▼                                                               │
│  taskService.getAllTasks(params)                  [task.service.ts]  │
│      │  USE_MOCK_DATA=true? → return MOCK_WORKS                      │
│      │  USE_MOCK_DATA=false? ↓                                       │
│      ▼                                                               │
│  apiClient.get('/tasks', { params })             [api-client.ts]     │
│      │                                                               │
│      │  ← request interceptor: attach Bearer token                   │
│      │                                                               │
├──────┼───────────────────────────────────────────────────────────────┤
│      │  NETWORK                                                       │
│      ▼                                                               │
│  GET http://localhost:3000/api/v1/tasks?...                          │
│      ▼                                                               │
│  Backend REST API                                                    │
│      │  Returns: { data: ApiTask[], meta: {...} }                    │
├──────┼───────────────────────────────────────────────────────────────┤
│      │  BROWSER                                                       │
│      ▼                                                               │
│      ← response interceptor: unwrap { data: ... } envelope           │
│      ← response interceptor: handle 401 → refresh → retry           │
│      ▼                                                               │
│  data.map(mapApiTaskToTask)                      [task.mapper.ts]    │
│      │  ApiTask → Task                                               │
│      │  'IN_PROGRESS' → 'In Progress'  (status display label)        │
│      ▼                                                               │
│  Task[]  stored in QueryClient cache                                 │
│      ▼                                                               │
│  useAllTasks() returns { data: Task[], isLoading, ... }              │
│      ▼                                                               │
│  TasksPage renders <BoardView tasks={Task[]} />                      │
│      ▼                                                               │
│  User sees task cards                                                │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 7. File Map Quick Reference

| Concern            | File(s)                                          |
|--------------------|--------------------------------------------------|
| Env / base URL     | [src/lib/config.ts](src/lib/config.ts)          |
| QueryClient setup  | [src/app/providers.tsx](src/app/providers.tsx)  |
| HTTP client (Axios)| [src/lib/api-client.ts](src/lib/api-client.ts)  |
| Auth token storage | [src/app/auth/auth-storage.ts](src/app/auth/auth-storage.ts) |
| API types          | [src/types/api.ts](src/types/api.ts)            |
| UI/domain types    | [src/types/domain.ts](src/types/domain.ts)      |
| Mappers            | [src/lib/mappers/](src/lib/mappers/)            |
| Task service       | [src/services/task.service.ts](src/services/task.service.ts) |
| All services       | [src/services/](src/services/)                  |
| Query key factory  | [src/hooks/api/query-keys.ts](src/hooks/api/query-keys.ts) |
| Task hooks         | [src/hooks/api/useTasks.ts](src/hooks/api/useTasks.ts) |
| All hooks          | [src/hooks/api/](src/hooks/api/)                |
| Mock data          | [src/mocks/](src/mocks/)                        |
| TasksPage          | [src/app/pages/TasksPage.tsx](src/app/pages/TasksPage.tsx) |
| WS real-time       | [src/hooks/useRealtimeUpdates.ts](src/hooks/useRealtimeUpdates.ts) |
| WS manager         | [src/lib/websocket.ts](src/lib/websocket.ts)    |
