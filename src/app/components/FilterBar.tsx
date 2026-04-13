/**
 * FilterBar Component - Enterprise SaaS Project Management Dashboard
 * Redesigned and optimized for scalability, clarity, and professional UX
 * 
 * Layout Structure:
 * 1. View selector (left): List | Board | Gantt
 * 2. Primary filters (center): Project, Status, Assignee, Priority
 * 3. Advanced filters: "More" popover with counter
 * 4. Actions (right): Search, Bulk add, Add task
 * 
 * Features:
 * - Active filters shown as removable chips
 * - Sticky positioning with reduced height on scroll
 * - Prominent search input
 * - Clean visual separators between groups
 * - Responsive design with mobile panel
 */

import { useState, useEffect } from 'react';
import {
  List,
  LayoutGrid,
  GanttChart,
  Search,
  Plus,
  Filter,
  ChevronDown,
  X,
  FileStack,
  Calendar,
  Briefcase,
  Check
} from 'lucide-react';
import { AddTaskModal } from './AddTaskModal';
import type { TaskFilters } from '@/types/domain';

type ViewType = 'list' | 'board' | 'gantt';

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface ActiveFilter {
  type: string;
  typeLabel: string;
  label: string;
  value: string;
}

interface FilterBarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  projectOptions?: FilterOption[];
  assigneeOptions?: FilterOption[];
  onFiltersChange?: (filters: TaskFilters) => void;
}

