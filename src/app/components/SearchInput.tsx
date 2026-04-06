import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  width?: string | number;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  width,
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`} style={width ? { width } : undefined}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width: '16px', height: '16px', color: 'var(--text-tertiary)' }}
      />
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-8 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors"
        style={{
          backgroundColor: 'var(--surface-secondary)',
          border: '1px solid var(--border-primary)',
          color: 'var(--text-primary)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-primary)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-primary)';
        }}
      />
      {value && (
        <button
          className="absolute right-2.5 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-tertiary)' }}
          onClick={() => onChange('')}
          type="button"
        >
          <X style={{ width: '14px', height: '14px' }} />
        </button>
      )}
    </div>
  );
}
