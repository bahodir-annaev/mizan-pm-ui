import type { ApiTimeEntry } from '@/types/api';
import type { TimeEntry } from '@/types/domain';

export function mapApiTimeEntryToTimeEntry(api: ApiTimeEntry): TimeEntry {
  return {
    id: api.id,
    taskId: api.taskId,
    userId: api.userId,
    userName: api.user ? `${api.user.firstName} ${api.user.lastName}` : 'Unknown',
    startTime: api.startTime,
    endTime: api.endTime,
    durationSeconds: api.durationSeconds,
    description: api.description,
    createdAt: api.createdAt,
  };
}
