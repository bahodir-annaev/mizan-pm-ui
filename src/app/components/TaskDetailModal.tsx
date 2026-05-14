/**
 * TaskDetailModal Component - Nizam Design System
 * Compact, editable task detail view matching AddTaskModal input style
 * Optimized for quick viewing and editing
 */

import { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  ChevronDown, 
  ChevronRight, 
  MessageSquare, 
  Paperclip,
  User,
  FileText,
  Play,
  Activity,
  Clock,
  Check,
  AlertCircle,
  CircleDot,
  TrendingUp,
  Layers,
  Ruler,
  Tag,
  CheckSquare,
  ClipboardList,
  Signal
} from 'lucide-react';
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

interface ActivityItem {
  id: string;
  user: {
    name: string;
    initials: string;
    color: string;
  };
  action: 'Added' | 'Updated';
  field?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

interface TaskDetail {
  id: string;
  title: string;
  projectName?: string;
  teamName?: string;
  assignee: {
    name: string;
    initials: string;
    color: string;
  };
  status: string;
  unit?: string;
  progress?: number;
  typeOfWork?: string;
  volume?: string;
  priority: string;
  dateStart?: string;
  dateEnd?: string;
  estimatedHours?: number;
  controlPoint?: string;
  label?: string;
  participants?: Participant[];
  checklist?: ChecklistItem[];
  subtasks?: Subtask[];
  comments?: string[];
  activity?: ActivityItem[];
}

interface TaskDetailModalProps {
  task: TaskDetail;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (taskId: string, updates: Partial<TaskDetail>) => void;
}

// Status configuration with icons and colors - matching AddTaskModal
const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string; bgColor: string }> = {
  'Not Started': {
    icon: <CircleDot style={{ width: '14px', height: '14px' }} />,
    label: 'Not Started',
    color: '#9ca3af',
    bgColor: 'rgba(156, 163, 175, 0.12)'
  },
  'Started': {
    icon: <Play style={{ width: '14px', height: '14px' }} />,
    label: 'Started',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.12)'
  },
  'In Progress': {
    icon: <Activity style={{ width: '14px', height: '14px' }} />,
    label: 'In Progress',
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.12)'
  },
  'Pending review': {
    icon: <Clock style={{ width: '14px', height: '14px' }} />,
    label: 'Pending review',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.12)'
  },
  'Late': {
    icon: <AlertCircle style={{ width: '14px', height: '14px' }} />,
    label: 'Late',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.12)'
  },
  'Completed': {
    icon: <Check style={{ width: '14px', height: '14px' }} />,
    label: 'Completed',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.12)'
  }
};

// Priority configuration - matching AddTaskModal
const priorityConfig: Record<string, { color: string; bgColor: string }> = {
  'Low': {
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.12)'
  },
  'Medium': {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.12)'
  },
  'High': {
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.12)'
  }
};

