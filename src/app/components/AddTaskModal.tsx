/**
 * AddTaskModal Component
 * Apple-style premium SaaS task creation modal
 * Focused, clean, intuitive interface with color-coded Priority and Status
 */

import { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ChevronDown, 
  Calendar,
  User,
  Users,
  Tag,
  FileText,
  BarChart3,
  CheckCircle2,
  MessageSquare,
  ChevronRight,
  Play,
  Activity,
  Clock,
  Check,
  AlertCircle,
  XCircle,
  CircleDot
} from 'lucide-react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any; // Task data for edit mode
  mode?: 'create' | 'edit'; // Modal mode
  defaultProjectId?: string; // Default project to pre-select
}

// Priority configuration - uses theme variables
const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case 'Low':
      return { color: 'var(--priority-low)', bgColor: 'var(--priority-low-bg)' };
    case 'Medium':
      return { color: 'var(--priority-medium)', bgColor: 'var(--priority-medium-bg)' };
    case 'High':
      return { color: 'var(--priority-high)', bgColor: 'var(--priority-high-bg)' };
    default:
      return { color: 'var(--text-tertiary)', bgColor: 'var(--surface-tertiary)' };
  }
};

// Status configuration - uses theme variables
const getStatusConfig = (status: string): { icon: React.ReactNode; color: string; bgColor: string } => {
  const baseIconStyle = { width: '14px', height: '14px' };
  
  switch (status) {
    case 'Not Started':
      return {
        icon: <CircleDot style={baseIconStyle} />,
        color: 'var(--text-tertiary)',
        bgColor: 'var(--surface-tertiary)'
      };
    case 'Started':
      return {
        icon: <Play style={baseIconStyle} />,
        color: 'var(--status-start)',
        bgColor: 'var(--status-start-bg)'
      };
    case 'In Progress':
      return {
        icon: <Activity style={baseIconStyle} />,
        color: 'var(--status-progress)',
        bgColor: 'var(--status-progress-bg)'
      };
    case 'Pending review':
      return {
        icon: <Clock style={baseIconStyle} />,
        color: 'var(--status-burning)',
        bgColor: 'var(--status-burning-bg)'
      };
    case 'Late':
      return {
        icon: <AlertCircle style={baseIconStyle} />,
        color: 'var(--status-late)',
        bgColor: 'var(--status-late-bg)'
      };
    case 'Completed':
      return {
        icon: <Check style={baseIconStyle} />,
        color: 'var(--status-end)',
        bgColor: 'var(--status-end-bg)'
      };
    default:
      return {
        icon: <CircleDot style={baseIconStyle} />,
        color: 'var(--text-tertiary)',
        bgColor: 'var(--surface-tertiary)'
      };
  }
};

