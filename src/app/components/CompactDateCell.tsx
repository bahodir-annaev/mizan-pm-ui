import { Calendar, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface CompactDateCellProps {
  startDate?: string;
  dueDate?: string;
  isOverdue?: boolean;
}

export function CompactDateCell({ startDate, dueDate, isOverdue = false }: CompactDateCellProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Format date to show day + month (e.g., "15 Jan")
  const formatCompactDate = (dateString?: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return `${day} ${month}`;
  };

  // Check if due date is overdue
  const isDueOverdue = () => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  const overdueStatus = isDueOverdue();
  const showOverdueState = overdueStatus || isOverdue;

  return (
    <div
      className="relative flex items-center gap-2 min-w-[100px] rounded-md px-2 py-1.5 -mx-2 -my-1.5"
      style={{
        backgroundColor: isHovered 
          ? 'var(--surface-hover)' 
          : 'transparent',
        transition: 'background-color 150ms ease-out'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Start Date - Always Visible */}
      <div className="flex items-center gap-1.5">
        <Calendar 
          className="w-3.5 h-3.5 flex-shrink-0" 
          style={{ 
            color: 'var(--text-tertiary)', 
            opacity: 0.5
          }} 
        />
        <span
          className="text-sm whitespace-nowrap"
          style={{
            color: isHovered ? 'var(--text-secondary)' : 'var(--text-tertiary)',
            fontSize: '13px',
            fontWeight: 400,
            transition: 'color 120ms ease-out'
          }}
        >
          {formatCompactDate(startDate)}
        </span>
      </div>

      {/* Due Date - Expandable on Hover */}
      {dueDate && (
        <div
          className="flex items-center gap-1.5"
          style={{
            maxWidth: isHovered ? '120px' : '0',
            opacity: isHovered ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-width 150ms ease-out, opacity 150ms ease-out',
          }}
        >
          <ArrowRight 
            className="w-3 h-3 flex-shrink-0"
            style={{
              color: showOverdueState ? 'var(--status-late)' : 'var(--text-tertiary)',
              opacity: 0.5
            }}
          />
          <span
            className="text-sm whitespace-nowrap"
            style={{
              color: showOverdueState ? 'var(--status-late)' : 'var(--text-tertiary)',
              fontSize: '13px',
              fontWeight: showOverdueState ? 500 : 400,
            }}
          >
            {formatCompactDate(dueDate)}
          </span>
        </div>
      )}

      {/* Overdue indicator dot - Static, no pulse */}
      {showOverdueState && !isHovered && (
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{
            backgroundColor: 'var(--status-late)',
          }}
        />
      )}
    </div>
  );
}