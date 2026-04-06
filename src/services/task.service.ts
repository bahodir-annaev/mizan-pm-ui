import { apiClient } from '@/lib/api-client';
import { USE_MOCK_DATA } from '@/lib/config';
import { mapApiTaskToTask } from '@/lib/mappers';
import { MOCK_WORKS, MOCK_BOARD_TASKS } from '@/mocks/tasks';
import type { Task } from '@/types/domain';
import type { ApiTask, CreateTaskDto, UpdateTaskDto, TaskFilterParams } from '@/types/api';

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
  if (USE_MOCK_DATA) {
    return MOCK_WORKS as unknown as Task[];
  }
  const { data } = await apiClient.get('/tasks', { params });
  return toTaskArray(data).map(mapApiTaskToTask);
}

// Returns all tasks (mock) or tasks for a given project
export async function getProjectTasks(projectId?: string): Promise<Task[]> {
  if (USE_MOCK_DATA) {
    const all = MOCK_WORKS as unknown as Task[];
    return projectId ? all.filter((t) => (t as any).project === projectId) : all;
  }
  if (!projectId) return [];
  const { data } = await apiClient.get(`/projects/${projectId}/tasks`);
  return toTaskArray(data).map(mapApiTaskToTask);
}

// Returns board-view tasks (flat list for kanban/gantt)
export async function getBoardTasks(projectId?: string): Promise<unknown[]> {
  if (USE_MOCK_DATA) {
    return projectId
      ? MOCK_BOARD_TASKS.filter((t) => (t as any).project === projectId)
      : MOCK_BOARD_TASKS;
  }
  if (!projectId) return [];
  const { data } = await apiClient.get<ApiTask[]>(`/projects/${projectId}/tasks`);
  return data.map(mapApiTaskToTask);
}

export async function getTask(id: string): Promise<Task> {
  if (USE_MOCK_DATA) {
    const t = (MOCK_WORKS as unknown as Task[]).find((t) => t.id === id);
    if (!t) throw new Error(`Task ${id} not found`);
    return t;
  }
  const { data } = await apiClient.get<ApiTask>(`/tasks/${id}`);
  return mapApiTaskToTask(data);
}

export async function createTask(dto: CreateTaskDto): Promise<Task> {
  if (USE_MOCK_DATA) {
    const STATUS_DISPLAY: Record<string, string> = {
      TODO: 'Start',
      IN_PROGRESS: 'In Progress',
      IN_REVIEW: 'Pending review',
      DONE: 'End',
      CANCELLED: 'Cancelled',
    };
    const PRIORITY_DISPLAY: Record<string, string> = {
      LOW: 'Low',
      MEDIUM: 'Medium',
      HIGH: 'High',
      URGENT: 'Urgent',
    };
    return {
      id: `TASK-${Date.now()}`,
      title: dto.title,
      description: dto.description,
      status: STATUS_DISPLAY[dto.status ?? 'TODO'] ?? 'Start',
      statusKey: dto.status ?? 'TODO',
      priority: PRIORITY_DISPLAY[dto.priority ?? 'MEDIUM'] ?? 'Medium',
      priorityKey: dto.priority ?? 'MEDIUM',
      projectId: dto.projectId,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Task;
  }
  const { data } = await apiClient.post<ApiTask>('/tasks', dto);
  return mapApiTaskToTask(data);
}

export async function updateTask(id: string, dto: UpdateTaskDto): Promise<Task> {
  if (USE_MOCK_DATA) {
    const existing = (MOCK_WORKS as unknown as Task[]).find((t) => t.id === id);
    return { ...(existing as Task), ...dto, updatedAt: new Date().toISOString() } as Task;
  }
  const { data } = await apiClient.patch<ApiTask>(`/tasks/${id}`, dto);
  return mapApiTaskToTask(data);
}

export async function deleteTask(id: string): Promise<void> {
  if (USE_MOCK_DATA) return;
  await apiClient.delete(`/tasks/${id}`);
}
