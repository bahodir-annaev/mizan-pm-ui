/**
 * WorksTableFieldsToolbar - Modern PM Tool Header
 * 
 * Icon + Label pairs for all key fields, horizontal layout
 * Similar to Summary / Timeline navigation style in Linear/ClickUp
 */

import { 
  LayoutList,
  FolderOpen,
  User,
  Users,
  GitBranch,
  Calendar,
  CalendarClock,
  TrendingUp,
  Layers
} from 'lucide-react';
import { useState } from 'react';

interface FieldSection {
  id: string;
  label: string;
  icon: React.ElementType;
}

const FIELD_SECTIONS: FieldSection[] = [
  { id: 'task-title', label: 'Task title', icon: LayoutList },
  { id: 'project', label: 'Project', icon: FolderOpen },
  { id: 'assignee', label: 'Assignee', icon: User },
  { id: 'participants', label: 'Participants', icon: Users },
  { id: 'workflow', label: 'Workflow', icon: GitBranch },
  { id: 'start-date', label: 'Start date', icon: Calendar },
  { id: 'due-date', label: 'Due date', icon: CalendarClock },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'work-type', label: 'Work type', icon: Layers }
];

export function WorksTableFieldsToolbar() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div 
      className="flex items-center gap-1 px-6 py-2.5 border-b overflow-x-auto scrollbar-thin"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border-secondary)',
        minHeight: '44px',
        boxShadow: '0 1px 0 0 rgba(0, 0, 0, 0.02)'
      }}
    >
      {FIELD_SECTIONS.map((section, index) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;
        
        return (
          <div key={section.id} className="flex items-center gap-1">
            {index > 0 && (
              <div 
                className="w-px h-4 flex-shrink-0"
                style={{ backgroundColor: 'var(--border-secondary)', opacity: 0.5 }}
              />
            )}
            <button
              onClick={() => setActiveSection(isActive ? null : section.id)}
              className="flex items-center gap-1.5 transition-all duration-200 flex-shrink-0 group relative"
              title={`Filter by ${section.label}`}
              style={{
                color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                padding: '5px 10px',
                borderRadius: '5px',
                marginBottom: '-2.5px'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div 
                  className="absolute bottom-0 left-2 right-2 rounded-full transition-all"
                  style={{ 
                    backgroundColor: 'var(--accent-primary)',
                    bottom: '-2.5px',
                    height: '2px'
                  }}
                />
              )}
              
              <Icon 
                className="w-3.5 h-3.5 transition-all"
                style={{
                  opacity: isActive ? 1 : 0.5,
                  strokeWidth: isActive ? 2 : 1.5
                }}
              />
              <span 
                className="text-xs font-medium transition-all whitespace-nowrap"
                style={{
                  fontSize: '12px',
                  fontWeight: isActive ? 600 : 500,
                  letterSpacing: '-0.01em'
                }}
              >
                {section.label}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}