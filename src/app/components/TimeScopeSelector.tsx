import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export type TimeScope = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all-time';

export interface TimeScopeState {
  scope: TimeScope;
  date: Date;
  weekStart?: Date;
  weekEnd?: Date;
  month?: number;
  year?: number;
}

interface TimeScopeSelectorProps {
  value: TimeScopeState;
  onChange: (value: TimeScopeState) => void;
}

// Helper functions
const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  return new Date(d.setDate(diff));
};

const getWeekEnd = (date: Date): Date => {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  return weekEnd;
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatWeekRange = (start: Date, end: Date): string => {
  return `${formatDate(start)} – ${formatDate(end)}`;
};

const formatMonth = (month: number, year: number): string => {
  const date = new Date(year, month);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function TimeScopeSelector({ value, onChange }: TimeScopeSelectorProps) {
  const [scopeDropdownOpen, setScopeDropdownOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  
  const scopeRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (scopeRef.current && !scopeRef.current.contains(event.target as Node)) {
        setScopeDropdownOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setDatePickerOpen(false);
      }
      if (monthRef.current && !monthRef.current.contains(event.target as Node)) {
        setMonthPickerOpen(false);
      }
      if (yearRef.current && !yearRef.current.contains(event.target as Node)) {
        setYearPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleScopeChange = (newScope: TimeScope) => {
    const today = new Date();
    const newState: TimeScopeState = {
      scope: newScope,
      date: today,
    };

    if (newScope === 'weekly') {
      newState.weekStart = getWeekStart(today);
      newState.weekEnd = getWeekEnd(today);
    } else if (newScope === 'monthly') {
      newState.month = today.getMonth();
      newState.year = today.getFullYear();
    } else if (newScope === 'yearly') {
      newState.year = today.getFullYear();
    }

    onChange(newState);
    setScopeDropdownOpen(false);
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(value.date);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    onChange({ ...value, date: newDate });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(value.date);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    const weekStart = getWeekStart(newDate);
    const weekEnd = getWeekEnd(newDate);
    onChange({ ...value, date: newDate, weekStart, weekEnd });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const currentMonth = value.month ?? new Date().getMonth();
    const currentYear = value.year ?? new Date().getFullYear();
    
    let newMonth = currentMonth + (direction === 'next' ? 1 : -1);
    let newYear = currentYear;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    
    onChange({ ...value, month: newMonth, year: newYear });
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    const currentYear = value.year ?? new Date().getFullYear();
    const newYear = currentYear + (direction === 'next' ? 1 : -1);
    onChange({ ...value, year: newYear });
  };

  const selectDate = (day: number) => {
    const newDate = new Date(value.date);
    newDate.setDate(day);
    onChange({ ...value, date: newDate });
    setDatePickerOpen(false);
  };

  const selectMonth = (monthIndex: number) => {
    onChange({ ...value, month: monthIndex });
    setMonthPickerOpen(false);
  };

  const selectYear = (year: number) => {
    onChange({ ...value, year: year });
    setYearPickerOpen(false);
  };

  // Generate calendar days for date picker
  const generateCalendarDays = () => {
    const year = value.date.getFullYear();
    const month = value.date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (number | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1); i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  // Generate year options (current year ± 10)
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  const getScopeLabel = (scope: TimeScope): string => {
    switch (scope) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      case 'all-time': return 'All Time';
    }
  };

  const getCurrentDisplayValue = (): string => {
    switch (value.scope) {
      case 'daily':
        return value.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      case 'weekly':
        if (value.weekStart && value.weekEnd) {
          return formatWeekRange(value.weekStart, value.weekEnd);
        }
        return 'Select week';
      case 'monthly':
        if (value.month !== undefined && value.year !== undefined) {
          return formatMonth(value.month, value.year);
        }
        return 'Select month';
      case 'yearly':
        return value.year?.toString() ?? 'Select year';
      case 'all-time':
        return 'All available data';
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Time Scope Dropdown */}
      <div className="relative" ref={scopeRef}>
        <button
          onClick={() => setScopeDropdownOpen(!scopeDropdownOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)'
          }}
        >
          <Calendar className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
          <span className="text-sm font-medium">{getScopeLabel(value.scope)}</span>
          <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
        </button>

        {/* Scope Dropdown Menu */}
        {scopeDropdownOpen && (
          <div
            className="absolute top-full left-0 mt-2 rounded-lg border shadow-xl z-50 overflow-hidden"
            style={{
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-primary)',
              minWidth: '160px'
            }}
          >
            {(['daily', 'weekly', 'monthly', 'yearly', 'all-time'] as TimeScope[]).map((scope) => (
              <button
                key={scope}
                onClick={() => handleScopeChange(scope)}
                className="w-full px-4 py-2.5 text-left text-sm transition-all"
                style={{
                  backgroundColor: value.scope === scope ? 'var(--accent-primary-subtle)' : 'transparent',
                  color: value.scope === scope ? 'var(--accent-primary)' : 'var(--text-primary)'
                }}
                onMouseEnter={(e) => {
                  if (value.scope !== scope) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (value.scope !== scope) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {getScopeLabel(scope)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dynamic Date Controls */}
      {value.scope === 'daily' && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateDay('prev')}
            className="p-2 rounded-lg border transition-all"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)'
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="relative" ref={dateRef}>
            <button
              onClick={() => setDatePickerOpen(!datePickerOpen)}
              className="px-4 py-2 rounded-lg border transition-all min-w-[140px]"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            >
              <span className="text-sm font-medium">{getCurrentDisplayValue()}</span>
            </button>

            {/* Calendar Picker */}
            {datePickerOpen && (
              <div
                className="absolute top-full left-0 mt-2 rounded-lg border shadow-xl z-50 p-4"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  borderColor: 'var(--border-primary)',
                  minWidth: '280px'
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {value.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <div
                      key={i}
                      className="text-center text-xs font-medium py-1"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {generateCalendarDays().map((day, i) => (
                    <button
                      key={i}
                      onClick={() => day && selectDate(day)}
                      disabled={!day}
                      className="aspect-square rounded-lg text-sm transition-all"
                      style={{
                        backgroundColor: day === value.date.getDate() 
                          ? 'var(--accent-primary)' 
                          : day ? 'transparent' : 'transparent',
                        color: day === value.date.getDate() 
                          ? '#ffffff' 
                          : day ? 'var(--text-primary)' : 'transparent',
                        cursor: day ? 'pointer' : 'default'
                      }}
                      onMouseEnter={(e) => {
                        if (day && day !== value.date.getDate()) {
                          e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (day && day !== value.date.getDate()) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => navigateDay('next')}
            className="p-2 rounded-lg border transition-all"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)'
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {value.scope === 'weekly' && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 rounded-lg border transition-all"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)'
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            className="px-4 py-2 rounded-lg border min-w-[180px] text-center"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)'
            }}
          >
            <span className="text-sm font-medium">{getCurrentDisplayValue()}</span>
          </div>

          <button
            onClick={() => navigateWeek('next')}
            className="p-2 rounded-lg border transition-all"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)'
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {value.scope === 'monthly' && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-lg border transition-all"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)'
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            {/* Month Picker */}
            <div className="relative" ref={monthRef}>
              <button
                onClick={() => setMonthPickerOpen(!monthPickerOpen)}
                className="px-4 py-2 rounded-lg border transition-all min-w-[120px]"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              >
                <span className="text-sm font-medium">
                  {value.month !== undefined ? months[value.month] : 'Month'}
                </span>
              </button>

              {monthPickerOpen && (
                <div
                  className="absolute top-full left-0 mt-2 rounded-lg border shadow-xl z-50 overflow-hidden max-h-[280px] overflow-y-auto"
                  style={{
                    backgroundColor: 'var(--surface-primary)',
                    borderColor: 'var(--border-primary)',
                    minWidth: '160px'
                  }}
                >
                  {months.map((month, index) => (
                    <button
                      key={index}
                      onClick={() => selectMonth(index)}
                      className="w-full px-4 py-2.5 text-left text-sm transition-all"
                      style={{
                        backgroundColor: value.month === index ? 'var(--accent-primary-subtle)' : 'transparent',
                        color: value.month === index ? 'var(--accent-primary)' : 'var(--text-primary)'
                      }}
                      onMouseEnter={(e) => {
                        if (value.month !== index) {
                          e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (value.month !== index) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Year Picker */}
            <div className="relative" ref={yearRef}>
              <button
                onClick={() => setYearPickerOpen(!yearPickerOpen)}
                className="px-4 py-2 rounded-lg border transition-all min-w-[100px]"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              >
                <span className="text-sm font-medium">
                  {value.year ?? 'Year'}
                </span>
              </button>

              {yearPickerOpen && (
                <div
                  className="absolute top-full left-0 mt-2 rounded-lg border shadow-xl z-50 overflow-hidden max-h-[280px] overflow-y-auto"
                  style={{
                    backgroundColor: 'var(--surface-primary)',
                    borderColor: 'var(--border-primary)',
                    minWidth: '120px'
                  }}
                >
                  {generateYears().map((year) => (
                    <button
                      key={year}
                      onClick={() => selectYear(year)}
                      className="w-full px-4 py-2.5 text-left text-sm transition-all"
                      style={{
                        backgroundColor: value.year === year ? 'var(--accent-primary-subtle)' : 'transparent',
                        color: value.year === year ? 'var(--accent-primary)' : 'var(--text-primary)'
                      }}
                      onMouseEnter={(e) => {
                        if (value.year !== year) {
                          e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (value.year !== year) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-lg border transition-all"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)'
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {value.scope === 'yearly' && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateYear('prev')}
            className="p-2 rounded-lg border transition-all"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)'
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="relative" ref={yearRef}>
            <button
              onClick={() => setYearPickerOpen(!yearPickerOpen)}
              className="px-4 py-2 rounded-lg border transition-all min-w-[120px]"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            >
              <span className="text-sm font-medium">{getCurrentDisplayValue()}</span>
            </button>

            {yearPickerOpen && (
              <div
                className="absolute top-full left-0 mt-2 rounded-lg border shadow-xl z-50 overflow-hidden max-h-[280px] overflow-y-auto"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  borderColor: 'var(--border-primary)',
                  minWidth: '120px'
                }}
              >
                {generateYears().map((year) => (
                  <button
                    key={year}
                    onClick={() => selectYear(year)}
                    className="w-full px-4 py-2.5 text-left text-sm transition-all"
                    style={{
                      backgroundColor: value.year === year ? 'var(--accent-primary-subtle)' : 'transparent',
                      color: value.year === year ? 'var(--accent-primary)' : 'var(--text-primary)'
                    }}
                    onMouseEnter={(e) => {
                      if (value.year !== year) {
                        e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (value.year !== year) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => navigateYear('next')}
            className="p-2 rounded-lg border transition-all"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)'
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {value.scope === 'all-time' && (
        <div
          className="px-4 py-2 rounded-lg border"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-tertiary)'
          }}
        >
          <span className="text-sm">{getCurrentDisplayValue()}</span>
        </div>
      )}
    </div>
  );
}
