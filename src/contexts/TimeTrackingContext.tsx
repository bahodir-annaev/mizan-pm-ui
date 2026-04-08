import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useStartTimer, useStopTimer } from '@/hooks/api/useTimeTracking';
import { getActiveTimer } from '@/services/time-tracking.service';
import { useAuth } from '@/app/auth/AuthContext';
import type { TimeEntry } from '@/types/domain';

interface TimeTrackingContextType {
  activeEntry: TimeEntry | null;
  startTracking: (taskId: string) => void;
  stopTracking: (taskId: string) => void;
  isStarting: boolean;
  isStopping: boolean;
}

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined);

export function TimeTrackingProvider({ children }: { children: ReactNode }) {
  // All state is plain React state — no TanStack Query subscriptions.
  // This prevents useSyncExternalStore updates from the mutation hooks
  // triggering intermediate renders before setActiveEntry is committed,
  // which was causing a brief grey-button flicker after clicking start.
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  const { isAuthenticated } = useAuth();
  const startMutation = useStartTimer();
  const stopMutation = useStopTimer();

  // Once the user explicitly starts or stops a timer, block the one-shot
  // page-refresh fetch from overriding the in-progress interaction.
  const hasInteractedRef = useRef(false);

  // Restore an active timer from the server on page refresh.
  // Gated on isAuthenticated to avoid a 401 before the token refresh completes.
  useEffect(() => {
    if (!isAuthenticated) return;
    getActiveTimer()
      .then((entry) => {
        if (!hasInteractedRef.current) {
          setActiveEntry(entry);
        }
      })
      .catch(() => {});
  }, [isAuthenticated]);

  function startTracking(taskId: string) {
    const force = activeEntry !== null;
    hasInteractedRef.current = true;
    const optimisticStartTime = new Date().toISOString();
    // Set everything in one synchronous batch — no intermediate renders.
    setIsStarting(true);
    setActiveEntry({
      id: `TE-opt-${Date.now()}`,
      taskId,
      userId: '',
      userName: '',
      startTime: optimisticStartTime,
      createdAt: optimisticStartTime,
    });

    startMutation.mutate({ taskId, force }, {
      onSuccess: (entry) => {
        // Ensure taskId is always set — some backends don't echo it back in the start response.
        // Fall back to the optimistic startTime if the server's value is missing or unparseable,
        // so the elapsed timer never gets stuck at 00:00 due to clock skew or a missing field.
        const resolvedStartTime =
          entry.startTime && !isNaN(new Date(entry.startTime).getTime())
            ? entry.startTime
            : optimisticStartTime;
        setActiveEntry({ ...entry, taskId: entry.taskId || taskId, startTime: resolvedStartTime });
        setIsStarting(false);
      },
      onError: () => {
        setActiveEntry(null);
        setIsStarting(false);
      },
    });
  }

  function stopTracking(taskId: string) {
    hasInteractedRef.current = true;
    setIsStopping(true);
    setActiveEntry(null);

    stopMutation.mutate(taskId, {
      onSuccess: () => setIsStopping(false),
      onError: () => {
        // Restore server state on failure
        setIsStopping(false);
        getActiveTimer().then(setActiveEntry).catch(() => {});
      },
    });
  }

  return (
    <TimeTrackingContext.Provider
      value={{ activeEntry, startTracking, stopTracking, isStarting, isStopping }}
    >
      {children}
    </TimeTrackingContext.Provider>
  );
}

export function useTimeTracking() {
  const context = useContext(TimeTrackingContext);
  if (context === undefined) {
    throw new Error('useTimeTracking must be used within a TimeTrackingProvider');
  }
  return context;
}
