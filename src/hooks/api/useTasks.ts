import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import * as taskService from '@/services/task.service';
import { buildTree } from '@/utils/buildTree';
import type { CreateTaskDto, UpdateTaskDto, TaskFilterParams } from '@/types/api';

export function useAllTasks(params?: TaskFilterParams, options?: { enabled?: boolean }) {
  const mergedParams: TaskFilterParams = { depth: 2, ...params };
  return useQuery({
    queryKey: queryKeys.tasks.list(mergedParams),
    queryFn: () => taskService.getAllTasks(mergedParams),
    select: (data) => ({
      tree: buildTree(data),
      flat: data,
    }),
    staleTime: 30_000,
    enabled: options?.enabled ?? true,
  });
}

interface UseProjectTasksOptions {
  projectId: string;
  depth?: number;
  filters?: TaskFilterParams;
}

export function useProjectTasks({ projectId, depth = 2, filters = {} }: UseProjectTasksOptions) {
  return useQuery({
    queryKey: queryKeys.tasks.byProject(projectId, { depth, ...filters }),
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

export function useBoardTasks(projectId?: string) {
  return useQuery({
    queryKey: projectId
      ? [...queryKeys.tasks.byProject(projectId), 'board']
      : [...queryKeys.tasks.all, 'board'],
    queryFn: () => taskService.getBoardTasks(projectId),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: () => taskService.getTask(id),
    enabled: !!id,
  });
}

/**
 * Lazily fetches direct children of a task node.
 * Only fires when `enabled` is true (e.g. user expands a node beyond initial depth).
 * In TanStack Query v5 there is no per-query onSuccess; callers use useEffect on isSuccess.
 */
export function useTaskChildren(taskId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.tasks.children(taskId),
    queryFn: () => taskService.getTaskChildren(taskId),
    enabled: enabled && !!taskId,
    staleTime: 30_000,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTaskDto) => taskService.createTask(dto),
    onSuccess: (newTask) => {
      // Invalidate project-scoped list (prefix match covers all depth/filter variants)
      qc.invalidateQueries({ queryKey: queryKeys.tasks.byProject(newTask.projectId) });
      // Invalidate all-tasks list (used by the Tasks page without a projectId)
      qc.invalidateQueries({ queryKey: queryKeys.tasks.list() });
      // Invalidate lazy children cache of the parent if this is a subtask
      if (newTask.parentId) {
        qc.invalidateQueries({ queryKey: queryKeys.tasks.children(newTask.parentId) });
      }
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTaskDto }) =>
      taskService.updateTask(id, dto),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks.byProject(updated.projectId) });
      qc.invalidateQueries({ queryKey: queryKeys.tasks.list() });
      qc.setQueryData(queryKeys.tasks.detail(updated.id), updated);
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId?: string }) =>
      taskService.deleteTask(id).then(() => ({ id, projectId })),
    onSuccess: ({ id, projectId }) => {
      if (projectId) {
        qc.invalidateQueries({ queryKey: queryKeys.tasks.byProject(projectId) });
      }
      qc.invalidateQueries({ queryKey: queryKeys.tasks.list() });
      qc.removeQueries({ queryKey: queryKeys.tasks.detail(id) });
    },
  });
}
