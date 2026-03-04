import { useState } from 'react';
import {
  SquareCheck,
  Flag,
  Layers,
  Target,
  Key,
  CalendarRange,
  FileText,
  File,
  ClipboardList,
  ChevronDown,
  FolderOpen,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface TaskType {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface TaskTypeGroup {
  label: string;
  types: TaskType[];
}

interface Project {
  id: string;
  name: string;
}

const taskTypeGroups: TaskTypeGroup[] = [
  {
    label: 'Work Items',
    types: [
      { id: 'task', label: 'Task', icon: SquareCheck },
      { id: 'milestone', label: 'Milestone', icon: Flag },
      { id: 'epic', label: 'Epic', icon: Layers },
    ],
  },
  {
    label: 'Planning / Structure',
    types: [
      { id: 'goal', label: 'Goal', icon: Target },
      { id: 'key-result', label: 'Key Result', icon: Key },
      { id: 'phase', label: 'Phase', icon: CalendarRange },
    ],
  },
  {
    label: 'Supporting Items',
    types: [
      { id: 'meeting-note', label: 'Meeting note', icon: FileText },
      { id: 'document', label: 'Document', icon: File },
      { id: 'form-response', label: 'Form response', icon: ClipboardList },
    ],
  },
];

interface TaskTypeSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function TaskTypeSelector({ value = 'task', onChange }: TaskTypeSelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedType = taskTypeGroups
    .flatMap(g => g.types)
    .find(t => t.id === value) || taskTypeGroups[0].types[0];

  const SelectedIcon = selectedType.icon;

  const handleSelect = (typeId: string) => {
    onChange?.(typeId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors border" style={{
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border-primary)',
          color: 'var(--text-primary)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
        }}>
          <SelectedIcon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <span className="text-sm">{selectedType.label}</span>
          <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2 shadow-lg" style={{
        backgroundColor: 'var(--surface-primary)',
        borderColor: 'var(--border-primary)'
      }} align="start">
        <div className="space-y-1">
          {taskTypeGroups.map((group, groupIndex) => (
            <div key={group.label}>
              {groupIndex > 0 && (
                <div className="h-px my-2" style={{ backgroundColor: 'var(--border-secondary)' }} />
              )}
              <div className="px-2 py-1.5">
                <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                  {group.label}
                </span>
              </div>
              {group.types.map((type) => {
                const Icon = type.icon;
                const isSelected = type.id === value;
                
                return (
                  <button
                    key={type.id}
                    onClick={() => handleSelect(type.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
                    style={{
                      backgroundColor: isSelected ? 'var(--accent-primary-bg)' : 'transparent',
                      color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{type.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}