import { useState, useRef, useEffect } from 'react';
import { Edit2, X, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface EditableCustomFieldProps {
  fieldId: string;
  label: string;
  value: string | number;
  type?: 'text' | 'number' | 'select';
  options?: { value: string; label: string }[];
  onLabelChange?: (newLabel: string) => void;
  onValueChange?: (newValue: string | number) => void;
  onDelete?: () => void;
  canEdit?: boolean;
}

export function EditableCustomField({
  fieldId,
  label,
  value,
  type = 'text',
  options = [],
  onLabelChange,
  onValueChange,
  onDelete,
  canEdit = true
}: EditableCustomFieldProps) {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tempLabel, setTempLabel] = useState(label);
  const [tempValue, setTempValue] = useState(value);
  
  const labelInputRef = useRef<HTMLInputElement>(null);
  const valueInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingLabel && labelInputRef.current) {
      labelInputRef.current.focus();
      labelInputRef.current.select();
    }
  }, [isEditingLabel]);

  useEffect(() => {
    if (isEditingValue && valueInputRef.current) {
      valueInputRef.current.focus();
      valueInputRef.current.select();
    }
  }, [isEditingValue]);

  const saveLabelChange = () => {
    if (tempLabel.trim() && tempLabel !== label) {
      onLabelChange?.(tempLabel.trim());
    } else {
      setTempLabel(label);
    }
    setIsEditingLabel(false);
  };

  const saveValueChange = () => {
    if (tempValue !== value) {
      onValueChange?.(tempValue);
    }
    setIsEditingValue(false);
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveLabelChange();
    } else if (e.key === 'Escape') {
      setTempLabel(label);
      setIsEditingLabel(false);
    }
  };

  const handleValueKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveValueChange();
    } else if (e.key === 'Escape') {
      setTempValue(value);
      setIsEditingValue(false);
    }
  };

  return (
    <div
      className="flex items-center justify-between py-3 px-2 -mx-2 rounded-md group transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: isHovered && canEdit ? 'var(--surface-hover)' : 'transparent'
      }}
    >
      {/* Label */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        {isEditingLabel ? (
          <div className="flex items-center gap-1 flex-1">
            <input
              ref={labelInputRef}
              type="text"
              value={tempLabel}
              onChange={(e) => setTempLabel(e.target.value)}
              onKeyDown={handleLabelKeyDown}
              onBlur={saveLabelChange}
              className="px-2 py-1 rounded border-2 text-sm outline-none flex-1"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--accent-primary)',
                color: 'var(--text-primary)',
                boxShadow: '0 0 0 2px var(--accent-primary-bg)'
              }}
            />
          </div>
        ) : (
          <button
            onClick={() => canEdit && setIsEditingLabel(true)}
            disabled={!canEdit}
            className="flex items-center gap-2 text-sm flex-1 text-left group/label"
          >
            <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
            {canEdit && isHovered && (
              <Edit2 className="w-3 h-3 opacity-0 group-hover/label:opacity-40" style={{ color: 'var(--text-tertiary)' }} />
            )}
          </button>
        )}
      </div>

      {/* Value */}
      <div className="flex items-center gap-2 ml-4">
        {type === 'select' ? (
          <Select
            value={String(value)}
            onValueChange={(val) => {
              onValueChange?.(val);
            }}
            disabled={!canEdit}
          >
            <SelectTrigger 
              className="w-40 h-8 border-0 shadow-none text-sm"
              style={{
                backgroundColor: isHovered && canEdit ? 'var(--surface-secondary)' : 'transparent',
                color: 'var(--text-primary)'
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : isEditingValue ? (
          <div className="flex items-center gap-1">
            <input
              ref={valueInputRef}
              type={type}
              value={String(tempValue)}
              onChange={(e) => setTempValue(type === 'number' ? Number(e.target.value) : e.target.value)}
              onKeyDown={handleValueKeyDown}
              onBlur={saveValueChange}
              className="w-40 px-2 py-1 rounded border-2 text-sm outline-none"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--accent-primary)',
                color: 'var(--text-primary)',
                boxShadow: '0 0 0 2px var(--accent-primary-bg)'
              }}
            />
          </div>
        ) : (
          <button
            onClick={() => canEdit && setIsEditingValue(true)}
            disabled={!canEdit}
            className="flex items-center gap-2 px-2 py-1 rounded text-sm group/value w-40 text-left"
          >
            <span style={{ color: 'var(--text-primary)' }}>{value}</span>
            {canEdit && isHovered && (
              <Edit2 className="w-3 h-3 opacity-0 group-hover/value:opacity-40" style={{ color: 'var(--text-tertiary)' }} />
            )}
          </button>
        )}

        {/* Delete button */}
        {canEdit && isHovered && onDelete && (
          <button
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-opacity-10 transition-colors opacity-0 group-hover:opacity-100"
            style={{ color: 'var(--text-tertiary)' }}
            title="Delete field"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
