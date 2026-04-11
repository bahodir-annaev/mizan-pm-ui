import { apiClient } from '@/lib/api-client';
import { mapApiTaskToTask } from '@/lib/mappers';
import type { Task } from '@/types/domain';
import type { ApiTask, CreateTaskDto, UpdateTaskDto, TaskFilterParams } from '@/types/api';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Coerce whatever the API returned into a flat ApiTask array. */
function toTaskArray(data: unknown): ApiTask[] {
  if (Array.isArray(data)) return data as ApiTask[];
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    // Common paginated shapes: { items }, { tasks }, { data } (in case interceptor missed it)
    const inner = obj['items'] ?? obj['tasks'] ?? obj['data'] ?? obj['results'];
    if (Array.isArray(inner)) return inner as ApiTask[];
  }
  console.warn('[task.service] Unexpected response shape:', data);
  return [];
}

// Returns all tasks for the current user, with optional filters/sorting
export async function getAllTasks(params?: TaskFilterParams): Promise<Task[]> {
  const { data } = await apiClient.get('/tasks', { params });
  return toTaskArray(data).map(mapApiTaskToTask);
}

// Returns tasks for a project (flat array with parentId; caller builds tree via buildTree).
// depth controls how many levels of children are pre-loaded (default 2).
export async function getProjectTasks(
  projectId?: string,
  options: { depth?: number; filters?: TaskFilterParams } = {},
): Promise<{ data: Task[]; meta?: PaginationMeta }> {
  if (!projectId) return { data: [] };
  const { depth = 3, filters = {} } = options;
  const response = await apiClient.get(`/projects/${projectId}/tasks`, {
    params: { depth, ...filters },
  });
  // Support both paginated { data, meta } and plain array responses
  if (Array.isArray(response.data)) {
    return { data: response.data.map(mapApiTaskToTask) };
  }
  const tasks = toTaskArray(response.data).map(mapApiTaskToTask);
  return { data: tasks, meta: response.data?.meta };
}

// Fetches direct children of a task (used for lazy expansion beyond initial depth)
export async function getTaskChildren(taskId: string): Promise<Task[]> {
  const { data } = await apiClient.get(`/tasks/${taskId}/children`);
  return toTaskArray(data).map(mapApiTaskToTask);
}

// Returns board-view tasks (flat list for kanban/gantt)
export async function getBoardTasks(projectId?: string): Promise<unknown[]> {
  if (!projectId) return [];
  const { data } = await apiClient.get<ApiTask[]>(`/projects/${projectId}/tasks`);
  return data.map(mapApiTaskToTask);
}

export async function getTask(id: string): Promise<Task> {
  const { data } = await apiClient.get<ApiTask>(`/tasks/${id}`);
  return mapApiTaskToTask(data);
}

export async function createTask(dto: CreateTaskDto): Promise<Task> {
  const { data } = await apiClient.post<ApiTask>('/tasks', dto);
  return mapApiTaskToTask(data);
}

export async function updateTask(id: string, dto: UpdateTaskDto): Promise<Task> {
  const { data } = await apiClient.patch<ApiTask>(`/tasks/${id}`, dto);
  return mapApiTaskToTask(data);
}

export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`);
}
