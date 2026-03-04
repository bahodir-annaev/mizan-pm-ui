import { useState, useRef, useEffect } from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface EditableSubtaskProps {
  id: string;
  title: string;
  completed: boolean;
  status: string;
  onTitleChange?: (newTitle: string) => void;
  onStatusChange?: (newStatus: string) => void;
  onToggleComplete?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
  statusOptions?: { value: string; className: string }[];
}

const defaultStatusOptions = [
  { value: 'Start', className: 'status-start' },
  { value: 'In Progress', className: 'status-progress' },
  { value: 'End', className: 'status-end' },
];

export function EditableSubtask({
  id,
  title,
  completed,
  status,
  onTitleChange,
  onStatusChange,
  onToggleComplete,
  onDelete,
  canEdit = true,
  statusOptions = defaultStatusOptions
}: EditableSubtaskProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  const saveTitleChange = () => {
    if (tempTitle.trim() && tempTitle !== title) {
      onTitleChange?.(tempTitle.trim());
    } else {
      setTempTitle(title);
    }
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveTitleChange();
    } else if (e.key === 'Escape') {
      setTempTitle(title);
      setIsEditingTitle(false);
    }
  };

  return (
    <div
      className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-md group transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: isHovered && canEdit ? 'var(--surface-hover)' : 'transparent'
      }}
    >
      {/* Drag handle */}
      {canEdit && (
        <div className="opacity-0 group-hover:opacity-30 cursor-grab" style={{ color: 'var(--text-tertiary)' }}>
          <GripVertical className="w-4 h-4" />
        </div>
      )}

      {/* Checkbox */}
      <input
        type="checkbox"
        checked={completed}
        onChange={onToggleComplete}
        disabled={!canEdit}
        className="w-4 h-4 rounded flex-shrink-0"
        style={{
          borderColor: 'var(--border-primary)',
          backgroundColor: 'var(--input-bg)',
          accentColor: 'var(--accent-primary)'
        }}
      />

      {/* Title */}
      <div className="flex-1 min-w-0">
        {isEditingTitle ? (
          <input
            ref={inputRef}
            type="text"
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={saveTitleChange}
            className="w-full px-2 py-1 rounded border-2 text-sm outline-none"
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--accent-primary)',
              color: 'var(--text-primary)',
              boxShadow: '0 0 0 2px var(--accent-primary-bg)'
            }}
          />
        ) : (
          <button
            onClick={() => canEdit && setIsEditingTitle(true)}
            disabled={!canEdit}
            className="w-full text-left text-sm"
            style={{
              color: 'var(--text-primary)',
              textDecoration: completed ? 'line-through' : 'none',
              opacity: completed ? 0.5 : 1
            }}
          >
            {title}
          </button>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <Select
          value={status}
          onValueChange={onStatusChange}
          disabled={!canEdit}
        >
          <SelectTrigger 
            className="w-28 h-7 border-0 shadow-none text-xs px-2"
            style={{
              backgroundColor: isHovered && canEdit ? 'var(--surface-secondary)' : 'transparent'
            }}
          >
            <SelectValue>
              {(() => {
                const currentStatus = statusOptions.find(s => s.value === status);
                return (
                  <div
                    className="px-2 py-0.5 rounded-full text-xs inline-block"
                    style={{
                      backgroundColor: currentStatus ? `var(--${currentStatus.className}-bg)` : 'var(--surface-tertiary)',
                      color: currentStatus ? `var(--${currentStatus.className})` : 'var(--text-primary)'
                    }}
                  >
                    {status}
                  </div>
                );
              })()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: `var(--${option.className})` }}
                  />
                  {option.value}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Delete button */}
        {canEdit && isHovered && onDelete && (
          <button
            onClick={onDelete}
            className="p-1 rounded hover:bg-opacity-10 transition-colors opacity-0 group-hover:opacity-100"
            style={{ color: 'var(--text-tertiary)' }}
            title="Delete subtask"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
