import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  /** Hex or CSS color string used for icon tint and background tint */
  iconColor?: string;
  children?: ReactNode;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  iconColor,
  children,
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`p-6 rounded-xl ${className}`}
      style={{
        backgroundColor: 'var(--surface-primary)',
        border: '1px solid var(--border-primary)',
      }}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: iconColor ? `${iconColor}20` : 'var(--surface-secondary)',
              color: iconColor ?? 'var(--text-secondary)',
            }}
          >
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div
            className="text-3xl mb-1"
            style={{ color: 'var(--text-primary)', fontWeight: 600 }}
          >
            {value}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {label}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
