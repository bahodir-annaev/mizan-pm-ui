/**
 * TimelineGantt Component
 * Enhanced modern horizontal timeline-based Gantt chart
 * Features: current time indicator, tooltips, drag/resize, sticky header
 */

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';

// Soft pastel colors for task bars
const taskColors = [
  { bg: '#FFE4E9', accent: '#FF4D7A' },      // Soft pink
  { bg: '#E0F2FE', accent: '#0EA5E9' },      // Soft blue
  { bg: '#FFF4E6', accent: '#FB923C' },      // Soft orange
  { bg: '#E7F5EC', accent: '#22C55E' },      // Soft green
  { bg: '#E0F7FA', accent: '#06B6D4' },      // Light cyan
  { bg: '#F3E8FF', accent: '#A855F7' },      // Soft purple
];

interface Task {
  id: string;
  title: string;
  category: string;
  duration: number; // in hours
  startHour: number; // 0-23
  assignees: Array<{
    name: string;
    initials: string;
    color: string;
  }>;
  colorIndex?: number;
  dependencies?: Array<{
    taskId: string;
    label: string;
  }>;
}

interface TimelineGanttProps {
  tasks?: Task[];
  onTaskClick?: (taskId: string) => void;
}

interface TooltipData {
  task: Task;
  x: number;
  y: number;
}

// Sample data
const defaultTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Project Planning',
    category: 'Planning',
    duration: 2,
    startHour: 9,
    colorIndex: 0,
    assignees: [
      { name: 'Sarah Chen', initials: 'SC', color: 'bg-blue-500' },
      { name: 'Mike Ross', initials: 'MR', color: 'bg-green-500' },
    ]
  },
  {
    id: 'task-2',
    title: 'Design Review',
    category: 'Design',
    duration: 3,
    startHour: 11,
    colorIndex: 1,
    assignees: [
      { name: 'Emma Wilson', initials: 'EW', color: 'bg-purple-500' },
      { name: 'Alex Kim', initials: 'AK', color: 'bg-pink-500' },
      { name: 'John Doe', initials: 'JD', color: 'bg-orange-500' },
      { name: 'Lisa Brown', initials: 'LB', color: 'bg-teal-500' },
    ]
  },
  {
    id: 'task-3',
    title: 'Development Sprint',
    category: 'Development',
    duration: 5,
    startHour: 14,
    colorIndex: 2,
    assignees: [
      { name: 'David Park', initials: 'DP', color: 'bg-indigo-500' },
    ],
    dependencies: [
      { taskId: 'task-2', label: 'Blocked by' }
    ]
  },
  {
    id: 'task-4',
    title: 'Team Sync',
    category: 'Meeting',
    duration: 1,
    startHour: 10,
    colorIndex: 3,
    assignees: [
      { name: 'Lisa Chang', initials: 'LC', color: 'bg-teal-500' },
      { name: 'Tom Hardy', initials: 'TH', color: 'bg-red-500' },
    ]
  },
  {
    id: 'task-5',
    title: 'QA Testing',
    category: 'Quality Assurance',
    duration: 3,
    startHour: 19,
    colorIndex: 4,
    assignees: [
      { name: 'Nina Patel', initials: 'NP', color: 'bg-cyan-500' },
      { name: 'Sam Lee', initials: 'SL', color: 'bg-amber-500' },
    ]
  },
  {
    id: 'task-6',
    title: 'Documentation',
    category: 'Documentation',
    duration: 2,
    startHour: 15,
    colorIndex: 5,
    assignees: [
      { name: 'Rachel Green', initials: 'RG', color: 'bg-emerald-500' },
    ]
  },
];