export function FilterBar({ activeView, onViewChange, projectOptions = [], assigneeOptions = [], onFiltersChange }: FilterBarProps) {
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [hoveredView, setHoveredView] = useState<ViewType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Advanced filter states
  const [selectedDueDate, setSelectedDueDate] = useState<string | null>(null);
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>([]);

  // Sticky scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Advanced filter options (inside "More")
  const dueDateOptions: FilterOption[] = [
    { id: 'today', label: 'Today', value: 'today' },
    { id: 'week', label: 'This Week', value: 'week' },
    { id: 'overdue', label: 'Overdue', value: 'overdue' },
  ];

  const workTypeOptions: FilterOption[] = [
    { id: 'design', label: 'Design', value: 'design' },
    { id: 'dev', label: 'Development', value: 'dev' },
    { id: 'review', label: 'Review', value: 'review' },
  ];

  // Update activeFilters when advanced filters change
  useEffect(() => {
    // Remove old advanced filters
    let updatedFilters = activeFilters.filter(f => 
      !['dueDate', 'workType'].includes(f.type)
    );

    // Add Due Date filter if selected
    if (selectedDueDate) {
      const option = dueDateOptions.find(opt => opt.value === selectedDueDate);
      if (option) {
        updatedFilters.push({
          type: 'dueDate',
          typeLabel: 'Due Date',
          label: option.label,
          value: option.value
        });
      }
    }

    // Add Work Type filters (can be multiple)
    selectedWorkTypes.forEach(workTypeValue => {
      const option = workTypeOptions.find(opt => opt.value === workTypeValue);
      if (option) {
        updatedFilters.push({
          type: 'workType',
          typeLabel: 'Work Type',
          label: option.label,
          value: option.value
        });
      }
    });

    setActiveFilters(updatedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDueDate, selectedWorkTypes]);

  // Static filter options with values matching domain data
  const statusOptions: FilterOption[] = [
    { id: 'IN_PROGRESS', label: 'In Progress', value: 'IN_PROGRESS' },
    { id: 'TODO',        label: 'To Do',        value: 'TODO' },
    { id: 'PLANNING',   label: 'Planning',     value: 'PLANNING' },
    { id: 'IN_REVIEW',  label: 'In Review',    value: 'IN_REVIEW' },
    { id: 'DONE',       label: 'Done',         value: 'DONE' },
    { id: 'CANCELLED',  label: 'Cancelled',    value: 'CANCELLED' },
  ];

  const priorityOptions: FilterOption[] = [
    { id: 'High',   label: 'High',   value: 'High' },
    { id: 'Medium', label: 'Medium', value: 'Medium' },
    { id: 'Low',    label: 'Low',    value: 'Low' },
  ];

  // Emit resolved TaskFilters to parent whenever active filters or search changes
  useEffect(() => {
    if (!onFiltersChange) return;
    onFiltersChange({
      search: searchQuery,
      project: activeFilters.find(f => f.type === 'project')?.value ?? null,
      status: activeFilters.find(f => f.type === 'status')?.value ?? null,
      assignee: activeFilters.find(f => f.type === 'assignee')?.value ?? null,
      priority: activeFilters.find(f => f.type === 'priority')?.value ?? null,
      dueDate: (activeFilters.find(f => f.type === 'dueDate')?.value ?? null) as TaskFilters['dueDate'],
      workTypes: activeFilters.filter(f => f.type === 'workType').map(f => f.value),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters, searchQuery]);

  // Remove filter
  const removeFilter = (filter: ActiveFilter) => {
    setActiveFilters(activeFilters.filter(f => f !== filter));
  };

  // Add filter
  const addFilter = (type: string, typeLabel: string, label: string, value: string) => {
    const filtered = activeFilters.filter(f => f.type !== type);
    setActiveFilters([...filtered, { type, typeLabel, label, value }]);
  };

  // Count active advanced filters (from "More")
  const advancedFilterCount = activeFilters.filter(f => 
    ['dueDate', 'workType', 'participants', 'tags'].includes(f.type)
  ).length;

  // Helper function to get tab styles
  const getTabStyle = (view: ViewType) => {
    const isActive = activeView === view;
    const isHovered = hoveredView === view;
    
    return {
      backgroundColor: isActive 
        ? 'var(--accent-primary)'
        : isHovered && !isActive
          ? 'var(--accent-primary-hover)'
          : 'transparent',
      color: isActive 
        ? '#ffffff'
        : 'var(--text-secondary)',
      transition: 'all 0.18s ease'
    };
  };

  // Check if a filter type is active
  const isFilterActive = (type: string) => {
    return activeFilters.some(f => f.type === type);
  };

  return (
    <>
      <AddTaskModal 
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
      />
      
      <div 
        className="sticky top-0 z-30 border-b transition-all duration-200"
        style={{ 
          backgroundColor: 'var(--surface-primary)',
          borderColor: 'var(--border-primary)',
          boxShadow: isScrolled ? '0 2px 8px rgba(0, 0, 0, 0.06)' : 'none'
        }}
      >
        {/* Main Filter Bar */}
        <div 
          className="flex items-center gap-4 px-6 transition-all duration-200"
          style={{ 
            paddingTop: isScrolled ? '0.625rem' : '0.75rem',
            paddingBottom: isScrolled ? '0.625rem' : '0.75rem'
          }}
        >
          {/* Section 1: View Selector (Left) */}
          <div className="flex items-center">
            <div 
              className="flex items-center rounded-lg p-0.5"
              style={{ backgroundColor: 'var(--surface-secondary)' }}
            >
              <button
                onClick={() => onViewChange('list')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-all"
                style={getTabStyle('list')}
                onMouseEnter={() => setHoveredView('list')}
                onMouseLeave={() => setHoveredView(null)}
              >
                <List style={{ width: '16px', height: '16px' }} />
                <span className="text-xs font-medium">List</span>
              </button>
              
              <button
                onClick={() => onViewChange('board')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-all"
                style={getTabStyle('board')}
                onMouseEnter={() => setHoveredView('board')}
                onMouseLeave={() => setHoveredView(null)}
              >
                <LayoutGrid style={{ width: '16px', height: '16px' }} />
                <span className="text-xs font-medium">Board</span>
              </button>
              
              <button
                onClick={() => onViewChange('gantt')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-all"
                style={getTabStyle('gantt')}
                onMouseEnter={() => setHoveredView('gantt')}
                onMouseLeave={() => setHoveredView(null)}
              >
                <GanttChart style={{ width: '16px', height: '16px' }} />
                <span className="text-xs font-medium">Gantt</span>
              </button>
            </div>

            {/* Subtle separator */}
            <div 
              className="w-px h-6 mx-4"
              style={{ backgroundColor: 'var(--border-primary)' }}
            />
          </div>

          {/* Section 2: Primary Filters (Center) */}
          <div className="flex items-center gap-2">
            <FilterDropdown
              label="Project"
              options={projectOptions}
              onSelect={(option) => addFilter('project', 'Project', option.label, option.value)}
              isActive={isFilterActive('project')}
              icon={<Briefcase style={{ width: '14px', height: '14px' }} />}
            />

            <FilterDropdown
              label="Status"
              options={statusOptions}
              onSelect={(option) => addFilter('status', 'Status', option.label, option.value)}
              isActive={isFilterActive('status')}
            />

            <FilterDropdown
              label="Assignee"
              options={assigneeOptions}
              onSelect={(option) => addFilter('assignee', 'Assignee', option.label, option.value)}
              isActive={isFilterActive('assignee')}
            />

            <FilterDropdown
              label="Priority"
              options={priorityOptions}
              onSelect={(option) => addFilter('priority', 'Priority', option.label, option.value)}
              isActive={isFilterActive('priority')}
            />

            {/* More Filters - Popover */}
            <MoreFiltersPopover
              isOpen={showMoreFilters}
              onToggle={() => setShowMoreFilters(!showMoreFilters)}
              activeCount={advancedFilterCount}
              dueDateOptions={dueDateOptions}
              workTypeOptions={workTypeOptions}
              onSelectDueDate={(option) => addFilter('dueDate', 'Due Date', option.label, option.value)}
              onSelectWorkType={(option) => addFilter('workType', 'Work Type', option.label, option.value)}
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Section 3: Search & Actions (Right) */}
          <div className="flex items-center gap-3">
            {/* Prominent Search Input */}
            <div className="relative">
              <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ 
                  width: '16px', 
                  height: '16px',
                  color: 'var(--text-tertiary)'
                }} 
              />
              <input
                type="text"
                placeholder="Search tasks by name, tag, assignee…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg text-xs transition-all focus:outline-none focus:ring-2"
                style={{
                  width: searchQuery ? '280px' : '240px',
                  backgroundColor: 'var(--surface-secondary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                  transitionProperty: 'width, border-color, box-shadow',
                  transitionDuration: '0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--surface-primary)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                }}
              />
            </div>

            {/* Subtle separator */}
            <div 
              className="w-px h-6"
              style={{ backgroundColor: 'var(--border-primary)' }}
            />

            {/* Bulk Add */}
            <button
              onClick={() => setIsAddTaskModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:opacity-80 transition-all"
              style={{ 
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <FileStack style={{ width: '15px', height: '15px' }} />
              <span className="text-xs font-medium">Bulk add</span>
            </button>

            {/* Add Task - Primary Action */}
            <button
              onClick={() => setIsAddTaskModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              style={{ 
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff',
                boxShadow: '0 1px 3px rgba(59, 130, 246, 0.2)'
              }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              <span className="text-xs font-semibold">Add task</span>
            </button>
          </div>
        </div>

        {/* Active Filters - Chips Row */}
        {activeFilters.length > 0 && (
          <div 
            className="flex items-center gap-2 px-6 py-2.5 border-t animate-in slide-in-from-top-2 duration-200"
            style={{ 
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <span className="text-xs font-medium mr-1" style={{ color: 'var(--text-tertiary)' }}>
              Active filters:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {activeFilters.map((filter, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-md transition-all hover:opacity-80 animate-in fade-in zoom-in-95 duration-150"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    animationDelay: `${index * 30}ms`,
                    animationFillMode: 'backwards'
                  }}
                >
                  <span className="text-xs font-medium" style={{ color: '#ffffff' }}>
                    {filter.typeLabel}: {filter.label}
                  </span>
                  <button
                    onClick={() => removeFilter(filter)}
                    className="p-0.5 rounded hover:bg-white/20 transition-colors"
                    title={`Remove ${filter.typeLabel} filter`}
                  >
                    <X style={{ width: '12px', height: '12px', color: '#ffffff' }} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setActiveFilters([])}
              className="text-xs font-medium hover:opacity-70 transition-opacity ml-auto"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// Filter Dropdown Component
interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  onSelect: (option: FilterOption) => void;
  isActive?: boolean;
  icon?: React.ReactNode;
}

function FilterDropdown({ label, options, onSelect, isActive = false, icon }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
        style={{ 
          color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
          border: `1px solid ${isActive ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
          backgroundColor: isOpen 
            ? 'var(--surface-hover)' 
            : isActive 
              ? 'var(--accent-primary-bg)' 
              : 'transparent',
          fontWeight: isActive ? 500 : 400
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = isActive 
              ? 'var(--accent-primary-hover-bg)' 
              : 'var(--surface-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = isActive 
              ? 'var(--accent-primary-bg)' 
              : 'transparent';
          }
        }}
      >
        {icon}
        <span className="text-xs font-medium">{label}</span>
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
          
          {/* Dropdown Menu */}
          <div
            className="absolute top-full left-0 mt-2 rounded-lg overflow-hidden z-20 min-w-[180px] animate-in fade-in slide-in-from-top-2 duration-150"
            style={{
              backgroundColor: 'var(--surface-primary)',
              border: '1px solid var(--border-primary)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)'
            }}
          >
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 transition-colors"
                style={{
                  color: 'var(--text-primary)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
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

// More Filters Popover Component
interface MoreFiltersPopoverProps {
  isOpen: boolean;
  onToggle: () => void;
  activeCount: number;
  dueDateOptions: FilterOption[];
  workTypeOptions: FilterOption[];
  onSelectDueDate: (option: FilterOption) => void;
  onSelectWorkType: (option: FilterOption) => void;
}

function MoreFiltersPopover({
  isOpen,
  onToggle,
  activeCount,
  dueDateOptions,
  workTypeOptions,
  onSelectDueDate,
  onSelectWorkType
}: MoreFiltersPopoverProps) {
  const [selectedDueDateLocal, setSelectedDueDateLocal] = useState<string | null>(null);
  const [selectedWorkTypesLocal, setSelectedWorkTypesLocal] = useState<string[]>([]);

  const handleDueDateSelect = (option: FilterOption) => {
    // Toggle radio behavior - clicking same option deselects it
    if (selectedDueDateLocal === option.value) {
      setSelectedDueDateLocal(null);
    } else {
      setSelectedDueDateLocal(option.value);
      onSelectDueDate(option);
    }
  };

  const handleWorkTypeToggle = (option: FilterOption) => {
    // Toggle checkbox behavior
    const isSelected = selectedWorkTypesLocal.includes(option.value);
    if (isSelected) {
      setSelectedWorkTypesLocal(selectedWorkTypesLocal.filter(v => v !== option.value));
    } else {
      setSelectedWorkTypesLocal([...selectedWorkTypesLocal, option.value]);
    }
    onSelectWorkType(option);
  };

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:opacity-80 transition-all"
        style={{ 
          color: activeCount > 0 ? 'var(--accent-primary)' : 'var(--text-tertiary)',
          border: `1px solid ${activeCount > 0 ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
          backgroundColor: isOpen 
            ? 'var(--surface-hover)' 
            : activeCount > 0 
              ? 'var(--accent-primary-bg)' 
              : 'transparent',
          fontWeight: activeCount > 0 ? 500 : 400
        }}
      >
        <Filter style={{ width: '14px', height: '14px' }} />
        <span className="text-xs font-medium">
          More{activeCount > 0 ? ` (${activeCount})` : ''}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={onToggle}
          />
          
          {/* Popover Panel */}
          <div
            className="absolute top-full left-0 mt-2 rounded-lg z-20 w-[340px] animate-in fade-in slide-in-from-top-2 duration-150"
            style={{
              backgroundColor: 'var(--surface-primary)',
              border: '1px solid var(--border-primary)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Header */}
            <div 
              className="px-4 py-3.5 border-b"
              style={{ borderColor: 'var(--border-primary)' }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Advanced Filters
                </h3>
                <button
                  onClick={onToggle}
                  className="p-1 rounded transition-colors"
                  style={{ color: 'var(--text-tertiary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <X style={{ width: '14px', height: '14px' }} />
                </button>
              </div>
            </div>

            {/* Filter Sections */}
            <div className="p-4 space-y-5 max-h-[420px] overflow-y-auto">
              {/* SECTION 1: Due Date - Time-based filter (Radio / Single Select) */}
              <div>
                <div 
                  className="flex items-center gap-2 mb-3 pb-2"
                  style={{ borderBottom: '1px solid var(--border-secondary)' }}
                >
                  <Calendar 
                    style={{ 
                      width: '15px', 
                      height: '15px',
                      color: 'var(--text-secondary)'
                    }} 
                  />
                  <label className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Due Date
                  </label>
                  <span className="text-xs ml-auto" style={{ color: 'var(--text-tertiary)' }}>
                    Select one
                  </span>
                </div>
                <div className="space-y-1.5">
                  {dueDateOptions.map((option) => {
                    const isSelected = selectedDueDateLocal === option.value;
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleDueDateSelect(option)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group"
                        style={{
                          backgroundColor: isSelected 
                            ? 'var(--accent-primary-bg)' 
                            : 'transparent',
                          border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'transparent'}`
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        {/* Radio indicator */}
                        <div 
                          className="w-4 h-4 rounded-full flex items-center justify-center transition-all flex-shrink-0"
                          style={{
                            border: `2px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                            backgroundColor: isSelected ? 'var(--accent-primary)' : 'transparent'
                          }}
                        >
                          {isSelected && (
                            <div 
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: '#ffffff' }}
                            />
                          )}
                        </div>
                        <span 
                          className="text-xs font-medium"
                          style={{ 
                            color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)'
                          }}
                        >
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subtle Divider */}
              <div 
                className="h-px -mx-4"
                style={{ backgroundColor: 'var(--border-primary)' }}
              />

              {/* SECTION 2: Work Type - Category-based filter (Checkbox / Multi-Select) */}
              <div>
                <div 
                  className="flex items-center gap-2 mb-3 pb-2"
                  style={{ borderBottom: '1px solid var(--border-secondary)' }}
                >
                  <Briefcase 
                    style={{ 
                      width: '15px', 
                      height: '15px',
                      color: 'var(--text-secondary)'
                    }} 
                  />
                  <label className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Work Type
                  </label>
                  <span className="text-xs ml-auto" style={{ color: 'var(--text-tertiary)' }}>
                    Multi-select
                  </span>
                </div>
                <div className="space-y-1.5">
                  {workTypeOptions.map((option) => {
                    const isSelected = selectedWorkTypesLocal.includes(option.value);
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleWorkTypeToggle(option)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group"
                        style={{
                          backgroundColor: isSelected 
                            ? 'var(--accent-primary-subtle)' 
                            : 'transparent',
                          border: `1px solid transparent`
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = isSelected 
                            ? 'var(--accent-primary-bg)' 
                            : 'var(--surface-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = isSelected 
                            ? 'var(--accent-primary-subtle)' 
                            : 'transparent';
                        }}
                      >
                        {/* Checkbox indicator */}
                        <div 
                          className="w-4 h-4 rounded flex items-center justify-center transition-all flex-shrink-0"
                          style={{
                            border: `2px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                            backgroundColor: isSelected ? 'var(--accent-primary)' : 'transparent'
                          }}
                        >
                          {isSelected && (
                            <Check 
                              style={{ 
                                width: '10px', 
                                height: '10px',
                                color: '#ffffff',
                                strokeWidth: 3
                              }} 
                            />
                          )}
                        </div>
                        <span 
                          className="text-xs font-medium"
                          style={{ 
                            color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)'
                          }}
                        >
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}