/**
 * AddTaskModal Component
 * Apple-style premium SaaS task creation modal
 * Focused, clean, intuitive interface with color-coded Priority and Status
 */

import { useState, useEffect, useRef } from 'react';
import { useCreateTask, useUpdateTask } from '@/hooks/api/useTasks';
import { useProjects } from '@/hooks/api/useProjects';
import { useUsers } from '@/hooks/api/useUsers';
import type { CreateTaskDto, UpdateTaskDto, TaskPriority, TaskStatus, WorkType } from '@/types/api';
import { ModalHeader } from './ModalHeader';
import {
  ChevronDown,
  Calendar,
  User,
  Users,
  Tag,
  FileText,
  CheckCircle2,
  ChevronRight,
  Check,
} from 'lucide-react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any; // Task data for edit mode
  mode?: 'create' | 'edit'; // Modal mode
  defaultProjectId?: string; // Default project to pre-select
  parentTaskId?: string; // Pre-populate parent task (subtask creation)
  parentTaskTitle?: string; // Display name for the parent task field
}

// Status options derived from TaskStatus enum
const STATUS_OPTIONS: Array<{ value: TaskStatus; label: string }> = [
  { value: 'PLANNING',        label: 'Planning' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW',   label: 'In Review' },
  { value: 'DONE',        label: 'Done' },
  { value: 'CANCELLED',   label: 'Cancelled' },
];

// Priority options derived from TaskPriority enum
const PRIORITY_OPTIONS: Array<{ value: TaskPriority; label: string }> = [
  { value: 'LOW',    label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH',   label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

// Work type options matching backend enum values
const WORK_TYPE_OPTIONS: Array<{ value: WorkType; label: string }> = [
  { value: 'architecture',       label: 'Architecture' },
  { value: 'interior_design',    label: 'Interior Design' },
  { value: 'exterior_design',    label: 'Exterior Design' },
  { value: 'landscape',          label: 'Landscape' },
  { value: 'working_drawings',   label: 'Working Drawings' },
  { value: '3d_visualization',   label: '3D Visualization' },
  { value: 'author_supervision', label: 'Author Supervision' },
  { value: 'documentation',      label: 'Documentation' },
  { value: 'engineering',        label: 'Engineering' },
  { value: 'client_coordination',label: 'Client Coordination' },
];

// Unit options — static measurement units
const UNIT_OPTIONS = ['m²', 'm³', 'kg', 'pcs', 'hours'];

// Resolve status: accepts enum values ('IN_PROGRESS'), display names ('In Progress'),
// or legacy app-specific strings ('Burning', 'Start', 'End', 'Late')
function resolveStatus(status: string): string {
  if (!status) return '';
  const byValue = STATUS_OPTIONS.find(o => o.value === status);
  if (byValue) return byValue.value;
  const byLabel = STATUS_OPTIONS.find(o => o.label.toLowerCase() === status.toLowerCase());
  if (byLabel) return byLabel.value;
  // Legacy display strings used in mock data
  const LEGACY: Record<string, TaskStatus> = {
    'Start':   'TODO',
    'End':     'DONE',
    'Burning': 'IN_PROGRESS',
    'Late':    'IN_PROGRESS',
  };
  return LEGACY[status] ?? '';
}

// Resolve workType: accepts both enum values ('architecture') and display names ('Architecture')
function resolveWorkType(workType: string): string {
  if (!workType) return '';
  const byValue = WORK_TYPE_OPTIONS.find(o => o.value === workType);
  if (byValue) return byValue.value;
  const byLabel = WORK_TYPE_OPTIONS.find(o => o.label.toLowerCase() === workType.toLowerCase());
  return byLabel ? byLabel.value : '';
}

// Priority color config keyed by API enum value
const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case 'LOW':    return { color: 'var(--priority-low)',    bgColor: 'var(--priority-low-bg)' };
    case 'MEDIUM': return { color: 'var(--priority-medium)', bgColor: 'var(--priority-medium-bg)' };
    case 'HIGH':   return { color: 'var(--priority-high)',   bgColor: 'var(--priority-high-bg)' };
    case 'URGENT': return { color: 'var(--status-late)',     bgColor: 'var(--status-late-bg)' };
    default:       return { color: 'var(--text-tertiary)',   bgColor: 'var(--surface-tertiary)' };
  }
};

export function AddTaskModal({ isOpen, onClose, initialData, mode = 'create', defaultProjectId, parentTaskId, parentTaskTitle }: AddTaskModalProps) {
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { data: projects = [] } = useProjects();
  const { data: users = [] } = useUsers();
  const [showAdvanced, setShowAdvanced] = useState(mode === 'edit');
  const [showParticipants, setShowParticipants] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: defaultProjectId || '',
    assignee: '',
    participants: [] as string[],
    status: '',
    priority: 'MEDIUM' as TaskPriority,
    startDate: '',
    dueDate: '',
    estimatedDays: '',
    labels: [] as string[],
    typeOfWork: '' as WorkType | '',
    volume: '',
    unit: '',
    acceptanceStatus: 'Pending review',
    progress: 0,
    comments: ''
  });

  // Populate form data when initialData changes (edit mode)
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        project: initialData.projectId || initialData.project || '',
        assignee: initialData.assignee?.id || '',
        participants: (initialData.participants?.map((p: any) => p.id).filter(Boolean)) || [],
        status: resolveStatus(initialData.statusKey || initialData.status || ''),
        priority: (initialData.priorityKey || initialData.priority || 'MEDIUM') as TaskPriority,
        startDate: initialData.dateStart || initialData.startDate || '',
        dueDate: initialData.dateEnd || initialData.dueDate || '',
        estimatedDays: initialData.estimatedHours != null ? String(initialData.estimatedHours / 24) : '',
        labels: initialData.labels || [],
        typeOfWork: resolveWorkType(initialData.workType || '') as WorkType | '',
        volume: initialData.volume != null ? String(initialData.volume) : '',
        unit: initialData.unit || '',
        acceptanceStatus: initialData.acceptance || initialData.acceptanceStatus || 'Pending review',
        progress: initialData.progress ?? 0,
        comments: initialData.comments || ''
      });
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        title: '',
        description: '',
        project: defaultProjectId || '',
        assignee: '',
        participants: [],
        status: '',
        priority: 'MEDIUM' as TaskPriority,
        startDate: '',
        dueDate: '',
        estimatedDays: '',
        labels: [],
        typeOfWork: '' as WorkType | '',
        volume: '',
        unit: '',
        acceptanceStatus: 'Pending review',
        progress: 0,
        comments: ''
      });
    }
  }, [initialData, mode, isOpen, defaultProjectId]);

  // Auto-focus on title input when modal opens
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Disable background interactions when modal is open
  useEffect(() => {
    if (isOpen) {
      const root = document.getElementById('root');
      if (root) {
        root.style.pointerEvents = 'none';
      }
      return () => {
        if (root) {
          root.style.pointerEvents = '';
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const buildCreateDto = (): CreateTaskDto => ({
    title: formData.title,
    description: formData.description || undefined,
    projectId: formData.project || 'default',
    assigneeId: formData.assignee || undefined,
    participantIds: formData.participants.length > 0 ? formData.participants : undefined,
    priority: formData.priority,
    startDate: formData.startDate || undefined,
    dueDate: formData.dueDate || undefined,
    estimatedHours: formData.estimatedDays ? parseFloat(formData.estimatedDays) * 24 : undefined,
    workType: formData.typeOfWork || undefined,
    parentId: parentTaskId || undefined,
  });

  const buildUpdateDto = (): UpdateTaskDto => ({
    title: formData.title,
    description: formData.description || undefined,
    assigneeId: formData.assignee || undefined,
    participantIds: formData.participants.length > 0 ? formData.participants : undefined,
    priority: formData.priority,
    status: formData.status as TaskStatus || undefined,
    startDate: formData.startDate || undefined,
    dueDate: formData.dueDate || undefined,
    estimatedHours: formData.estimatedDays ? parseFloat(formData.estimatedDays) * 24 : undefined,
    workType: formData.typeOfWork || undefined,
    progress: formData.progress,
  });

  const handleSave = () => {
    if (!formData.title.trim()) return;
    if (mode === 'edit' && initialData?.id) {
      updateTask.mutate({ id: initialData.id, dto: buildUpdateDto() }, { onSuccess: () => onClose() });
    } else {
      createTask.mutate(buildCreateDto(), { onSuccess: () => onClose() });
    }
  };

  const handleSaveAndView = () => {
    if (!formData.title.trim()) return;
    if (mode === 'edit' && initialData?.id) {
      updateTask.mutate({ id: initialData.id, dto: buildUpdateDto() }, { onSuccess: () => onClose() });
    } else {
      createTask.mutate(buildCreateDto(), { onSuccess: () => onClose() });
    }
  };

  return (
    <>
      {/* Subtle Blur Layer - No dim, no color change */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          zIndex: 49,
          pointerEvents: 'none'
        }}
      />
      
      {/* Modal Container */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ pointerEvents: 'auto' }}
      >
        {/* Modal Content */}
        <div
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl"
          style={{
            backgroundColor: 'var(--surface-primary)',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 1px rgba(0, 0, 0, 0.2)'
          }}
        >
          <ModalHeader title={mode === 'edit' ? 'Edit Task' : 'New Task'} onClose={onClose} />

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-6 py-6" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--border-secondary) transparent'
          }}>
            {/* Primary Fields */}
            <div className="space-y-5">
              {/* Task Title */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Task title *
                </label>
                <input
                  ref={titleInputRef}
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter task title..."
                  className="w-full px-4 py-2.5 rounded-lg outline-none transition-all text-sm"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add a description..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg outline-none transition-all text-sm resize-none"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              {/* Assignment Section */}
              <div className="space-y-4 pt-4">
                <h3 
                  className="text-sm font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Assignment
                </h3>
                
                {/* Read-only parent task banner — shown only in subtask mode */}
                {parentTaskId && (
                  <div className="grid grid-cols-2 gap-4 mb-0">
                    <ReadonlyField
                      label="Project"
                      icon={<FileText style={{ width: '14px', height: '14px' }} />}
                      value={projects.find(p => p.id === formData.project)?.name ?? formData.project ?? '—'}
                    />
                    <ReadonlyField
                      label="Parent task"
                      icon={<ChevronRight style={{ width: '14px', height: '14px' }} />}
                      value={parentTaskTitle ?? parentTaskId}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {/* Project — hidden in subtask mode (pre-populated & read-only above) */}
                  {!parentTaskId && (
                  <SelectField
                    label="Project"
                    value={formData.project}
                    onChange={(value) => setFormData({ ...formData, project: value })}
                    options={projects.map(p => ({ value: p.id, label: p.name }))}
                    placeholder="Select project"
                    icon={<FileText style={{ width: '14px', height: '14px' }} />}
                  />
                  )}

                  {/* Assignee */}
                  <SelectField
                    label="Assignee"
                    value={formData.assignee}
                    onChange={(value) => setFormData({ ...formData, assignee: value })}
                    options={users.map(u => ({ value: u.id, label: u.name }))}
                    placeholder="Select assignee"
                    icon={<User style={{ width: '14px', height: '14px' }} />}
                  />
                </div>

                {/* Participants */}
                <div className="relative">
                  <label
                    className="block text-xs font-medium mb-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Participants
                  </label>
                  <button
                    onClick={() => setShowParticipants(!showParticipants)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      border: '1px solid var(--border-primary)',
                      color: formData.participants.length > 0 ? 'var(--text-primary)' : 'var(--text-tertiary)'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Users style={{ width: '14px', height: '14px' }} />
                      <span className="text-xs">
                        {formData.participants.length > 0
                          ? `${formData.participants.length} participant${formData.participants.length > 1 ? 's' : ''} selected`
                          : 'Add participants...'}
                      </span>
                    </div>
                    <ChevronDown style={{ width: '14px', height: '14px', transform: showParticipants ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                  </button>
                  {showParticipants && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowParticipants(false)} />
                      <div
                        className="absolute top-full left-0 mt-1 w-full rounded-lg overflow-hidden z-20 max-h-48 overflow-y-auto"
                        style={{
                          backgroundColor: 'var(--surface-primary)',
                          border: '1px solid var(--border-primary)',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                        }}
                      >
                        {users.map(user => {
                          const isSelected = formData.participants.includes(user.id);
                          return (
                            <button
                              key={user.id}
                              onClick={() => {
                                const next = isSelected
                                  ? formData.participants.filter(id => id !== user.id)
                                  : [...formData.participants, user.id];
                                setFormData({ ...formData, participants: next });
                              }}
                              className="w-full flex items-center justify-between px-4 py-2.5 transition-colors"
                              style={{
                                color: 'var(--text-primary)',
                                backgroundColor: isSelected ? 'var(--surface-hover)' : 'transparent'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                              onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                              <span className="text-xs">{user.name}</span>
                              {isSelected && <Check style={{ width: '12px', height: '12px', color: 'var(--accent-primary)' }} />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Status & Planning */}
              <div className="space-y-4 pt-4">
                <h3
                  className="text-sm font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Planning
                </h3>

                {/* Status & Priority */}
                <div className={`grid gap-4 ${mode === 'edit' ? 'grid-cols-2' : 'w-1/2 pr-2'}`}>
                  {mode === 'edit' && (
                    <SelectField
                      label="Status"
                      value={formData.status}
                      onChange={(value) => setFormData({ ...formData, status: value })}
                      options={STATUS_OPTIONS}
                      placeholder="Select status"
                    />
                  )}
                  <PrioritySelect
                    label="Priority"
                    value={formData.priority}
                    onChange={(value) => setFormData({ ...formData, priority: value as TaskPriority })}
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div>
                    <label
                      className="block text-xs font-medium mb-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Start date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg outline-none text-xs pr-10"
                        style={{
                          backgroundColor: 'var(--surface-secondary)',
                          border: '1px solid var(--border-primary)',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <Calendar style={{ width: '14px', height: '14px', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label
                      className="block text-xs font-medium mb-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Due date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg outline-none text-xs pr-10"
                        style={{
                          backgroundColor: 'var(--surface-secondary)',
                          border: '1px solid var(--border-primary)',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <Calendar style={{ width: '14px', height: '14px', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
                    </div>
                  </div>
                </div>

                {/* Estimated days */}
                <div className="w-1/2 pr-2">
                  <label
                    className="block text-xs font-medium mb-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Estimated duration (days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.estimatedDays}
                    onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
                    placeholder="e.g. 2.5"
                    className="w-full px-4 py-2.5 rounded-lg outline-none text-xs"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </div>

              {/* Advanced Options - Collapsible */}
              <div className="pt-4">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  <ChevronRight 
                    style={{ 
                      width: '16px', 
                      height: '16px',
                      transform: showAdvanced ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }} 
                  />
                  Additional details
                </button>

                {showAdvanced && (
                  <div className="mt-4 space-y-4 pl-6 border-l-2" style={{ borderColor: 'var(--border-secondary)' }}>
                    {/* Labels */}
                    <div>
                      <label 
                        className="block text-xs font-medium mb-2"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Labels
                      </label>
                      <button
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm"
                        style={{
                          backgroundColor: 'var(--surface-secondary)',
                          border: '1px solid var(--border-primary)',
                          color: 'var(--text-tertiary)'
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Tag style={{ width: '14px', height: '14px' }} />
                          <span className="text-xs">Add labels...</span>
                        </div>
                      </button>
                    </div>

                    {/* Type of Work */}
                    <SelectField
                      label="Type of work"
                      value={formData.typeOfWork}
                      onChange={(value) => setFormData({ ...formData, typeOfWork: value as WorkType })}
                      options={WORK_TYPE_OPTIONS}
                      placeholder="Select type"
                    />

                    {/* Volume & Unit */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label 
                          className="block text-xs font-medium mb-2"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          Volume
                        </label>
                        <input
                          type="number"
                          value={formData.volume}
                          onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                          placeholder="0"
                          className="w-full px-4 py-2.5 rounded-lg outline-none text-xs"
                          style={{
                            backgroundColor: 'var(--surface-secondary)',
                            border: '1px solid var(--border-primary)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>

                      <SelectField
                        label="Unit"
                        value={formData.unit}
                        onChange={(value) => setFormData({ ...formData, unit: value })}
                        options={UNIT_OPTIONS}
                        placeholder="Select unit"
                      />
                    </div>

                    {/* Acceptance Status */}
                    <SelectField
                      label="Acceptance status"
                      value={formData.acceptanceStatus}
                      onChange={(value) => setFormData({ ...formData, acceptanceStatus: value })}
                      options={[
                        'Pending review',
                        'Approved',
                        'Rejected',
                        'Needs revision'
                      ]}
                      icon={<CheckCircle2 style={{ width: '14px', height: '14px' }} />}
                    />

                    {/* Progress */}
                    <div>
                      <label 
                        className="flex items-center justify-between text-xs font-medium mb-2"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <span>Progress</span>
                        <span style={{ color: 'var(--accent-primary)' }}>{formData.progress}%</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.progress}
                        onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                        className="w-full"
                        style={{
                          accentColor: 'var(--accent-primary)'
                        }}
                      />
                    </div>

                    {/* Comments */}
                    <div>
                      <label 
                        className="block text-xs font-medium mb-2"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Comments
                      </label>
                      <textarea
                        value={formData.comments}
                        onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                        placeholder="Add comments..."
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-lg outline-none text-xs resize-none"
                        style={{
                          backgroundColor: 'var(--surface-secondary)',
                          border: '1px solid var(--border-primary)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div 
            className="flex items-center justify-end gap-3 px-6 py-4 border-t"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            {/* Cancel */}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ 
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              Cancel
            </button>

            {/* Save and View */}
            <button
              onClick={handleSaveAndView}
              className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ 
                backgroundColor: 'var(--surface-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              Save and view
            </button>

            {/* Save - Primary */}
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ 
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff'
              }}
            >
              {mode === 'edit' ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Reusable Select Field Component
interface SelectOption { value: string; label: string; }
interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[] | SelectOption[];
  placeholder?: string;
  icon?: React.ReactNode;
}

function ReadonlyField({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      <div
        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs"
        style={{
          backgroundColor: 'var(--surface-tertiary, var(--surface-secondary))',
          border: '1px solid var(--border-primary)',
          color: 'var(--text-tertiary)',
          cursor: 'default',
          opacity: 0.8,
        }}
      >
        {icon}
        <span className="truncate">{value}</span>
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder, icon }: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const normalized: SelectOption[] = options.map(o => typeof o === 'string' ? { value: o, label: o } : o);
  const selectedLabel = normalized.find(o => o.value === value)?.label;

  return (
    <div className="relative">
      <label
        className="block text-xs font-medium mb-2"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </label>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all"
        style={{
          backgroundColor: 'var(--surface-secondary)',
          border: '1px solid var(--border-primary)',
          color: value ? 'var(--text-primary)' : 'var(--text-tertiary)'
        }}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs">{selectedLabel || placeholder || 'Select...'}</span>
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
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div
            className="absolute top-full left-0 mt-1 w-full rounded-lg overflow-hidden z-20 max-h-48 overflow-y-auto"
            style={{
              backgroundColor: 'var(--surface-primary)',
              border: '1px solid var(--border-primary)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
            }}
          >
            {normalized.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 transition-colors"
                style={{
                  color: 'var(--text-primary)',
                  backgroundColor: value === option.value ? 'var(--surface-hover)' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  if (value !== option.value) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span className="text-xs">{option.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}


// Priority Select Field Component with Colors
interface PrioritySelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function PrioritySelect({ label, value, onChange }: PrioritySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedConfig = value ? getPriorityConfig(value) : null;
  const selectedLabel = PRIORITY_OPTIONS.find(o => o.value === value)?.label ?? value;

  return (
    <div className="relative">
      <label 
        className="block text-xs font-medium mb-2"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </label>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all"
        style={{
          backgroundColor: selectedConfig ? selectedConfig.bgColor : 'var(--surface-secondary)',
          border: `1px solid ${selectedConfig ? selectedConfig.color + '33' : 'var(--border-primary)'}`,
          color: selectedConfig ? selectedConfig.color : 'var(--text-tertiary)'
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{selectedLabel || 'Select priority...'}</span>
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
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div
            className="absolute top-full left-0 mt-1 w-full rounded-lg overflow-hidden z-20"
            style={{
              backgroundColor: 'var(--surface-primary)',
              border: '1px solid var(--border-primary)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            {PRIORITY_OPTIONS.map((option) => {
              const config = getPriorityConfig(option.value);
              const isSelected = value === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 transition-all"
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
                  <div className="flex items-center gap-2.5 pl-1">
                    <span className="text-xs font-semibold" style={{ color: config.color }}>
                      {option.label}
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