export function AddTaskModal({ isOpen, onClose, initialData, mode = 'create', defaultProjectId }: AddTaskModalProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: defaultProjectId || '',
    assignee: 'Sarah Johnson',
    participants: [] as string[],
    status: 'Not Started',
    priority: 'Medium',
    startDate: '',
    dueDate: '',
    labels: [] as string[],
    typeOfWork: '',
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
        project: initialData.project || '',
        assignee: initialData.assignee?.name || 'Sarah Johnson',
        participants: initialData.participants?.map((p: any) => p.name) || [],
        status: initialData.status || 'Not Started',
        priority: initialData.priority || 'Medium',
        startDate: initialData.dateStart || '',
        dueDate: initialData.dateEnd || '',
        labels: initialData.labels || [],
        typeOfWork: initialData.workType || '',
        volume: initialData.volume || '',
        unit: initialData.unit || '',
        acceptanceStatus: initialData.acceptance || 'Pending review',
        progress: initialData.progress || 0,
        comments: initialData.comments || ''
      });
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        title: '',
        description: '',
        project: defaultProjectId || '',
        assignee: 'Sarah Johnson',
        participants: [],
        status: 'Not Started',
        priority: 'Medium',
        startDate: '',
        dueDate: '',
        labels: [],
        typeOfWork: '',
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

  const handleSave = () => {
    console.log('Save task:', formData);
    onClose();
  };

  const handleSaveAndView = () => {
    console.log('Save and view task:', formData);
    onClose();
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
          {/* Header */}
          <div 
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <h2 
              className="text-lg font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {mode === 'edit' ? 'Edit Task' : 'New Task'}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>

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
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Project */}
                  <SelectField
                    label="Project"
                    value={formData.project}
                    onChange={(value) => setFormData({ ...formData, project: value })}
                    options={[
                      'Mehnat bozorini',
                      'Xolis Ismailov',
                      'John Company',
                      'Tech Solutions'
                    ]}
                    placeholder="Select project"
                    icon={<FileText style={{ width: '14px', height: '14px' }} />}
                  />

                  {/* Assignee */}
                  <SelectField
                    label="Assignee"
                    value={formData.assignee}
                    onChange={(value) => setFormData({ ...formData, assignee: value })}
                    options={[
                      'Sarah Johnson',
                      'Alex Kim',
                      'Mike Chen',
                      'Emma Wilson'
                    ]}
                    icon={<User style={{ width: '14px', height: '14px' }} />}
                  />
                </div>

                {/* Participants */}
                <div>
                  <label 
                    className="block text-xs font-medium mb-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Participants
                  </label>
                  <button
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-tertiary)'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Users style={{ width: '14px', height: '14px' }} />
                      <span className="text-xs">Add participants...</span>
                    </div>
                    <ChevronDown style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              </div>

              {/* Status & Planning */}
              <div className="space-y-4 pt-4">
                <h3 
                  className="text-sm font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Status & Planning
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Status */}
                  <StatusSelect
                    label="Status"
                    value={formData.status}
                    onChange={(value) => setFormData({ ...formData, status: value })}
                  />

                  {/* Priority */}
                  <PrioritySelect
                    label="Priority"
                    value={formData.priority}
                    onChange={(value) => setFormData({ ...formData, priority: value })}
                  />

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
                      <Calendar 
                        style={{ 
                          width: '14px', 
                          height: '14px',
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--text-tertiary)',
                          pointerEvents: 'none'
                        }} 
                      />
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
                      <Calendar 
                        style={{ 
                          width: '14px', 
                          height: '14px',
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--text-tertiary)',
                          pointerEvents: 'none'
                        }} 
                      />
                    </div>
                  </div>
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
                      onChange={(value) => setFormData({ ...formData, typeOfWork: value })}
                      options={[
                        'Architecture',
                        'Construction',
                        'Design',
                        'Engineering',
                        'Planning'
                      ]}
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
                        options={['m²', 'm³', 'kg', 'pcs', 'hours']}
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
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 transition-colors"
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

// Status Select Field Component with Icons and Colors
interface StatusSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function StatusSelect({ label, value, onChange }: StatusSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedConfig = value ? getStatusConfig(value) : null;
  
  const statusOptions = ['Not Started', 'Started', 'In Progress', 'Pending review', 'Late', 'Completed'];

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
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div
            className="absolute top-full left-0 mt-1 w-full rounded-lg overflow-hidden z-20 max-h-64 overflow-y-auto"
            style={{
              backgroundColor: 'var(--surface-primary)',
              border: '1px solid var(--border-primary)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            {statusOptions.map((option) => {
              const config = getStatusConfig(option);
              const isSelected = value === option;
              
              return (
                <button
                  key={option}
                  onClick={() => {
                    onChange(option);
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

// Priority Select Field Component with Colors
interface PrioritySelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function PrioritySelect({ label, value, onChange }: PrioritySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedConfig = value ? getPriorityConfig(value) : null;
  
  const priorityOptions = ['Low', 'Medium', 'High'];

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
            {priorityOptions.map((option) => {
              const config = getPriorityConfig(option);
              const isSelected = value === option;
              
              return (
                <button
                  key={option}
                  onClick={() => {
                    onChange(option);
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