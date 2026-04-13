import { LayoutDashboard, FolderKanban, Briefcase, ChartBar, Settings, Users, Building2, ChevronDown, ChevronRight, Pin, Plus, MoreHorizontal, DollarSign, TrendingUp, Layers, Wrench, Clock } from 'lucide-react';
import { useEffect } from 'react';
import { Logo } from './Logo';
import { useTranslation } from '../contexts/TranslationContext';
import { MiroSidebarMenu } from './MiroSidebarMenu';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSidebarProjects } from '@/hooks/api/useProjects';

const PALETTE = ['#6366f1', '#22c55e', '#a855f7', '#f97316', '#14b8a6', '#ec4899', '#3b82f6', '#eab308'];

interface SidebarProps {
  // Legacy props (no longer required — router state is used instead)
  currentPath?: string;
  activeView?: string;
  onViewChange?: (view: string) => void;
  onProjectSelect?: (projectId: string) => void;
  selectedProjectId?: string | null;
}

export function Sidebar({ currentPath }: SidebarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const activePath = currentPath ?? location.pathname;

  const navItems = [
    { icon: LayoutDashboard, label: t('nav.dashboard'), key: 'dashboard' as const, path: '/dashboard' },
    { icon: FolderKanban, label: t('nav.projects'), key: 'projects' as const, path: '/projects' },
    { icon: Briefcase, label: t('nav.tasks'), key: 'tasks' as const, path: '/tasks' },
    { icon: ChartBar, label: t('nav.analytics'), key: 'analytics' as const, path: '/analytics' },
    { icon: Users, label: t('nav.team'), key: 'team' as const, path: '/team' },
    { icon: Building2, label: t('nav.clients'), key: 'clients' as const, path: '/clients' },
    { icon: Settings, label: t('nav.settings'), key: 'settings' as const, path: '/settings' },
  ];

  const [isProjectsMenuOpen, setProjectsMenuOpen] = useState(true);
  const [isFinanceOpen, setFinanceOpen] = useState(() => location.pathname.startsWith('/finance'));

  useEffect(() => {
    if (activePath.startsWith('/finance')) setFinanceOpen(true);
  }, [activePath]);
  const { data: projects = [], isLoading: projectsLoading } = useSidebarProjects();

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
          const isActive = activePath === item.path || activePath.startsWith(item.path + '/');
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
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
              backgroundColor: activePath === '/projects' ? 'var(--surface-secondary)' : 'transparent',
            }}
          >
            <button
              onClick={() => {
                setProjectsMenuOpen(!isProjectsMenuOpen);
                navigate('/projects');
              }}
              className="flex items-center gap-3 flex-1 transition-colors"
              style={{
                color: activePath.startsWith('/projects') ? 'var(--text-primary)' : 'var(--text-secondary)'
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
              {projectsLoading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 animate-pulse">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--border-secondary)' }} />
                    <div className="h-3 rounded flex-1" style={{ backgroundColor: 'var(--border-secondary)' }} />
                  </div>
                ))
              ) : (
                projects.map((project, idx) => (
                  <button
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors group"
                    style={{
                      backgroundColor: activePath === `/projects/${project.id}` ? 'var(--surface-secondary)' : 'transparent',
                      color: 'var(--text-secondary)'
                    }}
                    onMouseEnter={(e) => {
                      if (activePath !== `/projects/${project.id}`) {
                        e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activePath !== `/projects/${project.id}`) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ flexShrink: 0, backgroundColor: PALETTE[idx % PALETTE.length] }}
                    />
                    <span className="text-sm flex-1 truncate text-left">{project.name}</span>
                    {project.isPinned && (
                      <Pin className="w-3 h-3 opacity-60" style={{ flexShrink: 0 }} />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Finance Section - Collapsible */}
        <div className="mt-2">
          <button
            onClick={() => { setFinanceOpen(!isFinanceOpen); navigate('/finance'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors"
            style={{
              backgroundColor: activePath.startsWith('/finance') ? 'var(--surface-secondary)' : 'transparent',
              color: activePath.startsWith('/finance') ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => { if (!activePath.startsWith('/finance')) e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'; }}
            onMouseLeave={(e) => { if (!activePath.startsWith('/finance')) e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {isFinanceOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <DollarSign className="w-5 h-5" />
            <span>Finance</span>
          </button>

          {isFinanceOpen && (
            <div className="ml-4 mt-1 space-y-0.5">
              {[
                { path: '/finance', label: 'Dashboard', icon: TrendingUp, exact: true },
                { path: '/finance/exchange-rates', label: 'Exchange Rates', icon: Layers, exact: false },
                { path: '/finance/overhead-costs', label: 'Overhead Costs', icon: Briefcase, exact: false },
                { path: '/finance/equipment', label: 'Equipment', icon: Wrench, exact: false },
                { path: '/finance/hourly-rates', label: 'Hourly Rates', icon: Clock, exact: false },
              ].map(({ path, label, icon: Icon, exact }) => {
                const isActive = exact ? activePath === path : activePath.startsWith(path);
                return (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm"
                    style={{
                      backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                      color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)'; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1 text-left truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <MiroSidebarMenu currentView={activePath.replace('/', '') as any} />
    </aside>
  );
}