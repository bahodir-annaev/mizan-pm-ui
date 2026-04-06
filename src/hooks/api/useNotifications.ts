import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import * as notificationService from '@/services/notification.service';
import type { Notification } from '@/types/domain';

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: notificationService.getNotifications,
    refetchInterval: 60000, // Poll every 60s as fallback when WS is down
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: notificationService.getUnreadCount,
    refetchInterval: 60000,
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => {
      qc.setQueryData<Notification[]>(queryKeys.notifications.list(), (old = []) =>
        old.map((n) => ({ ...n, isRead: true })),
      );
      qc.setQueryData(queryKeys.notifications.unreadCount(), 0);
    },
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: (updated) => {
      qc.setQueryData<Notification[]>(queryKeys.notifications.list(), (old = []) =>
        old.map((n) => (n.id === updated.id ? updated : n)),
      );
      qc.setQueryData<number>(queryKeys.notifications.unreadCount(), (old = 0) =>
        Math.max(0, old - 1),
      );
    },
  });
}
