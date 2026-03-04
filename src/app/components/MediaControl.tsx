import { useState } from 'react';
import { Play, Pause } from 'lucide-react';

interface MediaControlProps {
  size?: 'sm' | 'md' | 'lg';
  onPlayStateChange?: (isPlaying: boolean) => void;
  className?: string;
}

export function MediaControl({ 
  size = 'md', 
  onPlayStateChange,
  className = '' 
}: MediaControlProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggle = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    onPlayStateChange?.(newState);
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-10 h-10',
      icon: 'w-4 h-4',
    },
    md: {
      container: 'w-14 h-14',
      icon: 'w-6 h-6',
    },
    lg: {
      container: 'w-20 h-20',
      icon: 'w-8 h-8',
    },
  };

  const config = sizeConfig[size];

  // State-based colors
  const idleColor = '#5CCB7A';      // Soft green - ready to play
  const activeColor = '#4C7DFF';     // Accent blue - currently playing

  const currentColor = isPlaying ? activeColor : idleColor;
  const bgOpacity = isPlaying ? 0.2 : 0.15;

  return (
    <button
      onClick={handleToggle}
      className={`
        ${config.container}
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
        focus-visible:ring-offset-2
        group
        ${className}
      `}
      style={{
        backgroundColor: `${currentColor}${Math.round(bgOpacity * 255).toString(16).padStart(2, '0')}`,
        color: currentColor,
        focusVisibleRingColor: currentColor,
      }}
      aria-label={isPlaying ? 'Pause' : 'Play'}
    >
      {/* Pulse animation when playing */}
      {isPlaying && (
        <>
          {/* Outer pulse ring */}
          <div
            className="absolute inset-0 rounded-full animate-pulse-soft"
            style={{
              backgroundColor: `${activeColor}15`,
              animation: 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
          
          {/* Glow effect */}
          <div
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              boxShadow: `0 0 20px ${activeColor}40`,
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
          <Pause className={config.icon} fill={currentColor} />
        ) : (
          <Play className={config.icon} fill={currentColor} style={{ marginLeft: '2px' }} />
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

// Demo component showing different sizes and states
export function MediaControlDemo() {
  return (
    <div 
      className="p-12 rounded-xl"
      style={{
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-primary)',
      }}
    >
      <div className="mb-8">
        <h3 
          className="text-lg mb-2"
          style={{ 
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--text-section-header-weight)',
          }}
        >
          Media Control Component
        </h3>
        <p 
          className="text-sm"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Click to toggle between idle (green) and playing (blue) states
        </p>
      </div>

      {/* Size Variations */}
      <div className="space-y-10">
        {/* Large */}
        <div>
          <div 
            className="text-xs mb-3"
            style={{ color: 'var(--text-secondary)' }}
          >
            Large (lg)
          </div>
          <div className="flex items-center gap-6">
            <MediaControl size="lg" />
            <div style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>
              <div>Idle: Soft Green (#5CCB7A)</div>
              <div>Playing: Accent Blue (#4C7DFF)</div>
              <div>Hover: Scale 1.05 + opacity increase</div>
            </div>
          </div>
        </div>

        {/* Medium (Default) */}
        <div>
          <div 
            className="text-xs mb-3"
            style={{ color: 'var(--text-secondary)' }}
          >
            Medium (md) - Default
          </div>
          <div className="flex items-center gap-6">
            <MediaControl size="md" />
            <div style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>
              <div>Subtle pulse animation when playing</div>
              <div>Background opacity: 15% idle, 20% playing</div>
              <div>Smooth ease-out transitions</div>
            </div>
          </div>
        </div>

        {/* Small */}
        <div>
          <div 
            className="text-xs mb-3"
            style={{ color: 'var(--text-secondary)' }}
          >
            Small (sm)
          </div>
          <div className="flex items-center gap-6">
            <MediaControl size="sm" />
            <div style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>
              <div>Compact version for inline use</div>
              <div>Maintains all state behaviors</div>
              <div>Enterprise SaaS aesthetic</div>
            </div>
          </div>
        </div>
      </div>

      {/* State Explanation */}
      <div 
        className="mt-10 p-6 rounded-lg"
        style={{
          backgroundColor: 'var(--surface-primary)',
          border: '1px solid var(--border-primary)',
        }}
      >
        <div 
          className="text-sm mb-4"
          style={{ 
            color: 'var(--text-primary)',
            fontWeight: 600,
          }}
        >
          State Design
        </div>
        <div className="grid grid-cols-2 gap-6">
          {/* Idle State */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: '#5CCB7A' }}
              />
              <span style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500 }}>
                Idle State
              </span>
            </div>
            <ul style={{ color: 'var(--text-tertiary)', fontSize: '12px' }} className="space-y-1 ml-9">
              <li>• Soft green (#5CCB7A)</li>
              <li>• Ready to play</li>
              <li>• No animation</li>
              <li>• Calm, non-distracting</li>
            </ul>
          </div>

          {/* Playing State */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: '#4C7DFF' }}
              />
              <span style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500 }}>
                Playing State
              </span>
            </div>
            <ul style={{ color: 'var(--text-tertiary)', fontSize: '12px' }} className="space-y-1 ml-9">
              <li>• Accent blue (#4C7DFF)</li>
              <li>• Currently active</li>
              <li>• Subtle pulse (2s interval)</li>
              <li>• Active but not alarming</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Integration Example */}
      <div className="mt-8">
        <div 
          className="text-sm mb-4"
          style={{ 
            color: 'var(--text-primary)',
            fontWeight: 600,
          }}
        >
          Dashboard Integration Example
        </div>
        <div 
          className="p-6 rounded-lg flex items-center justify-between"
          style={{
            backgroundColor: 'var(--surface-primary)',
            border: '1px solid var(--border-primary)',
          }}
        >
          <div>
            <div style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500 }}>
              Team Standup Recording
            </div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '12px' }} className="mt-1">
              Daily sync • 15:30 duration
            </div>
          </div>
          <MediaControl size="md" />
        </div>
      </div>
    </div>
  );
}
