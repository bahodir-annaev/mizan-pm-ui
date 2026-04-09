import { apiClient } from '@/lib/api-client';
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

export async function getNotifications(): Promise<Notification[]> {
  const { data } = await apiClient.get<ApiNotification[]>('/notifications');
  return data.map(mapApiNotification);
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await apiClient.get<{ count: number }>('/notifications/unread-count');
  return data.count;
}

export async function markAllRead(): Promise<void> {
  await apiClient.patch('/notifications/read-all');
}

export async function markRead(id: string): Promise<Notification> {
  const { data } = await apiClient.patch<ApiNotification>(`/notifications/${id}/read`);
  return mapApiNotification(data);
}
