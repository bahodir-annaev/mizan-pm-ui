# Tasks — Frontend Integration Guide (TanStack Query + React)

## Strategy: Flat fetch → client builds tree

The API returns tasks as a **flat array** with `parentId` included. The frontend builds the nested tree structure. Expanding a node beyond the initially loaded depth triggers a lazy fetch for deeper children.

---

## API Endpoints

| Method | Endpoint                                    | Purpose                                                            |
| ------ | ------------------------------------------- | ------------------------------------------------------------------ |
| `GET`  | `/api/v1/projects/:projectId/tasks?depth=2` | Initial load — returns tasks up to N levels deep (flat, paginated) |
| `GET`  | `/api/v1/tasks/:taskId/children`            | Lazy load direct children of an expanded node                      |
| `GET`  | `/api/v1/projects/:projectId/tasks/tree`    | Full nested tree (avoid unless project is small)                   |

### `depth` param behaviour

- `depth=0` (default) → root tasks only
- `depth=1` → root + their direct children
- `depth=2` → root + 2 levels of children (recommended for initial load)
- Max: `depth=10`

### Pagination

`page` and `limit` apply across all returned tasks (not just roots). Recommend `limit=50` for initial load with `depth=2`.

---

## Task shape (response)

```ts
interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'planning' | 'in_progress' | 'in_review' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  parentId: string | null; // key for tree building
  depth: number; // 0 = root
  position: number;
  projectId: string;
  code: string; // e.g. "TSK-001"
  dueDate: string | null;
  startDate: string | null;
  estimatedHours: number | null;
  progress: number | null;
  createdAt: string;
  updatedAt: string;
  creator: User;
  assignee: User | null;
}

interface TreeTask extends Task {
  children: TreeTask[];
}
```

---

## Tree builder utility

```ts
// utils/buildTree.ts
export function buildTree(tasks: Task[]): TreeTask[] {
  const map = new Map<string, TreeTask>();

  for (const task of tasks) {
    map.set(task.id, { ...task, children: [] });
  }

  const roots: TreeTask[] = [];

  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Sort children by position
  for (const node of map.values()) {
    node.children.sort((a, b) => a.position - b.position);
  }

  return roots;
}
```

---

## Query keys

```ts
// queryKeys.ts
export const taskKeys = {
  all: ['tasks'] as const,
  byProject: (projectId: string, filters?: object) => ['tasks', 'project', projectId, filters] as const,
  children: (taskId: string) => ['tasks', taskId, 'children'] as const,
};
```

---

## Initial load hook

```ts
// hooks/useProjectTasks.ts
import { useQuery } from '@tanstack/react-query';
import { taskKeys } from '../queryKeys';
import { buildTree } from '../utils/buildTree';
import { api } from '../api';

interface UseProjectTasksOptions {
  projectId: string;
  depth?: number; // default 2
  filters?: {
    status?: string;
    priority?: string;
    assigneeId?: string;
    search?: string;
    page?: number;
    limit?: number;
  };
}

export function useProjectTasks({ projectId, depth = 2, filters = {} }: UseProjectTasksOptions) {
  return useQuery({
    queryKey: taskKeys.byProject(projectId, { depth, ...filters }),
    queryFn: () =>
      api
        .get(`/projects/${projectId}/tasks`, {
          params: { depth, ...filters },
        })
        .then((r) => r.data),
    select: (response) => ({
      tree: buildTree(response.data),
      flat: response.data as Task[],
      meta: response.meta,
    }),
    staleTime: 30_000,
  });
}
```

---

## Lazy load children hook (on expand)

```ts
// hooks/useTaskChildren.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { taskKeys } from '../queryKeys';
import { api } from '../api';

export function useTaskChildren(taskId: string, enabled: boolean) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: taskKeys.children(taskId),
    queryFn: () => api.get(`/tasks/${taskId}/children`).then((r) => r.data.data as Task[]),
    enabled, // only fires when user expands the node
    staleTime: 30_000,
    onSuccess: (children) => {
      // Inject children into the project tasks cache so the tree stays consistent
      // Update all cached project-task queries that contain this task
      queryClient.setQueriesData({ queryKey: ['tasks', 'project'] }, (old: any) => {
        if (!old?.data) return old;
        const ids = new Set(old.data.map((t: Task) => t.id));
        const newTasks = children.filter((c: Task) => !ids.has(c.id));
        return { ...old, data: [...old.data, ...newTasks] };
      });
    },
  });
}
```

---

## Task node component pattern

