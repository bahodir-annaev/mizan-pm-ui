import { LayoutDashboard, FolderKanban, Briefcase, ChartBar, Settings, Users, Building2, ChevronDown, ChevronRight, Pin, Folder, Plus, MoreHorizontal } from 'lucide-react';
import { Logo } from './Logo';
import { useTranslation } from '../contexts/TranslationContext';
import { MiroSidebarMenu } from './MiroSidebarMenu';
import { useState } from 'react';

interface SidebarProps {
  activeView: 'dashboard' | 'projects' | 'tasks' | 'analytics' | 'settings' | 'team' | 'clients';
  onViewChange: (view: 'dashboard' | 'projects' | 'tasks' | 'analytics' | 'settings' | 'team' | 'clients') => void;
  onProjectSelect?: (projectId: string) => void;
  selectedProjectId?: string | null;
}

export function Sidebar({ activeView, onViewChange, onProjectSelect, selectedProjectId }: SidebarProps) {
  const { t } = useTranslation();

  const navItems = [
    { icon: LayoutDashboard, label: t('nav.dashboard'), key: 'dashboard' as const },
    { icon: FolderKanban, label: t('nav.projects'), key: 'projects' as const },
    { icon: Briefcase, label: t('nav.tasks'), key: 'tasks' as const },
    { icon: ChartBar, label: t('nav.analytics'), key: 'analytics' as const },
    { icon: Users, label: t('nav.team'), key: 'team' as const },
    { icon: Building2, label: t('nav.clients'), key: 'clients' as const },
    { icon: Settings, label: t('nav.settings'), key: 'settings' as const },
  ];

  const [isProjectsMenuOpen, setProjectsMenuOpen] = useState(true);

  // Sample projects data
  const projects = [
    { 
      id: 'proj-1', 
      name: 'Main Building Project', 
      color: 'bg-blue-500',
      isPinned: false,
      subprojects: [
        { id: 'sub-1', name: 'Foundation Work' },
        { id: 'sub-2', name: 'Structural Design' },
      ]
    },
    { 
      id: 'proj-2', 
      name: 'Residential Complex', 
      color: 'bg-green-500',
      isPinned: false,
      subprojects: [
        { id: 'sub-3', name: 'Tower A' },
        { id: 'sub-4', name: 'Tower B' },
        { id: 'sub-5', name: 'Parking Structure' },
      ]
    },
    { 
      id: 'proj-3', 
      name: 'Office Renovation', 
      color: 'bg-purple-500',
      isPinned: false,
      subprojects: []
    },
    { 
      id: 'proj-4', 
      name: 'City Plaza Development', 
      color: 'bg-orange-500',
      isPinned: false,
      subprojects: [
        { id: 'sub-6', name: 'Retail Spaces' },
      ]
    },
  ];

  return (
    <aside className="w-64 h-screen flex flex-col border-r" style={{
      backgroundColor: 'var(--surface-primary)',
      borderColor: 'var(--border-primary)',
      boxShadow: 'var(--shadow-md)'
    }}>
      <div className="p-6 pb-8">
        <Logo />
      </div>
      
      <nav className="flex-1 px-3 overflow-y-auto">
        {/* Main Navigation - excluding Projects */}
        {navItems.filter(item => item.key !== 'projects').map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                onViewChange(item.key);
                // Clear selected project when switching to other views
                if (selectedProjectId) {
                  onProjectSelect?.(null as any);
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors"
              style={{
                backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Projects Section - Collapsible */}
        <div className="mt-6">
          {/* Projects Header */}
          <div 
            className="w-full flex items-center gap-2 px-3 py-3 rounded-lg mb-1 group"
            style={{
              backgroundColor: (activeView === 'projects' && !selectedProjectId) ? 'var(--surface-secondary)' : 'transparent',
            }}
          >
            <button
              onClick={() => {
                setProjectsMenuOpen(!isProjectsMenuOpen);
                // Clear selected project when clicking Projects header
                if (activeView === 'projects' && selectedProjectId) {
                  onProjectSelect?.(null as any);
                }
                onViewChange('projects');
              }}
              className="flex items-center gap-3 flex-1 transition-colors"
              style={{
                color: (activeView === 'projects' && !selectedProjectId) ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
            >
              {isProjectsMenuOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <FolderKanban className="w-5 h-5" />
              <span className="text-left">{t('nav.projects')}</span>
            </button>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                className="p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100"
                style={{ color: 'var(--text-tertiary)' }}
                title="Add new project"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                }}
              >
                <Plus className="w-4 h-4" />
              </button>

              <button
                className="p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100"
                style={{ color: 'var(--text-tertiary)' }}
                title="More options"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                }}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Projects List */}
          {isProjectsMenuOpen && (
            <div className="ml-4 mt-1 space-y-0.5">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    onProjectSelect?.(project.id);
                    onViewChange('projects');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors group"
                  style={{
                    backgroundColor: selectedProjectId === project.id ? 'var(--surface-secondary)' : 'transparent',
                    color: 'var(--text-secondary)'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedProjectId !== project.id) {
                      e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedProjectId !== project.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div 
                    className={`w-2 h-2 rounded-full ${project.color}`}
                    style={{ flexShrink: 0 }}
                  />
                  <span className="text-sm flex-1 truncate text-left">{project.name}</span>
                  {project.isPinned && (
                    <Pin className="w-3 h-3 opacity-60" style={{ flexShrink: 0 }} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      <MiroSidebarMenu currentView={activeView} />
    </aside>
  );
}