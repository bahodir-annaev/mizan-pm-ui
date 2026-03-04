/**
 * ProjectsToolbar Component - Projects Filter & Actions Toolbar
 * Identical to Tasks section toolbar with project-specific labels
 */

import { useState } from 'react';
import { 
  Search, 
  Plus, 
  ChevronDown,
  Layers,
  Workflow,
  Building2,
  Flag,
  Filter
} from 'lucide-react';
import { AddProjectModal } from './AddProjectModal';
import { useBudget } from '@/app/contexts/BudgetContext';

interface ProjectsToolbarProps {
  onAddProject?: () => void;
}

export function ProjectsToolbar({ onAddProject }: ProjectsToolbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  
  // Budget integration
  const { isBurning } = useBudget();
  const budgetAtLimit = isBurning();

  // Filter options
  const projectTypes = ['Interior', 'Residential', 'Commercial', 'Mixed Use'];
  const statuses = ['Start', 'In Progress', 'Burning', 'Late', 'End'];
  const clients = ['Bobur Construction', 'Elite Developers', 'Modern Spaces LLC'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  const FilterButton = ({ 
    id, 
    label, 
    icon: Icon 
  }: { 
    id: string; 
    label: string; 
    icon: React.ElementType;
  }) => {
    const isOpen = openFilter === id;

    return (
      <button
        onClick={() => setOpenFilter(isOpen ? null : id)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-medium border"
        style={{
          backgroundColor: isOpen ? 'var(--surface-secondary)' : 'transparent',
          borderColor: isOpen ? 'var(--border-primary)' : 'var(--border-secondary)',
          color: isOpen ? 'var(--text-primary)' : 'var(--text-secondary)'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            e.currentTarget.style.borderColor = 'var(--border-primary)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'var(--border-secondary)';
          }
        }}
      >
        <Icon 
          style={{ 
            width: '14px', 
            height: '14px',
            strokeWidth: 1.5
          }} 
        />
        <span>{label}</span>
        <ChevronDown 
          style={{ 
            width: '14px', 
            height: '14px',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }} 
        />
      </button>
    );
  };

  return (
    <>
      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={() => setIsAddProjectModalOpen(false)}
      />

      <div 
        className="flex items-center justify-between gap-4 px-6 py-3 border-b"
        style={{
          backgroundColor: 'var(--surface-primary)',
          borderColor: 'var(--border-primary)'
        }}
      >
        {/* Left - Filters */}
        <div className="flex items-center gap-2 flex-1">
          <FilterButton id="type" label="Project type" icon={Layers} />
          <FilterButton id="status" label="Status" icon={Workflow} />
          <FilterButton id="client" label="Client" icon={Building2} />
          <FilterButton id="priority" label="Priority" icon={Flag} />
          
          {/* More filters button */}
          <button
            onClick={() => setOpenFilter(openFilter === 'more' ? null : 'more')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-medium border"
            style={{
              backgroundColor: openFilter === 'more' ? 'var(--surface-secondary)' : 'transparent',
              borderColor: openFilter === 'more' ? 'var(--border-primary)' : 'var(--border-secondary)',
              color: openFilter === 'more' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
            onMouseEnter={(e) => {
              if (openFilter !== 'more') {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                e.currentTarget.style.borderColor = 'var(--border-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (openFilter !== 'more') {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'var(--border-secondary)';
              }
            }}
          >
            <Filter 
              style={{ 
                width: '14px', 
                height: '14px',
                strokeWidth: 1.5
              }} 
            />
            <span>More</span>
            <ChevronDown 
              style={{ 
                width: '14px', 
                height: '14px',
                transform: openFilter === 'more' ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }} 
            />
          </button>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ 
                width: '16px', 
                height: '16px',
                color: 'var(--text-tertiary)'
              }} 
            />
            <input
              type="text"
              placeholder="Search projects by name, client, tag…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg text-xs transition-all focus:outline-none focus:ring-2"
              style={{
                width: searchQuery ? '280px' : '240px',
                backgroundColor: 'var(--surface-secondary)',
                border: '1px solid var(--border-secondary)',
                color: 'var(--text-primary)',
                transition: 'width 0.2s ease, border-color 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-secondary)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Add Project - Primary Action */}
          <button
            onClick={() => !budgetAtLimit && setIsAddProjectModalOpen(true)}
            disabled={budgetAtLimit}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all"
            style={{ 
              backgroundColor: budgetAtLimit ? 'var(--surface-tertiary)' : 'var(--accent-primary)',
              color: budgetAtLimit ? 'var(--text-tertiary)' : '#ffffff',
              boxShadow: budgetAtLimit ? 'none' : '0 1px 3px rgba(59, 130, 246, 0.2)',
              cursor: budgetAtLimit ? 'not-allowed' : 'pointer',
              opacity: budgetAtLimit ? 0.5 : 1
            }}
            title={budgetAtLimit ? 'Byudjet limitiga yetib keldingiz. Loyiha ocha olmaysiz.' : 'Yangi loyiha qo\'shish'}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            <span className="text-xs font-semibold">Add project</span>
          </button>
        </div>
      </div>
    </>
  );
}