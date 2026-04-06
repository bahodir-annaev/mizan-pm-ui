import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';

interface QueryWrapperProps {
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
  children: ReactNode;
  loadingRows?: number;
}

export function QueryWrapper({
  isLoading,
  isError,
  error,
  isEmpty,
  emptyMessage = 'No data found.',
  onRetry,
  children,
  loadingRows = 3,
}: QueryWrapperProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {Array.from({ length: loadingRows }).map((_, i) => (
          <div
            key={i}
            className="h-12 rounded-lg animate-pulse"
            style={{ backgroundColor: 'var(--surface-secondary)', opacity: 1 - i * 0.2 }}
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <AlertCircle className="w-10 h-10" style={{ color: 'var(--status-late)' }} />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {error?.message ?? 'Something went wrong'}
        </p>
        {onRetry && (
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors"
            style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--text-primary)' }}
            onClick={onRetry}
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          {emptyMessage}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

/** Spinner for inline loading states */
export function InlineLoader({ size = 16 }: { size?: number }) {
  return <Loader2 style={{ width: size, height: size }} className="animate-spin" />;
}
