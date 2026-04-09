import { apiClient } from '@/lib/api-client';
import { mapApiTimeEntryToTimeEntry } from '@/lib/mappers';
import type { TimeEntry } from '@/types/domain';
import type { ApiTimeEntry, CreateTimeEntryDto } from '@/types/api';

export async function getTaskTimeEntries(taskId: string): Promise<TimeEntry[]> {
  const { data } = await apiClient.get<ApiTimeEntry[]>(`/tasks/${taskId}/time`);
  return data.map(mapApiTimeEntryToTimeEntry);
}

export async function startTimer(taskId: string, force = false): Promise<TimeEntry> {
  const { data } = await apiClient.post<ApiTimeEntry>(
    `/tasks/${taskId}/time/start${force ? '?force=true' : ''}`,
  );
  const entry = mapApiTimeEntryToTimeEntry(data);
  return entry.taskId ? entry : { ...entry, taskId };
}

export async function stopTimer(taskId: string): Promise<TimeEntry> {
  const { data } = await apiClient.post<ApiTimeEntry>(`/tasks/${taskId}/time/stop`);
  return mapApiTimeEntryToTimeEntry(data);
}

export async function createTimeEntry(dto: CreateTimeEntryDto): Promise<TimeEntry> {
  const { data } = await apiClient.post<ApiTimeEntry>('/time-entries', dto);
  return mapApiTimeEntryToTimeEntry(data);
}

export async function updateTimeEntry(id: string, dto: Partial<CreateTimeEntryDto>): Promise<TimeEntry> {
  const { data } = await apiClient.patch<ApiTimeEntry>(`/time-entries/${id}`, dto);
  return mapApiTimeEntryToTimeEntry(data);
}

export async function deleteTimeEntry(id: string): Promise<void> {
  await apiClient.delete(`/time-entries/${id}`);
}

export async function getMyTimeEntries(): Promise<TimeEntry[]> {
  const { data } = await apiClient.get<ApiTimeEntry[]>('/users/me/time');
  return data.map(mapApiTimeEntryToTimeEntry);
}

export async function getActiveTimer(): Promise<TimeEntry | null> {
  const { data } = await apiClient.get<ApiTimeEntry | null>('/users/me/time/active');
  return data ? mapApiTimeEntryToTimeEntry(data) : null;
}
