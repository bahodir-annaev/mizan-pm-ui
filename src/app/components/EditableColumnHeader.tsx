import { useState, useRef, useEffect } from 'react';

interface EditableColumnHeaderProps {
  label: string;
  onRename?: (newLabel: string) => void;
  canEdit?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function EditableColumnHeader({
  label,
  onRename,
  canEdit = true,
  className = '',
  style = {},
  children
}: EditableColumnHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(label);
  }, [label]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (canEdit && onRename) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    const trimmedValue = value.trim();
    if (trimmedValue && trimmedValue !== label && onRename) {
      onRename(trimmedValue);
    } else {
      setValue(label); // Revert if empty or unchanged
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(label);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (isEditing) {
    return (
      <th className={className} style={style}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="w-full px-2 py-1 text-xs uppercase tracking-wider rounded border-2 transition-all"
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--accent-primary)',
              color: 'var(--text-primary)',
              outline: 'none',
              boxShadow: '0 0 0 2px var(--accent-primary-bg)'
            }}
          />
        </div>
      </th>
    );
  }

  return (
    <th
      className={`${className} ${canEdit && onRename ? 'cursor-text select-none group/header' : ''}`}
      style={style}
      onDoubleClick={handleDoubleClick}
      title={canEdit && onRename ? 'Double-click to rename' : ''}
    >
      <div className="flex items-center gap-2">
        {children || (
          <span className={canEdit && onRename ? 'group-hover/header:opacity-70 transition-opacity' : ''}>
            {label}
          </span>
        )}
      </div>
    </th>
  );
}
