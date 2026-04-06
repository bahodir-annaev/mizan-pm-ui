import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import * as taskFeaturesService from '@/services/task-features.service';

// ─── Checklist ───────────────────────────────────────────────────────────────

export function useTaskChecklist(taskId: string) {
  return useQuery({
    queryKey: queryKeys.tasks.checklist(taskId),
    queryFn: () => taskFeaturesService.getChecklist(taskId),
    enabled: !!taskId,
  });
}

export function useCreateChecklistItem(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { title: string; isCompleted?: boolean }) =>
      taskFeaturesService.createChecklistItem(taskId, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tasks.checklist(taskId) }),
  });
}

export function useUpdateChecklistItem(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, dto }: { itemId: string; dto: { title?: string; isCompleted?: boolean } }) =>
      taskFeaturesService.updateChecklistItem(taskId, itemId, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tasks.checklist(taskId) }),
  });
}

export function useDeleteChecklistItem(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => taskFeaturesService.deleteChecklistItem(taskId, itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tasks.checklist(taskId) }),
  });
}

// ─── Comments ────────────────────────────────────────────────────────────────

export function useTaskComments(taskId: string) {
  return useQuery({
    queryKey: queryKeys.tasks.comments(taskId),
    queryFn: () => taskFeaturesService.getComments(taskId),
    enabled: !!taskId,
  });
}

export function useCreateComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { body: string }) => taskFeaturesService.createComment(taskId, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tasks.comments(taskId) }),
  });
}

export function useDeleteComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => taskFeaturesService.deleteComment(taskId, commentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tasks.comments(taskId) }),
  });
}

// ─── Participants ─────────────────────────────────────────────────────────────

export function useTaskParticipants(taskId: string) {
  return useQuery({
    queryKey: queryKeys.tasks.participants(taskId),
    queryFn: () => taskFeaturesService.getParticipants(taskId),
    enabled: !!taskId,
  });
}

export function useAddParticipant(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => taskFeaturesService.addParticipant(taskId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tasks.participants(taskId) }),
  });
}

export function useRemoveParticipant(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => taskFeaturesService.removeParticipant(taskId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tasks.participants(taskId) }),
  });
}

// ─── Dependencies ─────────────────────────────────────────────────────────────

export function useTaskDependencies(taskId: string) {
  return useQuery({
    queryKey: queryKeys.tasks.dependencies(taskId),
    queryFn: () => taskFeaturesService.getDependencies(taskId),
    enabled: !!taskId,
  });
}
