import { apiClient } from '@/lib/api-client';
import type { ApiChecklistItem, ApiComment } from '@/types/api';

// ─── Checklist ───────────────────────────────────────────────────────────────

export async function getChecklist(taskId: string): Promise<ApiChecklistItem[]> {
  const { data } = await apiClient.get<ApiChecklistItem[]>(`/tasks/${taskId}/checklist`);
  return data;
}

export async function createChecklistItem(
  taskId: string,
  dto: { title: string; isCompleted?: boolean },
): Promise<ApiChecklistItem> {
  const { data } = await apiClient.post<ApiChecklistItem>(`/tasks/${taskId}/checklist`, dto);
  return data;
}

export async function updateChecklistItem(
  taskId: string,
  itemId: string,
  dto: { title?: string; isCompleted?: boolean },
): Promise<ApiChecklistItem> {
  const { data } = await apiClient.patch<ApiChecklistItem>(
    `/tasks/${taskId}/checklist/${itemId}`,
    dto,
  );
  return data;
}

export async function deleteChecklistItem(taskId: string, itemId: string): Promise<void> {
  await apiClient.delete(`/tasks/${taskId}/checklist/${itemId}`);
}

// ─── Comments ────────────────────────────────────────────────────────────────

export async function getComments(taskId: string): Promise<ApiComment[]> {
  const { data } = await apiClient.get<ApiComment[]>(`/tasks/${taskId}/comments`);
  return data;
}

export async function createComment(taskId: string, dto: { body: string }): Promise<ApiComment> {
  const { data } = await apiClient.post<ApiComment>(`/tasks/${taskId}/comments`, dto);
  return data;
}

export async function deleteComment(taskId: string, commentId: string): Promise<void> {
  await apiClient.delete(`/tasks/${taskId}/comments/${commentId}`);
}

// ─── Participants ─────────────────────────────────────────────────────────────

export async function getParticipants(taskId: string) {
  const { data } = await apiClient.get(`/tasks/${taskId}/participants`);
  return data;
}

export async function addParticipant(taskId: string, userId: string) {
  const { data } = await apiClient.post(`/tasks/${taskId}/participants`, { userId });
  return data;
}

export async function removeParticipant(taskId: string, userId: string): Promise<void> {
  await apiClient.delete(`/tasks/${taskId}/participants/${userId}`);
}

// ─── Dependencies ─────────────────────────────────────────────────────────────

export async function getDependencies(taskId: string) {
  const { data } = await apiClient.get(`/tasks/${taskId}/dependencies`);
  return data;
}

export async function addDependency(taskId: string, dependsOnId: string) {
  const { data } = await apiClient.post(`/tasks/${taskId}/dependencies`, { dependsOnId });
  return data;
}

export async function removeDependency(taskId: string, depId: string): Promise<void> {
  await apiClient.delete(`/tasks/${taskId}/dependencies/${depId}`);
}
