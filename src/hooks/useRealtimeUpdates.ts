import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { onWsEvent } from '@/lib/websocket';
import { queryKeys } from '@/hooks/api/query-keys';
import type { Notification } from '@/types/domain';

/**
 * Listens to WebSocket events and invalidates the corresponding TanStack Query caches.
 * Call once at the AppLayout level.
 */
export function useRealtimeUpdates(): void {
  const qc = useQueryClient();

  useEffect(() => {
    const unsubs = [
      onWsEvent('task:created', (data: any) => {
        qc.invalidateQueries({ queryKey: queryKeys.tasks.byProject(data?.projectId) });
        qc.invalidateQueries({ queryKey: queryKeys.tasks.tree(data?.projectId) });
      }),
      onWsEvent('task:updated', (data: any) => {
        qc.invalidateQueries({ queryKey: queryKeys.tasks.detail(data?.id) });
        if (data?.projectId) {
          qc.invalidateQueries({ queryKey: queryKeys.tasks.byProject(data.projectId) });
        }
      }),
      onWsEvent('task:deleted', (data: any) => {
        if (data?.projectId) {
          qc.invalidateQueries({ queryKey: queryKeys.tasks.byProject(data.projectId) });
          qc.invalidateQueries({ queryKey: queryKeys.tasks.tree(data.projectId) });
        }
      }),
      onWsEvent('project:created', () => {
        qc.invalidateQueries({ queryKey: queryKeys.projects.list() });
      }),
      onWsEvent('project:updated', (data: any) => {
        qc.invalidateQueries({ queryKey: queryKeys.projects.detail(data?.id) });
        qc.invalidateQueries({ queryKey: queryKeys.projects.list() });
      }),
      onWsEvent('time:logged', (data: any) => {
        if (data?.entry?.taskId) {
          qc.invalidateQueries({ queryKey: queryKeys.tasks.time(data.entry.taskId) });
        }
        qc.invalidateQueries({ queryKey: queryKeys.users.myTime() });
        qc.invalidateQueries({ queryKey: queryKeys.analytics.overview() });
      }),
      onWsEvent('user:online', (data: any) => {
        if (!data?.userId) return;
        qc.setQueryData<string[]>(queryKeys.users.online(), (old = []) =>
          old.includes(data.userId) ? old : [...old, data.userId],
        );
      }),
      onWsEvent('user:offline', (data: any) => {
        if (!data?.userId) return;
        qc.setQueryData<string[]>(queryKeys.users.online(), (old = []) =>
          old.filter((id) => id !== data.userId),
        );
      }),
      onWsEvent('notification:new', (payload: any) => {
        if (!payload) return;
        // Map raw WS notification to domain shape
        const notification: Notification = {
          id: payload.id,
          type: payload.type,
          title: payload.title,
          body: payload.body,
          isRead: payload.isRead ?? false,
          entityId: payload.entityId,
          entityType: payload.entityType,
          createdAt: payload.createdAt,
          timeAgo: formatDistanceToNow(new Date(payload.createdAt), { addSuffix: true }),
        };
        qc.setQueryData<Notification[]>(queryKeys.notifications.list(), (old = []) => [notification, ...old]);
        qc.setQueryData<number>(queryKeys.notifications.unreadCount(), (old = 0) => old + 1);
      }),
    ];

    return () => unsubs.forEach((unsub) => unsub());
  }, [qc]);
}
