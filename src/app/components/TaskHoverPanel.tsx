/**
 * TaskHoverPanel Component - Nizam Design System
 * Compact, information-dense quick-view panel
 * Optimized for fast scanning (1-2 seconds)
 */

import { useState } from 'react';
import { Calendar, ChevronRight, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';

interface Participant {
  name: string;
  initials: string;
  color: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Subtask {
  id: string;
  title: string;
  status: string;
  completed: boolean;
}

interface TaskHoverData {
  id: string;
  title: string;
  projectName?: string;
  assignee: {
    name: string;
    initials: string;
    color: string;
  };
  status: string;
  priority: string;
  dateStart?: string;
  dateEnd?: string;
  progress?: number;
  typeOfWork?: string;
  volume?: string;
  unit?: string;
  controlPoint?: string;
  label?: string;
  participants?: Participant[];
  checklist?: ChecklistItem[];
  subtasks?: Subtask[];
}

interface TaskHoverPanelProps {
  task: TaskHoverData;
  isVisible: boolean;
  position: { x: number; y: number };
  onClose?: () => void;
}

// Status configuration
const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  'Not Started': { label: 'Backlog', color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.08)' },
  'Started': { label: 'To Do', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.08)' },
  'In Progress': { label: 'In Progress', color: '#6366f1', bgColor: 'rgba(99, 102, 241, 0.08)' },
  'Pending review': { label: 'Review', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.08)' },
  'Completed': { label: 'Done', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.08)' },
  'Late': { label: 'Late', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.08)' }
};

// Priority configuration
const priorityConfig: Record<string, { color: string; bgColor: string }> = {
  'Low': { color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.08)' },
  'Medium': { color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.08)' },
  'High': { color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.08)' }
};

export function TaskHoverPanel({ task, isVisible, position }: TaskHoverPanelProps) {
  const [checklistExpanded, setChecklistExpanded] = useState(false);
  
  if (!isVisible) return null;

  const statusStyle = statusConfig[task.status] || statusConfig['Not Started'];
  const priorityStyle = priorityConfig[task.priority];
  
  const checklistCompleted = task.checklist?.filter(item => item.completed).length || 0;
  const checklistTotal = task.checklist?.length || 0;

  return (
    <div 
      className="fixed z-[100]"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        animation: 'fadeInScale 120ms ease-out'
      }}
    >
      {/* Compact Hover Card */}
      <div
        style={{
          width: '420px',
          backgroundColor: 'var(--background)',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1)',
          padding: '12px 14px',
          border: '1px solid var(--border)'
        }}
      >
        {/* HEADER BLOCK - Compact Grouping */}
        <div className="mb-3">
          {/* Project Name */}
          {task.projectName && (
            <div className="mb-1">
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '500',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  color: 'var(--ai-blue)',
                  letterSpacing: '-0.01em'
                }}
              >
                {task.projectName}
              </span>
            </div>
          )}

          {/* Task Title */}
          <h3
            style={{
              fontSize: '15px',
              fontWeight: '600',
              lineHeight: '1.3',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              color: 'var(--foreground)',
              marginBottom: '8px',
              letterSpacing: '-0.01em'
            }}
          >
            {task.title}
          </h3>

          {/* Meta Row - Tight */}
          <div className="flex items-center gap-2">
            {/* Assignee */}
            <div className="flex items-center gap-1.5">
              <Avatar className="w-5 h-5">
                <AvatarFallback 
                  className={task.assignee.color}
                  style={{ fontSize: '9px', fontWeight: '600' }}
                >
                  {task.assignee.initials}
                </AvatarFallback>
              </Avatar>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  color: 'var(--foreground)'
                }}
              >
                {task.assignee.name}
              </span>
            </div>

            <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border)' }} />

            {/* Status */}
            <div
              className="px-2 py-0.5 rounded-md"
              style={{
                backgroundColor: statusStyle.bgColor,
                color: statusStyle.color,
                fontSize: '11px',
                fontWeight: '600',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              {statusStyle.label}
            </div>

            {/* Priority */}
            <div
              className="px-2 py-0.5 rounded-md"
              style={{
                backgroundColor: priorityStyle.bgColor,
                color: priorityStyle.color,
                fontSize: '11px',
                fontWeight: '600',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              {task.priority}
            </div>
          </div>
        </div>

        {/* SUBTASKS - Ultra Compact */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mb-2">
            <div className="space-y-0.5">
              {task.subtasks.map((subtask) => {
                const subtaskStatus = statusConfig[subtask.status] || statusConfig['Not Started'];
                return (
                  <div 
                    key={subtask.id}
                    className="flex items-center gap-2 py-1 px-1.5 rounded-md"
                    style={{ backgroundColor: 'var(--muted)' }}
                  >
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      className="w-3.5 h-3.5 rounded"
                      style={{ accentColor: 'var(--ai-blue)' }}
                      readOnly
                    />
                    <span
                      className="flex-1 truncate"
                      style={{
                        fontSize: '12px',
                        fontWeight: '400',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        color: subtask.completed ? 'var(--muted-foreground)' : 'var(--foreground)',
                        textDecoration: subtask.completed ? 'line-through' : 'none'
                      }}
                    >
                      {subtask.title}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: '600',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        color: subtaskStatus.color
                      }}
                    >
                      {subtaskStatus.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CHECKLIST - Collapsed by Default */}
        {task.checklist && task.checklist.length > 0 && (
          <div className="mb-2">
            <button
              onClick={() => setChecklistExpanded(!checklistExpanded)}
              className="flex items-center gap-1.5 w-full text-left py-1 hover:opacity-70 transition-opacity"
            >
              {checklistExpanded ? (
                <ChevronDown style={{ width: '14px', height: '14px', color: 'var(--muted-foreground)' }} />
              ) : (
                <ChevronRight style={{ width: '14px', height: '14px', color: 'var(--muted-foreground)' }} />
              )}
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  color: 'var(--foreground)'
                }}
              >
                Checklist
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '500',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  color: 'var(--muted-foreground)'
                }}
              >
                {checklistCompleted}/{checklistTotal}
              </span>
            </button>

            {checklistExpanded && (
              <div className="space-y-0.5 mt-1">
                {task.checklist.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center gap-2 py-1 px-1.5 rounded-md"
                    style={{ backgroundColor: 'var(--muted)' }}
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      className="w-3.5 h-3.5 rounded"
                      style={{ accentColor: 'var(--ai-blue)' }}
                      readOnly
                    />
                    <span
                      className="flex-1"
                      style={{
                        fontSize: '12px',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        color: item.completed ? 'var(--muted-foreground)' : 'var(--foreground)',
                        textDecoration: item.completed ? 'line-through' : 'none'
                      }}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DETAILS SIDEBAR - Compact Grid */}
        <div 
          className="pt-2 mt-2"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            {/* Start Date */}
            {task.dateStart && (
              <div>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: '500',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    color: 'var(--muted-foreground)',
                    marginBottom: '2px'
                  }}
                >
                  Start
                </div>
                <div
                  className="flex items-center gap-1"
                  style={{
                    fontSize: '12px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    color: 'var(--foreground)'
                  }}
                >
                  <Calendar style={{ width: '11px', height: '11px', opacity: 0.4 }} />
                  {task.dateStart}
                </div>
              </div>
            )}

            {/* Due Date */}
            {task.dateEnd && (
              <div>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: '500',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    color: 'var(--muted-foreground)',
                    marginBottom: '2px'
                  }}
                >
                  Due
                </div>
                <div
                  className="flex items-center gap-1"
                  style={{
                    fontSize: '12px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    color: 'var(--foreground)'
                  }}
                >
                  <Calendar style={{ width: '11px', height: '11px', opacity: 0.4 }} />
                  {task.dateEnd}
                </div>
              </div>
            )}

            {/* Progress */}
            {task.progress !== undefined && (
              <div>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: '500',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    color: 'var(--muted-foreground)',
                    marginBottom: '2px'
                  }}
                >
                  Progress
                </div>
                <div className="flex items-center gap-1.5">
                  <div 
                    className="h-1 rounded-full overflow-hidden flex-1"
                    style={{ backgroundColor: 'var(--muted)' }}
                  >
                    <div 
                      className="h-full rounded-full"
                      style={{
                        width: `${task.progress}%`,
                        backgroundColor: task.progress === 100 ? '#10b981' : 'var(--ai-blue)'
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      color: task.progress === 100 ? '#10b981' : 'var(--ai-blue)'
                    }}
                  >
                    {task.progress}%
                  </span>
                </div>
              </div>
            )}

            {/* Type of Work */}
            {task.typeOfWork && (
              <div>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: '500',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    color: 'var(--muted-foreground)',
                    marginBottom: '2px'
                  }}
                >
                  Type
                </div>
                <div
                  className="truncate"
                  style={{
                    fontSize: '12px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    color: 'var(--foreground)'
                  }}
                >
                  {task.typeOfWork}
                </div>
              </div>
            )}

            {/* Volume */}
            {task.volume && task.unit && (
              <div>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: '500',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    color: 'var(--muted-foreground)',
                    marginBottom: '2px'
                  }}
                >
                  Volume
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    color: 'var(--foreground)'
                  }}
                >
                  {task.volume} {task.unit}
                </div>
              </div>
            )}

            {/* Control Point */}
            {task.controlPoint && (
              <div>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: '500',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    color: 'var(--muted-foreground)',
                    marginBottom: '2px'
                  }}
                >
                  Control Point
                </div>
                <div
                  className="truncate"
                  style={{
                    fontSize: '12px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    color: 'var(--foreground)'
                  }}
                >
                  {task.controlPoint}
                </div>
              </div>
            )}

            {/* Label */}
            {task.label && (
              <div>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: '500',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    color: 'var(--muted-foreground)',
                    marginBottom: '2px'
                  }}
                >
                  Label
                </div>
                <div
                  className="truncate"
                  style={{
                    fontSize: '12px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    color: 'var(--foreground)'
                  }}
                >
                  {task.label}
                </div>
              </div>
            )}
          </div>

          {/* Participants - If Any */}
          {task.participants && task.participants.length > 0 && (
            <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
              <div
                className="mb-1"
                style={{
                  fontSize: '10px',
                  fontWeight: '500',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  color: 'var(--muted-foreground)'
                }}
              >
                Team ({1 + task.participants.length})
              </div>
              <div className="flex items-center gap-1">
                {/* Assignee */}
                <Avatar className="w-5 h-5">
                  <AvatarFallback 
                    className={task.assignee.color}
                    style={{ fontSize: '9px', fontWeight: '600' }}
                  >
                    {task.assignee.initials}
                  </AvatarFallback>
                </Avatar>
                {/* Other Participants */}
                {task.participants.slice(0, 4).map((participant, index) => (
                  <Avatar key={index} className="w-5 h-5">
                    <AvatarFallback 
                      className={participant.color}
                      style={{ fontSize: '9px', fontWeight: '600' }}
                    >
                      {participant.initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {task.participants.length > 4 && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '500',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      color: 'var(--muted-foreground)',
                      marginLeft: '4px'
                    }}
                  >
                    +{task.participants.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeInScale {
          from { 
            opacity: 0;
            transform: scale(0.95) translateY(-4px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
