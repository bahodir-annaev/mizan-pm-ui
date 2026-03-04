import { Play, Pause } from 'lucide-react';
import { useMediaPlayer } from '@/contexts/MediaPlayerContext';

interface TaskMediaControlProps {
  taskId: string;
  hasAudio?: boolean;
  isSubtask?: boolean;
}

export function TaskMediaControl({ taskId, hasAudio = true }: TaskMediaControlProps) {
  const { playingTaskId, setPlayingTaskId } = useMediaPlayer();
  
  const isPlaying = playingTaskId === taskId;
  
  // Don't render if task has no audio
  if (!hasAudio) {
    return <div className="w-9" />; // Spacer to maintain alignment
  }

  const handleToggle = () => {
    if (isPlaying) {
      // Stop playing
      setPlayingTaskId(null);
    } else {
      // Start playing this task (stops any other playing task)
      setPlayingTaskId(taskId);
    }
  };

  // State-based colors
  const idleColor = '#5CCB7A';      // Soft green - ready to play
  const activeColor = '#4C7DFF';     // Accent blue - currently playing

  const currentColor = isPlaying ? activeColor : idleColor;
  const bgOpacity = 0.15; // Consistent background opacity for all buttons
  
  // UNIFORM SIZE - identical for all tasks (parent and subtask)
  const containerSize = 'w-9 h-9';
  const iconSize = 'w-4 h-4';

  return (
    <button
      onClick={handleToggle}
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
        group
        flex-shrink-0
      `}
      style={{
        backgroundColor: `${currentColor}${Math.round(bgOpacity * 255).toString(16).padStart(2, '0')}`,
        color: currentColor,
      }}
      aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
      title={isPlaying ? 'Pause audio' : 'Play audio'}
    >
      {/* Pulse animation when playing */}
      {isPlaying && (
        <>
          {/* Outer pulse ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              backgroundColor: `${activeColor}15`,
              animation: 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
          
          {/* Subtle glow on hover when playing */}
          <div
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              boxShadow: `0 0 12px ${activeColor}30`,
            }}
          />
        </>
      )}

      {/* Hover background opacity increase */}
      <div
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          backgroundColor: `${currentColor}10`,
        }}
      />

      {/* Icon */}
      <div className="relative z-10">
        {isPlaying ? (
          <Pause className={iconSize} fill={currentColor} strokeWidth={0} />
        ) : (
          <Play className={iconSize} fill={currentColor} strokeWidth={0} style={{ marginLeft: '1px' }} />
        )}
      </div>

      {/* CSS Animation Definition */}
      <style>{`
        @keyframes pulse-soft {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.05);
          }
        }
      `}</style>
    </button>
  );
}
