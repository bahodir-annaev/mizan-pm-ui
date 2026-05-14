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
  FileText,
  DollarSign,
  Users,
  ChevronDown,
  Loader2,
  ArrowRight,
  X,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { WorksTable } from '../components/WorksTable';
import { BoardView } from '../components/BoardView';
import { GanttView } from '../components/GanttView';
import { AddTaskModal } from '../components/AddTaskModal';
import { ProjectFinanceTab } from '../components/finance/ProjectFinanceTab';
import { useProject, useTeamAssignments, useCreateTeamAssignment, useActivateTeamAssignment } from '@/hooks/api/useProjects';
import { useBoardTasks } from '@/hooks/api/useTasks';
import { useTeams } from '@/hooks/api/useTeams';
import type { Task } from '@/types/domain';
import type { ApiTeamAssignment } from '@/types/api';

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

  const [activeTab, setActiveTab] = useState<'tasks' | 'overview' | 'board' | 'gantt' | 'files' | 'finance'>('tasks');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: boardTasks = [] } = useBoardTasks(projectId);
  const { data: teams = [] } = useTeams();
  const { data: assignments = [], isLoading: assignmentsLoading } = useTeamAssignments(projectId);
  const createAssignment = useCreateTeamAssignment();
  const activateAssignment = useActivateTeamAssignment();

  const [queueOpen, setQueueOpen] = useState(false);
  const [queueTeamId, setQueueTeamId] = useState('');
  const [queueNotes, setQueueNotes] = useState('');
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);

  const activeAssignment = assignments.find(a => a.status === 'active');
  const pendingAssignment = assignments.find(a => a.status === 'pending');

  const handleQueueSubmit = () => {
    if (!queueTeamId) return;
    createAssignment.mutate(
      { projectId, dto: { teamId: queueTeamId, notes: queueNotes || undefined } },
      {
        onSuccess: () => {
          setQueueOpen(false);
          setQueueTeamId('');
          setQueueNotes('');
        },
      },
    );
  };

  const handleActivate = () => {
    activateAssignment.mutate(projectId);
  };

  const formatAssignmentDate = (iso?: string | null) =>
    iso ? format(parseISO(iso), 'dd MMM yyyy') : '—';

  const tabs = [
    { key: 'tasks',    label: 'Task List',  icon: List },
    { key: 'overview', label: 'Overview',   icon: CheckCircle2 },
    { key: 'board',    label: 'Task Board', icon: LayoutGrid },
    { key: 'gantt',    label: 'Gantt',      icon: GanttChart },
    { key: 'files',    label: 'Files',      icon: FileText },
    { key: 'finance',  label: 'Finance',    icon: DollarSign },
    { key: 'team',     label: 'Team',       icon: Users },
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
  const teamName = project.teamName ?? teams.find(t => t.id === project.teamId)?.name;

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

          {teamName && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-secondary)',
              }}
            >
              <Users className="w-3 h-3" />
              {teamName}
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
                    {teamName && (
                      <div className="flex justify-between">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Team</span>
                        <span className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          <Users className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
                          {teamName}
                        </span>
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

        {activeTab === 'finance' && (
          <ProjectFinanceTab projectId={projectId} />
        )}

        {activeTab === 'team' && (
          <div className="h-full overflow-auto p-8">
            <div className="max-w-2xl mx-auto space-y-6">

              {/* Current state banner */}
              <div
                className="flex items-center justify-between p-5 rounded-xl"
                style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-primary)' }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--accent-primary)20' }}
                  >
                    <Users className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-tertiary)' }}>
                      Active team
                    </p>
                    <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {activeAssignment?.team?.name ?? teamName ?? '—'}
                    </p>
                    {activeAssignment?.activatedAt && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                        Since {formatAssignmentDate(activeAssignment.activatedAt)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Pending assignment action */}
                {pendingAssignment ? (
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--priority-medium)' }}>
                        Pending handoff
                      </p>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {pendingAssignment.team?.name ?? teams.find(t => t.id === pendingAssignment.teamId)?.name ?? pendingAssignment.teamId}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
                    <button
                      onClick={handleActivate}
                      disabled={activateAssignment.isPending}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-60"
                      style={{ backgroundColor: 'var(--accent-primary)', color: '#ffffff' }}
                    >
                      {activateAssignment.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Activate'
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setQueueOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-secondary)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'; }}
                  >
                    <Plus className="w-4 h-4" />
                    Queue next team
                  </button>
                )}
              </div>

              {/* Queue next team form */}
              {queueOpen && (
                <div
                  className="p-5 rounded-xl space-y-4"
                  style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-primary)' }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Queue next team
                    </h3>
                    <button
                      onClick={() => { setQueueOpen(false); setQueueTeamId(''); setQueueNotes(''); }}
                      className="p-1 rounded transition-opacity hover:opacity-60"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Team selector */}
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Team *
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setTeamDropdownOpen(!teamDropdownOpen)}
                        className="w-full px-3 py-2.5 rounded-lg text-left flex items-center justify-between text-sm"
                        style={{
                          backgroundColor: 'var(--surface-secondary)',
                          border: '1px solid var(--border-secondary)',
                          color: queueTeamId ? 'var(--text-primary)' : 'var(--text-tertiary)',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {teams.find(t => t.id === queueTeamId)?.name ?? 'Select team'}
                        </div>
                        <ChevronDown
                          className="w-4 h-4 transition-transform"
                          style={{ transform: teamDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        />
                      </button>
                      {teamDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setTeamDropdownOpen(false)} />
                          <div
                            className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden shadow-lg z-20"
                            style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-primary)' }}
                          >
                            {teams.map(team => (
                              <button
                                key={team.id}
                                type="button"
                                onClick={() => { setQueueTeamId(team.id); setTeamDropdownOpen(false); }}
                                className="w-full px-3 py-2.5 text-left text-sm transition-colors"
                                style={{
                                  color: 'var(--text-primary)',
                                  backgroundColor: queueTeamId === team.id ? 'var(--surface-secondary)' : 'transparent',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = queueTeamId === team.id ? 'var(--surface-secondary)' : 'transparent'; }}
                              >
                                {team.name}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Notes (optional)
                    </label>
                    <textarea
                      value={queueNotes}
                      onChange={(e) => setQueueNotes(e.target.value)}
                      rows={2}
                      placeholder="e.g. Taking over in Q3..."
                      className="w-full px-3 py-2.5 rounded-lg text-sm resize-none outline-none"
                      style={{
                        backgroundColor: 'var(--surface-secondary)',
                        border: '1px solid var(--border-secondary)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => { setQueueOpen(false); setQueueTeamId(''); setQueueNotes(''); }}
                      className="px-4 py-2 rounded-lg text-sm font-medium"
                      style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--surface-secondary)' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleQueueSubmit}
                      disabled={!queueTeamId || createAssignment.isPending}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                      style={{ backgroundColor: 'var(--accent-primary)', color: '#ffffff' }}
                    >
                      {createAssignment.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                      Queue team
                    </button>
                  </div>
                </div>
              )}

              {/* Assignment history */}
              <div>
                <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Assignment history
                </h3>

                {assignmentsLoading ? (
                  <div className="flex items-center gap-2 py-6" style={{ color: 'var(--text-tertiary)' }}>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading…</span>
                  </div>
                ) : assignments.length === 0 ? (
                  <div className="py-8 text-center">
                    <Users className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-tertiary)' }} />
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No assignment history yet</p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Vertical line */}
                    <div
                      className="absolute left-[19px] top-6 bottom-6 w-px"
                      style={{ backgroundColor: 'var(--border-secondary)' }}
                    />
                    <div className="space-y-0">
                      {assignments.map((a: ApiTeamAssignment, idx: number) => {
                        const teamLabel = a.team?.name ?? teams.find(t => t.id === a.teamId)?.name ?? a.teamId;
                        const statusStyles: Record<string, { dot: string; badge: string; text: string; label: string }> = {
                          active:    { dot: '#22C55E', badge: 'rgba(34,197,94,0.12)',   text: '#22C55E',   label: 'Active' },
                          pending:   { dot: '#F59E0B', badge: 'rgba(245,158,11,0.12)',  text: '#F59E0B',   label: 'Pending' },
                          completed: { dot: '#6B7280', badge: 'rgba(107,114,128,0.12)', text: '#9CA3AF',   label: 'Completed' },
                        };
                        const s = statusStyles[a.status] ?? statusStyles.completed;
                        return (
                          <div key={a.id} className="flex gap-5 pb-6 last:pb-0">
                            {/* Dot */}
                            <div className="relative z-10 flex-shrink-0 mt-0.5">
                              <div
                                className="w-[10px] h-[10px] rounded-full ring-2 ring-offset-2"
                                style={{
                                  backgroundColor: s.dot,
                                  ringOffsetColor: 'var(--bg-secondary)',
                                  boxShadow: `0 0 0 3px var(--bg-secondary), 0 0 0 4px ${s.dot}40`,
                                  marginLeft: '14px',
                                  marginTop: '5px',
                                }}
                              />
                            </div>
                            {/* Card */}
                            <div
                              className="flex-1 p-4 rounded-xl"
                              style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-primary)' }}
                            >
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                  {teamLabel}
                                </span>
                                <span
                                  className="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
                                  style={{ backgroundColor: s.badge, color: s.text }}
                                >
                                  {s.label}
                                </span>
                              </div>
                              <div className="flex gap-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                <span>Activated: {formatAssignmentDate(a.activatedAt)}</span>
                                <span>Completed: {formatAssignmentDate(a.completedAt)}</span>
                              </div>
                              {a.notes && (
                                <p className="mt-2 text-xs italic" style={{ color: 'var(--text-secondary)' }}>
                                  "{a.notes}"
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
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
