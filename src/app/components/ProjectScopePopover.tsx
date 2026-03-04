import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { Info, Square, Building2 } from 'lucide-react';

interface ProjectScopePopoverProps {
  size: string;
  kvadratura: string;
  type: string;
  description?: string;
  complexity?: string;
  duration?: string;
  children: React.ReactNode;
}

const sizeConfig = {
  Small: {
    color: 'var(--status-start)',
    bg: 'var(--status-start-bg)',
    description: 'Compact scope, focused deliverables'
  },
  Medium: {
    color: 'var(--status-progress)',
    bg: 'var(--status-progress-bg)',
    description: 'Balanced scope with moderate complexity'
  },
  Large: {
    color: 'var(--status-burning)',
    bg: 'var(--status-burning-bg)',
    description: 'Extensive scope, high-level planning required'
  }
};

export function ProjectScopePopover({
  size,
  kvadratura,
  type,
  description,
  complexity,
  duration,
  children
}: ProjectScopePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const config = sizeConfig[size as keyof typeof sizeConfig] || sizeConfig.Medium;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div>
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[340px] p-0 border shadow-lg"
        style={{
          backgroundColor: 'var(--surface-primary)',
          borderColor: 'var(--border-primary)',
        }}
        align="start"
        sideOffset={8}
      >
        {/* Header */}
        <div 
          className="px-4 py-3 border-b flex items-center gap-2"
          style={{ borderColor: 'var(--border-secondary)' }}
        >
          <Info className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Project Scope Overview
          </h3>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Project Size Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Size:
            </span>
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: config.bg,
                color: config.color
              }}
            >
              <div 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              {size}
            </div>
          </div>

          {/* Project Area */}
          <div className="flex items-start gap-3">
            <Square 
              className="w-4 h-4 flex-shrink-0 mt-0.5" 
              style={{ color: 'var(--text-tertiary)' }} 
            />
            <div className="flex-1">
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Total Project Area
              </div>
              <div className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>
                {kvadratura}
              </div>
            </div>
          </div>

          {/* Project Type */}
          <div className="flex items-start gap-3">
            <Building2 
              className="w-4 h-4 flex-shrink-0 mt-0.5" 
              style={{ color: 'var(--text-tertiary)' }} 
            />
            <div className="flex-1">
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Project Direction
              </div>
              <div className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>
                {type}
              </div>
            </div>
          </div>

          {/* Description */}
          {description && (
            <div 
              className="pt-3 border-t text-xs leading-relaxed"
              style={{ 
                borderColor: 'var(--border-secondary)',
                color: 'var(--text-secondary)' 
              }}
            >
              {description}
            </div>
          )}

          {/* Optional: Complexity & Duration */}
          {(complexity || duration) && (
            <div 
              className="pt-3 border-t flex items-center gap-4 text-xs"
              style={{ 
                borderColor: 'var(--border-secondary)',
                color: 'var(--text-tertiary)' 
              }}
            >
              {complexity && (
                <div>
                  <span className="opacity-70">Complexity:</span>{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>{complexity}</span>
                </div>
              )}
              {duration && (
                <div>
                  <span className="opacity-70">Duration:</span>{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>{duration}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
