import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import * as taskService from '@/services/task.service';
import type { Task } from '@/types/domain';
import type { CreateTaskDto, UpdateTaskDto, TaskFilterParams } from '@/types/api';

export function useAllTasks(params?: TaskFilterParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.tasks.list(params),
    queryFn: () => taskService.getAllTasks(params),
    enabled: options?.enabled ?? true,
  });
}

export function useProjectTasks(projectId?: string) {
  return useQuery({
    queryKey: projectId ? queryKeys.tasks.byProject(projectId) : queryKeys.tasks.all,
    queryFn: () => taskService.getProjectTasks(projectId),
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

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTaskDto) => taskService.createTask(dto),
    onSuccess: (newTask) => {
      const key = newTask.projectId
        ? queryKeys.tasks.byProject(newTask.projectId)
        : queryKeys.tasks.all;
      qc.setQueryData<Task[]>(key, (old = []) => [...old, newTask]);
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTaskDto }) =>
      taskService.updateTask(id, dto),
    onSuccess: (updated) => {
      const key = updated.projectId
        ? queryKeys.tasks.byProject(updated.projectId)
        : queryKeys.tasks.all;
      qc.setQueryData<Task[]>(key, (old = []) =>
        old.map((t) => (t.id === updated.id ? updated : t)),
      );
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
      const key = projectId ? queryKeys.tasks.byProject(projectId) : queryKeys.tasks.all;
      qc.setQueryData<Task[]>(key, (old = []) => old.filter((t) => t.id !== id));
      qc.removeQueries({ queryKey: queryKeys.tasks.detail(id) });
    },
  });
}
