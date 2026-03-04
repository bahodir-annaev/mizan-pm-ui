import { useState } from 'react';
import { ChevronDown, Edit2, Check, X } from 'lucide-react';

interface TaskCardProps {
  task: {
    id: string;
    name: string;
    icon: string;
    priority: 'High' | 'Medium' | 'Low';
    location: string;
    assignee: {
      name: string;
      initials: string;
      color: string;
    };
    collaborators: {
      initials: string;
      color: string;
    }[];
    status: {
      label: string;
      subLabel?: string;
      color: string;
    };
    startDate: string;
    deadline: string;
    deadlineOverdue?: boolean;
    progress?: number;
  };
}

const getPriorityColor = (priority: 'High' | 'Medium' | 'Low') => {
  switch (priority) {
    case 'High': return '#DC2626';
    case 'Medium': return '#F97316';
    case 'Low': return '#10B981';
  }
};

export function TaskCard({ task }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);

  const handleSave = () => {
    console.log('Saving task:', editedTask);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTask(task);
    setIsEditing(false);
  };

  return (
    <div
      className="rounded-lg p-4 transition-all relative"
      style={{
        backgroundColor: 'var(--surface-primary)',
        border: isEditing ? '1px solid var(--accent-primary)' : '1px solid var(--border-primary)',
        cursor: 'pointer',
        boxShadow: isEditing ? '0 4px 12px rgba(0,0,0,0.12)' : (isHovered ? '0 2px 8px rgba(0,0,0,0.08)' : 'none')
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edit Button */}
      {(isHovered || isEditing) && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="p-1.5 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <Check style={{ width: '14px', height: '14px' }} />
              </button>
              <button
                onClick={handleCancel}
                className="p-1.5 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-primary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                }}
              >
                <X style={{ width: '14px', height: '14px' }} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <Edit2 style={{ width: '14px', height: '14px' }} />
            </button>
          )}
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <input 
          type="checkbox" 
          className="mt-1"
          style={{
            width: '16px',
            height: '16px',
            accentColor: 'var(--accent-primary)'
          }}
        />

        {/* Task ID */}
        <div className="flex flex-col gap-0.5 min-w-[80px]">
          <span 
            className="text-xs" 
            style={{ 
              color: 'var(--text-tertiary)',
              fontWeight: 500
            }}
          >
            {task.id}
          </span>
        </div>

        {/* Task Info */}
        <div className="flex-1 flex items-center gap-6">
          {/* Icon + Title + Priority */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {isEditing ? (
                <input
                  type="text"
                  value={editedTask.icon}
                  onChange={(e) => setEditedTask({ ...editedTask, icon: e.target.value })}
                  className="w-8 h-8 text-center text-lg rounded"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                />
              ) : (
                <span className="text-lg">{task.icon}</span>
              )}
              
              {isEditing ? (
                <input
                  type="text"
                  value={editedTask.name}
                  onChange={(e) => setEditedTask({ ...editedTask, name: e.target.value })}
                  className="flex-1 px-2 py-1 text-sm rounded"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)',
                    fontWeight: 500
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                  }}
                />
              ) : (
                <h3 
                  className="text-sm"
                  style={{ 
                    color: 'var(--text-primary)',
                    fontWeight: 500
                  }}
                >
                  {task.name}
                </h3>
              )}
            </div>
            
            {isEditing ? (
              <select
                value={editedTask.priority}
                onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as 'High' | 'Medium' | 'Low' })}
                className="px-2 py-1 rounded text-xs transition-colors"
                style={{
                  color: getPriorityColor(editedTask.priority),
                  backgroundColor: getPriorityColor(editedTask.priority) + '15',
                  fontWeight: 500,
                  border: '1px solid ' + getPriorityColor(editedTask.priority)
                }}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            ) : (
              <button
                className="px-2 py-0.5 rounded text-xs flex items-center gap-1 transition-colors"
                style={{
                  color: getPriorityColor(task.priority),
                  backgroundColor: getPriorityColor(task.priority) + '15',
                  fontWeight: 500
                }}
              >
                {task.priority}
                <ChevronDown style={{ width: '12px', height: '12px' }} />
              </button>
            )}
          </div>

          {/* Location */}
          <div className="flex flex-col items-center min-w-[100px]">
            {isEditing ? (
              <input
                type="text"
                value={editedTask.location}
                onChange={(e) => setEditedTask({ ...editedTask, location: e.target.value })}
                className="w-full px-2 py-1 text-xs text-center rounded"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-secondary)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                }}
              />
            ) : (
              <>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {task.location.split(' ')[0]}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {task.location.split(' ')[1] || ''}
                </span>
              </>
            )}
          </div>

          {/* Assignee */}
          <div className="flex items-center gap-2 min-w-[120px]">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: task.assignee.color,
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 600
              }}
            >
              {task.assignee.initials}
            </div>
            {isEditing ? (
              <input
                type="text"
                value={editedTask.assignee.name}
                onChange={(e) => setEditedTask({ 
                  ...editedTask, 
                  assignee: { ...editedTask.assignee, name: e.target.value }
                })}
                className="flex-1 px-2 py-1 text-xs rounded"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-secondary)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                }}
              />
            ) : (
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {task.assignee.name}
              </span>
            )}
          </div>

          {/* Collaborators */}
          <div className="flex items-center -space-x-2">
            {task.collaborators.map((collab, idx) => (
              <div
                key={idx}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: collab.color,
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 600,
                  border: '2px solid var(--surface-primary)'
                }}
              >
                {collab.initials}
              </div>
            ))}
            {isEditing && (
              <button
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  color: 'var(--text-tertiary)',
                  border: '2px solid var(--surface-primary)',
                  fontSize: '16px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                }}
              >
                +
              </button>
            )}
          </div>

          {/* Status */}
          {isEditing ? (
            <select
              value={editedTask.status.label}
              onChange={(e) => setEditedTask({ 
                ...editedTask, 
                status: { ...editedTask.status, label: e.target.value }
              })}
              className="px-3 py-1.5 rounded-lg text-xs transition-colors min-w-[140px]"
              style={{
                backgroundColor: task.status.color + '15',
                color: task.status.color,
                fontWeight: 500,
                border: '1px solid ' + task.status.color
              }}
            >
              <option value="In Progress">In Progress</option>
              <option value="To Do">To Do</option>
              <option value="Done">Done</option>
              <option value="On Hold">On Hold</option>
            </select>
          ) : (
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors min-w-[140px]"
              style={{
                backgroundColor: task.status.color + '15',
              }}
            >
              <div 
                className="w-1.5 h-1.5 rounded-full" 
                style={{ backgroundColor: task.status.color }}
              />
              <div className="flex flex-col items-start">
                <span 
                  className="text-xs"
                  style={{ 
                    color: task.status.color,
                    fontWeight: 500
                  }}
                >
                  {task.status.label}
                </span>
                {task.status.subLabel && (
                  <span 
                    className="text-xs"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {task.status.subLabel}
                  </span>
                )}
              </div>
              <ChevronDown style={{ width: '12px', height: '12px', color: task.status.color }} />
            </button>
          )}

          {/* Dates */}
          <div className="flex items-center gap-6">
            <div className="text-center min-w-[60px]">
              {isEditing ? (
                <input
                  type="date"
                  value={editedTask.startDate}
                  onChange={(e) => setEditedTask({ ...editedTask, startDate: e.target.value })}
                  className="w-full px-1 py-1 text-xs rounded"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                  }}
                />
              ) : (
                <>
                  <div className="text-lg" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    {task.startDate.split(' ')[0]}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {task.startDate.split(' ')[1]} {task.startDate.split(' ')[2]}
                  </div>
                </>
              )}
            </div>

            <div className="text-center min-w-[60px]">
              {isEditing ? (
                <input
                  type="date"
                  value={editedTask.deadline}
                  onChange={(e) => setEditedTask({ ...editedTask, deadline: e.target.value })}
                  className="w-full px-1 py-1 text-xs rounded"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                  }}
                />
              ) : (
                <>
                  <div 
                    className="text-lg" 
                    style={{ 
                      color: task.deadlineOverdue ? '#EF4444' : 'var(--text-primary)', 
                      fontWeight: 600 
                    }}
                  >
                    {task.deadline.split(' ')[0]}
                  </div>
                  <div 
                    className="text-xs" 
                    style={{ 
                      color: task.deadlineOverdue ? '#EF4444' : 'var(--text-tertiary)' 
                    }}
                  >
                    {task.deadline.split(' ')[1]} {task.deadline.split(' ')[2]}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {task.progress !== undefined && (
            <div className="w-16 flex flex-col gap-1">
              {isEditing ? (
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editedTask.progress || 0}
                  onChange={(e) => setEditedTask({ ...editedTask, progress: parseInt(e.target.value) })}
                  className="w-full"
                  style={{
                    accentColor: 'var(--accent-primary)'
                  }}
                />
              ) : (
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--surface-secondary)' }}
                >
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${task.progress}%`,
                      backgroundColor: 'var(--accent-primary)'
                    }}
                  />
                </div>
              )}
              {isEditing && (
                <span className="text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
                  {editedTask.progress}%
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}