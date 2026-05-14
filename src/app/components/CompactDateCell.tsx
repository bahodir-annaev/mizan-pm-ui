import { Calendar, ArrowRight } from 'lucide-react';

interface CompactDateCellProps {
  startDate?: string;
  dueDate?: string;
  isDone?: boolean;
}

export function CompactDateCell({ startDate, dueDate, isDone = false }: CompactDateCellProps) {
  const formatCompactDate = (dateString?: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return `${day} ${month}`;
  };

  const getDueDateState = (): 'overdue' | 'warning' | 'normal' => {
    if (!dueDate || isDone) return 'normal';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 3) return 'warning';
    return 'normal';
  };

  const dueDateState = getDueDateState();
  const dueDateColor =
    dueDateState === 'overdue' ? 'var(--status-late)' :
    dueDateState === 'warning' ? '#f97316' :
    'var(--text-tertiary)';

  return (
    <div className="flex items-center gap-2">
      {/* Start Date */}
      <div className="flex items-center gap-1.5">
        <Calendar
          className="w-3.5 h-3.5 flex-shrink-0"
          style={{ color: 'var(--text-tertiary)', opacity: 0.5 }}
        />
        <span
          className="text-sm whitespace-nowrap"
          style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}
        >
          {formatCompactDate(startDate)}
        </span>
      </div>

      {/* Due Date */}
      {dueDate && (
        <div className="flex items-center gap-1.5">
          <ArrowRight
            className="w-3 h-3 flex-shrink-0"
            style={{
              color: dueDateState !== 'normal' ? dueDateColor : 'var(--text-tertiary)',
              opacity: 0.5,
            }}
          />
          <span
            className="text-sm whitespace-nowrap"
            style={{
              color: dueDateColor,
              fontSize: '13px',
              fontWeight: dueDateState !== 'normal' ? 500 : 400,
            }}
          >
            {formatCompactDate(dueDate)}
          </span>
          {dueDateState !== 'normal' && (
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: dueDateColor }}
            />
          )}
        </div>
      )}
    </div>
  );
}