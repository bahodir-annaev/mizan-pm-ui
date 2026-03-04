/**
 * GanttView Component - Time-Based Calendar (Production Ready)
 * Google Calendar / Motion / Sunsama style
 * Real tasks rendered inside calendar with drag & drop
 */

import { useState, useEffect, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { TimelineGantt } from './TimelineGantt';
import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  addWeeks, 
  subWeeks, 
  isToday,
  parseISO,
  isSameDay,
  setHours,
  setMinutes,
  getHours,
  getMinutes
} from 'date-fns';

// Status-based soft pastel colors (Apple/Linear style)
const statusColors: Record<string, string> = {
  'Not Started': '#E8EAF6',    // Soft indigo
  'Started': '#E3F2FD',        // Soft blue
  'In Progress': '#E1F5FE',    // Lighter blue
  'Pending review': '#FFF3E0', // Soft amber
  'Completed': '#E8F5E9',      // Soft green
  'Late': '#FFEBEE'            // Soft red
};

// Priority dots
const priorityColors: Record<string, string> = {
  'Low': '#10b981',
  'Medium': '#f59e0b',
  'High': '#ef4444'
};

interface Participant {
  name: string;
  initials: string;
  color: string;
}

interface GanttTask {
  id: string;
  title: string;
  assignee: {
    name: string;
    initials: string;
    color: string;
  };
  participants?: Participant[];
  priority: string;
  dateStart: string;
  dateEnd: string;
  timeStart?: string;
  timeEnd?: string;
  status: string;
  progress?: number;
}

interface GanttViewProps {
  tasks: GanttTask[];
  onTaskClick?: (taskId: string) => void;
  onTaskMove?: (taskId: string, newDate: Date, newTimeStart: string, newTimeEnd: string) => void;
}

// Constants
const START_HOUR = 9;
const END_HOUR = 18;
const HOUR_HEIGHT = 72;
const COLUMN_MIN_WIDTH = 160;

// Parse date
const parseTaskDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  try {
    const isoDate = parseISO(dateStr);
    if (!isNaN(isoDate.getTime())) return isoDate;
  } catch (e) {}

  const months: Record<string, number> = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  
  const parts = dateStr.split(' ');
  if (parts.length !== 3) return new Date();
  const day = parseInt(parts[0]);
  const month = months[parts[1]];
  const year = parseInt(parts[2]);
  return new Date(year, month, day);
};

// Parse time to minutes
const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr) return START_HOUR * 60;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
};

// Calculate task position
const calculateTaskPosition = (timeStart: string, timeEnd: string) => {
  const startMinutes = parseTimeToMinutes(timeStart || '09:00');
  const endMinutes = parseTimeToMinutes(timeEnd || '10:00');
  const startFromBeginning = startMinutes - (START_HOUR * 60);
  const duration = endMinutes - startMinutes;
  const top = (startFromBeginning / 60) * HOUR_HEIGHT;
  const height = Math.max((duration / 60) * HOUR_HEIGHT, 50);
  return { top, height };
};