export function TimelineGantt({ tasks = defaultTasks, onTaskClick }: TimelineGanttProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Validate and use default tasks if structure is invalid
  const validTasks = tasks.every(t => t.assignees && Array.isArray(t.assignees)) 
    ? tasks 
    : defaultTasks;

  // Generate time labels (9 AM - 6 PM)
  const timeLabels = Array.from({ length: 10 }, (_, i) => {
    const hour = 9 + i;
    return hour <= 12 ? `${hour} AM` : `${hour - 12} PM`;
  });

  // Group tasks by category
  const categories = Array.from(new Set(validTasks.map(t => t.category)));

  // Calculate task bar position and width
  const getTaskStyle = (task: Task) => {
    const startOffset = ((task.startHour - 9) / 9) * 100;
    const width = (task.duration / 9) * 100;
    return {
      left: `${startOffset}%`,
      width: `${width}%`
    };
  };

  // Get task color
  const getTaskColor = (task: Task) => {
    const colorIndex = task.colorIndex || 0;
    return taskColors[colorIndex % taskColors.length];
  };

  // Calculate current time position
  const getCurrentTimePosition = () => {
    const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
    if (currentHour < 9 || currentHour > 18) return null;
    return ((currentHour - 9) / 9) * 100;
  };

  const currentTimePosition = getCurrentTimePosition();

  // Format time for tooltip
  const formatTime = (hour: number) => {
    const h = Math.floor(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayHour}:00 ${ampm}`;
  };

  const handleTaskMouseEnter = (task: Task, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      task,
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleTaskMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div
      style={{
        height: '100%',
        backgroundColor: '#FAFBFC',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
        position: 'relative'
      }}
    >
      {/* Main Content */}
      <div
        ref={scrollContainerRef}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px 0'
        }}
      >
        <div style={{ display: 'flex', minWidth: '1200px' }}>
          {/* Left Side - Task Categories */}
          <div
            style={{
              width: '280px',
              flexShrink: 0,
              paddingLeft: '32px',
              paddingRight: '24px',
              position: 'sticky',
              left: 0,
              backgroundColor: '#FAFBFC',
              zIndex: 10
            }}
          >
            {/* Sticky Header Spacer */}
            <div 
              style={{ 
                height: '60px',
                borderBottom: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'flex-end',
                paddingBottom: '12px',
                position: 'sticky',
                top: 0,
                backgroundColor: '#FAFBFC',
                zIndex: 20
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#9CA3AF',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                Tasks
              </span>
            </div>

            {/* Categories and Tasks */}
            {categories.map((category, index) => {
              const categoryTasks = validTasks.filter(t => t.category === category);
              return (
                <div key={category} style={{ marginTop: '16px' }}>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6B7280',
                      letterSpacing: '0.02em',
                      marginBottom: '8px'
                    }}
                  >
                    {category}
                  </div>
                  {categoryTasks.map((task) => (
                    <div
                      key={task.id}
                      style={{
                        height: '64px',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '12px',
                        borderRadius: '8px',
                        backgroundColor: hoveredRow === task.id ? '#F9FAFB' : 'transparent',
                        transition: 'background-color 120ms ease-out'
                      }}
                      onMouseEnter={() => setHoveredRow(task.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: '500',
                          color: '#111827',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Right Side - Timeline */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              paddingRight: '32px'
            }}
          >
            {/* Sticky Timeline Header */}
            <div
              style={{
                position: 'sticky',
                top: 0,
                backgroundColor: '#FAFBFC',
                zIndex: 15,
                display: 'flex',
                height: '60px',
                alignItems: 'flex-end',
                paddingBottom: '12px',
                marginBottom: '16px',
                borderBottom: '1px solid #E5E7EB'
              }}
            >
              {timeLabels.map((label, index) => (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    fontSize: '11px',
                    fontWeight: '500',
                    color: '#9CA3AF',
                    textAlign: 'left',
                    paddingLeft: '8px'
                  }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Timeline Grid with Vertical Dashed Lines */}
            <div style={{ position: 'relative' }}>
              {/* Vertical dashed guide lines */}
              {timeLabels.map((_, index) => (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    left: `${(index / (timeLabels.length - 1)) * 100}%`,
                    top: 0,
                    bottom: 0,
                    width: '1px',
                    borderLeft: '1px dashed #E5E7EB',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}
                />
              ))}

              {/* Current Time Indicator */}
              {currentTimePosition !== null && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${currentTimePosition}%`,
                    top: '-16px',
                    bottom: 0,
                    width: '2px',
                    backgroundColor: '#EF4444',
                    zIndex: 5,
                    pointerEvents: 'none'
                  }}
                >
                  {/* Red dot at top */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#EF4444',
                      borderRadius: '50%',
                      border: '2px solid #FAFBFC'
                    }}
                  />
                </div>
              )}

              {/* Task Rows by Category */}
              {categories.map((category, catIndex) => {
                const categoryTasks = validTasks.filter(t => t.category === category);
                
                return (
                  <div key={category} style={{ marginTop: catIndex === 0 ? '0' : '16px' }}>
                    {/* Category Header Row */}
                    <div style={{ height: '32px' }} />

                    {categoryTasks.map((task, taskIndex) => {
                      const colors = getTaskColor(task);
                      const isHovered = hoveredRow === task.id;
                      const taskStyle = getTaskStyle(task);

                      const visibleAssignees = task.assignees.slice(0, 3);
                      const extraCount = task.assignees.length - 3;

                      return (
                        <div
                          key={task.id}
                          style={{
                            position: 'relative',
                            height: '64px',
                            backgroundColor: isHovered ? '#F9FAFB' : 'transparent',
                            borderRadius: '8px',
                            transition: 'background-color 120ms ease-out'
                          }}
                          onMouseEnter={() => setHoveredRow(task.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          {/* Task Bar */}
                          <div
                            onMouseEnter={(e) => handleTaskMouseEnter(task, e)}
                            onMouseLeave={handleTaskMouseLeave}
                            onClick={() => onTaskClick?.(task.id)}
                            style={{
                              position: 'absolute',
                              top: '12px',
                              left: taskStyle.left,
                              width: taskStyle.width,
                              height: '40px',
                              backgroundColor: colors.bg,
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0 12px',
                              cursor: 'pointer',
                              transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
                              boxShadow: isHovered 
                                ? '0 4px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)' 
                                : '0 1px 3px rgba(0, 0, 0, 0.04)',
                              transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                              overflow: 'hidden',
                              zIndex: isHovered ? 10 : 2
                            }}
                          >
                            {/* Left color strip */}
                            <div
                              style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: '3px',
                                backgroundColor: colors.accent,
                                borderRadius: '12px 0 0 12px'
                              }}
                            />

                            {/* Task Content */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                flex: 1,
                                minWidth: 0,
                                paddingLeft: '8px'
                              }}
                            >
                              {/* Title */}
                              <span
                                style={{
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  color: '#111827',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  lineHeight: '1.2'
                                }}
                              >
                                {task.title}
                              </span>
                            </div>

                            {/* Assignee Avatars */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                paddingLeft: '8px',
                                flexShrink: 0
                              }}
                            >
                              {visibleAssignees.map((assignee, index) => (
                                <Avatar
                                  key={index}
                                  className="w-6 h-6"
                                  style={{
                                    border: '2px solid #FFFFFF',
                                    marginLeft: index > 0 ? '-6px' : '0',
                                    flexShrink: 0
                                  }}
                                >
                                  <AvatarFallback
                                    className={assignee.color}
                                    style={{
                                      fontSize: '9px',
                                      fontWeight: '600',
                                      color: '#FFFFFF'
                                    }}
                                  >
                                    {assignee.initials}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {extraCount > 0 && (
                                <div
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    backgroundColor: '#E5E7EB',
                                    border: '2px solid #FFFFFF',
                                    marginLeft: '-6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '9px',
                                    fontWeight: '600',
                                    color: '#6B7280'
                                  }}
                                >
                                  +{extraCount}
                                </div>
                              )}
                            </div>

                            {/* Resize Handle - Right */}
                            <div
                              style={{
                                position: 'absolute',
                                right: 0,
                                top: 0,
                                bottom: 0,
                                width: '8px',
                                cursor: 'ew-resize',
                                opacity: isHovered ? 1 : 0,
                                transition: 'opacity 150ms ease-out'
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                // Handle resize logic here
                              }}
                            />
                          </div>

                          {/* Dependency Lines */}
                          {task.dependencies?.map((dep, depIndex) => {
                            const depTask = validTasks.find(t => t.id === dep.taskId);
                            if (!depTask) return null;

                            const depStyle = getTaskStyle(depTask);
                            const currentStyle = getTaskStyle(task);
                            
                            // Calculate connection points
                            const depEndX = parseFloat(depStyle.left) + parseFloat(depStyle.width);
                            const currentStartX = parseFloat(currentStyle.left);
                            
                            return (
                              <div
                                key={depIndex}
                                style={{
                                  position: 'absolute',
                                  left: `${depEndX}%`,
                                  top: '32px',
                                  width: `${currentStartX - depEndX}%`,
                                  height: '1px',
                                  backgroundColor: '#D1D5DB',
                                  zIndex: 1
                                }}
                              >
                                {/* Dependency Label */}
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: '-18px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    fontSize: '10px',
                                    fontWeight: '500',
                                    color: '#9CA3AF',
                                    backgroundColor: '#FAFBFC',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    whiteSpace: 'nowrap',
                                    border: '1px solid #E5E7EB'
                                  }}
                                >
                                  {dep.label}
                                </div>

                                {/* Arrow at the end */}
                                <div
                                  style={{
                                    position: 'absolute',
                                    right: '-4px',
                                    top: '-3px',
                                    width: '0',
                                    height: '0',
                                    borderLeft: '4px solid #D1D5DB',
                                    borderTop: '4px solid transparent',
                                    borderBottom: '4px solid transparent'
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
            backgroundColor: '#111827',
            color: '#FFFFFF',
            padding: '12px 16px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)',
            pointerEvents: 'none',
            zIndex: 100,
            minWidth: '220px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif'
          }}
        >
          {/* Task Title */}
          <div
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#FFFFFF',
              marginBottom: '8px',
              letterSpacing: '-0.01em'
            }}
          >
            {tooltip.task.title}
          </div>

          {/* Time Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500' }}>Start:</span>
              <span style={{ fontSize: '11px', color: '#E5E7EB', fontWeight: '500' }}>
                {formatTime(tooltip.task.startHour)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500' }}>End:</span>
              <span style={{ fontSize: '11px', color: '#E5E7EB', fontWeight: '500' }}>
                {formatTime(tooltip.task.startHour + tooltip.task.duration)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500' }}>Duration:</span>
              <span style={{ fontSize: '11px', color: '#E5E7EB', fontWeight: '500' }}>
                {tooltip.task.duration} hour{tooltip.task.duration > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Assignees */}
          {tooltip.task.assignees.length > 0 && (
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #374151' }}>
              <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500', marginBottom: '6px' }}>
                Assignees:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {tooltip.task.assignees.map((assignee, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Avatar className="w-5 h-5">
                      <AvatarFallback
                        className={assignee.color}
                        style={{
                          fontSize: '8px',
                          fontWeight: '600',
                          color: '#FFFFFF'
                        }}
                      >
                        {assignee.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span style={{ fontSize: '11px', color: '#E5E7EB', fontWeight: '500' }}>
                      {assignee.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tooltip Arrow */}
          <div
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '0',
              height: '0',
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #111827'
            }}
          />
        </div>
      )}
    </div>
  );
}
