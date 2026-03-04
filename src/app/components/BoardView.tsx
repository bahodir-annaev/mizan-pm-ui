/**
 * BoardView Component - Nizam Design System
 * Clean, minimal Kanban Board inspired by Linear/Notion/Asana
 * Fully adapted to Nizam visual identity
 */

import { useState, useEffect, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Calendar, Plus } from 'lucide-react';

// Status configuration matching Nizam design system
const statusConfig: Record<string, { 
  label: string; 
  color: string; 
  dotColor: string; 
  bgColor: string;
  columnBg: string;
  columnBgHover: string;
}> = {
  'Not Started': {
    label: 'Backlog',
    color: '#64748b',
    dotColor: '#cbd5e1',
    bgColor: 'rgba(100, 116, 139, 0.1)',
    columnBg: '#F9FAFB',
    columnBgHover: '#F3F4F6'
  },
  'Started': {
    label: 'To Do',
    color: '#3b82f6',
    dotColor: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    columnBg: '#F9FAFB',
    columnBgHover: '#F3F4F6'
  },
  'In Progress': {
    label: 'In Progress',
    color: '#6366f1',
    dotColor: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.1)',
    columnBg: '#F9FAFB',
    columnBgHover: '#F3F4F6'
  },
  'Pending review': {
    label: 'Review',
    color: '#f59e0b',
    dotColor: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    columnBg: '#F9FAFB',
    columnBgHover: '#F3F4F6'
  },
  'Completed': {
    label: 'Done',
    color: '#10b981',
    dotColor: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    columnBg: '#F9FAFB',
    columnBgHover: '#F3F4F6'
  },
  'Late': {
    label: 'Late',
    color: '#ef4444',
    dotColor: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    columnBg: '#F9FAFB',
    columnBgHover: '#F3F4F6'
  }
};

// Priority configuration - Nizam colors
const priorityConfig: Record<string, { color: string; bgColor: string }> = {
  'Low': {
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)'
  },
  'Medium': {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)'
  },
  'High': {
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)'
  }
};

interface Participant {
  name: string;
  initials: string;
  color: string;
}

interface TaskCardData {
  id: string;
  title: string;
  assignee: {
    name: string;
    initials: string;
    color: string;
  };
  participants?: Participant[];
  priority: string;
  dateEnd: string;
  dateStart?: string;
  status: string;
  typeOfWork?: string;
  volume?: string;
  unit?: string;
  progress?: number;
}

interface BoardViewProps {
  tasks: TaskCardData[];
  onTaskMove?: (taskId: string, newStatus: string) => void;
  onTaskClick?: (taskId: string) => void;
}

// Task Card Component with Drag functionality
interface TaskCardProps {
  task: TaskCardData;
  onMove: (taskId: string, newStatus: string) => void;
  onClick?: (taskId: string) => void;
  isAnimating?: boolean;
  isShifting?: boolean;
  shiftIndex?: number;
}