```tsx
// components/TaskNode.tsx
function TaskNode({ task }: { task: TreeTask }) {
  const [expanded, setExpanded] = useState(false);
  const [childrenLoaded, setChildrenLoaded] = useState(
    task.children.length > 0, // already loaded in initial fetch
  );

  const { data: lazyChildren } = useTaskChildren(task.id, expanded && !childrenLoaded);

  const children = childrenLoaded ? task.children : (lazyChildren ?? []);

  return (
    <div>
      <div
        onClick={() => {
          setExpanded((e) => !e);
          if (!childrenLoaded && lazyChildren) setChildrenLoaded(true);
        }}
      >
        {task.title}
      </div>

      {expanded && children.map((child) => <TaskNode key={child.id} task={child} />)}
    </div>
  );
}
```

---

## Mutations

### Create task

```ts
const createTask = useMutation({
  mutationFn: (dto: CreateTaskDto) => api.post('/tasks', dto).then((r) => r.data.data),
  onSuccess: (newTask) => {
    queryClient.invalidateQueries({
      queryKey: taskKeys.byProject(newTask.projectId),
    });
    // If it has a parent, also invalidate that parent's children cache
    if (newTask.parentId) {
      queryClient.invalidateQueries({
        queryKey: taskKeys.children(newTask.parentId),
      });
    }
  },
});
```

### Update task (optimistic)

```ts
const updateTask = useMutation({
  mutationFn: ({ id, dto }: { id: string; dto: UpdateTaskDto }) =>
    api.patch(`/tasks/${id}`, dto).then((r) => r.data.data),
  onMutate: async ({ id, dto }) => {
    await queryClient.cancelQueries({ queryKey: ['tasks', 'project'] });
    const snapshot = queryClient.getQueriesData({ queryKey: ['tasks', 'project'] });

    queryClient.setQueriesData({ queryKey: ['tasks', 'project'] }, (old: any) => ({
      ...old,
      data: old?.data?.map((t: Task) => (t.id === id ? { ...t, ...dto } : t)),
    }));
    return { snapshot };
  },
  onError: (_err, _vars, ctx) => {
    // Roll back on error
    ctx?.snapshot.forEach(([key, data]) => {
      queryClient.setQueryData(key, data);
    });
  },
  onSettled: (_data, _err, { id }) => {
    queryClient.invalidateQueries({ queryKey: ['tasks', 'project'] });
  },
});
```

### Move task

```ts
const moveTask = useMutation({
  mutationFn: ({ id, dto }: { id: string; dto: MoveTaskDto }) =>
    api.patch(`/tasks/${id}/move`, dto).then((r) => r.data.data),
  onSuccess: () => {
    // Invalidate everything — tree structure changed
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  },
});
```

### Delete task

```ts
const deleteTask = useMutation({
  mutationFn: (id: string) => api.delete(`/tasks/${id}`),
  onSuccess: (_data, id) => {
    // Remove from all caches immediately, server cascades to children
    queryClient.setQueriesData({ queryKey: ['tasks', 'project'] }, (old: any) => ({
      ...old,
      data: old?.data?.filter((t: Task) => t.id !== id),
    }));
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  },
});
```

---

## Decision tree — which endpoint to call?

```
User opens project page
  → useProjectTasks({ projectId, depth: 2 })   ← eager 2 levels

User expands a node that has children beyond depth 2
  → useTaskChildren(taskId, true)               ← lazy fetch on demand

User searches / filters
  → useProjectTasks({ projectId, depth: 0, filters: { search, status } })
    (searching across all depths? use depth=10 or the /tree endpoint)

User wants to see entire hierarchy (e.g., Gantt / outline view)
  → GET /projects/:id/tasks/tree                ← full nested tree, no pagination
```

---

## Notes

- Always include `parentId` when displaying tasks so you can navigate to parent context.
- The `depth` field on each task tells you its level (0 = root) — use it to indent rows.
- After a `move` mutation, **invalidate all task queries** since the entire tree structure changes.
- The `meta` object from the paginated response includes `{ page, limit, total, totalPages }`.

---

## Implementation Plan

> Codebase baseline: React 18.3, Vite 6.3, TanStack Query v5, Axios, TypeScript.
> All paths are relative to `src/`.

---

### Step 1 — Add `TreeTask` type to `types/domain.ts`

The `Task` interface already carries `parentId`, `depth`, `position`, and `subtasks[]`. Add `TreeTask` alongside it:

```ts
// types/domain.ts  (append after Task interface)
export interface TreeTask extends Task {
  children: TreeTask[];
}
```

`subtasks[]` on `Task` stays for legacy mock data; `children` on `TreeTask` is the live, API-built hierarchy.

