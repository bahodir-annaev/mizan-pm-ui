import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import * as timeService from '@/services/time-tracking.service';
import type { TimeEntry } from '@/types/domain';
import type { CreateTimeEntryDto } from '@/types/api';

export function useTaskTimeEntries(taskId: string) {
  return useQuery({
    queryKey: queryKeys.tasks.time(taskId),
    queryFn: () => timeService.getTaskTimeEntries(taskId),
    enabled: !!taskId,
  });
}

export function useActiveTimer({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.users.activeTimer(),
    queryFn: timeService.getActiveTimer,
    refetchInterval: 30000, // Poll every 30s
    enabled,
  });
}

export function useMyTimeEntries() {
  return useQuery({
    queryKey: queryKeys.users.myTime(),
    queryFn: timeService.getMyTimeEntries,
  });
}

export function useStartTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, force }: { taskId: string; force?: boolean }) =>
      timeService.startTimer(taskId, force),
    onSuccess: (entry) => {
      qc.setQueryData(queryKeys.users.activeTimer(), entry);
      qc.invalidateQueries({ queryKey: queryKeys.tasks.time(entry.taskId) });
    },
  });
}

export function useStopTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => timeService.stopTimer(taskId),
    onSuccess: (entry) => {
      qc.setQueryData(queryKeys.users.activeTimer(), null);
      qc.setQueryData<TimeEntry[]>(queryKeys.tasks.time(entry.taskId), (old = []) => [entry, ...old]);
    },
  });
}

export function useCreateTimeEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTimeEntryDto) => timeService.createTimeEntry(dto),
    onSuccess: (entry) => {
      qc.setQueryData<TimeEntry[]>(queryKeys.tasks.time(entry.taskId), (old = []) => [entry, ...old]);
      qc.invalidateQueries({ queryKey: queryKeys.users.myTime() });
    },
  });
}

export function useDeleteTimeEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, taskId }: { id: string; taskId: string }) => timeService.deleteTimeEntry(id),
    onSuccess: (_, { id, taskId }) => {
      qc.setQueryData<TimeEntry[]>(queryKeys.tasks.time(taskId), (old = []) =>
        old.filter((e) => e.id !== id),
      );
    },
  });
}