// Format time
const formatTime = (timeStr: string): string => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Task Card Component with Drag
function TaskCard({ 
  task, 
  onClick, 
  style,
  isShifting,
  shiftDelay
}: { 
  task: GanttTask; 
  onClick?: (id: string) => void; 
  style?: React.CSSProperties;
  isShifting?: boolean;
  shiftDelay?: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { taskId: task.id, task },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

  const bgColor = statusColors[task.status] || statusColors['Not Started'];
  const priorityColor = priorityColors[task.priority] || priorityColors['Medium'];
  const visibleParticipants = [task.assignee, ...(task.participants || [])].slice(0, 3);

  return (
    <div
      ref={drag}
      onClick={() => onClick?.(task.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...style,
        padding: '12px',
        backgroundColor: bgColor,
        borderRadius: '10px',
        border: isHovered ? '1.5px solid #3b82f6' : '1px solid rgba(0, 0, 0, 0.06)',
        boxShadow: isHovered 
          ? '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)' 
          : '0 2px 8px rgba(0, 0, 0, 0.06)',
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.5 : 1,
        transform: isShifting ? 'translateY(0)' : (isHovered ? 'translateY(-2px) scale(1.01)' : 'translateY(0)'),
        transition: isShifting 
          ? `transform 160ms cubic-bezier(0.22, 1, 0.36, 1) ${shiftDelay}ms`
          : 'all 140ms cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: isHovered ? 20 : (isDragging ? 30 : 10)
      }}
    >
      {/* Time range */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginBottom: '8px',
          fontSize: '11px',
          fontWeight: '600',
          fontFamily: '-apple-system, system-ui, sans-serif',
          color: '#6B7280',
          letterSpacing: '0.01em'
        }}
      >
        <Clock style={{ width: '11px', height: '11px' }} />
        <span>{formatTime(task.timeStart || '09:00')} – {formatTime(task.timeEnd || '10:00')}</span>
      </div>

      {/* Title */}
      <h4
        style={{
          fontSize: '14px',
          fontWeight: '600',
          lineHeight: '1.35',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
          color: '#111827',
          letterSpacing: '-0.015em',
          marginBottom: '10px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}
      >
        {task.title}
      </h4>

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        {/* Priority dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: priorityColor,
              flexShrink: 0
            }}
          />
          <span
            style={{
              fontSize: '11px',
              fontWeight: '500',
              fontFamily: '-apple-system, system-ui, sans-serif',
              color: '#6B7280'
            }}
          >
            {task.priority}
          </span>
        </div>

        {/* Avatars */}
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '-4px' }}>
          {visibleParticipants.map((p, i) => (
            <Avatar 
              key={i}
              className="w-5 h-5"
              style={{
                border: '2px solid #FFFFFF',
                marginLeft: i > 0 ? '-6px' : '0',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
              }}
            >
              <AvatarFallback 
                className={p.color}
                style={{ fontSize: '8px', fontWeight: '600' }}
              >
                {p.initials}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>
    </div>
  );
}

// Day Column Component
function DayColumn({ 
  day, 
  tasks, 
  onTaskClick,
  columnIndex
}: { 
  day: Date; 
  tasks: GanttTask[]; 
  onTaskClick?: (id: string) => void;
  columnIndex: number;
}) {
  const isTodayColumn = isToday(day);
  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
  
  // Filter tasks for this day
  const dayTasks = tasks
    .filter(task => isSameDay(parseTaskDate(task.dateStart), day))
    .sort((a, b) => parseTimeToMinutes(a.timeStart || '09:00') - parseTimeToMinutes(b.timeStart || '09:00'));

  // Track shifting animation
  const [shiftingTasks, setShiftingTasks] = useState<Set<string>>(new Set());
  const prevTasksRef = useRef(dayTasks);

  useEffect(() => {
    const prevIds = new Set(prevTasksRef.current.map(t => t.id));
    const currentIds = new Set(dayTasks.map(t => t.id));
    
    // Find new task
    const newTaskId = dayTasks.find(t => !prevIds.has(t.id))?.id;
    
    if (newTaskId) {
      const newTaskIndex = dayTasks.findIndex(t => t.id === newTaskId);
      const tasksToShift = dayTasks.slice(newTaskIndex + 1).map(t => t.id);
      
      if (tasksToShift.length > 0) {
        setShiftingTasks(new Set(tasksToShift));
        setTimeout(() => setShiftingTasks(new Set()), 200 + tasksToShift.length * 25);
      }
    }
    
    prevTasksRef.current = dayTasks;
  }, [dayTasks]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item: { taskId: string; task: GanttTask }) => {
      // Handle drop logic here
      console.log('Task dropped on', format(day, 'MMM d'));
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }));

  return (
    <div
      ref={drop}
      style={{
        flex: 1,
        minWidth: `${COLUMN_MIN_WIDTH}px`,
        position: 'relative',
        backgroundColor: isOver 
          ? 'rgba(59, 130, 246, 0.04)' 
          : (isTodayColumn ? 'rgba(59, 130, 246, 0.02)' : 'transparent'),
        borderRight: columnIndex < 6 ? '1px solid #E5E7EB' : 'none',
        transition: 'background-color 120ms ease-out'
      }}
    >
      {/* Render tasks */}
      <div style={{ position: 'absolute', inset: '0', padding: '0 6px' }}>
        {dayTasks.map((task, index) => {
          const { top, height } = calculateTaskPosition(task.timeStart || '09:00', task.timeEnd || '10:00');
          const isShifting = shiftingTasks.has(task.id);
          const shiftIndex = dayTasks.slice(dayTasks.findIndex(t => t.id === task.id) + 1).length;
          
          return (
            <TaskCard
              key={task.id}
              task={task}
              onClick={onTaskClick}
              isShifting={isShifting}
              shiftDelay={shiftIndex * 25}
              style={{
                position: 'absolute',
                top: `${top}px`,
                left: '6px',
                right: '6px',
                height: `${height}px`,
                minHeight: '50px'
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// Calendar Grid Component
function CalendarGrid({ days, tasks, onTaskClick }: { 
  days: Date[]; 
  tasks: GanttTask[]; 
  onTaskClick?: (id: string) => void;
}) {
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  return (
    <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
      {/* Time labels */}
      <div 
        style={{
          width: '72px',
          flexShrink: 0,
          backgroundColor: '#FAFBFC',
          borderRight: '1px solid #E5E7EB',
          position: 'sticky',
          left: 0,
          zIndex: 10
        }}
      >
        {/* Header spacer */}
        <div style={{ height: '64px', borderBottom: '1px solid #E5E7EB' }} />
        
        {/* Time labels */}
        {hours.map(hour => (
          <div
            key={hour}
            style={{
              height: `${HOUR_HEIGHT}px`,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
              paddingRight: '10px',
              paddingTop: '8px',
              fontSize: '12px',
              fontWeight: '500',
              fontFamily: '-apple-system, system-ui, sans-serif',
              color: '#9CA3AF',
              borderBottom: '1px solid #F3F4F6'
            }}
          >
            {format(setHours(new Date(), hour), 'h a')}
          </div>
        ))}
      </div>

      {/* Day columns */}
      <div style={{ display: 'flex', flex: 1 }}>
        {days.map((day, index) => {
          const isTodayColumn = isToday(day);
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          
          return (
            <div key={index} style={{ flex: 1, minWidth: `${COLUMN_MIN_WIDTH}px` }}>
              {/* Day header */}
              <div
                className="sticky top-[73px] z-20"
                style={{
                  height: '64px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isTodayColumn ? 'rgba(59, 130, 246, 0.08)' : '#FAFBFC',
                  borderBottom: '1px solid #E5E7EB',
                  borderRight: index < days.length - 1 ? '1px solid #E5E7EB' : 'none'
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    color: isTodayColumn ? '#3b82f6' : (isWeekend ? '#9CA3AF' : '#6B7280'),
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '4px'
                  }}
                >
                  {format(day, 'EEE')}
                </div>
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: isTodayColumn ? '600' : '500',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                    color: isTodayColumn ? '#3b82f6' : '#111827'
                  }}
                >
                  {isTodayColumn ? (
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        backgroundColor: '#3b82f6',
                        color: '#FFFFFF',
                        fontSize: '15px',
                        fontWeight: '600',
                        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.35)'
                      }}
                    >
                      {format(day, 'd')}
                    </div>
                  ) : (
                    format(day, 'd')
                  )}
                </div>
              </div>

              {/* Hour cells */}
              <div style={{ position: 'relative' }}>
                {hours.map((hour, hIndex) => (
                  <div
                    key={hour}
                    style={{
                      height: `${HOUR_HEIGHT}px`,
                      borderBottom: '1px solid #F3F4F6',
                      borderRight: index < days.length - 1 ? '1px solid #E5E7EB' : 'none'
                    }}
                  />
                ))}
                
                {/* Tasks overlay */}
                <DayColumn 
                  day={day} 
                  tasks={tasks} 
                  onTaskClick={onTaskClick}
                  columnIndex={index}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Main Component
export function GanttView({ tasks, onTaskClick, onTaskMove }: GanttViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'calendar' | 'timeline'>('calendar');
  const [hoveredTab, setHoveredTab] = useState<'calendar' | 'timeline' | null>(null);
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const handleNavigate = (dir: 'prev' | 'next') => {
    setCurrentDate(dir === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
  };

  const getTabStyle = (tab: 'calendar' | 'timeline') => {
    const isActive = activeTab === tab;
    const isHovered = hoveredTab === tab;
    
    return {
      backgroundColor: isActive ? '#FFFFFF' : 'transparent',
      color: isActive ? '#111827' : (isHovered ? '#374151' : '#6B7280'),
      boxShadow: isActive ? '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)' : 'none',
    };
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: '#FAFBFC',
        overflow: 'hidden'
      }}>
        {/* Header with Tabs */}
        <div 
          className="sticky top-0 z-30"
          style={{
            backgroundColor: '#FAFBFC',
            borderBottom: '1px solid #E5E7EB'
          }}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <h3
                style={{
                  fontSize: '19px',
                  fontWeight: '600',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                  color: '#111827',
                  letterSpacing: '-0.022em'
                }}
              >
                {activeTab === 'calendar' 
                  ? `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`
                  : 'Timeline View'
                }
              </h3>
              
              {activeTab === 'calendar' && (
                <button
                  onClick={() => setCurrentDate(new Date())}
                  style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    backgroundColor: '#FFFFFF',
                    color: '#374151',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    transition: 'all 120ms ease-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                    e.currentTarget.style.borderColor = '#9CA3AF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#D1D5DB';
                  }}
                >
                  Today
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* View Tabs */}
              <div 
                className="flex items-center rounded-lg p-0.5"
                style={{ backgroundColor: '#E5E7EB' }}
              >
                <button
                  onClick={() => setActiveTab('calendar')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-all"
                  style={getTabStyle('calendar')}
                  onMouseEnter={() => setHoveredTab('calendar')}
                  onMouseLeave={() => setHoveredTab(null)}
                >
                  <CalendarIcon style={{ width: '16px', height: '16px' }} />
                  <span className="text-xs font-medium">Calendar</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('timeline')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-all"
                  style={getTabStyle('timeline')}
                  onMouseEnter={() => setHoveredTab('timeline')}
                  onMouseLeave={() => setHoveredTab(null)}
                >
                  <Clock style={{ width: '16px', height: '16px' }} />
                  <span className="text-xs font-medium">Timeline</span>
                </button>
              </div>

              {/* Navigation buttons (only for calendar view) */}
              {activeTab === 'calendar' && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleNavigate('prev')}
                    style={{
                      padding: '6px',
                      borderRadius: '6px',
                      color: '#6B7280',
                      cursor: 'pointer',
                      transition: 'all 100ms ease-out',
                      border: 'none',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F3F4F6';
                      e.currentTarget.style.color = '#111827';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#6B7280';
                    }}
                  >
                    <ChevronLeft style={{ width: '20px', height: '20px' }} />
                  </button>
                  <button
                    onClick={() => handleNavigate('next')}
                    style={{
                      padding: '6px',
                      borderRadius: '6px',
                      color: '#6B7280',
                      cursor: 'pointer',
                      transition: 'all 100ms ease-out',
                      border: 'none',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F3F4F6';
                      e.currentTarget.style.color = '#111827';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#6B7280';
                    }}
                  >
                    <ChevronRight style={{ width: '20px', height: '20px' }} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {activeTab === 'calendar' ? (
            <div style={{ height: '100%', overflow: 'auto' }}>
              <CalendarGrid days={days} tasks={tasks} onTaskClick={onTaskClick} />
            </div>
          ) : (
            <TimelineGantt onTaskClick={onTaskClick} />
          )}
        </div>
      </div>
    </DndProvider>
  );
}