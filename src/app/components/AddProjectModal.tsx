/**
 * AddProjectModal Component
 * Apple-style premium SaaS project creation modal
 * Matches AddTaskModal design and structure
 */

import { useState, useEffect, useRef } from 'react';
import { useCreateProject } from '@/hooks/api/useProjects';
import { useClients } from '@/hooks/api/useClients';
import type { CreateProjectDto, ProjectType } from '@/types/api';
import { 
  X, 
  ChevronDown, 
  Calendar,
  Building2,
  Layers,
  Flag,
  FileText,
  DollarSign,
  Ruler,
  CalendarDays,
  Check,
  AlertCircle,
  Play,
  Activity,
  Clock,
  CircleDot
} from 'lucide-react';
// import { useBudget, parseBudgetInput, formatBudget } from '@/app/contexts/BudgetContext';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  mode?: 'create' | 'edit';
}

// Status configuration - uses theme variables
const getStatusConfig = (status: string): { icon: React.ReactNode; color: string; bgColor: string } => {
  const baseIconStyle = { width: '14px', height: '14px' };
  
  switch (status) {
    case 'Start':
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
    case 'Burning':
      return {
        icon: <AlertCircle style={baseIconStyle} />,
        color: 'var(--status-burning)',
        bgColor: 'var(--status-burning-bg)'
      };
    case 'Late':
      return {
        icon: <Clock style={baseIconStyle} />,
        color: 'var(--status-late)',
        bgColor: 'var(--status-late-bg)'
      };
    case 'End':
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

// Priority configuration - uses theme variables
const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case 'Low':
      return { color: 'var(--priority-low)', bgColor: 'var(--priority-low-bg)' };
    case 'Medium':
      return { color: 'var(--priority-medium)', bgColor: 'var(--priority-medium-bg)' };
    case 'High':
      return { color: 'var(--priority-high)', bgColor: 'var(--priority-high-bg)' };
    case 'Critical':
      return { color: 'var(--priority-critical)', bgColor: 'var(--priority-critical-bg)' };
    default:
      return { color: 'var(--text-tertiary)', bgColor: 'var(--surface-tertiary)' };
  }
};

const PROJECT_TYPE_MAP: Record<string, ProjectType> = {
  'Residential': 'RESIDENTIAL',
  'Commercial': 'COMMERCIAL',
  'Industrial': 'INDUSTRIAL',
  'Mixed Use': 'OTHER',
  'Interior': 'OTHER',
};

const PRIORITY_MAP: Record<string, string> = {
  'Low': 'LOW',
  'Medium': 'MEDIUM',
  'High': 'HIGH',
  'Critical': 'URGENT',
};

