import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Share2,
  MoreHorizontal,
  Calendar,
  Flag,
  Tag,
  Plus,
  Paperclip,
  Upload,
  MessageCircle,
  ChevronDown,
  Square,
  CheckSquare,
  Circle,
  CheckCircle2,
  Trash2,
  GripVertical,
  Link as LinkIcon,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Edit2,
  Check,
  X as XIcon,
  File,
  Save
} from 'lucide-react';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';
import { InlineDatePicker } from './InlineDatePicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface Project {
  id: string;
  name: string;
  client: string;
  dateStart: string;
  dateEnd: string;
  holat: number;
  status: string;
  size: string;
  kvadratura: string;
  type: string;
  progress: number;
  description?: string;
  complexity?: string;
  duration?: string;
}

interface ProjectTaskDetailOverlayProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  status: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface Attachment {
  id: string;
  name: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  isOwn?: boolean;
}

const statusOptions = [
  { value: 'In Progress', label: 'In Progress', className: 'status-progress', icon: Circle },
  { value: 'Start', label: 'Start', className: 'status-start', icon: Circle },
  { value: 'Burning', label: 'Burning', className: 'status-burning', icon: Circle },
  { value: 'End', label: 'End', className: 'status-end', icon: CheckCircle2 },
  { value: 'Late', label: 'Late', className: 'status-late', icon: Circle },
];

const priorityOptions = [
  { value: 'High', label: 'High', icon: ArrowUp, className: 'priority-high' },
  { value: 'Medium', label: 'Medium', icon: ArrowRight, className: 'priority-medium' },
  { value: 'Low', label: 'Low', icon: ArrowDown, className: 'priority-low' },
];

const sizeOptions = ['Small', 'Medium', 'Large', 'X-Large'];
const typeOptions = ['Residential', 'Commercial', 'Mixed-Use', 'Public'];

