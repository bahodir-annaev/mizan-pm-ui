import React from 'react';
import { Play, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface WorkflowOption {
  value: string;
  label: string;
  icon: React.ElementType;
  colorVar: string;
  group: 'execution' | 'review';
}

const workflowOptions: WorkflowOption[] = [
  // Execution states
  { value: 'Start', label: 'Start', icon: Play, colorVar: 'var(--status-start)', group: 'execution' },
  { value: 'In Progress', label: 'In Progress', icon: Play, colorVar: 'var(--status-progress)', group: 'execution' },
  { value: 'Burning', label: 'Burning', icon: AlertCircle, colorVar: 'var(--status-burning)', group: 'execution' },
  { value: 'End', label: 'End', icon: CheckCircle2, colorVar: 'var(--status-end)', group: 'execution' },
  { value: 'Late', label: 'Late', icon: Clock, colorVar: 'var(--status-late)', group: 'execution' },
  
  // Review states
  { value: 'Pending review', label: 'Pending review', icon: Clock, colorVar: 'var(--text-tertiary)', group: 'review' },
  { value: 'Approved', label: 'Approved', icon: CheckCircle2, colorVar: 'var(--status-start)', group: 'review' },
  { value: 'Rejected', label: 'Rejected', icon: AlertCircle, colorVar: 'var(--status-late)', group: 'review' },
];

interface UnifiedWorkflowCellProps {
  executionState: string;
  reviewState: string;
  onExecutionChange: (newValue: string) => void;
  onReviewChange: (newValue: string) => void;
  isActive?: boolean;
}

export function UnifiedWorkflowCell({ 
  executionState, 
  reviewState, 
  onExecutionChange, 
  onReviewChange,
  isActive 
}: UnifiedWorkflowCellProps) {
  const currentExecution = workflowOptions.find(opt => opt.value === executionState && opt.group === 'execution') || workflowOptions[0];
  const currentReview = workflowOptions.find(opt => opt.value === reviewState && opt.group === 'review');
  const ExecutionIcon = currentExecution.icon;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Execution State */}
      <Select value={executionState} onValueChange={onExecutionChange}>
        <SelectTrigger 
          className="h-auto border-0 shadow-none p-0 hover:opacity-80 transition-opacity focus:ring-0 focus:ring-offset-0"
          style={{ width: 'auto', backgroundColor: 'transparent' }}
        >
          <SelectValue>
            <div className="flex flex-col gap-1">
              {/* Main execution state - Text Only */}
              <div className="inline-flex items-center gap-1.5">
                <ExecutionIcon 
                  className="w-3 h-3 flex-shrink-0" 
                  style={{ color: currentExecution.colorVar }}
                />
                <span 
                  className="text-xs whitespace-nowrap"
                  style={{ 
                    color: currentExecution.colorVar,
                    fontWeight: isActive && currentExecution.value === 'In Progress' ? 500 : 400
                  }}
                >
                  {currentExecution.label}
                </span>
              </div>
              
              {/* Review state as subtitle */}
              {currentReview && (
                <span 
                  className="text-xs whitespace-nowrap"
                  style={{ 
                    color: currentReview.colorVar,
                    opacity: 0.7,
                    fontSize: '0.7rem',
                    paddingLeft: '0.625rem'
                  }}
                >
                  {currentReview.label}
                </span>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent 
          style={{
            backgroundColor: 'var(--surface-primary)',
            borderColor: 'var(--border-primary)',
            minWidth: '180px'
          }}
        >
          {/* Execution States Group */}
          <div className="px-2 py-1.5">
            <div 
              className="text-xs uppercase tracking-wider mb-1.5" 
              style={{ 
                color: 'var(--text-tertiary)',
                fontSize: '0.65rem',
                fontWeight: 600
              }}
            >
              Execution
            </div>
            {workflowOptions
              .filter(opt => opt.group === 'execution')
              .map(option => {
                const OptionIcon = option.icon;
                return (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <OptionIcon 
                        className="w-3 h-3 flex-shrink-0" 
                        style={{ color: option.colorVar }}
                      />
                      <span 
                        className="text-xs"
                        style={{ color: option.colorVar }}
                      >
                        {option.label}
                      </span>
                    </div>
                  </SelectItem>
                );
              })}
          </div>

          {/* Divider */}
          <div 
            className="h-px my-1" 
            style={{ backgroundColor: 'var(--border-secondary)' }}
          />

          {/* Review States Group */}
          <div className="px-2 py-1.5">
            <div 
              className="text-xs uppercase tracking-wider mb-1.5" 
              style={{ 
                color: 'var(--text-tertiary)',
                fontSize: '0.65rem',
                fontWeight: 600
              }}
            >
              Review
            </div>
            {workflowOptions
              .filter(opt => opt.group === 'review')
              .map(option => {
                const OptionIcon = option.icon;
                return (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onReviewChange(option.value);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <OptionIcon 
                        className="w-3 h-3 flex-shrink-0" 
                        style={{ color: option.colorVar }}
                      />
                      <span 
                        className="text-xs"
                        style={{ color: option.colorVar }}
                      >
                        {option.label}
                      </span>
                    </div>
                  </SelectItem>
                );
              })}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}