export function AddProjectModal({ isOpen, onClose, initialData, mode = 'create' }: AddProjectModalProps) {
  const titleInputRef = useRef<HTMLInputElement>(null);
  const createProject = useCreateProject();
  const { data: clients = [] } = useClients();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientId: '',
    projectType: '',
    priority: 'Medium',
    startDate: '',
    endDate: '',
    price: '',
    area: '',
    unit: 'm²',
    year: '',
    cost: '',
    labels: [] as string[],
  });

  // Populate form data when initialData changes (edit mode)
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        title: initialData.name || '',
        description: initialData.description || '',
        clientId: initialData.clientId || '',
        projectType: initialData.type || '',
        priority: initialData.priority || 'Medium',
        startDate: initialData.dateStart || '',
        endDate: initialData.dateEnd || '',
        price: initialData.price || '',
        area: initialData.kvadratura || '',
        unit: 'm²',
        year: initialData.year || '',
        cost: initialData.cost || '',
        labels: initialData.labels || [],
      });
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        title: '',
        description: '',
        clientId: '',
        projectType: '',
        priority: 'Medium',
        startDate: '',
        endDate: '',
        price: '',
        area: '',
        unit: 'm²',
        year: '',
        cost: '',
        labels: [],
      });
    }
  }, [initialData, mode]);

  // Focus title input when modal opens
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const buildDto = (): CreateProjectDto => ({
    name: formData.title,
    description: formData.description || undefined,
    projectType: formData.projectType ? (PROJECT_TYPE_MAP[formData.projectType] ?? 'OTHER') : undefined,
    priority: formData.priority ? (PRIORITY_MAP[formData.priority] ?? formData.priority) : undefined,
    clientId: formData.clientId || undefined,
    startDate: formData.startDate || undefined,
    dueDate: formData.endDate || undefined,
    areaSqm: formData.area ? parseFloat(formData.area) : undefined,
    budget: formData.cost ? parseFloat(formData.cost) : undefined,
  });

  const handleSave = () => {
    if (!formData.title.trim()) return;
    createProject.mutate(buildDto(), { onSuccess: () => onClose() });
  };

  const handleSaveAndView = () => {
    if (!formData.title.trim()) return;
    createProject.mutate(buildDto(), { onSuccess: () => onClose() });
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
          {/* Header - Sticky */}
          <div 
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <h2 
              className="text-lg font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {mode === 'edit' ? 'Edit Project' : 'New Project'}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-6 py-6" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--border-secondary) transparent'
          }}>
            <div className="space-y-5">
              {/* Basic Info Section */}
              <div className="space-y-4">
                {/* Project Title */}
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Project title *
                  </label>
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter project title..."
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
                  {/* Client */}
                  <SelectField
                    label="Client"
                    value={clients.find(c => c.id === formData.clientId)?.name ?? ''}
                    onChange={(name) => {
                      const client = clients.find(c => c.name === name);
                      setFormData({ ...formData, clientId: client?.id ?? '' });
                    }}
                    options={clients.map(c => c.name)}
                    placeholder="Select client"
                    icon={<Building2 style={{ width: '14px', height: '14px' }} />}
                  />

                  {/* Project Type */}
                  <SelectField
                    label="Project type"
                    value={formData.projectType}
                    onChange={(value) => setFormData({ ...formData, projectType: value })}
                    options={['Residential', 'Commercial', 'Industrial', 'Mixed Use', 'Interior']}
                    placeholder="Select type"
                    icon={<Layers style={{ width: '14px', height: '14px' }} />}
                  />
                </div>
              </div>

              {/* Planning Section */}
              <div className="space-y-4 pt-4">
                <h3
                  className="text-sm font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Planning
                </h3>

                {/* Priority */}
                <PrioritySelectField
                  label="Priority"
                  value={formData.priority}
                  onChange={(value) => setFormData({ ...formData, priority: value })}
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div>
                    <label 
                      className="block text-xs font-medium mb-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Start date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg outline-none transition-all text-xs"
                      style={{
                        backgroundColor: 'var(--surface-secondary)',
                        border: '1px solid var(--border-secondary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label 
                      className="block text-xs font-medium mb-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      End date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg outline-none transition-all text-xs"
                      style={{
                        backgroundColor: 'var(--surface-secondary)',
                        border: '1px solid var(--border-secondary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Project Details Section */}
              <div className="space-y-4 pt-4">
                <h3 
                  className="text-sm font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Project Details
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Price */}
                  <div>
                    <label 
                      className="block text-xs font-medium mb-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Price
                    </label>
                    <div className="relative">
                      <DollarSign 
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ width: '14px', height: '14px', color: 'var(--text-tertiary)' }}
                      />
                      <input
                        type="text"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                        className="w-full pl-9 pr-3 py-2 rounded-lg outline-none transition-all text-xs"
                        style={{
                          backgroundColor: 'var(--surface-secondary)',
                          border: '1px solid var(--border-secondary)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Area */}
                  <div>
                    <label 
                      className="block text-xs font-medium mb-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Area
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        placeholder="0"
                        className="flex-1 px-3 py-2 rounded-lg outline-none transition-all text-xs"
                        style={{
                          backgroundColor: 'var(--surface-secondary)',
                          border: '1px solid var(--border-secondary)',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <select
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        className="px-3 py-2 rounded-lg outline-none transition-all text-xs"
                        style={{
                          backgroundColor: 'var(--surface-secondary)',
                          border: '1px solid var(--border-secondary)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <option>m²</option>
                        <option>ft²</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Year */}
                  <div>
                    <label 
                      className="block text-xs font-medium mb-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Year
                    </label>
                    <input
                      type="text"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      placeholder="2024"
                      className="w-full px-3 py-2 rounded-lg outline-none transition-all text-xs"
                      style={{
                        backgroundColor: 'var(--surface-secondary)',
                        border: '1px solid var(--border-secondary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  {/* Cost */}
                  <div>
                    <label 
                      className="block text-xs font-medium mb-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Cost
                    </label>
                    <div className="relative">
                      <DollarSign 
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ width: '14px', height: '14px', color: 'var(--text-tertiary)' }}
                      />
                      <input
                        type="text"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        placeholder="0.00"
                        className="w-full pl-9 pr-3 py-2 rounded-lg outline-none transition-all text-xs"
                        style={{
                          backgroundColor: 'var(--surface-secondary)',
                          border: '1px solid var(--border-secondary)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Labels */}
                <div>
                  <label 
                    className="block text-xs font-medium mb-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Labels
                  </label>
                  <input
                    type="text"
                    placeholder="Add labels (comma separated)"
                    className="w-full px-3 py-2 rounded-lg outline-none transition-all text-xs"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      border: '1px solid var(--border-secondary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

              </div>
            </div>
          </div>

          {/* Footer - Sticky */}
          <div 
            className="flex items-center justify-end gap-3 px-6 py-4 border-t"
            style={{ 
              borderColor: 'var(--border-primary)',
              backgroundColor: 'var(--surface-primary)'
            }}
          >
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--surface-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff'
              }}
            >
              Save
            </button>
            <button
              onClick={handleSaveAndView}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff'
              }}
            >
              Save & View
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Reusable SelectField Component
function SelectField({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder,
  icon
}: { 
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  icon?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <label 
        className="block text-xs font-medium mb-2"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 rounded-lg text-left transition-all flex items-center justify-between"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            border: '1px solid var(--border-secondary)',
            color: value ? 'var(--text-primary)' : 'var(--text-tertiary)'
          }}
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-xs">{value || placeholder}</span>
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

        {/* Dropdown */}
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div 
              className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden shadow-lg z-20"
              style={{
                backgroundColor: 'var(--surface-primary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs transition-colors"
                  style={{
                    color: 'var(--text-primary)',
                    backgroundColor: value === option ? 'var(--surface-secondary)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = value === option ? 'var(--surface-secondary)' : 'transparent';
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Status Select Field with color-coded icons
function StatusSelectField({ 
  label, 
  value, 
  onChange 
}: { 
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const statusOptions = ['Start', 'In Progress', 'Burning', 'Late', 'End'];
  const selectedConfig = getStatusConfig(value);

  return (
    <div>
      <label 
        className="block text-xs font-medium mb-2"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 rounded-lg text-left transition-all flex items-center justify-between"
          style={{
            backgroundColor: selectedConfig.bgColor,
            border: '1px solid var(--border-secondary)',
            color: selectedConfig.color
          }}
        >
          <div className="flex items-center gap-2">
            {selectedConfig.icon}
            <span className="text-xs font-medium">{value || 'Select status...'}</span>
          </div>
          <ChevronDown 
            style={{ 
              width: '14px', 
              height: '14px',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              color: selectedConfig.color
            }} 
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div 
              className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden shadow-lg z-20"
              style={{
                backgroundColor: 'var(--surface-primary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              {statusOptions.map((option) => {
                const config = getStatusConfig(option);
                return (
                  <button
                    key={option}
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs transition-colors flex items-center gap-2"
                    style={{
                      color: config.color,
                      backgroundColor: value === option ? config.bgColor : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = config.bgColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = value === option ? config.bgColor : 'transparent';
                    }}
                  >
                    {config.icon}
                    {option}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Priority Select Field with color-coded backgrounds
function PrioritySelectField({ 
  label, 
  value, 
  onChange 
}: { 
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];
  const selectedConfig = getPriorityConfig(value);

  return (
    <div>
      <label 
        className="block text-xs font-medium mb-2"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 rounded-lg text-left transition-all flex items-center justify-between"
          style={{
            backgroundColor: selectedConfig.bgColor,
            border: '1px solid var(--border-secondary)',
            color: selectedConfig.color
          }}
        >
          <div className="flex items-center gap-2">
            <Flag style={{ width: '14px', height: '14px' }} />
            <span className="text-xs font-medium">{value || 'Select priority...'}</span>
          </div>
          <ChevronDown 
            style={{ 
              width: '14px', 
              height: '14px',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              color: selectedConfig.color
            }} 
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div 
              className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden shadow-lg z-20"
              style={{
                backgroundColor: 'var(--surface-primary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              {priorityOptions.map((option) => {
                const config = getPriorityConfig(option);
                return (
                  <button
                    key={option}
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs transition-colors flex items-center gap-2"
                    style={{
                      color: config.color,
                      backgroundColor: value === option ? config.bgColor : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = config.bgColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = value === option ? config.bgColor : 'transparent';
                    }}
                  >
                    <Flag style={{ width: '14px', height: '14px' }} />
                    {option}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}