/**
 * ProjectDetail Page
 * Shows project details with tabs: Task List, Overview, Task Board, Gantt, Files
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Pin,
  MoreHorizontal,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  List,
  LayoutGrid,
  GanttChart,
  FileText
} from 'lucide-react';
import { WorksTable } from '../components/WorksTable';
import { BoardView } from '../components/BoardView';
import { GanttView } from '../components/GanttView';
import { AddTaskModal } from '../components/AddTaskModal';
import { useProject } from '@/hooks/api/useProjects';
import { useBoardTasks } from '@/hooks/api/useTasks';
import type { Task } from '@/types/domain';

interface ProjectDetailProps {
  projectId?: string;
  onBack?: () => void;
}

// Derive a consistent color for the project dot from the project id
const PROJECT_PALETTE = ['#6366f1', '#22c55e', '#a855f7', '#f97316', '#14b8a6', '#ec4899', '#3b82f6', '#eab308'];
function projectColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return PROJECT_PALETTE[Math.abs(hash) % PROJECT_PALETTE.length];
}

const getStatusColor = (statusKey: string) => {
  switch (statusKey) {
    case 'IN_PROGRESS': return { bg: '#DBEAFE', text: '#1E40AF' };
    case 'PLANNING':    return { bg: '#EDE9FE', text: '#5B21B6' };
    case 'ON_HOLD':     return { bg: '#FEF3C7', text: '#92400E' };
    case 'COMPLETED':   return { bg: '#D1FAE5', text: '#065F46' };
    case 'CANCELLED':   return { bg: '#FEE2E2', text: '#991B1B' };
    default:            return { bg: '#F3F4F6', text: '#6B7280' };
  }
};

// Map domain Task → TaskCardData expected by BoardView
function toCardData(task: Task) {
  return {
    id: task.id,
    title: task.title,
    assignee: task.assignee
      ? { name: task.assignee.name, initials: task.assignee.initials, color: task.assignee.color }
      : { name: 'Unassigned', initials: '?', color: 'bg-gray-400' },
    participants: task.participants?.map(p => ({ name: p.name, initials: p.initials, color: p.color })),
    priority: task.priority,
    dateEnd: task.dueDate || task.dateEnd || '',
    dateStart: task.startDate || task.dateStart,
    status: task.status,
    typeOfWork: task.workType,
    volume: task.volume,
    unit: task.unit,
    progress: task.progress,
  };
}

// Map domain Task → GanttTask expected by GanttView
function toGanttTask(task: Task) {
  return {
    id: task.id,
    title: task.title,
    assignee: task.assignee
      ? { name: task.assignee.name, initials: task.assignee.initials, color: task.assignee.color }
      : { name: 'Unassigned', initials: '?', color: 'bg-gray-400' },
    participants: task.participants?.map(p => ({ name: p.name, initials: p.initials, color: p.color })),
    priority: task.priority,
    dateStart: task.startDate || task.dateStart || '',
    dateEnd: task.dueDate || task.dateEnd || '',
    status: task.status,
    progress: task.progress,
  };
}

export function ProjectDetailPage({ projectId: propProjectId, onBack: propOnBack }: ProjectDetailProps) {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = params.id ?? propProjectId ?? '';
  const onBack = propOnBack ?? (() => navigate('/projects'));

  const [activeTab, setActiveTab] = useState<'tasks' | 'overview' | 'board' | 'gantt' | 'files'>('tasks');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: boardTasks = [] } = useBoardTasks(projectId);

  const tabs = [
    { key: 'tasks',    label: 'Task List',  icon: List },
    { key: 'overview', label: 'Overview',   icon: CheckCircle2 },
    { key: 'board',    label: 'Task Board', icon: LayoutGrid },
    { key: 'gantt',    label: 'Gantt',      icon: GanttChart },
    { key: 'files',    label: 'Files',      icon: FileText },
  ] as const;

  // Compute task stats from board tasks
  const now = new Date();
  const totalTasks     = boardTasks.length;
  const completedTasks = boardTasks.filter(t => t.statusKey === 'DONE' || t.status === 'Completed').length;
  const activeTasks    = boardTasks.filter(t => t.statusKey === 'IN_PROGRESS' || t.status === 'In Progress').length;
  const overdueTasks   = boardTasks.filter(t => {
    const due = t.dueDate || t.dateEnd;
    return due && new Date(due) < now && t.statusKey !== 'DONE';
  }).length;

  if (projectLoading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="animate-pulse text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading project…</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Project not found.</div>
      </div>
    );
  }

  const statusColor = getStatusColor(project.statusKey);
  const dotColor = projectColor(project.id);
  const startDate = project.startDate || project.dateStart;
  const endDate = project.dueDate || project.dateEnd;

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Header */}
      <div
        className="border-b px-8 py-6"
        style={{
          backgroundColor: 'var(--surface-primary)',
          borderColor: 'var(--border-primary)'
        }}
      >
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dotColor }} />

          <h1 className="text-2xl font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>
            {project.name}
          </h1>

          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }}
            onClick={() => setIsAddTaskModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>

          <button
            className="p-2 rounded-lg transition-colors"
            style={{ color: project.isPinned ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Pin className="w-5 h-5" />
          </button>

          <button
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {project.description && (
          <p className="text-sm mb-4 max-w-3xl" style={{ color: 'var(--text-secondary)' }}>
            {project.description}
          </p>
        )}

        {/* Status and Progress */}
        <div className="flex items-center gap-6 mb-6">
          <div
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
          >
            {project.status}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-32 h-2 rounded-full" style={{ backgroundColor: 'var(--border-secondary)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${project.progress}%`, backgroundColor: 'var(--accent-primary)' }}
              />
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {project.progress}%
            </span>
          </div>

          {project.clientName && (
            <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Client: <span style={{ color: 'var(--text-secondary)' }}>{project.clientName}</span>
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: activeTab === tab.key ? 'var(--surface-secondary)' : 'transparent',
                  color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.key) e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.key) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'tasks' && (
          <WorksTable projectId={projectId} />
        )}

        {activeTab === 'overview' && (
          <div className="h-full overflow-auto p-8">
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--surface-primary)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Tasks</span>
                  </div>
                  <div className="text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {totalTasks}
                  </div>
                </div>

                <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--surface-primary)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5" style={{ color: '#22C55E' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Completed</span>
                  </div>
                  <div className="text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {completedTasks}
                  </div>
                </div>

                <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--surface-primary)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5" style={{ color: '#F59E0B' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Active</span>
                  </div>
                  <div className="text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {activeTasks}
                  </div>
                </div>

                <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--surface-primary)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5" style={{ color: '#EF4444' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Overdue</span>
                  </div>
                  <div className="text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {overdueTasks}
                  </div>
                </div>
              </div>

              {/* Project Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--surface-primary)' }}>
                  <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Timeline
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Start: {startDate ?? '—'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        End: {endDate ?? '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--surface-primary)' }}>
                  <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Details
                  </h3>
                  <div className="space-y-2">
                    {project.type && (
                      <div className="flex justify-between">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Type</span>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{project.type}</span>
                      </div>
                    )}
                    {project.size && (
                      <div className="flex justify-between">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Size</span>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{project.size}</span>
                      </div>
                    )}
                    {project.kvadratura && (
                      <div className="flex justify-between">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Area</span>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{project.kvadratura}</span>
                      </div>
                    )}
                    {project.budget != null && (
                      <div className="flex justify-between">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Budget</span>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {project.budget.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {project.clientName && (
                      <div className="flex justify-between">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Client</span>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{project.clientName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'board' && (
          <BoardView
            tasks={boardTasks.map(toCardData)}
            onTaskMove={(taskId, newStatus) => console.log('Task moved:', taskId, newStatus)}
            onTaskClick={(taskId) => console.log('Task clicked:', taskId)}
          />
        )}

        {activeTab === 'gantt' && (
          <GanttView
            tasks={boardTasks.map(toGanttTask)}
            onTaskClick={(taskId) => console.log('Task clicked:', taskId)}
          />
        )}

        {activeTab === 'files' && (
          <div className="h-full overflow-auto p-8">
            <div className="p-12 rounded-xl text-center" style={{ backgroundColor: 'var(--surface-primary)' }}>
              <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>No files yet</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Upload files related to this project
              </p>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium mx-auto"
                style={{ backgroundColor: 'var(--accent-primary)', color: '#ffffff' }}
              >
                <Plus className="w-4 h-4" />
                Upload Files
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        defaultProjectId={projectId}
      />
    </div>
  );
}