---

### Step 2 — Add `buildTree` utility

Create `utils/buildTree.ts` (new file):

```ts
// utils/buildTree.ts
import type { Task, TreeTask } from '@/types/domain';

export function buildTree(tasks: Task[]): TreeTask[] {
  const map = new Map<string, TreeTask>();

  for (const task of tasks) {
    map.set(task.id, { ...task, children: [] });
  }

  const roots: TreeTask[] = [];

  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  for (const node of map.values()) {
    node.children.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }

  return roots;
}
```

---

### Step 3 — Update `hooks/api/query-keys.ts`

Add the missing `children` key (the `tree` key already exists):

```ts
// inside tasks object
children: (taskId: string) => ['tasks', taskId, 'children'] as const,
```

---

### Step 4 — Update `services/task.service.ts`

#### 4a — Extend `getProjectTasks` to accept `depth` and filter params

```ts
// Signature change
export async function getProjectTasks(
  projectId?: string,
  options: { depth?: number; filters?: TaskFilterParams } = {}
): Promise<{ data: Task[]; meta?: PaginationMeta }> {
  if (USE_MOCK_DATA) {
    const tasks = projectId
      ? MOCK_WORKS.filter((t) => t.projectId === projectId)
      : MOCK_WORKS;
    return { data: tasks };
  }
  const { depth = 2, filters = {} } = options;
  const response = await apiClient.get(`/projects/${projectId}/tasks`, {
    params: { depth, ...filters },
  });
  return response.data; // { data: ApiTask[], meta: PaginationMeta }
}
```

#### 4b — Add `getTaskChildren` function

```ts
export async function getTaskChildren(taskId: string): Promise<Task[]> {
  if (USE_MOCK_DATA) {
    // Return tasks whose parentId matches (from MOCK_WORKS)
    return MOCK_WORKS.filter((t) => t.parentId === taskId);
  }
  const response = await apiClient.get(`/tasks/${taskId}/children`);
  return response.data.data as Task[];
}
```

Also add `PaginationMeta` to the export (or import from `types/api.ts` if already defined there).

---

### Step 5 — Update `hooks/api/useTasks.ts`

#### 5a — Rewrite `useProjectTasks` to return tree + flat + meta

```ts
import { buildTree } from '@/utils/buildTree';
import type { TreeTask } from '@/types/domain';

interface UseProjectTasksOptions {
  projectId: string;
  depth?: number;
  filters?: TaskFilterParams;
}

export function useProjectTasks({ projectId, depth = 2, filters = {} }: UseProjectTasksOptions) {
  return useQuery({
    queryKey: taskKeys.tasks.byProject(projectId, { depth, ...filters }),
    queryFn: () => taskService.getProjectTasks(projectId, { depth, filters }),
    select: (response) => ({
      tree: buildTree(response.data),
      flat: response.data,
      meta: response.meta,
    }),
    staleTime: 30_000,
    enabled: !!projectId,
  });
}
```

> **Breaking change:** callers that used `useProjectTasks(projectId)` (positional string) must be updated to `useProjectTasks({ projectId })`.

#### 5b — Add `useTaskChildren` for lazy node expansion

```ts
export function useTaskChildren(taskId: string, enabled: boolean) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: taskKeys.tasks.children(taskId),
    queryFn: () => taskService.getTaskChildren(taskId),
    enabled,
    staleTime: 30_000,
    // TanStack Query v5: use `meta` + global onSuccess or subscribe externally
    // Inject fetched children into the project task cache after query settles
  });
}
```

Because TanStack Query v5 removed per-query `onSuccess`, merge children into the project cache via a `useEffect` in the calling component (see Step 7).

---

### Step 6 — Update mock data in `mocks/tasks.ts`

Add `parentId`, `depth`, and `position` fields to `MOCK_WORKS` entries so mock mode exercises the tree builder:

- Tasks 1–5: root tasks → `parentId: null`, `depth: 0`, `position: 0..4`
- Tasks 6–8: children of task 1 → `parentId: '<id of task 1>'`, `depth: 1`, `position: 0..2`
- Tasks 9–10: grandchildren → `depth: 2`

This lets `buildTree` produce a real hierarchy in mock mode without a backend.

---

### Step 7 — Refactor `components/WorksTable.tsx`

The component already renders a visual hierarchy (circular node, vertical line, curved branches). Replace the existing flat-list + `subtasks[]` approach with the `TreeTask` tree from `useProjectTasks`.

#### 7a — Extract `TaskNode` row component

