import { useEffect, useState } from 'react';
import { Square } from 'lucide-react';
import { useActiveTimer, useStopTimer } from '@/hooks/api/useTimeTracking';
import { useTask } from '@/hooks/api/useTasks';
import { useAuth } from '@/app/auth/AuthContext';

function formatElapsed(startTime: string): string {
  const start = new Date(startTime).getTime();
  if (isNaN(start)) return '00:00:00';
  const elapsed = Math.max(0, Math.floor((Date.now() - start) / 1000));
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

function TaskTitle({ taskId }: { taskId: string }) {
  const { data: task } = useTask(taskId);
  if (!task) return null;
  return (
    <span
      className="text-xs max-w-32 truncate hidden sm:block"
      style={{ color: 'var(--text-secondary)' }}
    >
      {task.title}
    </span>
  );
}

export function ActiveTimerWidget() {
  const { isAuthenticated, isLoading } = useAuth();
  const { data: activeTimer } = useActiveTimer({ enabled: isAuthenticated && !isLoading });
  const stopTimer = useStopTimer();
  const [, tick] = useState(0);

  // Re-render every second to update the displayed elapsed time
  useEffect(() => {
    if (!activeTimer) return;
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [activeTimer?.id]);

  if (!activeTimer) return null;

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
      style={{
        backgroundColor: 'var(--surface-secondary)',
        borderColor: 'var(--status-late)',
      }}
    >
      {/* Pulsing indicator */}
      <span className="relative flex h-2 w-2 shrink-0">
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ backgroundColor: 'var(--status-late)' }}
        />
        <span
          className="relative inline-flex rounded-full h-2 w-2"
          style={{ backgroundColor: 'var(--status-late)' }}
        />
      </span>

      {/* Task title (hidden on small screens) */}
      <TaskTitle taskId={activeTimer.taskId} />

      {/* Elapsed time */}
      <span
        className="text-sm font-mono font-medium tabular-nums"
        style={{ color: 'var(--text-primary)' }}
      >
        {formatElapsed(activeTimer.startTime)}
      </span>

      {/* Stop button */}
      <button
        className="flex items-center justify-center w-5 h-5 rounded transition-opacity hover:opacity-70 disabled:opacity-40"
        style={{ color: 'var(--status-late)' }}
        title="Stop timer"
        disabled={stopTimer.isPending}
        onClick={() => stopTimer.mutate(activeTimer.taskId)}
      >
        <Square className="w-3.5 h-3.5 fill-current" />
      </button>
    </div>
  );
}
