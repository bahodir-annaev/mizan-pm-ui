import { useState, useEffect } from 'react';
import { Play, Square } from 'lucide-react';
import { useTimeTracking } from '@/contexts/TimeTrackingContext';

interface TaskTimeTrackingControlProps {
  taskId: string;
  isSubtask?: boolean;
}

function ElapsedTimer({ startTime }: { startTime: string }) {
  const getElapsed = () => {
    const ms = Date.now() - new Date(startTime).getTime();
    return isNaN(ms) || ms < 0 ? 0 : Math.floor(ms / 1000);
  };

  const [elapsed, setElapsed] = useState(getElapsed);

  useEffect(() => {
    const interval = setInterval(() => setElapsed(getElapsed()), 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;

  const formatted = h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  return (
    <span
      className="text-xs font-mono tabular-nums"
      style={{ color: '#FF6B35', minWidth: h > 0 ? '4.5rem' : '3rem' }}
    >
      {formatted}
    </span>
  );
}

export function TaskTimeTrackingControl({ taskId }: TaskTimeTrackingControlProps) {
  const { activeEntry, startTracking, stopTracking, isStarting, isStopping } = useTimeTracking();

  const isRunning = activeEntry?.taskId === taskId;
  const isBlockedByOther = activeEntry !== null && !isRunning;
  const isPending = isStarting || isStopping;

  const handleClick = () => {
    if (isPending) return;
    if (isRunning) {
      stopTracking(taskId);
    } else {
      startTracking(taskId);
    }
  };

  // Color scheme
  const idleColor = '#5CCB7A';       // green — ready to start
  const activeColor = '#FF6B35';     // orange — currently tracking
  const blockedColor = '#888888';    // gray — another task is tracking

  const currentColor = isRunning ? activeColor : isBlockedByOther ? blockedColor : idleColor;
  const bgOpacity = 0.15;

  const containerSize = 'w-9 h-9';
  const iconSize = 'w-4 h-4';

  const label = isRunning
    ? 'Stop time tracking'
    : isBlockedByOther
    ? 'Another task is being tracked — click to switch'
    : 'Start time tracking';

  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`
          ${containerSize}
          relative
          rounded-full
          flex
          items-center
          justify-center
          transition-all
          duration-300
          ease-out
          hover:scale-105
          active:scale-95
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-offset-1
          flex-shrink-0
          disabled:opacity-50
          disabled:cursor-not-allowed
          group
        `}
        style={{
          backgroundColor: `${currentColor}${Math.round(bgOpacity * 255).toString(16).padStart(2, '0')}`,
          color: currentColor,
        }}
        aria-label={label}
        title={label}
      >
        {/* Pulse animation when running */}
        {isRunning && (
          <>
            <div
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: `${activeColor}15`,
                animation: 'tt-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            />
            <div
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ boxShadow: `0 0 12px ${activeColor}30` }}
            />
          </>
        )}

        {/* Hover background */}
        <div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ backgroundColor: `${currentColor}10` }}
        />

        {/* Icon */}
        <div className="relative z-10">
          {isRunning ? (
            <Square className={iconSize} fill={activeColor} strokeWidth={0} />
          ) : (
            <Play className={iconSize} fill={currentColor} strokeWidth={0} style={{ marginLeft: '1px' }} />
          )}
        </div>

        <style>{`
          @keyframes tt-pulse {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(1.05); }
          }
        `}</style>
      </button>

      {isRunning && activeEntry && (
        <ElapsedTimer startTime={activeEntry.startTime} />
      )}
    </div>
  );
}
