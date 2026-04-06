import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { onWsEvent } from '@/lib/websocket';
import { queryKeys } from '@/hooks/api/query-keys';
import { USE_MOCK_DATA } from '@/lib/config';

/**
 * Listens to WebSocket events and invalidates the corresponding TanStack Query caches.
 * Call once at the AppLayout level.
 */
export function useRealtimeUpdates(): void {
  const qc = useQueryClient();

  useEffect(() => {
    if (USE_MOCK_DATA) return;

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
        if (data?.taskId) {
          qc.invalidateQueries({ queryKey: queryKeys.tasks.time(data.taskId) });
        }
        qc.invalidateQueries({ queryKey: queryKeys.users.myTime() });
        qc.invalidateQueries({ queryKey: queryKeys.analytics.overview() });
      }),
    ];

    return () => unsubs.forEach((unsub) => unsub());
  }, [qc]);
}
