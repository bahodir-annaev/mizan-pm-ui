import { useState, useRef, useEffect } from 'react';
import { Edit2, Check, X } from 'lucide-react';

interface EditableCellProps {
  value: string | number;
  onChange: (value: string | number) => void;
  type?: 'text' | 'number' | 'select';
  options?: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  validation?: (value: string | number) => boolean;
  renderDisplay?: (value: string | number) => React.ReactNode;
}

export function EditableCell({
  value,
  onChange,
  type = 'text',
  options = [],
  placeholder = 'Enter value',
  disabled = false,
  className = '',
  style = {},
  validation,
  renderDisplay
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement && type === 'text') {
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleSave();
      }
    }

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isEditing, tempValue]);

  const handleSave = () => {
    // Validate if validation function provided
    if (validation && !validation(tempValue)) {
      setError(true);
      return;
    }

    // Don't save if value hasn't changed
    if (tempValue !== value) {
      onChange(tempValue);
    }
    
    setError(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setError(false);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'select') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Tab') {
      handleSave();
    }
  };

  if (disabled) {
    return (
      <div className={className} style={style}>
        {renderDisplay ? renderDisplay(value) : value}
      </div>
    );
  }

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className={`group flex items-center gap-2 px-2 py-1 rounded transition-all text-left w-full ${className}`}
        style={style}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <span className="flex-1">
          {renderDisplay ? renderDisplay(value) : value || placeholder}
        </span>
        <Edit2 
          className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity flex-shrink-0" 
          style={{ color: 'var(--text-tertiary)' }}
        />
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div 
        className="flex items-center gap-1 px-2 py-1 rounded-md border-2 shadow-sm"
        style={{
          backgroundColor: 'var(--input-bg)',
          borderColor: error ? 'var(--status-burning)' : 'var(--accent-primary)',
          boxShadow: error 
            ? '0 0 0 2px rgba(239, 68, 68, 0.1)' 
            : '0 0 0 2px var(--accent-primary-bg)'
        }}
      >
        {type === 'select' ? (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={String(tempValue)}
            onChange={(e) => {
              setTempValue(e.target.value);
              // Auto-save on select change
              setTimeout(() => {
                onChange(e.target.value);
                setIsEditing(false);
              }, 0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-sm pr-6"
            style={{ color: 'var(--text-primary)' }}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={type}
            value={String(tempValue)}
            onChange={(e) => setTempValue(type === 'number' ? Number(e.target.value) : e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text-primary)' }}
          />
        )}
        
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={handleSave}
            className="p-1 rounded hover:bg-opacity-10 transition-colors"
            style={{ color: 'var(--accent-primary)' }}
            title="Save (Enter)"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 rounded hover:bg-opacity-10 transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            title="Cancel (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {error && (
        <div 
          className="absolute left-0 top-full mt-1 text-xs px-2 py-1 rounded shadow-sm whitespace-nowrap z-10"
          style={{
            backgroundColor: 'var(--status-burning-bg)',
            color: 'var(--status-burning)'
          }}
        >
          Invalid value
        </div>
      )}
    </div>
  );
}
