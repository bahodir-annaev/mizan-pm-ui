import { useState, useRef, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, User } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface AddTaskRowProps {
  onAddTask: (task: {
    title: string;
    project?: string;
    status: string;
    assignee?: string;
    dueDate?: string;
  }) => void;
  colSpan: number;
  projectLocked?: boolean;
  defaultProject?: string;
  mode?: 'projects' | 'works';
}

export function AddTaskRow({ 
  onAddTask, 
  colSpan, 
  projectLocked = false, 
  defaultProject = '',
  mode = 'works'
}: AddTaskRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [project, setProject] = useState(defaultProject);
  const [status, setStatus] = useState('Start');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isExpanded]);

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleCancel = () => {
    setIsExpanded(false);
    setTitle('');
    setProject(defaultProject);
    setStatus('Start');
    setAssignee('');
    setDueDate(undefined);
  };

  const handleSubmit = () => {
    if (title.trim()) {
      onAddTask({
        title: title.trim(),
        project: projectLocked ? defaultProject : project,
        status,
        assignee: assignee || undefined,
        dueDate: dueDate?.toLocaleDateString('en-GB', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        }),
      });
      handleCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isExpanded) {
    return (
      <tr 
        className="border-t transition-colors cursor-pointer group"
        style={{ 
          borderColor: 'var(--border-secondary)',
          borderStyle: 'dashed'
        }}
        onClick={handleExpand}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <td colSpan={colSpan} className="px-6 py-4">
          <div className="flex items-center gap-2">
            <Plus 
              className="w-4 h-4 opacity-40 group-hover:opacity-60 transition-opacity" 
              style={{ color: 'var(--text-tertiary)' }}
            />
            <span 
              className="text-sm opacity-60 group-hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Add new task
            </span>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr 
      className="border-t"
      style={{ 
        borderColor: 'var(--border-primary)',
        backgroundColor: 'var(--surface-secondary)'
      }}
    >
      <td colSpan={colSpan} className="px-6 py-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Title Input - Primary */}
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Task title..."
            className="flex-1 min-w-[200px] px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-1 transition-colors"
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--input-border)',
              color: 'var(--text-primary)',
              outlineColor: 'var(--input-focus)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--input-focus)';
              e.target.style.boxShadow = `0 0 0 1px var(--input-focus)`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--input-border)';
              e.target.style.boxShadow = 'none';
            }}
          />

          {/* Project Input - Only for Works table */}
          {mode === 'works' && !projectLocked && (
            <input
              type="text"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Project name..."
              className="w-40 px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-1 transition-colors"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-primary)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--input-focus)';
                e.target.style.boxShadow = `0 0 0 1px var(--input-focus)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--input-border)';
                e.target.style.boxShadow = 'none';
              }}
            />
          )}

          {/* Status Select */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-1 transition-colors"
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--input-border)',
              color: 'var(--text-primary)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--input-focus)';
              e.target.style.boxShadow = `0 0 0 1px var(--input-focus)`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--input-border)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value="Start">Start</option>
            <option value="In Progress">In Progress</option>
            <option value="Burning">Burning</option>
            <option value="End">End</option>
            <option value="Late">Late</option>
          </select>

          {/* Assignee Input */}
          <div className="relative">
            <User 
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-40 pointer-events-none"
              style={{ color: 'var(--text-tertiary)' }}
            />
            <input
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Assignee"
              className="w-32 pl-8 pr-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-1 transition-colors"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-primary)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--input-focus)';
                e.target.style.boxShadow = `0 0 0 1px var(--input-focus)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--input-border)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Due Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--input-border)',
                  color: dueDate ? 'var(--text-primary)' : 'var(--text-tertiary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--input-focus)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--input-border)';
                }}
              >
                <CalendarIcon className="w-3.5 h-3.5 opacity-50" />
                <span>
                  {dueDate 
                    ? dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                    : 'Due date'
                  }
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-0 border" 
              align="start"
              style={{
                backgroundColor: 'var(--surface-primary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="px-4 py-2 rounded-md text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: title.trim() ? 'var(--accent-primary)' : 'var(--surface-tertiary)',
                color: title.trim() ? 'var(--surface-primary)' : 'var(--text-disabled)'
              }}
              onMouseEnter={(e) => {
                if (title.trim()) {
                  e.currentTarget.style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                if (title.trim()) {
                  e.currentTarget.style.opacity = '1';
                }
              }}
            >
              Add task
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-md text-sm transition-colors"
              style={{
                color: 'var(--text-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="mt-2 flex items-center gap-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          <span className="opacity-60">
            <kbd className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--surface-tertiary)' }}>Enter</kbd> to save
          </span>
          <span className="opacity-60">
            <kbd className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--surface-tertiary)' }}>Esc</kbd> to cancel
          </span>
        </div>
      </td>
    </tr>
  );
}