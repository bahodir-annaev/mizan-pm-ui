import { useState, useRef, useEffect } from 'react';
import { GripVertical, Trash2 } from 'lucide-react';

interface EditableChecklistItemProps {
  id: string;
  text: string;
  completed: boolean;
  onTextChange?: (newText: string) => void;
  onToggleComplete?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
}

export function EditableChecklistItem({
  id,
  text,
  completed,
  onTextChange,
  onToggleComplete,
  onDelete,
  canEdit = true
}: EditableChecklistItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tempText, setTempText] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const saveChange = () => {
    if (tempText.trim() && tempText !== text) {
      onTextChange?.(tempText.trim());
    } else {
      setTempText(text);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveChange();
    } else if (e.key === 'Escape') {
      setTempText(text);
      setIsEditing(false);
    }
  };

  return (
    <div
      className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-md group transition-colors"
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

      {/* Text */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={tempText}
            onChange={(e) => setTempText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={saveChange}
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
            onClick={() => canEdit && setIsEditing(true)}
            disabled={!canEdit}
            className="w-full text-left text-sm"
            style={{
              color: 'var(--text-primary)',
              textDecoration: completed ? 'line-through' : 'none',
              opacity: completed ? 0.5 : 1
            }}
          >
            {text}
          </button>
        )}
      </div>

      {/* Delete button */}
      {canEdit && isHovered && onDelete && (
        <button
          onClick={onDelete}
          className="p-1 rounded hover:bg-opacity-10 transition-colors opacity-0 group-hover:opacity-100"
          style={{ color: 'var(--text-tertiary)' }}
          title="Delete item"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