```tsx
// Inside WorksTable.tsx (or a new components/TaskNode.tsx)
function TaskNode({
  task,
  depth,
  columns,
  onUpdate,
}: {
  task: TreeTask;
  depth: number;
  columns: ColumnConfig[];
  onUpdate: (id: string, dto: UpdateTaskDto) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2); // auto-expand top 2 levels
  const [childrenLoaded, setChildrenLoaded] = useState(task.children.length > 0);

  const { data: lazyChildren, isSuccess } = useTaskChildren(
    task.id,
    expanded && !childrenLoaded,
  );

  // Merge lazy children into local state (v5 pattern — no onSuccess)
  useEffect(() => {
    if (isSuccess && lazyChildren && lazyChildren.length > 0) {
      setChildrenLoaded(true);
    }
  }, [isSuccess, lazyChildren]);

  const visibleChildren = childrenLoaded ? task.children : (lazyChildren ?? []);

  return (
    <>
      <TableRow>
        {/* indent by depth * 20px, expand toggle, then regular cells */}
        <td style={{ paddingLeft: depth * 20 }}>
          {(task.children.length > 0 || !childrenLoaded) && (
            <button onClick={() => setExpanded((e) => !e)}>
              {expanded ? '▾' : '▸'}
            </button>
          )}
          {task.title}
        </td>
        {/* …remaining columns… */}
      </TableRow>

      {expanded &&
        visibleChildren.map((child) => (
          <TaskNode
            key={child.id}
            task={child as TreeTask}
            depth={depth + 1}
            columns={columns}
            onUpdate={onUpdate}
          />
        ))}
    </>
  );
}
```

#### 7b — Update `WorksTable` root render

```tsx
// Replace flat tasks.map(…) with:
const { data } = useProjectTasks({ projectId, depth: 2 });

return (
  <Table>
    <TableHeader />
    <TableBody>
      {data?.tree.map((root) => (
        <TaskNode key={root.id} task={root} depth={0} columns={columns} onUpdate={handleUpdate} />
      ))}
    </TableBody>
  </Table>
);
```

---

### Step 8 — Update callers of `useProjectTasks`

Files to update (positional → options-object signature):

| File | Old call | New call |
|------|----------|----------|
| `components/WorksTable.tsx` | `useProjectTasks(projectId)` | `useProjectTasks({ projectId, depth: 2 })` |
| `app/pages/TasksPage.tsx` | `useAllTasks()` + board tasks | Keep `useAllTasks` for non-project views; use new signature for project-scoped views |
| `components/WorksTableWrapper.tsx` | `useBoardTasks(projectId)` | No change — board/gantt use flat list, not tree |

---

### Step 9 — Verify mutations still invalidate correctly

The mutation cache keys from the spec already match:

| Mutation | Invalidation |
|----------|--------------|
| `createTask` | `taskKeys.tasks.byProject(projectId)` + `taskKeys.tasks.children(parentId)` if has parent |
| `updateTask` (optimistic) | cancel + setQueriesData on `['tasks', 'project']` → rollback on error |
| `moveTask` | `queryClient.invalidateQueries({ queryKey: ['tasks'] })` — entire tree |
| `deleteTask` | optimistic remove from flat list + `invalidateQueries({ queryKey: ['tasks'] })` |

No changes needed to existing mutation hooks — they already use broad invalidation patterns.

---

### Step 10 — Wire `AddTaskModal` to support `parentId`

When "Add subtask" is triggered from a `TaskNode`, pass `parentId` to the modal:

```tsx
// AddTaskModal — add parentId prop
interface AddTaskModalProps {
  projectId: string;
  parentId?: string; // new
  onClose: () => void;
}

// Inside modal, include in createTask mutation:
createTask.mutate({ ...formValues, projectId, parentId: parentId ?? null });
```

---

### Completion checklist

- [ ] `types/domain.ts` — `TreeTask` interface added
- [ ] `utils/buildTree.ts` — utility created
- [ ] `hooks/api/query-keys.ts` — `children` key added
- [ ] `services/task.service.ts` — `getProjectTasks` updated + `getTaskChildren` added
- [ ] `mocks/tasks.ts` — `parentId`/`depth`/`position` fields populated
- [ ] `hooks/api/useTasks.ts` — `useProjectTasks` rewritten; `useTaskChildren` added
- [ ] `components/WorksTable.tsx` — `TaskNode` component extracted; tree render wired
- [ ] `components/AddTaskModal.tsx` — `parentId` prop added
- [ ] All `useProjectTasks` call sites updated to options-object signature
- [ ] Manual smoke test: expand/collapse nodes, add subtask, move task, delete task
