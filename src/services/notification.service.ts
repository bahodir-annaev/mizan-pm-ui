import { apiClient } from '@/lib/api-client';
import { USE_MOCK_DATA } from '@/lib/config';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '@/types/domain';
import type { ApiNotification } from '@/types/api';

function mapApiNotification(api: ApiNotification): Notification {
  return {
    id: api.id,
    type: api.type,
    title: api.title,
    body: api.body,
    isRead: api.isRead,
    entityId: api.entityId,
    entityType: api.entityType,
    createdAt: api.createdAt,
    timeAgo: formatDistanceToNow(new Date(api.createdAt), { addSuffix: true }),
  };
}

const MOCK_NOTIFICATIONS: ApiNotification[] = [
  { id: 'NOTIF-001', userId: 'EMP-001', type: 'TASK_ASSIGNED', title: 'Task assigned to you', body: 'You have been assigned to "Residential house conceptual design"', isRead: false, entityId: 'TSK-045', entityType: 'task', createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'NOTIF-002', userId: 'EMP-001', type: 'COMMENT_ADDED', title: 'New comment', body: 'Mike Johnson commented on "Living room interior layouts"', isRead: false, entityId: 'TSK-042', entityType: 'task', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'NOTIF-003', userId: 'EMP-001', type: 'DEADLINE_APPROACHING', title: 'Deadline approaching', body: 'Project "Villa Aurora" is due in 3 days', isRead: true, entityId: 'PRJ-001', entityType: 'project', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'NOTIF-004', userId: 'EMP-001', type: 'PROJECT_UPDATED', title: 'Project updated', body: 'Project "Urban Plaza" status changed to In Progress', isRead: true, entityId: 'PRJ-003', entityType: 'project', createdAt: new Date(Date.now() - 172800000).toISOString() },
];

export async function getNotifications(): Promise<Notification[]> {
  if (USE_MOCK_DATA) return MOCK_NOTIFICATIONS.map(mapApiNotification);
  const { data } = await apiClient.get<ApiNotification[]>('/notifications');
  return data.map(mapApiNotification);
}

export async function getUnreadCount(): Promise<number> {
  if (USE_MOCK_DATA) return MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;
  const { data } = await apiClient.get<{ count: number }>('/notifications/unread-count');
  return data.count;
}

export async function markAllRead(): Promise<void> {
  if (USE_MOCK_DATA) {
    MOCK_NOTIFICATIONS.forEach((n) => { n.isRead = true; });
    return;
  }
  await apiClient.patch('/notifications/read-all');
}

export async function markRead(id: string): Promise<Notification> {
  if (USE_MOCK_DATA) {
    const n = MOCK_NOTIFICATIONS.find((n) => n.id === id);
    if (n) n.isRead = true;
    return mapApiNotification(n ?? MOCK_NOTIFICATIONS[0]);
  }
  const { data } = await apiClient.patch<ApiNotification>(`/notifications/${id}/read`);
  return mapApiNotification(data);
}
