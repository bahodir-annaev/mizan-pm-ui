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

// Mock projects - in real app, this would come from props or context
const availableProjects: Project[] = [
  { id: 'PRJ-001', name: 'Bobur residence interior' },
  { id: 'PRJ-002', name: 'Elite Developers complex' },
  { id: 'PRJ-003', name: 'Modern Spaces office' },
  { id: 'PRJ-004', name: 'Urban Design pavilion' },
  { id: 'PRJ-005', name: 'Prestige Homes villa' },
];

interface ProjectAwareTaskTypeSelectorProps {
  defaultProject?: Project;
  projectLocked?: boolean;
  onSelect?: (taskType: string, project: Project) => void;
}

export function ProjectAwareTaskTypeSelector({
  defaultProject = availableProjects[0],
  projectLocked = false,
  onSelect
}: ProjectAwareTaskTypeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project>(defaultProject);
  const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false);

  const handleTaskTypeSelect = (typeId: string) => {
    onSelect?.(typeId, selectedProject);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button 
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors border text-sm" 
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
          }}
        >
          <SquareCheck className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <span>Create task</span>
          <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-72 p-0 shadow-lg" 
        style={{
          backgroundColor: 'var(--surface-primary)',
          borderColor: 'var(--border-primary)'
        }} 
        align="start"
      >
        {/* Project Context Section */}
        <div className="p-3 border-b" style={{ borderColor: 'var(--border-secondary)' }}>
          <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
            Project
          </div>
          <Popover open={isProjectSelectorOpen} onOpenChange={setIsProjectSelectorOpen}>
            <PopoverTrigger asChild>
              <button
                disabled={projectLocked}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  color: 'var(--text-primary)',
                  cursor: projectLocked ? 'default' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!projectLocked) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                }}
              >
                <FolderOpen className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                <span className="flex-1 text-left text-sm truncate">{selectedProject.name}</span>
                {!projectLocked && (
                  <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
                )}
              </button>
            </PopoverTrigger>
            {!projectLocked && (
              <PopoverContent 
                className="w-64 p-2 shadow-lg" 
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  borderColor: 'var(--border-primary)'
                }}
                align="start"
                side="right"
              >
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {availableProjects.map((project) => {
                    const isSelected = project.id === selectedProject.id;
                    return (
                      <button
                        key={project.id}
                        onClick={() => {
                          setSelectedProject(project);
                          setIsProjectSelectorOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-left"
                        style={{
                          backgroundColor: isSelected ? 'var(--accent-primary-bg)' : 'transparent',
                          color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)'
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
                        <FolderOpen className="w-4 h-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate">{project.name}</div>
                          <div className="text-xs opacity-60">{project.id}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            )}
          </Popover>
        </div>

        {/* Task Type Selection */}
        <div className="p-2 space-y-1">
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
                
                return (
                  <button
                    key={type.id}
                    onClick={() => handleTaskTypeSelect(type.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--text-secondary)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
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
