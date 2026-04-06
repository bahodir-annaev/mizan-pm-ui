import { apiClient } from '@/lib/api-client';
import { USE_MOCK_DATA } from '@/lib/config';
import { mapApiTimeEntryToTimeEntry } from '@/lib/mappers';
import type { TimeEntry } from '@/types/domain';
import type { ApiTimeEntry, CreateTimeEntryDto } from '@/types/api';

export async function getTaskTimeEntries(taskId: string): Promise<TimeEntry[]> {
  if (USE_MOCK_DATA) return [];
  const { data } = await apiClient.get<ApiTimeEntry[]>(`/tasks/${taskId}/time`);
  return data.map(mapApiTimeEntryToTimeEntry);
}

export async function startTimer(taskId: string, force = false): Promise<TimeEntry> {
  if (USE_MOCK_DATA) {
    return {
      id: `TE-${Date.now()}`,
      taskId,
      userId: 'EMP-001',
      userName: 'Sarah Chen',
      startTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
  }
  const { data } = await apiClient.post<ApiTimeEntry>(
    `/tasks/${taskId}/time/start${force ? '?force=true' : ''}`,
  );
  const entry = mapApiTimeEntryToTimeEntry(data);
  // Some backends don't echo taskId back in the response body — fill it from the request
  return entry.taskId ? entry : { ...entry, taskId };
}

export async function stopTimer(taskId: string): Promise<TimeEntry> {
  if (USE_MOCK_DATA) {
    return {
      id: `TE-${Date.now()}`,
      taskId,
      userId: 'EMP-001',
      userName: 'Sarah Chen',
      startTime: new Date(Date.now() - 3600000).toISOString(),
      endTime: new Date().toISOString(),
      durationSeconds: 3600,
      createdAt: new Date().toISOString(),
    };
  }
  const { data } = await apiClient.post<ApiTimeEntry>(`/tasks/${taskId}/time/stop`);
  return mapApiTimeEntryToTimeEntry(data);
}

export async function createTimeEntry(dto: CreateTimeEntryDto): Promise<TimeEntry> {
  if (USE_MOCK_DATA) {
    return {
      id: `TE-${Date.now()}`,
      taskId: dto.taskId,
      userId: 'EMP-001',
      userName: 'Sarah Chen',
      startTime: dto.startTime,
      endTime: dto.endTime,
      description: dto.description,
      createdAt: new Date().toISOString(),
    };
  }
  const { data } = await apiClient.post<ApiTimeEntry>('/time-entries', dto);
  return mapApiTimeEntryToTimeEntry(data);
}

export async function updateTimeEntry(id: string, dto: Partial<CreateTimeEntryDto>): Promise<TimeEntry> {
  if (USE_MOCK_DATA) {
    return {
      id,
      taskId: dto.taskId ?? '',
      userId: 'EMP-001',
      userName: 'Sarah Chen',
      startTime: dto.startTime ?? new Date().toISOString(),
      endTime: dto.endTime,
      description: dto.description,
      createdAt: new Date().toISOString(),
    };
  }
  const { data } = await apiClient.patch<ApiTimeEntry>(`/time-entries/${id}`, dto);
  return mapApiTimeEntryToTimeEntry(data);
}

export async function deleteTimeEntry(id: string): Promise<void> {
  if (USE_MOCK_DATA) return;
  await apiClient.delete(`/time-entries/${id}`);
}

export async function getMyTimeEntries(): Promise<TimeEntry[]> {
  if (USE_MOCK_DATA) return [];
  const { data } = await apiClient.get<ApiTimeEntry[]>('/users/me/time');
  return data.map(mapApiTimeEntryToTimeEntry);
}

export async function getActiveTimer(): Promise<TimeEntry | null> {
  if (USE_MOCK_DATA) return null;
  const { data } = await apiClient.get<ApiTimeEntry | null>('/users/me/time/active');
  return data ? mapApiTimeEntryToTimeEntry(data) : null;
}
