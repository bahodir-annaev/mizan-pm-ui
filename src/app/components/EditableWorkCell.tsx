import { useState } from 'react';
import { InlineDatePicker } from './InlineDatePicker';
import { EditableCell } from './EditableCell';
import { 
  Circle, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Home,
  PaintBucket,
  Building,
  Trees,
  FileText,
  Box,
  Eye,
  File,
  Wrench,
  Users
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface EditableWorkCellProps {
  field: 'status' | 'priority' | 'workType' | 'acceptance' | 'dateStart' | 'dateEnd' | 'title' | 'assignee';
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  rowData?: any; // For validation (e.g., date ranges)
  isActive?: boolean; // For active task visual emphasis
}

const statusOptions = [
  { value: 'In Progress', label: 'In Progress', icon: Play, className: 'status-progress' },
  { value: 'Start', label: 'Start', icon: Play, className: 'status-start' },
  { value: 'Burning', label: 'Burning', icon: AlertCircle, className: 'status-burning' },
  { value: 'End', label: 'End', icon: CheckCircle2, className: 'status-end' },
  { value: 'Late', label: 'Late', icon: Clock, className: 'status-late' },
  // Review states merged into workflow
  { value: 'Pending review', label: 'Pending review', icon: Clock, className: 'status-progress' },
  { value: 'Approved', label: 'Approved', icon: CheckCircle2, className: 'status-end' },
  { value: 'Rejected', label: 'Rejected', icon: AlertCircle, className: 'status-late' },
];

const priorityOptions = [
  { value: 'High', label: 'High', icon: ArrowUp },
  { value: 'Medium', label: 'Medium', icon: ArrowRight },
  { value: 'Low', label: 'Low', icon: ArrowDown },
];

const workTypeOptions = [
  { value: 'Architecture', label: 'Architecture', icon: Home },
  { value: 'Interior Design', label: 'Interior Design', icon: PaintBucket },
  { value: 'Exterior Design', label: 'Exterior Design', icon: Building },
  { value: 'Landscape', label: 'Landscape', icon: Trees },
  { value: 'Working Drawings', label: 'Working Drawings', icon: FileText },
  { value: '3D Visualization', label: '3D Visualization', icon: Box },
  { value: 'Author Supervision', label: 'Author Supervision', icon: Eye },
  { value: 'Documentation', label: 'Documentation', icon: File },
  { value: 'Engineering', label: 'Engineering', icon: Wrench },
  { value: 'Client Coordination', label: 'Client Coordination', icon: Users },
];

const acceptanceOptions = [
  { value: 'Pending', label: 'Pending', style: { color: 'var(--status-progress)', bg: 'var(--status-progress-bg)' } },
  { value: 'Approved', label: 'Approved', style: { color: 'var(--status-end)', bg: 'var(--status-end-bg)' } },
  { value: 'Rejected', label: 'Rejected', style: { color: 'var(--status-burning)', bg: 'var(--status-burning-bg)' } },
  { value: 'Review', label: 'Review', style: { color: 'var(--status-start)', bg: 'var(--status-start-bg)' } },
];

export function EditableWorkCell({
  field,
  value,
  onChange,
  disabled = false,
  rowData,
  isActive = false
}: EditableWorkCellProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Status with dropdown
  if (field === 'status') {
    const statusOption = statusOptions.find(s => s.value === value) || statusOptions[0];
    const StatusIcon = statusOption.icon;
    
    return (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger 
            className="border-0 shadow-none h-8 gap-2"
            style={{
              backgroundColor: isHovered && !disabled ? 'var(--surface-hover)' : 'transparent'
            }}
          >
            <SelectValue>
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-all"
                  style={{
                    backgroundColor: `var(--${statusOption.className}-bg)`,
                    color: `var(--${statusOption.className})`,
                    fontWeight: isActive ? 600 : 500,
                    boxShadow: isActive ? `0 0 0 2px var(--${statusOption.className}-bg)` : 'none'
                  }}
                >
                  <StatusIcon className="w-3 h-3" />
                  <span>{statusOption.label}</span>
                </div>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(option => {
              const Icon = option.icon;
              return (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" />
                    {option.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Priority with dropdown
  if (field === 'priority') {
    const priorityOption = priorityOptions.find(p => p.value === value) || priorityOptions[1];
    const PriorityIcon = priorityOption.icon;
    
    // Get priority class name
    const priorityClassName = `priority-${value.toLowerCase()}`;
    
    return (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger 
            className="border-0 shadow-none h-auto p-0"
            style={{
              backgroundColor: 'transparent'
            }}
          >
            <SelectValue>
              <div className={`priority-pill ${priorityClassName}`}>
                <PriorityIcon className="w-3.5 h-3.5" />
                <span>{priorityOption.label}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map(option => {
              const Icon = option.icon;
              const optionClassName = `priority-${option.value.toLowerCase()}`;
              return (
                <SelectItem key={option.value} value={option.value}>
                  <div className={`priority-pill ${optionClassName}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {option.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Work Type with dropdown
  if (field === 'workType') {
    const workOption = workTypeOptions.find(w => w.value === value) || workTypeOptions[0];
    const WorkIcon = workOption.icon;
    
    return (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger 
            className="border-0 shadow-none h-8 gap-2"
            style={{
              backgroundColor: isHovered && !disabled ? 'var(--surface-hover)' : 'transparent'
            }}
          >
            <SelectValue>
              <div className="flex items-center gap-2">
                <div 
                  className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--surface-tertiary)' }}
                >
                  <WorkIcon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                </div>
                <span style={{ color: 'var(--text-primary)' }}>{workOption.label}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {workTypeOptions.map(option => {
              const Icon = option.icon;
              return (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" />
                    {option.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Acceptance with dropdown
  if (field === 'acceptance') {
    const acceptanceOption = acceptanceOptions.find(a => a.value === value) || acceptanceOptions[0];
    
    return (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger 
            className="border-0 shadow-none h-8 gap-2"
            style={{
              backgroundColor: isHovered && !disabled ? 'var(--surface-hover)' : 'transparent'
            }}
          >
            <SelectValue>
              <div
                className="inline-flex px-2 py-1 rounded text-xs"
                style={{
                  backgroundColor: acceptanceOption.style.bg,
                  color: acceptanceOption.style.color
                }}
              >
                {acceptanceOption.label}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {acceptanceOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Date fields
  if (field === 'dateStart' || field === 'dateEnd') {
    return (
      <InlineDatePicker
        value={value}
        onChange={onChange}
        disabled={disabled}
        minDate={field === 'dateEnd' && rowData?.dateStart ? rowData.dateStart : undefined}
        maxDate={field === 'dateStart' && rowData?.dateEnd ? rowData.dateEnd : undefined}
        isDeadline={field === 'dateEnd'} // Enable deadline coloring for end dates
      />
    );
  }

  // Text fields (title, assignee)
  if (field === 'title' || field === 'assignee') {
    return (
      <EditableCell
        value={value}
        onChange={onChange}
        type="text"
        disabled={disabled}
        placeholder={field === 'title' ? 'Enter task title' : 'Assign to...'}
        style={{ color: 'var(--text-primary)' }}
      />
    );
  }

  return <span>{value}</span>;
}