export function TaskDetailModal({ task, isOpen, onClose, onUpdate }: TaskDetailModalProps) {
  const [editedTask, setEditedTask] = useState(task);
  const [newComment, setNewComment] = useState('');
  const [checklistExpanded, setChecklistExpanded] = useState(false);
  const [activityExpanded, setActivityExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [statusChanged, setStatusChanged] = useState(false);
  
  useEffect(() => {
    setEditedTask(task);
    setIsClosing(false);
    setStatusChanged(false);
  }, [task]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;

  const statusStyle = statusConfig[editedTask.status] || statusConfig['Not Started'];
  const priorityStyle = priorityConfig[editedTask.priority];
  
  const checklistCompleted = editedTask.checklist?.filter(item => item.completed).length || 0;
  const checklistTotal = editedTask.checklist?.length || 0;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  const handleUpdate = (field: keyof TaskDetail, value: any) => {
    const updated = { ...editedTask, [field]: value };
    setEditedTask(updated);
    onUpdate?.(task.id, { [field]: value });
    
    // If status changed, trigger special animation and close
    if (field === 'status') {
      setStatusChanged(true);
      setTimeout(() => {
        handleClose();
      }, 100);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        animation: isClosing ? 'fadeOut 200ms ease-out' : 'fadeIn 150ms ease-out',
        opacity: isClosing ? 0 : 1
      }}
      onClick={handleClose}
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl"
        style={{
          backgroundColor: 'var(--surface-primary)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          animation: statusChanged 
            ? 'shrinkOut 200ms cubic-bezier(0.22, 1, 0.36, 1)' 
            : (isClosing 
              ? 'scaleOut 200ms cubic-bezier(0.22, 1, 0.36, 1)' 
              : 'scaleIn 180ms cubic-bezier(0.16, 1, 0.3, 1)'),
          transform: statusChanged || isClosing ? 'scale(0.92)' : 'scale(1)',
          opacity: statusChanged || isClosing ? 0 : 1
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <div className="flex-1">
            {/* Project / Team breadcrumb */}
            {(editedTask.projectName || editedTask.teamName) && (
              <div className="mb-1 flex items-center gap-2">
                {editedTask.projectName && (
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      color: 'var(--accent-primary)',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {editedTask.projectName}
                  </span>
                )}
                {editedTask.projectName && editedTask.teamName && (
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>·</span>
                )}
                {editedTask.teamName && (
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      color: 'var(--text-secondary)',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {editedTask.teamName}
                  </span>
                )}
              </div>
            )}

            {/* Task Title - Editable */}
            <input
              type="text"
              value={editedTask.title}
              onChange={(e) => handleUpdate('title', e.target.value)}
              className="w-full bg-transparent outline-none"
              style={{
                fontSize: '20px',
                fontWeight: '600',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em'
              }}
            />
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:opacity-70 transition-opacity ml-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] px-6 py-5">
          {/* Primary Info Row - Compact */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {/* Assignee */}
            <SelectField
              label="Assignee"
              value={editedTask.assignee.name}
              onChange={(value) => handleUpdate('assignee', { ...editedTask.assignee, name: value })}
              options={['Sarah Johnson', 'Alex Kim', 'Mike Chen', 'Emma Wilson']}
              icon={<User style={{ width: '14px', height: '14px' }} />}
            />

            {/* Status */}
            <StatusSelect
              label="Status"
              value={editedTask.status}
              onChange={(value) => handleUpdate('status', value)}
            />

            {/* Priority */}
            <PrioritySelect
              label="Priority"
              value={editedTask.priority}
              onChange={(value) => handleUpdate('priority', value)}
            />
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Start Date */}
            <div>
              <label
                className="flex items-center gap-1.5 text-xs font-medium mb-1.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Calendar style={{ width: '14px', height: '14px', color: '#9CA3AF', strokeWidth: 1.5 }} />
                Start date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={editedTask.dateStart || ''}
                  onChange={(e) => handleUpdate('dateStart', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg outline-none text-xs pr-9"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label
                className="flex items-center gap-1.5 text-xs font-medium mb-1.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Calendar style={{ width: '14px', height: '14px', color: '#9CA3AF', strokeWidth: 1.5 }} />
                Due date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={editedTask.dateEnd || ''}
                  onChange={(e) => handleUpdate('dateEnd', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg outline-none text-xs pr-9"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Estimated duration */}
          <div className="mb-4" style={{ width: '50%', paddingRight: '6px' }}>
            <label
              className="flex items-center gap-1.5 text-xs font-medium mb-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Clock style={{ width: '14px', height: '14px', color: '#9CA3AF', strokeWidth: 1.5 }} />
              Estimated duration (days)
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={editedTask.estimatedHours != null ? editedTask.estimatedHours / 24 : ''}
              onChange={(e) => handleUpdate('estimatedHours', e.target.value ? parseFloat(e.target.value) * 24 : undefined)}
              placeholder="e.g. 2.5"
              className="w-full px-3 py-2 rounded-lg outline-none text-xs"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* Progress */}
          {editedTask.progress !== undefined && (
            <div className="mb-4">
              <label 
                className="flex items-center gap-1.5 text-xs font-medium mb-1.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                <TrendingUp style={{ width: '14px', height: '14px', color: '#9CA3AF', strokeWidth: 1.5 }} />
                Progress
              </label>
              <div className="flex items-center gap-3">
                <div 
                  className="flex-1 h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--surface-secondary)' }}
                >
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${editedTask.progress}%`,
                      backgroundColor: editedTask.progress === 100 ? '#10b981' : 'var(--accent-primary)'
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    color: editedTask.progress === 100 ? '#10b981' : 'var(--accent-primary)',
                    minWidth: '40px'
                  }}
                >
                  {editedTask.progress}%
                </span>
              </div>
            </div>
          )}

          {/* Additional Details - Compact Grid */}
          {(editedTask.typeOfWork || editedTask.volume || editedTask.controlPoint || editedTask.label) && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {editedTask.typeOfWork && (
                <SelectField
                  label="Type of work"
                  value={editedTask.typeOfWork}
                  onChange={(value) => handleUpdate('typeOfWork', value)}
                  options={['Architecture', 'Construction', 'Design', 'Engineering', 'Planning']}
                  icon={<FileText style={{ width: '14px', height: '14px' }} />}
                />
              )}

              {editedTask.volume && editedTask.unit && (
                <div>
                  <label 
                    className="flex items-center gap-1.5 text-xs font-medium mb-1.5"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Ruler style={{ width: '14px', height: '14px', color: '#9CA3AF', strokeWidth: 1.5 }} />
                    Volume
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedTask.volume}
                      onChange={(e) => handleUpdate('volume', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg outline-none text-xs"
                      style={{
                        backgroundColor: 'var(--surface-secondary)',
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        minWidth: '40px'
                      }}
                    >
                      {editedTask.unit}
                    </span>
                  </div>
                </div>
              )}

              {editedTask.controlPoint && (
                <div>
                  <label 
                    className="flex items-center gap-1.5 text-xs font-medium mb-1.5"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <CheckSquare style={{ width: '14px', height: '14px', color: '#9CA3AF', strokeWidth: 1.5 }} />
                    Control Point
                  </label>
                  <input
                    type="text"
                    value={editedTask.controlPoint}
                    onChange={(e) => handleUpdate('controlPoint', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg outline-none text-xs"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              )}

              {editedTask.label && (
                <div>
                  <label 
                    className="flex items-center gap-1.5 text-xs font-medium mb-1.5"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Tag style={{ width: '14px', height: '14px', color: '#9CA3AF', strokeWidth: 1.5 }} />
                    Label
                  </label>
                  <input
                    type="text"
                    value={editedTask.label}
                    onChange={(e) => handleUpdate('label', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg outline-none text-xs"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Section Divider */}
          {editedTask.subtasks && editedTask.subtasks.length > 0 && (
            <div className="border-t my-4" style={{ borderColor: 'var(--border-secondary)' }} />
          )}

          {/* Subtasks - Compact List */}
          {editedTask.subtasks && editedTask.subtasks.length > 0 && (
            <div className="mb-4">
              <h3
                className="flex items-center gap-1.5 text-xs font-semibold mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                <CheckSquare style={{ width: '14px', height: '14px', color: '#9CA3AF', strokeWidth: 1.5 }} />
                Subtasks
              </h3>

              <div className="space-y-1">
                {editedTask.subtasks.map((subtask) => {
                  const subtaskStatus = statusConfig[subtask.status] || statusConfig['Not Started'];
                  return (
                    <div 
                      key={subtask.id}
                      className="flex items-center gap-2 py-1.5 px-2 rounded-lg"
                      style={{ backgroundColor: 'var(--surface-secondary)' }}
                    >
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                        onChange={() => console.log('Toggle subtask:', subtask.id)}
                      />
                      <span
                        className="flex-1 text-xs"
                        style={{
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          color: subtask.completed ? 'var(--text-tertiary)' : 'var(--text-primary)',
                          textDecoration: subtask.completed ? 'line-through' : 'none'
                        }}
                      >
                        {subtask.title}
                      </span>
                      <span
                        className="text-xs font-medium"
                        style={{
                          color: subtaskStatus.color,
                          fontSize: '11px'
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

          {/* Checklist - Collapsible */}
          {editedTask.checklist && editedTask.checklist.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setChecklistExpanded(!checklistExpanded)}
                className="flex items-center gap-2 text-xs font-semibold mb-2 hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text-secondary)' }}
              >
                {checklistExpanded ? (
                  <ChevronDown style={{ width: '16px', height: '16px' }} />
                ) : (
                  <ChevronRight style={{ width: '16px', height: '16px' }} />
                )}
                <ClipboardList style={{ width: '14px', height: '14px', color: '#9CA3AF', strokeWidth: 1.5 }} />
                Checklist ({checklistCompleted}/{checklistTotal})
              </button>

              {checklistExpanded && (
                <div className="space-y-1 pl-6">
                  {editedTask.checklist.map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center gap-2 py-1.5 px-2 rounded-lg"
                      style={{ backgroundColor: 'var(--surface-secondary)' }}
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                        onChange={() => console.log('Toggle checklist:', item.id)}
                      />
                      <span
                        className="flex-1 text-xs"
                        style={{
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          color: item.completed ? 'var(--text-tertiary)' : 'var(--text-primary)',
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

          {/* Comments & Activity - Collapsible */}
          {editedTask.activity && editedTask.activity.length > 0 && (
            <div>
              <button
                onClick={() => setActivityExpanded(!activityExpanded)}
                className="flex items-center gap-2 text-xs font-semibold mb-2 hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text-secondary)' }}
              >
                {activityExpanded ? (
                  <ChevronDown style={{ width: '16px', height: '16px' }} />
                ) : (
                  <ChevronRight style={{ width: '16px', height: '16px' }} />
                )}
                <MessageSquare style={{ width: '14px', height: '14px' }} />
                Comments & Activity
              </button>

              {activityExpanded && (
                <div className="pl-6">
                  {/* Comment Input */}
                  <div className="mb-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg outline-none text-xs resize-none"
                      style={{
                        backgroundColor: 'var(--surface-secondary)',
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <button
                        className="p-1 rounded hover:opacity-70 transition-opacity"
                        style={{ color: 'var(--text-tertiary)' }}
                        title="Attach"
                      >
                        <Paperclip style={{ width: '14px', height: '14px' }} />
                      </button>
                      <button
                        onClick={() => {
                          console.log('Add comment:', newComment);
                          setNewComment('');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
                        style={{
                          backgroundColor: 'var(--accent-primary)',
                          color: '#ffffff'
                        }}
                      >
                        Post
                      </button>
                    </div>
                  </div>

                  {/* Activity History */}
                  <div className="space-y-2">
                    {editedTask.activity.map((item) => (
                      <div key={item.id} className="flex gap-2">
                        <Avatar className="w-6 h-6 flex-shrink-0">
                          <AvatarFallback 
                            className={item.user.color}
                            style={{ fontSize: '10px', fontWeight: '600' }}
                          >
                            {item.user.initials}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span
                              className="text-xs font-semibold"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {item.user.name}
                            </span>
                            <span
                              className="text-xs"
                              style={{ color: 'var(--text-tertiary)' }}
                            >
                              {item.action.toLowerCase()}
                            </span>
                            {item.field && (
                              <>
                                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                  {item.field}:
                                </span>
                                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                  {item.oldValue}
                                </span>
                                <span style={{ color: 'var(--text-tertiary)' }}>→</span>
                                <span
                                  className="text-xs font-semibold"
                                  style={{ color: 'var(--accent-primary)' }}
                                >
                                  {item.newValue}
                                </span>
                              </>
                            )}
                          </div>
                          <span
                            className="text-xs"
                            style={{ color: 'var(--text-tertiary)' }}
                          >
                            {item.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes scaleOut {
          from { 
            opacity: 1;
            transform: scale(1);
          }
          to { 
            opacity: 0;
            transform: scale(0.95);
          }
        }
        @keyframes shrinkOut {
          from { 
            opacity: 1;
            transform: scale(1);
          }
          to { 
            opacity: 0;
            transform: scale(0.92);
          }
        }
      `}</style>
    </div>
  );
}

// Reusable Select Field Component - matching AddTaskModal
interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  icon?: React.ReactNode;
}

function SelectField({ label, value, onChange, options, placeholder, icon }: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <label 
        className="block text-xs font-medium mb-1.5"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </label>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all"
        style={{
          backgroundColor: 'var(--surface-secondary)',
          border: '1px solid var(--border-primary)',
          color: value ? 'var(--text-primary)' : 'var(--text-tertiary)'
        }}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs">{value || placeholder || 'Select...'}</span>
        </div>
        <ChevronDown 
          style={{ 
            width: '14px', 
            height: '14px',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }} 
        />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          <div
            className="absolute top-full left-0 mt-1 w-full rounded-lg overflow-hidden z-20 max-h-48 overflow-y-auto"
            style={{
              backgroundColor: 'var(--surface-primary)',
              border: '1px solid var(--border-primary)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
            }}
          >
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 transition-colors"
                style={{
                  color: 'var(--text-primary)',
                  backgroundColor: value === option ? 'var(--surface-hover)' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  if (value !== option) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span className="text-xs">{option}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Status Select - matching AddTaskModal with colored background
interface StatusSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function StatusSelect({ label, value, onChange }: StatusSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedConfig = value ? statusConfig[value] : null;

  return (
    <div className="relative">
      <label 
        className="block text-xs font-medium mb-1.5"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </label>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all"
        style={{
          backgroundColor: selectedConfig ? selectedConfig.bgColor : 'var(--surface-secondary)',
          border: `1px solid ${selectedConfig ? selectedConfig.color + '33' : 'var(--border-primary)'}`,
          color: selectedConfig ? selectedConfig.color : 'var(--text-tertiary)'
        }}
      >
        <div className="flex items-center gap-2">
          {selectedConfig?.icon}
          <span className="text-xs font-medium">{value || 'Select status...'}</span>
        </div>
        <ChevronDown 
          style={{ 
            width: '14px', 
            height: '14px',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            opacity: 0.5
          }} 
        />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          <div
            className="absolute top-full left-0 mt-1 w-full rounded-lg overflow-hidden z-20 max-h-64 overflow-y-auto"
            style={{
              backgroundColor: 'var(--surface-primary)',
              border: '1px solid var(--border-primary)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
            }}
          >
            {Object.keys(statusConfig).map((option) => {
              const config = statusConfig[option];
              const isSelected = value === option;
              
              return (
                <button
                  key={option}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 transition-all"
                  style={{
                    backgroundColor: isSelected ? config.bgColor : 'transparent',
                    borderLeft: isSelected ? `3px solid ${config.color}` : '3px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = config.bgColor;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div className="flex items-center gap-2 pl-1">
                    <span style={{ color: config.color }}>
                      {config.icon}
                    </span>
                    <span className="text-xs font-medium" style={{ color: config.color }}>
                      {option}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// Priority Select - matching AddTaskModal with colored background
interface PrioritySelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function PrioritySelect({ label, value, onChange }: PrioritySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedConfig = value ? priorityConfig[value] : null;

  return (
    <div className="relative">
      <label 
        className="block text-xs font-medium mb-1.5"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </label>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all"
        style={{
          backgroundColor: selectedConfig ? selectedConfig.bgColor : 'var(--surface-secondary)',
          border: `1px solid ${selectedConfig ? selectedConfig.color + '33' : 'var(--border-primary)'}`,
          color: selectedConfig ? selectedConfig.color : 'var(--text-tertiary)'
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{value || 'Select priority...'}</span>
        </div>
        <ChevronDown 
          style={{ 
            width: '14px', 
            height: '14px',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            opacity: 0.5
          }} 
        />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          <div
            className="absolute top-full left-0 mt-1 w-full rounded-lg overflow-hidden z-20"
            style={{
              backgroundColor: 'var(--surface-primary)',
              border: '1px solid var(--border-primary)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
            }}
          >
            {Object.keys(priorityConfig).map((option) => {
              const config = priorityConfig[option];
              const isSelected = value === option;
              
              return (
                <button
                  key={option}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 transition-all"
                  style={{
                    backgroundColor: isSelected ? config.bgColor : 'transparent',
                    borderLeft: isSelected ? `3px solid ${config.color}` : '3px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = config.bgColor;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span className="text-xs font-medium pl-1" style={{ color: config.color }}>
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}