function TaskCard({ task, onMove, onClick, isAnimating, isShifting, shiftIndex = 0 }: TaskCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK_CARD',
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const priorityStyle = priorityConfig[task.priority];
  const statusStyle = statusConfig[task.status];
  
  // Calculate if deadline is approaching (within 7 days)
  const isDeadlineNear = () => {
    const today = new Date();
    const dateStr = task.dateEnd.split(' ');
    if (dateStr.length < 3) return false;
    
    const months: Record<string, number> = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    const day = parseInt(dateStr[0]);
    const month = months[dateStr[1]];
    const year = parseInt(dateStr[2]);
    
    if (isNaN(day) || month === undefined || isNaN(year)) return false;
    
    const deadline = new Date(year, month, day);
    const daysUntil = Math.floor((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 7 && daysUntil >= 0;
  };

  const deadlineNear = isDeadlineNear();
  
  // All participants for display (no limit - show all)
  const allParticipants = task.participants || [];

  return (
    <div
      ref={drag}
      onClick={() => onClick?.(task.id)}
      className="group cursor-pointer select-none task-card"
      style={{
        marginBottom: '12px',
        padding: '14px',
        backgroundColor: '#FFFFFF',
        border: 'none',
        borderRadius: '12px',
        boxShadow: isDragging 
          ? '0 8px 16px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)' 
          : '0 1px 2px rgba(0, 0, 0, 0.04)',
        opacity: isDragging ? 0.6 : 1,
        transform: isDragging ? 'rotate(2deg)' : 'none',
        transition: isShifting 
          ? `transform 180ms cubic-bezier(0.22, 1, 0.36, 1) ${shiftIndex * 30}ms` 
          : 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        animation: isAnimating && !isShifting ? 'taskEnter 200ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none'
      }}
      onMouseEnter={(e) => {
        if (!isDragging && !isShifting) {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging && !isShifting) {
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {/* === TOP SECTION: TASK TITLE === */}
      <h4 
        className="mb-3 line-clamp-2"
        style={{ 
          color: 'var(--card-foreground)',
          fontSize: 'var(--text-card-title)',
          fontWeight: 'var(--text-card-title-weight)',
          lineHeight: 'var(--text-card-title-line)',
          fontFamily: 'var(--font-text)',
          minHeight: '40px'
        }}
      >
        {task.title}
      </h4>

      {/* === DETAILS BLOCK: TYPE, VOLUME, UNIT === */}
      <div 
        className="mb-3 space-y-1.5"
      >
        {/* Type of Work */}
        {task.typeOfWork && (
          <div className="flex items-center gap-2">
            <span
              style={{
                fontSize: 'var(--text-badge)',
                fontWeight: 'var(--text-badge-weight)',
                fontFamily: 'var(--font-text)',
                color: 'var(--muted-foreground)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Type:
            </span>
            <span
              style={{
                fontSize: 'var(--text-secondary)',
                fontWeight: '500',
                fontFamily: 'var(--font-text)',
                color: 'var(--foreground)'
              }}
            >
              {task.typeOfWork}
            </span>
          </div>
        )}

        {/* Volume & Unit */}
        {task.volume && task.unit && (
          <div className="flex items-center gap-2">
            <span
              style={{
                fontSize: 'var(--text-badge)',
                fontWeight: 'var(--text-badge-weight)',
                fontFamily: 'var(--font-text)',
                color: 'var(--muted-foreground)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Volume:
            </span>
            <span
              style={{
                fontSize: 'var(--text-secondary)',
                fontWeight: '500',
                fontFamily: 'var(--font-text)',
                color: 'var(--foreground)'
              }}
            >
              {task.volume} {task.unit}
            </span>
          </div>
        )}

        {/* Progress Percentage with Bar */}
        {task.progress !== undefined && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span
                style={{
                  fontSize: 'var(--text-badge)',
                  fontWeight: 'var(--text-badge-weight)',
                  fontFamily: 'var(--font-text)',
                  color: 'var(--muted-foreground)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Progress:
              </span>
              <span
                style={{
                  fontSize: 'var(--text-secondary)',
                  fontWeight: '600',
                  fontFamily: 'var(--font-text)',
                  color: task.progress === 100 ? '#10b981' : 'var(--ai-blue)'
                }}
              >
                {task.progress}%
              </span>
            </div>
            {/* Progress Bar */}
            <div 
              className="h-2 rounded-full overflow-hidden"
              style={{
                backgroundColor: 'var(--muted)'
              }}
            >
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${task.progress}%`,
                  backgroundColor: task.progress === 100 ? '#10b981' : 'var(--ai-blue)'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* === STATUS & PRIORITY ROW === */}
      <div className="flex items-center gap-2 mb-3 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
        {/* Priority Pill */}
        <div
          className="px-2.5 py-1 rounded-md flex-shrink-0"
          style={{
            backgroundColor: priorityStyle.bgColor,
            color: priorityStyle.color,
            fontSize: 'var(--text-badge)',
            fontWeight: '600',
            lineHeight: 'var(--text-badge-line)',
            fontFamily: 'var(--font-text)',
            letterSpacing: '0.01em'
          }}
        >
          {task.priority} Priority
        </div>

        {/* Status Label */}
        <div
          className="px-2.5 py-1 rounded-md flex items-center gap-1.5 flex-1"
          style={{
            backgroundColor: statusStyle.bgColor,
            color: statusStyle.color,
            fontSize: 'var(--text-badge)',
            fontWeight: '600',
            lineHeight: 'var(--text-badge-line)',
            fontFamily: 'var(--font-text)',
            border: `1px solid ${statusStyle.color}20`
          }}
        >
          <div 
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: statusStyle.dotColor }}
          />
          <span className="truncate">{statusStyle.label}</span>
        </div>
      </div>

      {/* === DATES SECTION === */}
      <div className="mb-3 space-y-1.5">
        {/* Start Date */}
        {task.dateStart && (
          <div className="flex items-center justify-between">
            <span
              style={{
                fontSize: 'var(--text-badge)',
                fontWeight: 'var(--text-badge-weight)',
                fontFamily: 'var(--font-text)',
                color: 'var(--muted-foreground)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Start:
            </span>
            <div 
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md"
              style={{
                fontSize: 'var(--text-secondary)',
                fontWeight: '500',
                fontFamily: 'var(--font-text)',
                color: 'var(--foreground)',
                backgroundColor: 'var(--muted)'
              }}
            >
              <Calendar style={{ width: '11px', height: '11px', opacity: 0.6 }} />
              <span>{task.dateStart}</span>
            </div>
          </div>
        )}

        {/* Due Date */}
        {task.dateEnd && (
          <div className="flex items-center justify-between">
            <span
              style={{
                fontSize: 'var(--text-badge)',
                fontWeight: 'var(--text-badge-weight)',
                fontFamily: 'var(--font-text)',
                color: 'var(--muted-foreground)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Due:
            </span>
            <div 
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md"
              style={{
                fontSize: 'var(--text-secondary)',
                fontWeight: '500',
                fontFamily: 'var(--font-text)',
                color: deadlineNear ? '#f59e0b' : 'var(--foreground)',
                backgroundColor: deadlineNear ? 'rgba(245, 158, 11, 0.12)' : 'var(--muted)',
                border: deadlineNear ? '1px solid rgba(245, 158, 11, 0.3)' : 'none'
              }}
            >
              <Calendar style={{ width: '11px', height: '11px', opacity: 0.6 }} />
              <span>{task.dateEnd}</span>
            </div>
          </div>
        )}
      </div>

      {/* === FOOTER: ASSIGNEE & PARTICIPANTS === */}
      <div className="flex items-center gap-2">
        {/* Assignee Label */}
        <span
          style={{
            fontSize: 'var(--text-badge)',
            fontWeight: 'var(--text-badge-weight)',
            fontFamily: 'var(--font-text)',
            color: 'var(--muted-foreground)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            flexShrink: 0
          }}
        >
          Team:
        </span>

        {/* Assignee & Participants Avatars */}
        <div className="flex items-center -space-x-2 flex-1 overflow-x-auto">
          {/* Assignee Avatar - Always First */}
          <div className="relative flex-shrink-0 group/avatar">
            <Avatar 
              className="w-7 h-7 border-2 ring-1"
              style={{ 
                borderColor: 'var(--card)',
                ringColor: 'rgba(59, 130, 246, 0.2)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <AvatarFallback 
                className={task.assignee.color}
                style={{ 
                  fontSize: '10px',
                  fontWeight: '600'
                }}
              >
                {task.assignee.initials}
              </AvatarFallback>
            </Avatar>
            {/* Tooltip on hover */}
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded opacity-0 group-hover/avatar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10"
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-text)',
                backgroundColor: 'var(--popover)',
                color: 'var(--popover-foreground)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border)'
              }}
            >
              {task.assignee.name} (Lead)
            </div>
          </div>
          
          {/* All Participants - Show Every Single One */}
          {allParticipants.map((participant, index) => (
            <div key={index} className="relative flex-shrink-0 group/avatar">
              <Avatar 
                className="w-7 h-7 border-2"
                style={{ 
                  borderColor: 'var(--card)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                }}
              >
                <AvatarFallback 
                  className={participant.color}
                  style={{ 
                    fontSize: '10px',
                    fontWeight: '600'
                  }}
                >
                  {participant.initials}
                </AvatarFallback>
              </Avatar>
              {/* Tooltip on hover */}
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded opacity-0 group-hover/avatar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10"
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-text)',
                  backgroundColor: 'var(--popover)',
                  color: 'var(--popover-foreground)',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid var(--border)'
                }}
              >
                {participant.name}
              </div>
            </div>
          ))}

          {/* Team Count */}
          <span
            className="ml-2 px-2 py-0.5 rounded-md flex-shrink-0"
            style={{
              fontSize: 'var(--text-badge)',
              fontWeight: '600',
              fontFamily: 'var(--font-text)',
              color: 'var(--muted-foreground)',
              backgroundColor: 'var(--muted)'
            }}
          >
            {1 + allParticipants.length}
          </span>
        </div>
      </div>
    </div>
  );
}

// Board Column Component with Drop functionality
interface ColumnProps {
  status: string;
  tasks: TaskCardData[];
  onTaskMove: (taskId: string, newStatus: string) => void;
  onTaskClick?: (taskId: string) => void;
  onAddTask?: (status: string) => void;
  animatingTaskId?: string | null;
}

function BoardColumn({ status, tasks, onTaskMove, onTaskClick, onAddTask, animatingTaskId }: ColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK_CARD',
    drop: (item: { id: string; status: string }) => {
      if (item.status !== status) {
        onTaskMove(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const config = statusConfig[status];
  const taskCount = tasks.length;
  const [isHovered, setIsHovered] = useState(false);
  
  // Track previous tasks for shift animation
  const prevTasksRef = useRef<TaskCardData[]>(tasks);
  const [shiftingMap, setShiftingMap] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    const prevTasks = prevTasksRef.current;
    const prevIds = new Set(prevTasks.map(t => t.id));
    
    // Find new task (exists in current but not in previous)
    const newTaskId = tasks.find(t => !prevIds.has(t.id))?.id;
    
    if (newTaskId) {
      // Find the index of the new task
      const newTaskIndex = tasks.findIndex(t => t.id === newTaskId);
      
      // Build map of shifting tasks with their relative positions
      const newMap = new Map<string, number>();
      tasks.slice(newTaskIndex + 1).forEach((task, relativeIndex) => {
        newMap.set(task.id, relativeIndex);
      });
      
      if (newMap.size > 0) {
        setShiftingMap(newMap);
        
        // Clear shifting state after animation completes
        const maxDelay = newMap.size * 30; // 30ms stagger per item
        setTimeout(() => {
          setShiftingMap(new Map());
        }, 180 + maxDelay + 50); // Add 50ms buffer
      }
    }
    
    // Update ref
    prevTasksRef.current = tasks;
  }, [tasks]);

  return (
    <div
      className="flex flex-col group/column"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        minWidth: '320px',
        maxWidth: '320px',
        height: '100%',
        backgroundColor: isOver ? config.columnBgHover : (isHovered ? config.columnBgHover : config.columnBg),
        borderRadius: '15px',
        padding: '14px',
        transition: 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 pb-3" style={{ borderBottom: `1px solid ${config.color}15` }}>
        <div className="flex items-center gap-2">
          {/* Colored Dot Indicator */}
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: config.dotColor }}
          />
          
          {/* Status Title */}
          <h3 
            style={{ 
              color: 'var(--foreground)',
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            {config.label}
          </h3>
          
          {/* Task Count */}
          <span 
            className="px-2 py-0.5 rounded-full"
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.06)',
              color: 'var(--muted-foreground)',
              fontSize: '11px',
              fontWeight: '600',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            {taskCount}
          </span>
        </div>

        {/* Add Task Button */}
        <button
          onClick={() => onAddTask?.(status)}
          className="flex items-center justify-center w-6 h-6 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors opacity-0 group-hover/column:opacity-100"
          style={{
            color: 'var(--muted-foreground)',
          }}
          aria-label="Add task"
        >
          <Plus style={{ width: '14px', height: '14px' }} />
        </button>
      </div>

      {/* Tasks Container - Scrollable */}
      <div 
        ref={drop}
        className="flex-1 overflow-y-auto -mr-1 pr-1 custom-scrollbar"
        style={{
          paddingBottom: '8px'
        }}
      >
        {taskCount === 0 ? (
          <div 
            className="flex flex-col items-center justify-center py-16 text-center rounded-lg"
            style={{ 
              color: config.color,
              fontSize: '13px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              backgroundColor: 'transparent',
              border: `1.5px dashed ${config.color}30`,
              opacity: 0.5
            }}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
              style={{
                backgroundColor: `${config.color}10`
              }}
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: config.dotColor }}
              />
            </div>
            <p className="text-xs">No tasks</p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onMove={onTaskMove}
              onClick={onTaskClick}
              isAnimating={task.id === animatingTaskId || shiftingMap.has(task.id)}
              isShifting={shiftingMap.has(task.id)}
              shiftIndex={shiftingMap.get(task.id) || index}
            />
          ))
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #BFDBFE;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #93C5FD;
        }
        
        /* Firefox scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #BFDBFE transparent;
        }
        
        /* Task Entrance Animation - Premium Motion */
        @keyframes taskEnter {
          from {
            opacity: 0;
            transform: scale(0.92);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

// Main Board View Component
export function BoardView({ tasks, onTaskMove, onTaskClick }: BoardViewProps) {
  const [boardTasks, setBoardTasks] = useState<TaskCardData[]>(tasks);
  const [animatingTaskId, setAnimatingTaskId] = useState<string | null>(null);

  const handleTaskMove = (taskId: string, newStatus: string) => {
    const oldStatus = boardTasks.find(t => t.id === taskId)?.status;
    
    // Update task status
    setBoardTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    
    // Trigger entrance animation if status changed
    if (oldStatus !== newStatus) {
      setAnimatingTaskId(taskId);
      setTimeout(() => {
        setAnimatingTaskId(null);
      }, 220);
    }
    
    onTaskMove?.(taskId, newStatus);
  };

  const handleAddTask = (status: string) => {
    console.log('Add task to status:', status);
    // In real app, this would open AddTaskModal with pre-selected status
  };

  // Group tasks by status
  const tasksByStatus = Object.keys(statusConfig).reduce((acc, status) => {
    acc[status] = boardTasks.filter(task => task.status === status);
    return acc;
  }, {} as Record<string, TaskCardData[]>);

  return (
    <DndProvider backend={HTML5Backend}>
      <div 
        className="h-full overflow-x-auto overflow-y-hidden"
        style={{
          backgroundColor: '#F6F7F9',
          padding: '24px 24px 0 24px'
        }}
      >
        {/* Board Container */}
        <div className="flex gap-6 h-full pb-6">
          {Object.keys(statusConfig).map((status) => (
            <BoardColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
              onTaskMove={handleTaskMove}
              onTaskClick={onTaskClick}
              onAddTask={handleAddTask}
              animatingTaskId={animatingTaskId}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}