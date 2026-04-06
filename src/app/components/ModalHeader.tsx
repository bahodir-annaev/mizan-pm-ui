import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ModalHeaderProps {
  title: ReactNode;
  onClose: () => void;
}

export function ModalHeader({ title, onClose }: ModalHeaderProps) {
  return (
    <div
      className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
      style={{ borderColor: 'var(--border-primary)' }}
    >
      <span
        className="text-base font-semibold"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </span>
      <button
        onClick={onClose}
        className="p-1.5 rounded-lg transition-colors"
        style={{ color: 'var(--text-tertiary)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--text-tertiary)';
        }}
        type="button"
        aria-label="Close"
      >
        <X style={{ width: '18px', height: '18px' }} />
      </button>
    </div>
  );
}
