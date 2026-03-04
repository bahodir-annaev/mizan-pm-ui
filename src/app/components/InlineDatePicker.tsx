import { useState, useRef, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';
import { getDeadlineColor, getDeadlineBackgroundColor, getDeadlineFontWeight } from '../utils/dateColors';

interface InlineDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  isDeadline?: boolean; // New prop to enable deadline coloring
}

export function InlineDatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  minDate,
  maxDate,
  disabled = false,
  isDeadline = false
}: InlineDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleSave();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, tempValue]);

  const handleSave = () => {
    if (tempValue && tempValue !== value) {
      onChange(tempValue);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return placeholder;
    
    // If it's already in a nice format (e.g., "12 Jan 2024"), return as is
    if (dateStr.includes(' ')) return dateStr;
    
    // Otherwise, format ISO date to nice format
    try {
      const date = new Date(dateStr);
      const day = date.getDate();
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return dateStr;
    }
  };

  const convertToISODate = (dateStr: string) => {
    // Convert "12 Jan 2024" to "2024-01-12" for input
    if (!dateStr || dateStr.includes('-')) return dateStr;
    
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  if (disabled) {
    return (
      <div className="flex items-center gap-2 px-2 py-1">
        <span style={{ color: 'var(--text-primary)' }}>
          {formatDisplayDate(value)}
        </span>
      </div>
    );
  }

  if (!isOpen) {
    const textColor = isDeadline ? getDeadlineColor(value) : 'var(--text-primary)';
    const bgColor = isDeadline ? getDeadlineBackgroundColor(value) : 'transparent';
    const fontWeight = isDeadline ? getDeadlineFontWeight(value) : 400;
    
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="group flex items-center gap-2 px-2 py-1 rounded transition-all w-full text-left"
        style={{ 
          color: textColor,
          backgroundColor: bgColor,
          fontWeight: fontWeight
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isDeadline && bgColor !== 'transparent' 
            ? bgColor 
            : 'var(--surface-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = bgColor;
        }}
      >
        <span>{formatDisplayDate(value)}</span>
        <Calendar 
          className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity" 
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
          borderColor: 'var(--accent-primary)',
          boxShadow: '0 0 0 2px var(--accent-primary-bg)'
        }}
      >
        <input
          ref={inputRef}
          type="date"
          value={convertToISODate(tempValue)}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyDown={handleKeyDown}
          min={minDate ? convertToISODate(minDate) : undefined}
          max={maxDate ? convertToISODate(maxDate) : undefined}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ 
            color: 'var(--text-primary)',
            colorScheme: 'light dark' // Adapts to theme
          }}
        />
        <button
          onClick={handleCancel}
          className="p-1 rounded hover:bg-opacity-10 transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}