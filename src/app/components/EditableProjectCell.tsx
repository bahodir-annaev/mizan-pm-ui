import { useState } from 'react';
import { InlineDatePicker } from './InlineDatePicker';
import { EditableCell } from './EditableCell';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface EditableProjectCellProps {
  field: 'status' | 'size' | 'type' | 'dateStart' | 'dateEnd' | 'name' | 'client';
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  rowData?: any;
}

const statusOptions = [
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Start', label: 'Start' },
  { value: 'Burning', label: 'Burning' },
  { value: 'End', label: 'End' },
  { value: 'Late', label: 'Late' },
];

const sizeOptions = [
  { value: 'Small', label: 'Small' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Large', label: 'Large' },
];

const typeOptions = [
  { value: 'Interior', label: 'Interior' },
  { value: 'Residential', label: 'Residential' },
  { value: 'Commercial', label: 'Commercial' },
];

export function EditableProjectCell({
  field,
  value,
  onChange,
  disabled = false,
  rowData
}: EditableProjectCellProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Status dropdown
  if (field === 'status') {
    return (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger 
            className="w-32 border-0 shadow-none h-8"
            style={{
              backgroundColor: isHovered && !disabled ? 'var(--surface-hover)' : 'transparent'
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Size dropdown
  if (field === 'size') {
    return (
      <EditableCell
        value={value}
        onChange={onChange}
        type="select"
        options={sizeOptions}
        disabled={disabled}
        renderDisplay={(val) => (
          <span 
            className="hover:underline"
            style={{ color: 'var(--accent-primary)' }}
          >
            {val}
          </span>
        )}
      />
    );
  }

  // Type dropdown
  if (field === 'type') {
    return (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger 
            className="w-36 border-0 shadow-none h-8"
            style={{
              backgroundColor: isHovered && !disabled ? 'var(--surface-hover)' : 'transparent'
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map(option => (
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
      />
    );
  }

  // Text fields (name, client)
  if (field === 'name') {
    return (
      <EditableCell
        value={value}
        onChange={onChange}
        type="text"
        disabled={disabled}
        placeholder="Enter project name"
        renderDisplay={(val) => (
          <span 
            className="hover:underline"
            style={{ color: 'var(--accent-primary)' }}
          >
            {val}
          </span>
        )}
      />
    );
  }

  if (field === 'client') {
    return (
      <EditableCell
        value={value}
        onChange={onChange}
        type="text"
        disabled={disabled}
        placeholder="Enter client name"
        style={{ color: 'var(--text-primary)' }}
      />
    );
  }

  return <span>{value}</span>;
}