// Inline Editable Text Input
function InlineEditableText({
  value,
  onChange,
  placeholder = 'Click to edit',
  className = '',
  multiline = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if ('select' in inputRef.current) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    const commonProps = {
      ref: inputRef as any,
      value: editValue,
      onChange: (e: any) => setEditValue(e.target.value),
      onBlur: handleSave,
      onKeyDown: handleKeyDown,
      className: `w-full px-2 py-1 rounded border outline-none ${className}`,
      style: {
        borderColor: 'var(--accent-primary)',
        backgroundColor: 'var(--input-bg)',
        color: 'var(--text-primary)',
      },
    };

    return multiline ? (
      <textarea {...commonProps} rows={3} />
    ) : (
      <input type="text" {...commonProps} />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer px-2 py-1 -mx-2 -my-1 rounded transition-colors ${className}`}
      style={{
        color: value ? 'var(--text-primary)' : 'var(--text-tertiary)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {value || placeholder}
    </div>
  );
}

// Inline Editable Subtask
function EditableSubtaskRow({
  subtask,
  onToggle,
  onUpdate,
  onDelete,
  onStatusChange,
}: {
  subtask: Subtask;
  onToggle: () => void;
  onUpdate: (title: string) => void;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(subtask.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(editTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleCancel = () => {
    setEditTitle(subtask.title);
    setIsEditingTitle(false);
  };

  const currentStatus = statusOptions.find(s => s.value === subtask.status) || statusOptions[0];

  return (
    <div
      className="flex items-start gap-2 p-2 rounded-lg transition-colors group"
      style={{ backgroundColor: 'transparent' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <button
        onClick={onToggle}
        className="flex-shrink-0 mt-0.5"
      >
        {subtask.completed ? (
          <CheckSquare className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
        ) : (
          <Square className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
        )}
      </button>

      {isEditingTitle ? (
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          className="flex-1 text-sm px-2 py-0.5 rounded border outline-none"
          style={{
            borderColor: 'var(--accent-primary)',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--text-primary)',
          }}
        />
      ) : (
        <span
          onClick={() => setIsEditingTitle(true)}
          className="flex-1 text-sm cursor-pointer"
          style={{
            color: subtask.completed ? 'var(--text-tertiary)' : 'var(--text-primary)',
            textDecoration: subtask.completed ? 'line-through' : 'none',
          }}
        >
          {subtask.title}
        </span>
      )}

      <Select value={subtask.status} onValueChange={onStatusChange}>
        <SelectTrigger 
          className="border-0 shadow-none h-auto p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ width: 'auto' }}
        >
          <SelectValue>
            <div className={`${currentStatus.className} px-2 py-0.5 rounded text-xs`}>
              {currentStatus.label}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <option.icon className="w-3 h-3" />
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        style={{ color: 'var(--text-tertiary)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--status-burning)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-tertiary)';
        }}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function ProjectTaskDetailOverlay({ 
  project, 
  isOpen, 
  onClose 
}: ProjectTaskDetailOverlayProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity'>('overview');
  
  // Editable project fields
  const [projectTitle, setProjectTitle] = useState(project?.name || '');
  const [projectClient, setProjectClient] = useState(project?.client || '');
  const [projectStatus, setProjectStatus] = useState(project?.status || 'Start');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [projectSize, setProjectSize] = useState(project?.size || 'Medium');
  const [projectType, setProjectType] = useState(project?.type || 'Residential');
  const [projectArea, setProjectArea] = useState(project?.kvadratura || '');
  const [projectDescription, setProjectDescription] = useState(project?.description || '');
  const [startDate, setStartDate] = useState(project?.dateStart || '');
  const [endDate, setEndDate] = useState(project?.dateEnd || '');
  const [progressValue, setProgressValue] = useState(project?.progress || 0);

  const [subtasks, setSubtasks] = useState<Subtask[]>([
    { id: '1', title: 'Initial site assessment', completed: true, status: 'End' },
    { id: '2', title: 'Design concept approval', completed: true, status: 'End' },
    { id: '3', title: 'Material selection', completed: false, status: 'In Progress' },
    { id: '4', title: 'Final review and handoff', completed: false, status: 'Start' },
  ]);

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', text: 'Client contract signed', checked: true },
    { id: '2', text: 'Budget approved', checked: true },
    { id: '3', text: 'Team assigned', checked: true },
    { id: '4', text: 'Timeline confirmed', checked: false },
  ]);

  const [attachments, setAttachments] = useState<Attachment[]>([
    { id: '1', name: 'floor-plan.pdf', size: '2.4 MB', uploadedBy: 'You', uploadedAt: '2 hours ago' },
    { id: '2', name: 'material-samples.zip', size: '8.1 MB', uploadedBy: 'Sarah Chen', uploadedAt: '5 hours ago' },
  ]);

  const [comments, setComments] = useState<Comment[]>([
    { id: '1', author: 'Sarah Chen', text: 'Great progress on the initial phase. Let\'s schedule a review meeting.', timestamp: '2 hours ago', isOwn: false },
    { id: '2', author: 'Mike Johnson', text: 'Material samples have arrived. Ready for client presentation.', timestamp: '5 hours ago', isOwn: false },
  ]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  // New subtask/checklist input
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newChecklistText, setNewChecklistText] = useState('');
  
  // Save state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Track changes
  useEffect(() => {
    if (!project) return;
    
    const hasChanges = 
      projectTitle !== project.name ||
      projectClient !== project.client ||
      projectStatus !== project.status ||
      projectSize !== project.size ||
      projectType !== project.type ||
      projectArea !== project.kvadratura ||
      projectDescription !== project.description ||
      startDate !== project.dateStart ||
      endDate !== project.dateEnd ||
      progressValue !== project.progress;
    
    setHasUnsavedChanges(hasChanges);
  }, [projectTitle, projectClient, projectStatus, projectSize, projectType, projectArea, projectDescription, startDate, endDate, progressValue, project]);

  // Save handler
  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Saving project:', {
        id: project?.id,
        name: projectTitle,
        client: projectClient,
        status: projectStatus,
        size: projectSize,
        type: projectType,
        kvadratura: projectArea,
        description: projectDescription,
        dateStart: startDate,
        dateEnd: endDate,
        progress: progressValue,
      });
      
      setIsSaving(false);
      setHasUnsavedChanges(false);
    }, 800);
  };

  // Sync with project prop
  useEffect(() => {
    if (project) {
      setProjectTitle(project.name);
      setProjectClient(project.client);
      setProjectStatus(project.status);
      setProjectSize(project.size);
      setProjectType(project.type);
      setProjectArea(project.kvadratura);
      setProjectDescription(project.description || '');
      setStartDate(project.dateStart);
      setEndDate(project.dateEnd);
      setProgressValue(project.progress);
    }
  }, [project]);

  // Auto-calculate progress from subtasks
  useEffect(() => {
    if (subtasks.length > 0) {
      const completed = subtasks.filter(s => s.completed).length;
      const newProgress = Math.round((completed / subtasks.length) * 100);
      setProgressValue(newProgress);
    }
  }, [subtasks]);

  // Handle Esc key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!project) return null;

  const currentStatus = statusOptions.find(s => s.value === projectStatus) || statusOptions[0];
  const StatusIcon = currentStatus.icon;
  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const completedChecklist = checklist.filter(c => c.checked).length;

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      setSubtasks([
        ...subtasks,
        {
          id: Date.now().toString(),
          title: newSubtaskTitle,
          completed: false,
          status: 'Start',
        },
      ]);
      setNewSubtaskTitle('');
    }
  };

  const handleAddChecklistItem = () => {
    if (newChecklistText.trim()) {
      setChecklist([
        ...checklist,
        {
          id: Date.now().toString(),
          text: newChecklistText,
          checked: false,
        },
      ]);
      setNewChecklistText('');
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([
        { 
          id: Date.now().toString(), 
          author: 'You', 
          text: newComment, 
          timestamp: 'Just now',
          isOwn: true
        },
        ...comments
      ]);
      setNewComment('');
    }
  };

  const handleEditComment = (commentId: string) => {
    if (editingCommentText.trim()) {
      setComments(comments.map(c => 
        c.id === commentId ? { ...c, text: editingCommentText } : c
      ));
      setEditingCommentId(null);
      setEditingCommentText('');
    }
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter(c => c.id !== commentId));
  };

  const handleDeleteAttachment = (attachmentId: string) => {
    setAttachments(attachments.filter(a => a.id !== attachmentId));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - dimmed background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}
          />

          {/* Overlay Panel - Right Side */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-full max-w-[720px] z-50 flex flex-col shadow-2xl"
            style={{ backgroundColor: 'var(--surface-primary)' }}
          >
            {/* Header */}
            <div 
              className="border-b px-6 py-5 flex-shrink-0"
              style={{ borderColor: 'var(--border-primary)' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Editable Title */}
                  <InlineEditableText
                    value={projectTitle}
                    onChange={setProjectTitle}
                    placeholder="Project name"
                    className="text-xl font-semibold"
                  />
                  <div className="flex items-center gap-3 mt-1.5 px-2">
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {project.id}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>•</span>
                    <InlineEditableText
                      value={projectClient}
                      onChange={setProjectClient}
                      placeholder="Client name"
                      className="text-xs"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Save Button */}
                  {hasUnsavedChanges && (
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-sm"
                      style={{ 
                        backgroundColor: isSaving ? 'var(--surface-tertiary)' : 'var(--accent-primary)',
                        color: '#ffffff',
                        opacity: isSaving ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!isSaving) {
                          e.currentTarget.style.opacity = '0.9';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSaving) {
                          e.currentTarget.style.opacity = '1';
                        }
                      }}
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Saving...' : 'Save'}</span>
                    </button>
                  )}

                  <button
                    className="p-2 rounded-lg transition-all"
                    style={{ color: 'var(--text-tertiary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                      e.currentTarget.style.color = 'var(--accent-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-tertiary)';
                    }}
                    title="AI Assist"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 rounded-lg transition-all"
                    style={{ color: 'var(--text-tertiary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-tertiary)';
                    }}
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 rounded-lg transition-all"
                    style={{ color: 'var(--text-tertiary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-tertiary)';
                    }}
                    title="More options"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  <div 
                    className="w-px h-5 mx-1"
                    style={{ backgroundColor: 'var(--border-secondary)' }}
                  />
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg transition-all"
                    style={{ color: 'var(--text-tertiary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-tertiary)';
                    }}
                    title="Close (Esc)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div 
              className="border-b px-6 flex-shrink-0"
              style={{ borderColor: 'var(--border-secondary)' }}
            >
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  className="pb-3 pt-2 text-sm font-medium transition-all relative"
                  style={{
                    color: activeTab === 'overview' ? 'var(--text-primary)' : 'var(--text-tertiary)'
                  }}
                >
                  Overview
                  {activeTab === 'overview' && (
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ backgroundColor: 'var(--accent-primary)' }}
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className="pb-3 pt-2 text-sm font-medium transition-all relative"
                  style={{
                    color: activeTab === 'activity' ? 'var(--text-primary)' : 'var(--text-tertiary)'
                  }}
                >
                  Activity
                  {activeTab === 'activity' && (
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ backgroundColor: 'var(--accent-primary)' }}
                    />
                  )}
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'overview' && (
                <div className="p-6 space-y-6">
                  {/* Status & Progress Section */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Status - Editable Dropdown */}
                      <div>
                        <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
                          Status
                        </label>
                        <Select value={projectStatus} onValueChange={setProjectStatus}>
                          <SelectTrigger 
                            className="w-full h-auto border-0 shadow-none p-0"
                          >
                            <SelectValue>
                              <div 
                                className={`${currentStatus.className} px-3 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2`}
                              >
                                <StatusIcon className="w-3.5 h-3.5" />
                                {currentStatus.label}
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent style={{
                            backgroundColor: 'var(--surface-primary)',
                            borderColor: 'var(--border-primary)'
                          }}>
                            {statusOptions.map(option => {
                              const Icon = option.icon;
                              return (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    <Icon className="w-3.5 h-3.5" />
                                    {option.label}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Priority - Editable Dropdown with Color */}
                      <div>
                        <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
                          Priority
                        </label>
                        <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                          <SelectTrigger 
                            className="w-full h-auto border-0 shadow-none p-0"
                          >
                            <SelectValue>
                              {(() => {
                                const currentPriority = priorityOptions.find(p => p.value === priority) || priorityOptions[1];
                                const PriorityIcon = currentPriority.icon;
                                return (
                                  <div className={`priority-pill ${currentPriority.className}`}>
                                    <PriorityIcon className="w-3.5 h-3.5" />
                                    <span>{currentPriority.label}</span>
                                  </div>
                                );
                              })()}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent style={{
                            backgroundColor: 'var(--surface-primary)',
                            borderColor: 'var(--border-primary)'
                          }}>
                            {priorityOptions.map(option => {
                              const Icon = option.icon;
                              return (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className={`priority-pill ${option.className}`}>
                                    <Icon className="w-3.5 h-3.5" />
                                    {option.label}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Progress - Auto-calculated from subtasks */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                          Progress (auto-calculated)
                        </label>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {progressValue}%
                        </span>
                      </div>
                      <Progress 
                        value={progressValue} 
                        className="h-2"
                      />
                    </div>
                  </div>

                  {/* Project Details - All Editable */}
                  <div 
                    className="pt-6 border-t space-y-4"
                    style={{ borderColor: 'var(--border-secondary)' }}
                  >
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Project Details
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Start Date - Editable */}
                      <div>
                        <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
                          <Calendar className="w-3.5 h-3.5" />
                          Start Date
                        </label>
                        <InlineDatePicker
                          value={startDate}
                          onChange={setStartDate}
                        />
                      </div>
                      {/* End Date - Editable */}
                      <div>
                        <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
                          <Calendar className="w-3.5 h-3.5" />
                          End Date
                        </label>
                        <InlineDatePicker
                          value={endDate}
                          onChange={setEndDate}
                          minDate={startDate}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Project Size - Editable Dropdown */}
                      <div>
                        <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-tertiary)' }}>
                          Project Size
                        </label>
                        <Select value={projectSize} onValueChange={setProjectSize}>
                          <SelectTrigger 
                            className="w-full h-8 text-sm"
                            style={{
                              borderColor: 'var(--border-primary)',
                              backgroundColor: 'var(--surface-secondary)',
                              color: 'var(--text-primary)'
                            }}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent style={{
                            backgroundColor: 'var(--surface-primary)',
                            borderColor: 'var(--border-primary)'
                          }}>
                            {sizeOptions.map(size => (
                              <SelectItem key={size} value={size}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Project Type - Editable Dropdown */}
                      <div>
                        <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
                          <Tag className="w-3.5 h-3.5" />
                          Project Type
                        </label>
                        <Select value={projectType} onValueChange={setProjectType}>
                          <SelectTrigger 
                            className="w-full h-8 text-sm"
                            style={{
                              borderColor: 'var(--border-primary)',
                              backgroundColor: 'var(--surface-secondary)',
                              color: 'var(--text-primary)'
                            }}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent style={{
                            backgroundColor: 'var(--surface-primary)',
                            borderColor: 'var(--border-primary)'
                          }}>
                            {typeOptions.map(type => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Total Area - Editable Text */}
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-tertiary)' }}>
                        Total Area
                      </label>
                      <InlineEditableText
                        value={projectArea}
                        onChange={setProjectArea}
                        placeholder="e.g., 500 m²"
                        className="text-sm"
                      />
                    </div>

                    {/* Description - Editable Multiline */}
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-tertiary)' }}>
                        Description
                      </label>
                      <InlineEditableText
                        value={projectDescription}
                        onChange={setProjectDescription}
                        placeholder="Add project description..."
                        className="text-sm leading-relaxed"
                        multiline
                      />
                    </div>
                  </div>

                  {/* Subtasks - Fully Editable */}
                  <div 
                    className="pt-6 border-t"
                    style={{ borderColor: 'var(--border-secondary)' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Subtasks
                        <span className="ml-2 text-xs font-normal" style={{ color: 'var(--text-tertiary)' }}>
                          {completedSubtasks}/{subtasks.length}
                        </span>
                      </h3>
                    </div>
                    <div className="space-y-1">
                      {subtasks.map((subtask) => (
                        <EditableSubtaskRow
                          key={subtask.id}
                          subtask={subtask}
                          onToggle={() => {
                            setSubtasks(subtasks.map(s => 
                              s.id === subtask.id ? { ...s, completed: !s.completed } : s
                            ));
                          }}
                          onUpdate={(title) => {
                            setSubtasks(subtasks.map(s => 
                              s.id === subtask.id ? { ...s, title } : s
                            ));
                          }}
                          onStatusChange={(status) => {
                            setSubtasks(subtasks.map(s => 
                              s.id === subtask.id ? { ...s, status } : s
                            ));
                          }}
                          onDelete={() => {
                            setSubtasks(subtasks.filter(s => s.id !== subtask.id));
                          }}
                        />
                      ))}

                      {/* Add New Subtask */}
                      <div 
                        className="flex items-center gap-2 p-2 rounded-lg border-2 border-dashed transition-colors"
                        style={{
                          borderColor: 'var(--border-secondary)',
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-secondary)';
                        }}
                      >
                        <Plus className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
                        <input
                          type="text"
                          placeholder="Add subtask..."
                          value={newSubtaskTitle}
                          onChange={(e) => setNewSubtaskTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddSubtask();
                          }}
                          className="flex-1 text-sm bg-transparent border-none outline-none"
                          style={{
                            color: 'var(--text-primary)',
                            caretColor: 'var(--accent-primary)'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Checklist - Fully Editable */}
                  <div 
                    className="pt-6 border-t"
                    style={{ borderColor: 'var(--border-secondary)' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Checklist
                        <span className="ml-2 text-xs font-normal" style={{ color: 'var(--text-tertiary)' }}>
                          {completedChecklist}/{checklist.length}
                        </span>
                      </h3>
                    </div>
                    <div className="space-y-1">
                      {checklist.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-2 p-2 rounded-lg transition-colors group"
                          style={{ backgroundColor: 'transparent' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <button
                            onClick={() => {
                              setChecklist(checklist.map(c => 
                                c.id === item.id ? { ...c, checked: !c.checked } : c
                              ));
                            }}
                            className="flex-shrink-0 mt-0.5"
                          >
                            {item.checked ? (
                              <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--status-end)' }} />
                            ) : (
                              <Circle className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                            )}
                          </button>
                          <InlineEditableText
                            value={item.text}
                            onChange={(text) => {
                              setChecklist(checklist.map(c => 
                                c.id === item.id ? { ...c, text } : c
                              ));
                            }}
                            className="flex-1 text-sm"
                          />
                          <button
                            onClick={() => {
                              setChecklist(checklist.filter(c => c.id !== item.id));
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            style={{ color: 'var(--text-tertiary)' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = 'var(--status-burning)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = 'var(--text-tertiary)';
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {/* Add New Checklist Item */}
                      <div 
                        className="flex items-center gap-2 p-2 rounded-lg border-2 border-dashed transition-colors"
                        style={{
                          borderColor: 'var(--border-secondary)',
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-secondary)';
                        }}
                      >
                        <Plus className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
                        <input
                          type="text"
                          placeholder="Add checklist item..."
                          value={newChecklistText}
                          onChange={(e) => setNewChecklistText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddChecklistItem();
                          }}
                          className="flex-1 text-sm bg-transparent border-none outline-none"
                          style={{
                            color: 'var(--text-primary)',
                            caretColor: 'var(--accent-primary)'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Attachments - Upload, Preview, Delete */}
                  <div 
                    className="pt-6 border-t"
                    style={{ borderColor: 'var(--border-secondary)' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Attachments
                      </h3>
                      <button
                        className="text-xs font-medium px-2 py-1 rounded transition-all inline-flex items-center gap-1"
                        style={{ color: 'var(--accent-primary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload
                      </button>
                    </div>

                    {attachments.length > 0 ? (
                      <div className="space-y-2">
                        {attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center gap-3 p-3 rounded-lg border transition-colors group"
                            style={{
                              borderColor: 'var(--border-primary)',
                              backgroundColor: 'var(--surface-secondary)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = 'var(--border-hover)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'var(--border-primary)';
                            }}
                          >
                            <File className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent-primary)' }} />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                {attachment.name}
                              </div>
                              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                {attachment.size} • {attachment.uploadedBy} • {attachment.uploadedAt}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteAttachment(attachment.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              style={{ color: 'var(--text-tertiary)' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--status-burning)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--text-tertiary)';
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors"
                        style={{ 
                          borderColor: 'var(--border-secondary)',
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-hover)';
                          e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-secondary)';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Paperclip className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-tertiary)' }} />
                        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                          No attachments yet
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                          Drop files here or click upload
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="p-6 space-y-6">
                  {/* Add Comment */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Comments
                    </h3>
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback 
                          className="text-xs"
                          style={{ 
                            backgroundColor: 'var(--accent-secondary)',
                            color: 'white'
                          }}
                        >
                          You
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg border resize-none text-sm outline-none focus:ring-2"
                          style={{
                            backgroundColor: 'var(--surface-secondary)',
                            borderColor: 'var(--border-primary)',
                            color: 'var(--text-primary)',
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'var(--accent-primary)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-primary)';
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                              handleAddComment();
                            }
                          }}
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{
                              backgroundColor: newComment.trim() ? 'var(--accent-primary)' : 'var(--surface-tertiary)',
                              color: newComment.trim() ? 'white' : 'var(--text-tertiary)',
                              cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                              opacity: newComment.trim() ? 1 : 0.5
                            }}
                          >
                            Post Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comments List - Editable/Deletable for own comments */}
                  <div 
                    className="pt-6 border-t space-y-4"
                    style={{ borderColor: 'var(--border-secondary)' }}
                  >
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 group">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback 
                            className="text-xs"
                            style={{ 
                              backgroundColor: comment.isOwn ? 'var(--accent-secondary)' : 'var(--surface-tertiary)',
                              color: comment.isOwn ? 'white' : 'var(--text-primary)'
                            }}
                          >
                            {comment.author.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              {comment.author}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                              {comment.timestamp}
                            </span>
                            {comment.isOwn && (
                              <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setEditingCommentText(comment.text);
                                  }}
                                  className="p-1 rounded transition-colors"
                                  style={{ color: 'var(--text-tertiary)' }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                                    e.currentTarget.style.color = 'var(--text-primary)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-tertiary)';
                                  }}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="p-1 rounded transition-colors"
                                  style={{ color: 'var(--text-tertiary)' }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                                    e.currentTarget.style.color = 'var(--status-burning)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-tertiary)';
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                          {editingCommentId === comment.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={editingCommentText}
                                onChange={(e) => setEditingCommentText(e.target.value)}
                                rows={2}
                                className="w-full px-2 py-1.5 rounded border text-sm outline-none resize-none"
                                style={{
                                  backgroundColor: 'var(--input-bg)',
                                  borderColor: 'var(--accent-primary)',
                                  color: 'var(--text-primary)',
                                }}
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                    handleEditComment(comment.id);
                                  } else if (e.key === 'Escape') {
                                    setEditingCommentId(null);
                                    setEditingCommentText('');
                                  }
                                }}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditComment(comment.id)}
                                  className="px-2 py-1 rounded text-xs font-medium transition-colors"
                                  style={{
                                    backgroundColor: 'var(--accent-primary)',
                                    color: 'white'
                                  }}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingCommentId(null);
                                    setEditingCommentText('');
                                  }}
                                  className="px-2 py-1 rounded text-xs font-medium transition-colors"
                                  style={{
                                    backgroundColor: 'var(--surface-tertiary)',
                                    color: 'var(--text-secondary)'
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                              {comment.text}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
