import { apiClient } from '@/lib/api-client';
import { USE_MOCK_DATA } from '@/lib/config';
import type { ApiChecklistItem, ApiComment } from '@/types/api';

// ─── Checklist ───────────────────────────────────────────────────────────────

export async function getChecklist(taskId: string): Promise<ApiChecklistItem[]> {
  if (USE_MOCK_DATA) return [];
  const { data } = await apiClient.get<ApiChecklistItem[]>(`/tasks/${taskId}/checklist`);
  return data;
}

export async function createChecklistItem(
  taskId: string,
  dto: { title: string; isCompleted?: boolean },
): Promise<ApiChecklistItem> {
  if (USE_MOCK_DATA) {
    return {
      id: `ci-${Date.now()}`,
      taskId,
      title: dto.title,
      isCompleted: dto.isCompleted ?? false,
      sortOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  const { data } = await apiClient.post<ApiChecklistItem>(`/tasks/${taskId}/checklist`, dto);
  return data;
}

export async function updateChecklistItem(
  taskId: string,
  itemId: string,
  dto: { title?: string; isCompleted?: boolean },
): Promise<ApiChecklistItem> {
  if (USE_MOCK_DATA) {
    return { id: itemId, taskId, title: dto.title ?? '', isCompleted: dto.isCompleted ?? false, sortOrder: 0, createdAt: '', updatedAt: new Date().toISOString() };
  }
  const { data } = await apiClient.patch<ApiChecklistItem>(
    `/tasks/${taskId}/checklist/${itemId}`,
    dto,
  );
  return data;
}

export async function deleteChecklistItem(taskId: string, itemId: string): Promise<void> {
  if (USE_MOCK_DATA) return;
  await apiClient.delete(`/tasks/${taskId}/checklist/${itemId}`);
}

// ─── Comments ────────────────────────────────────────────────────────────────

export async function getComments(taskId: string): Promise<ApiComment[]> {
  if (USE_MOCK_DATA) return [];
  const { data } = await apiClient.get<ApiComment[]>(`/tasks/${taskId}/comments`);
  return data;
}

export async function createComment(taskId: string, dto: { body: string }): Promise<ApiComment> {
  if (USE_MOCK_DATA) {
    return {
      id: `com-${Date.now()}`,
      taskId,
      content: dto.body,
      userId: 'mock-user-1',
      user: {} as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  const { data } = await apiClient.post<ApiComment>(`/tasks/${taskId}/comments`, dto);
  return data;
}

export async function deleteComment(taskId: string, commentId: string): Promise<void> {
  if (USE_MOCK_DATA) return;
  await apiClient.delete(`/tasks/${taskId}/comments/${commentId}`);
}

// ─── Participants ─────────────────────────────────────────────────────────────

export async function getParticipants(taskId: string) {
  if (USE_MOCK_DATA) return [];
  const { data } = await apiClient.get(`/tasks/${taskId}/participants`);
  return data;
}

export async function addParticipant(taskId: string, userId: string) {
  if (USE_MOCK_DATA) return { taskId, userId };
  const { data } = await apiClient.post(`/tasks/${taskId}/participants`, { userId });
  return data;
}

export async function removeParticipant(taskId: string, userId: string): Promise<void> {
  if (USE_MOCK_DATA) return;
  await apiClient.delete(`/tasks/${taskId}/participants/${userId}`);
}

// ─── Dependencies ─────────────────────────────────────────────────────────────

export async function getDependencies(taskId: string) {
  if (USE_MOCK_DATA) return [];
  const { data } = await apiClient.get(`/tasks/${taskId}/dependencies`);
  return data;
}

export async function addDependency(taskId: string, dependsOnId: string) {
  if (USE_MOCK_DATA) return { taskId, dependsOnId };
  const { data } = await apiClient.post(`/tasks/${taskId}/dependencies`, { dependsOnId });
  return data;
}

export async function removeDependency(taskId: string, depId: string): Promise<void> {
  if (USE_MOCK_DATA) return;
  await apiClient.delete(`/tasks/${taskId}/dependencies/${depId}`);
}
