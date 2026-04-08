/**
 * WorksTable Component with Circular Base Node & Curved Branches
 * 
 * Visual Tree Structure (Professional Task Hierarchy):
 * ┌─────────────────────────────────────┐
 * │ ● Parent Task                       │ ← Solid circular base node
 * └──────────────────────────────────────┘
 *    │
 *    ├── Child Task 1
 *    │
 *    ├── Child Task 2
 *    │
 *    └── Child Task 3
 * 
 * Connector Specifications:
 * - Solid circular base node at parent task (8px diameter, 60% opacity)
 * - One continuous vertical line starting from the circle (1.5px, 50% opacity)
 * - Smooth curved branches extending to the right from vertical line
 * - Fluid Bezier curves (not angular corners)
 * - No arrow heads - simple clean lines
 * - Rounded stroke caps and joins
 * - Neutral gray (#9ca3af) 
 * - Even vertical spacing, each branch aligns to row center
 * - Clean, modern, minimal design
 * - Hover effect: increased opacity and stroke width for better visibility
 */

import { useState, useEffect } from 'react';
import { 
  ChevronDown,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Star, 
  Copy, 
  Trash2, 
  FolderOpen,
  SquareCheck,
  Flag,
  Layers,
  Target,
  Key,
  CalendarRange,
  FileText,
  File,
  ClipboardList,
  Circle,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Home,
  PaintBucket,
  Building,
  Trees,
  Box,
  Eye,
  Pencil,
  Wrench,
  Users,
  MessageSquare,
  Ellipsis,
  Square,
  Link2,
  User,
  GitBranch,
  Calendar,
  CalendarClock,
  TrendingUp,
  LayoutList
} from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { UnifiedWorkflowCell } from './UnifiedWorkflowCell';
import { TaskDetailPage } from './TaskDetailPage';
import { AddTaskRow } from './AddTaskRow';
import { AddTaskModal } from './AddTaskModal';
import { ColumnEditorModal, ColumnConfig } from './ColumnEditorModal';
import { useColumnConfig } from '../hooks/useColumnConfig';
import { EditableColumnHeader } from './EditableColumnHeader';
import { EditableWorkCell } from './EditableWorkCell';
import { TaskTimeTrackingControl } from './TaskTimeTrackingControl';
import { CompactDateCell } from './CompactDateCell';
import { useProjectTasks, useAllTasks, useUpdateTask } from '@/hooks/api/useTasks';
import type { Task, TreeTask } from '@/types/domain';
import type { TaskStatus, AcceptanceStatus } from '@/types/api';

// Map legacy display strings to TaskStatus enum values
const LEGACY_STATUS_TO_KEY: Record<string, TaskStatus> = {
  'Start':       'TODO',
  'In Progress': 'IN_PROGRESS',
  'Burning':     'IN_PROGRESS',
  'End':         'DONE',
  'Late':        'IN_PROGRESS',
  'Planning':    'PLANNING',
  // Pass-through for values already in enum form
  'PLANNING':    'PLANNING',
  'TODO':        'TODO',
  'IN_PROGRESS': 'IN_PROGRESS',
  'IN_REVIEW':   'IN_REVIEW',
  'DONE':        'DONE',
  'CANCELLED':   'CANCELLED',
};

// Map legacy acceptance strings to AcceptanceStatus enum values
const LEGACY_ACCEPTANCE_TO_KEY: Record<string, AcceptanceStatus> = {
  'Pending review':  'PENDING',
  'Approved':        'ACCEPTED',
  'Rejected':        'REJECTED',
  'Needs revision':  'REVISION',
  // Pass-through
  'PENDING':   'PENDING',
  'ACCEPTED':  'ACCEPTED',
  'REJECTED':  'REJECTED',
  'REVISION':  'REVISION',
};

const STATUS_DISPLAY: Record<string, string> = {
  PLANNING:    'Planning',
  TODO:        'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW:   'In Review',
  DONE:        'Done',
  CANCELLED:   'Cancelled',
};


interface Work {
  id: string;
  code?: string;
  title: string;
  description?: string;
  project?: string;
  projectId?: string;
  assignee: {
    id?: string;
    name: string;
    initials: string;
    color: string;
  };
  participants: Array<{
    id?: string;
    name: string;
    initials: string;
    color: string;
  }>;
  status: string;
  statusKey?: string;
  priority: string;
  priorityKey?: string;
  dateStart: string;
  dateEnd: string;
  progress: number;
  workType: string;
  volume?: string;
  unit?: string;
  acceptance: string;
  dependencies?: {
    blockedBy: string[];
    blocks: string[];
  };
  subtasks?: Array<{
    id: string; // real task ID for mutations
    title: string;
    completed: boolean;
    assignee?: {
      name: string;
      initials: string;
      color: string;
    };
    participants?: Array<{
      name: string;
      initials: string;
      color: string;
    }>;
    status: string;
    priority: string;
    dateStart: string;
    dateEnd: string;
    progress: number;
    workType: string;
    acceptance: string;
  }>;
}

function taskToWork(task: Task | TreeTask): Work {
  // children from TreeTask take priority over legacy inline subtasks
  const childTasks = 'children' in task ? (task as TreeTask).children : undefined;
  const legacySubtasks = task.subtasks;

  let subtasks: Work['subtasks'];

  if (childTasks && childTasks.length > 0) {
    // Real child tasks with IDs — use these for tree rendering
    subtasks = childTasks.map(child => ({
      id: child.id,
      title: child.title,
      completed: child.statusKey === 'DONE' || ['Done', 'End', 'Completed'].includes(child.status),
      assignee: child.assignee
        ? { name: child.assignee.name, initials: child.assignee.initials, color: child.assignee.color }
        : undefined,
      participants: (child.participants ?? []).map(p => ({ name: p.name, initials: p.initials, color: p.color })),
      status: LEGACY_STATUS_TO_KEY[child.statusKey ?? child.status] ?? 'TODO',
      priority: child.priority,
      dateStart: child.startDate ?? child.dateStart ?? '',
      dateEnd: child.dueDate ?? child.dateEnd ?? '',
      progress: child.progress ?? 0,
      workType: child.workType ?? '',
      acceptance: LEGACY_ACCEPTANCE_TO_KEY[child.acceptance ?? ''] ?? 'PENDING',
    }));
  } else if (legacySubtasks && legacySubtasks.length > 0) {
    // Legacy inline subtasks (fallback, no real IDs)
    subtasks = legacySubtasks.map((st, i) => ({
      id: `${task.id}-sub-${i}`,
      title: st.title,
      completed: st.statusKey === 'DONE' || ['Done', 'End', 'Completed'].includes(st.status),
      assignee: st.assignee ? { name: st.assignee.name, initials: st.assignee.initials, color: st.assignee.color } : undefined,
      participants: (st.participants ?? []).map(p => ({ name: p.name, initials: p.initials, color: p.color })),
      status: LEGACY_STATUS_TO_KEY[st.statusKey ?? st.status] ?? 'TODO',
      priority: st.priority,
      dateStart: st.startDate ?? st.dateStart ?? '',
      dateEnd: st.dueDate ?? st.dateEnd ?? '',
      progress: st.progress ?? 0,
      workType: st.workType ?? '',
      acceptance: LEGACY_ACCEPTANCE_TO_KEY[st.acceptance ?? ''] ?? 'PENDING',
    }));
  }

  return {
    id: task.id,
    code: task.code,
    title: task.title,
    description: task.description,
    project: task?.project?.name ?? (task as any).project,
    projectId: task.projectId,
    assignee: task.assignee
      ? { id: task.assignee.id, name: task.assignee.name, initials: task.assignee.initials, color: task.assignee.color }
      : { name: 'Unassigned', initials: '?', color: 'bg-gray-400' },
    participants: (task.participants ?? []).map(p => ({ id: p.id, name: p.name, initials: p.initials, color: p.color })),
    status: task.status,
    statusKey: LEGACY_STATUS_TO_KEY[task.statusKey ?? task.status] ?? 'TODO',
    priority: task.priority,
    priorityKey: task.priorityKey,
    dateStart: task.startDate ?? task.dateStart ?? '',
    dateEnd: task.dueDate ?? task.dateEnd ?? '',
    progress: task.progress ?? 0,
    workType: task.workType ?? '',
    volume: task.volume,
    unit: task.unit,
    acceptance: LEGACY_ACCEPTANCE_TO_KEY[task.acceptance ?? ''] ?? 'PENDING',
    subtasks,
  };
}

const statusOptions = [
  { value: 'IN_PROGRESS', className: 'status-progress' },
  { value: 'TODO',        className: 'status-start' },
  { value: 'PLANNING',    className: 'status-start' },
  { value: 'IN_REVIEW',  className: 'status-burning' },
  { value: 'DONE',       className: 'status-end' },
  { value: 'CANCELLED',  className: 'status-late' },
];

const priorityOptions = [
  { value: 'Low', className: 'priority-low', icon: ArrowDown },
  { value: 'Medium', className: 'priority-medium', icon: ArrowRight },
  { value: 'High', className: 'priority-high', icon: ArrowUp },
];

const acceptanceOptions = [
  { value: 'PENDING',   style: { color: 'var(--text-tertiary)' } },
  { value: 'ACCEPTED',  style: { color: 'var(--status-start)' } },
  { value: 'REJECTED',  style: { color: 'var(--status-late)' } },
  { value: 'REVISION',  style: { color: 'var(--status-burning)' } },
];

// Helper function to get task type icon
const getTaskTypeIcon = (title: string) => {
  // Simple logic: milestone has "milestone" in title, epic has "epic"
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('milestone')) return Target;
  if (lowerTitle.includes('epic')) return Layers;
  return SquareCheck;
};

// Helper function to get work type icon
const getWorkTypeIcon = (workType: string) => {
  const iconMap: Record<string, any> = {
    'Architecture': Home,
    'Interior Design': PaintBucket,
    'Exterior Design': Building,
    'Landscape': Trees,
    'Working Drawings': FileText,
    '3D Visualization': Box,
    'Author Supervision': Eye,
    'Documentation': File,
    'Engineering': Wrench,
    'Client Coordination': Users,
  };
  return iconMap[workType] || Home;
};

// Helper function to get status icon (keyed by TaskStatus enum)
const getStatusIcon = (statusKey: string) => {
  const iconMap: Record<string, any> = {
    'PLANNING':    Circle,
    'TODO':        Play,
    'IN_PROGRESS': Play,
    'IN_REVIEW':   AlertCircle,
    'DONE':        CheckCircle2,
    'CANCELLED':   Clock,
  };
  return iconMap[statusKey] || Circle;
};

// Default column configuration
const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'checkbox', label: '', visible: true, locked: true },
  { id: 'id', label: 'ID', visible: true, locked: false },
  { id: 'title', label: 'Task title', visible: true, locked: false },
  { id: 'project', label: 'Project', visible: true, locked: false },
  { id: 'assignee', label: 'Assignee', visible: true, locked: false },
  { id: 'participants', label: 'Participants', visible: true, locked: false },
  { id: 'workflow', label: 'Workflow', visible: true, locked: false },
  { id: 'dateStart', label: 'Start date', visible: true, locked: false },
  { id: 'dateEnd', label: 'Due date', visible: true, locked: false },
  { id: 'progress', label: 'Progress', visible: true, locked: false },
  { id: 'workType', label: 'Work type', visible: true, locked: false },
  { id: 'actions', label: 'Actions', visible: true, locked: false },
  { id: 'control', label: '', visible: true, locked: true },
];

interface WorksTableProps {
  projectId?: string;
}

const EMPTY_TREE: TreeTask[] = [];

export function WorksTable({ projectId }: WorksTableProps = {}) {
  const projectQuery = useProjectTasks({ projectId: projectId ?? '' });
  const allQuery = useAllTasks(undefined, { enabled: !projectId });

  const isLoading = projectId ? projectQuery.isLoading : allQuery.isLoading;
  const isError   = projectId ? projectQuery.isError   : allQuery.isError;
  const error     = projectId ? projectQuery.error      : allQuery.error;

  const rootTasks: TreeTask[] = projectId
    ? (projectQuery.data?.tree ?? EMPTY_TREE)
    : (allQuery.data?.tree ?? EMPTY_TREE);
  const updateTask = useUpdateTask();
  const [selectedWorks, setSelectedWorks] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'detail'>('table');
  const [detailTask, setDetailTask] = useState<Work | null>(null);
  const [isColumnEditorOpen, setIsColumnEditorOpen] = useState(false);
  const [worksData, setWorksData] = useState<Work[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Work | null>(null);
  const [subtaskParent, setSubtaskParent] = useState<{ id: string; title: string; projectId: string } | null>(null);

  // Sync local state from tree roots whenever the query data changes
  useEffect(() => {
    setWorksData(rootTasks.map(taskToWork));
  }, [rootTasks]);
  
  const {
    columns,
    visibleColumns,
    renameColumn,
    saveColumns,
    resetColumns,
    getColumnById
  } = useColumnConfig({
    storageKey: 'works-table-columns',
    defaultColumns: DEFAULT_COLUMNS
  });

  const canEditColumns = true; // In real app, check user permissions
  const canEditTasks = true; // In real app, check user permissions

  // useProjectTasks already scopes data to the project; no secondary filter needed
  const filteredWorks = worksData;

  // Sort works: In Progress at top, then by original order
  const sortedWorks = [...filteredWorks].sort((a, b) => {
    const aInProgress = a.statusKey === 'IN_PROGRESS';
    const bInProgress = b.statusKey === 'IN_PROGRESS';
    
    if (aInProgress && !bInProgress) return -1;
    if (!aInProgress && bInProgress) return 1;
    return 0;
  });

  // Count active tasks
  const activeTasksCount = sortedWorks.filter(w => w.statusKey === 'IN_PROGRESS').length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedWorks(worksData.map(w => w.id));
    } else {
      setSelectedWorks([]);
    }
  };

  const handleSelectWork = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedWorks([...selectedWorks, id]);
    } else {
      setSelectedWorks(selectedWorks.filter(wid => wid !== id));
    }
  };

  const handleOpenTaskDetail = (work: Work) => {
    setDetailTask(work);
    setViewMode('detail');
  };

  const handleBackToTable = () => {
    setViewMode('table');
    setDetailTask(null);
  };

  // Toggle task expansion for subtasks
  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  // Field name mapping from Work interface to UpdateTaskDto
  const WORK_FIELD_TO_DTO: Partial<Record<keyof Work, string>> = {
    dateStart: 'startDate',
    dateEnd: 'dueDate',
  };

  // Handler for updating work data — optimistic local update + API call
  const handleUpdateWork = (workId: string, field: keyof Work, value: any) => {
    // Optimistic local update
    setWorksData(prevWorks =>
      prevWorks.map(work => work.id === workId ? { ...work, [field]: value } : work)
    );
    // Persist to API
    const apiField = WORK_FIELD_TO_DTO[field] ?? field;
    updateTask.mutate({ id: workId, dto: { [apiField]: value } });
  };

  const getStatusColor = (status: string) => {
    return statusOptions.find(s => s.value === status)?.className || statusOptions[0].className;
  };

  const getPriorityIcon = (priority: string) => {
    const option = priorityOptions.find(p => p.value === priority) || priorityOptions[0];
    return option;
  };

  const getAcceptanceColor = (acceptance: string) => {
    return acceptanceOptions.find(a => a.value === acceptance)?.style || acceptanceOptions[0].style;
  };

  const handleAddTask = (task: {
    title: string;
    project?: string;
    status: string;
    assignee?: string;
    dueDate?: string;
  }) => {
    console.log('New task created:', task);
    // In a real app, this would add the task to your data store
    // For now, just log it
  };

  const handleStartTask = (workId: string) => {
    if (!canEditTasks) return;
    setWorksData(prevWorks =>
      prevWorks.map(work => work.id === workId ? { ...work, statusKey: 'IN_PROGRESS', status: 'In Progress' } : work)
    );
    updateTask.mutate({ id: workId, dto: { status: 'IN_PROGRESS' } });
  };

  const handlePauseTask = (workId: string) => {
    if (!canEditTasks) return;
    setWorksData(prevWorks =>
      prevWorks.map(work => work.id === workId ? { ...work, statusKey: 'TODO', status: 'To Do' } : work)
    );
    updateTask.mutate({ id: workId, dto: { status: 'TODO' } });
  };

  const handleToggleTaskStatus = (workId: string, currentStatusKey: string) => {
    if (currentStatusKey === 'IN_PROGRESS') {
      handlePauseTask(workId);
    } else if (currentStatusKey === 'TODO' || currentStatusKey === 'PLANNING') {
      handleStartTask(workId);
    }
  };

  // If in detail view mode, show TaskDetailPage
  if (viewMode === 'detail' && detailTask) {
    return <TaskDetailPage task={detailTask} onBack={handleBackToTable} />;
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading tasks...</span>
      </div>
    );
  }

  if (isError) {
    console.error('[WorksTable] Failed to load tasks:', error);
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <span className="text-sm" style={{ color: '#EF4444' }}>
          Failed to load tasks: {(error as Error)?.message ?? 'Unknown error'}
        </span>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Column Editor Modal */}
      <ColumnEditorModal
        isOpen={isColumnEditorOpen}
        onClose={() => setIsColumnEditorOpen(false)}
        columns={columns}
        onSave={saveColumns}
        onReset={resetColumns}
      />

      {/* Edit Task Modal */}
      <AddTaskModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingTask(null);
        }}
        initialData={editingTask}
        mode="edit"
      />

      {/* Add Subtask Modal */}
      <AddTaskModal
        isOpen={!!subtaskParent}
        onClose={() => setSubtaskParent(null)}
        mode="create"
        defaultProjectId={subtaskParent?.projectId}
        parentTaskId={subtaskParent?.id}
        parentTaskTitle={subtaskParent?.title}
      />

      {/* Table */}
      <div className="works-table-container flex-1 overflow-auto">
        <div className="min-w-full">
          <table className="works-table w-full border-collapse">
            <tbody>
              {/* Active Tasks Label */}
              {activeTasksCount > 0 && (
                <>
                  <tr>
                    <td colSpan={13} className="px-4 py-2 border-b" style={{ 
                      backgroundColor: 'var(--surface-primary)',
                      borderColor: 'var(--border-secondary)'
                    }}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{ backgroundColor: 'var(--accent-primary)' }}
                        />
                        <span className="text-xs uppercase tracking-wider" style={{ 
                          color: 'var(--text-tertiary)',
                          fontWeight: 500
                        }}>
                          In Progress ({activeTasksCount})
                        </span>
                      </div>
                    </td>
                  </tr>
                  {/* Section Header Row */}
                  <tr style={{ 
                    backgroundColor: 'var(--surface-primary)',
                    borderBottom: '1px solid var(--border-secondary)'
                  }}>
                    <th className="w-12 px-4 py-2"></th>
                    <th className="px-4 py-2 text-left text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      <div className="flex items-center h-full">
                        <span>ID</span>
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left text-xs min-w-[280px]" style={{ color: 'var(--text-secondary)' }}>
                      <div className="flex items-center gap-2">
                        <LayoutList className="w-3.5 h-3.5" style={{ opacity: 0.6 }} />
                        <span>Task title</span>
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-3.5 h-3.5" style={{ opacity: 0.6 }} />
                        <span>Project</span>
                      </div>
                    </th>
                    <th className="pl-4 pr-2 py-2 text-left text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5" style={{ opacity: 0.6 }} />
                        <span>Assignee</span>
                      </div>
                    </th>
                    <th className="pl-2 pr-4 py-2 text-left text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" style={{ opacity: 0.6 }} />
                        <span>Participants</span>
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-3.5 h-3.5" style={{ opacity: 0.6 }} />
                        <span>Workflow</span>
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" style={{ opacity: 0.6 }} />
                        <span>Dates</span>
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left text-xs min-w-[120px]" style={{ color: 'var(--text-secondary)' }}>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5" style={{ opacity: 0.6 }} />
                        <span>Progress</span>
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5" style={{ opacity: 0.6 }} />
                        <span>Work type</span>
                      </div>
                    </th>
                    <th className="w-32 px-4 py-2 text-left text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      <div className="flex items-center h-full">
                        <span>Actions</span>
                      </div>
                    </th>
                    <th className="w-12 px-4 py-2"></th>
                  </tr>
                </>
              )}
              {sortedWorks.map((work, index) => {
                const isSelected = selectedWorks.includes(work.id);
                const isActive = work.statusKey === 'IN_PROGRESS';
                const isLastActiveTask = isActive && sortedWorks[index + 1]?.statusKey !== 'IN_PROGRESS';
                const priorityInfo = getPriorityIcon(work.priority);
                const PriorityIcon = priorityInfo.icon;
                const TaskTypeIcon = getTaskTypeIcon(work.title);
                const WorkTypeIcon = getWorkTypeIcon(work.workType);
                const StatusIcon = getStatusIcon(work.statusKey ?? '');
                const canStart = work.statusKey === 'TODO' || work.statusKey === 'PLANNING';
                const canPause = work.statusKey === 'IN_PROGRESS';

                const hasExpandedSubtasks = work.subtasks && work.subtasks.length > 0 && expandedTasks.has(work.id);

                // Task Row
                const mainRow = (
                  <tr
                    key={work.id}
                    className="transition-colors group relative"
                    tabIndex={0}
                    style={{
                      borderBottomColor: hasExpandedSubtasks ? 'transparent' : (isLastActiveTask ? 'var(--border-primary)' : 'var(--border-secondary)'),
                      borderBottomWidth: isLastActiveTask ? '2px' : '1px',
                      borderBottomStyle: 'solid',
                      backgroundColor: isSelected
                        ? 'var(--accent-primary-bg)'
                        : isActive
                          ? 'var(--surface-secondary)'
                          : hasExpandedSubtasks
                            ? 'transparent'
                            : 'transparent',
                      borderLeftWidth: isActive ? '3px' : '0',
                      borderLeftColor: isActive ? 'var(--accent-primary)' : 'transparent',
                      borderLeftStyle: 'solid'
                    }}
                    onKeyDown={(e) => {
                      // Enter or Space to start/pause task
                      if ((e.key === 'Enter' || e.key === ' ') && canEditTasks && (canStart || canPause)) {
                        e.preventDefault();
                        handleToggleTaskStatus(work.id, work.statusKey ?? '');
                      }
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = isActive 
                          ? 'var(--surface-tertiary)' 
                          : 'var(--surface-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = isActive 
                          ? 'var(--surface-secondary)' 
                          : 'transparent';
                      } else {
                        e.currentTarget.style.backgroundColor = 'var(--accent-primary-bg)';
                      }
                    }}
                  >
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectWork(work.id, e.target.checked)}
                        className="w-4 h-4 rounded"
                        style={{
                          borderColor: 'var(--border-primary)',
                          backgroundColor: 'var(--input-bg)',
                          accentColor: 'var(--accent-primary)'
                        }}
                      />
                    </td>
                    <td className="px-4 py-4 text-sm" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenTaskDetail(work)}
                        className="font-mono hover:underline underline-offset-2 transition-colors cursor-pointer"
                        style={{ color: 'var(--accent-primary)' }}
                        title="Open task detail"
                      >
                        {work.code ?? work.id}
                      </button>
                    </td>
                    <td className="px-4 py-4" style={{ position: 'relative' }}>
                      {/* TREE STRUCTURE: Circular base node + Vertical spine line extending from parent down to children */}
                      {work.subtasks && work.subtasks.length > 0 && expandedTasks.has(work.id) && (
                        <svg
                          className="parent-connector transition-all duration-200"
                          style={{
                            position: 'absolute',
                            left: '27px',
                            top: '0',
                            width: '10px',
                            height: '100%',
                            overflow: 'visible',
                            pointerEvents: 'none',
                            zIndex: 1
                          }}
                          preserveAspectRatio="none"
                          viewBox="0 0 10 100"
                        >
                          {/* Solid circular base node at parent task */}
                          <circle
                            cx="5"
                            cy="50"
                            r="4"
                            fill="#9ca3af"
                            opacity="0.6"
                            vectorEffect="non-scaling-stroke"
                          />
                          
                          {/* Vertical line extending down from circle */}
                          <line
                            x1="5"
                            y1="54"
                            x2="5"
                            y2="100"
                            stroke="#9ca3af"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            opacity="0.5"
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>
                      )}
                      
                      <div className="flex flex-col gap-1.5" style={{ position: 'relative', zIndex: 2 }}>
                        {/* Task Title Row */}
                        <div className="flex items-center gap-2.5">
                          {/* Chevron for subtasks */}
                          {work.subtasks && work.subtasks.length > 0 ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskExpansion(work.id);
                              }}
                              className="flex-shrink-0 transition-all p-0.5 rounded relative"
                              style={{ 
                                color: 'var(--text-tertiary)',
                                backgroundColor: expandedTasks.has(work.id) ? 'var(--surface-secondary)' : 'transparent'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--text-secondary)';
                                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--text-tertiary)';
                                e.currentTarget.style.backgroundColor = expandedTasks.has(work.id) ? 'var(--surface-secondary)' : 'transparent';
                              }}
                              title={expandedTasks.has(work.id) ? `Hide ${work.subtasks.length} subtasks` : `Show ${work.subtasks.length} subtasks`}
                            >
                              {expandedTasks.has(work.id) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          ) : (
                            <div className="w-4 h-4 flex-shrink-0" />
                          )}
                          <TaskTypeIcon 
                            className="w-4 h-4 flex-shrink-0 opacity-40 group-hover:opacity-60 transition-opacity" 
                            style={{ color: 'var(--text-tertiary)' }} 
                          />
                          <span 
                            className="text-sm transition-colors" 
                            style={{ 
                              color: 'var(--text-primary)',
                              fontWeight: isActive ? 500 : 400
                            }}
                          >
                            {work.title}
                          </span>
                          
                          {/* Subtask Count Badge */}
                          {work.subtasks && work.subtasks.length > 0 && (
                            <div 
                              className="flex items-center gap-1 px-1.5 py-0.5 rounded transition-all"
                              style={{
                                backgroundColor: expandedTasks.has(work.id) ? 'var(--accent-primary-bg)' : 'var(--surface-secondary)',
                                fontSize: '11px',
                                color: expandedTasks.has(work.id) ? 'var(--accent-primary)' : 'var(--text-tertiary)'
                              }}
                            >
                              <Layers className="w-3 h-3" />
                              <span>{work.subtasks.filter(st => st.completed).length}/{work.subtasks.length}</span>
                            </div>
                          )}
                          
                          {/* Dependencies Indicator */}
                          {work.dependencies && (work.dependencies.blockedBy.length > 0 || work.dependencies.blocks.length > 0) && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  className="p-1 rounded transition-colors"
                                  style={{
                                    color: work.dependencies.blockedBy.length > 0 ? '#F59E0B' : '#5B9AFF',
                                    backgroundColor: work.dependencies.blockedBy.length > 0 ? '#F59E0B20' : '#5B9AFF20'
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = (work.dependencies?.blockedBy?.length ?? 0) > 0 ? '#F59E0B30' : '#5B9AFF30';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = (work.dependencies?.blockedBy?.length ?? 0) > 0 ? '#F59E0B20' : '#5B9AFF20';
                                  }}
                                  title="Dependencies"
                                >
                                  <Link2 className="w-3.5 h-3.5" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent 
                                className="w-80 p-0" 
                                style={{
                                  backgroundColor: 'var(--surface-primary)',
                                  borderColor: 'var(--border-primary)',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Link2 className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                                    <span className="text-sm" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                                      Task Dependencies
                                    </span>
                                  </div>
                                  
                                  {work.dependencies.blockedBy.length > 0 && (
                                    <div className="mb-4">
                                      <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>
                                        Blocked By ({work.dependencies.blockedBy.length})
                                      </div>
                                      <div className="space-y-2">
                                        {work.dependencies.blockedBy.map((taskId) => {
                                          const depTask = worksData.find(w => w.id === taskId);
                                          return (
                                            <div 
                                              key={taskId}
                                              className="flex items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer"
                                              style={{ backgroundColor: 'var(--surface-secondary)' }}
                                              onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                                              }}
                                              onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                                              }}
                                              onClick={() => {
                                                if (depTask) handleOpenTaskDetail(depTask);
                                              }}
                                            >
                                              <div
                                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: '#F59E0B' }}
                                              />
                                              <div className="flex-1 min-w-0">
                                                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                                  {taskId}
                                                </div>
                                                <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                                                  {depTask?.title || 'Unknown task'}
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {work.dependencies.blocks.length > 0 && (
                                    <div>
                                      <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>
                                        Blocks ({work.dependencies.blocks.length})
                                      </div>
                                      <div className="space-y-2">
                                        {work.dependencies.blocks.map((taskId) => {
                                          const depTask = worksData.find(w => w.id === taskId);
                                          return (
                                            <div 
                                              key={taskId}
                                              className="flex items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer"
                                              style={{ backgroundColor: 'var(--surface-secondary)' }}
                                              onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                                              }}
                                              onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                                              }}
                                              onClick={() => {
                                                if (depTask) handleOpenTaskDetail(depTask);
                                              }}
                                            >
                                              <div
                                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: '#5B9AFF' }}
                                              />
                                              <div className="flex-1 min-w-0">
                                                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                                  {taskId}
                                                </div>
                                                <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                                                  {depTask?.title || 'Unknown task'}
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                        {/* Priority + Add Subtask */}
                        <div className="flex items-center ml-6 gap-2" onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={work.priority}
                            onValueChange={(newPriority) => {
                              setWorksData(prevWorks =>
                                prevWorks.map(w =>
                                  w.id === work.id ? { ...w, priority: newPriority } : w
                                )
                              );
                              updateTask.mutate({ id: work.id, dto: { priority: newPriority.toUpperCase() as import('@/types/api').TaskPriority } });
                            }}
                          >
                            <SelectTrigger 
                              className="h-auto border-0 shadow-none p-0 hover:opacity-80 transition-opacity focus:ring-0 focus:ring-offset-0"
                              style={{ width: 'auto', backgroundColor: 'transparent' }}
                            >
                              <SelectValue>
                                <span className={`text-xs ${priorityInfo.className}`}>
                                  {work.priority}
                                </span>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent style={{
                              backgroundColor: 'var(--surface-primary)',
                              borderColor: 'var(--border-primary)'
                            }}>
                              {priorityOptions.map(option => {
                                return (
                                  <SelectItem key={option.value} value={option.value}>
                                    <span className={`text-xs ${option.className}`}>
                                      {option.value}
                                    </span>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <button
                            title="Add subtask"
                            onClick={() => setSubtaskParent({ id: work.id, title: work.title, projectId: work.projectId ?? '' })}
                            className="flex items-center justify-center w-5 h-5 rounded hover:bg-[var(--surface-hover)] ml-auto"
                            style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}
                          >
                            <Plus style={{ width: '13px', height: '13px' }} />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <FolderOpen 
                          className="w-3.5 h-3.5 flex-shrink-0 opacity-30 group-hover:opacity-50 transition-opacity" 
                          style={{ color: 'var(--text-tertiary)' }} 
                        />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {work.project}
                        </span>
                      </div>
                    </td>
                    <td className="pl-4 pr-1 py-4">
                      <div className="flex items-center gap-2">
                        <div className="relative group/avatar">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className={`${work.assignee.color} text-white text-xs`}>
                              {work.assignee.initials}
                            </AvatarFallback>
                          </Avatar>
                          {/* Tooltip on hover */}
                          <div
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded opacity-0 group-hover/avatar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50"
                            style={{
                              fontSize: '11px',
                              fontFamily: 'var(--font-text)',
                              backgroundColor: 'var(--popover)',
                              color: 'var(--popover-foreground)',
                              boxShadow: 'var(--shadow-md)',
                              border: '1px solid var(--border)'
                            }}
                          >
                            {work.assignee.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="pl-1 pr-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-3">
                          {work.participants.map((participant, i) => (
                            <div key={i} className="relative group/avatar">
                              <Avatar className="w-10 h-10 border-2" style={{ borderColor: 'var(--bg-secondary)' }}>
                                <AvatarFallback className={`${participant.color} text-white text-xs`}>
                                  {participant.initials}
                                </AvatarFallback>
                              </Avatar>
                              {/* Tooltip on hover */}
                              <div
                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded opacity-0 group-hover/avatar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50"
                                style={{
                                  fontSize: '11px',
                                  fontFamily: 'var(--font-text)',
                                  backgroundColor: 'var(--popover)',
                                  color: 'var(--popover-foreground)',
                                  boxShadow: 'var(--shadow-md)',
                                  border: '1px solid var(--border)'
                                }}
                              >
                                {participant.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      {/* Unified Workflow - Single button with all states */}
                      <UnifiedWorkflowCell
                        executionState={work.statusKey ?? 'TODO'}
                        reviewState={work.acceptance}
                        onExecutionChange={(newStatusKey) => {
                          setWorksData(prevWorks =>
                            prevWorks.map(w =>
                              w.id === work.id
                                ? { ...w, statusKey: newStatusKey, status: STATUS_DISPLAY[newStatusKey] ?? newStatusKey }
                                : w
                            )
                          );
                          updateTask.mutate({ id: work.id, dto: { status: newStatusKey as TaskStatus } });
                        }}
                        onReviewChange={(newReview) => {
                          setWorksData(prevWorks =>
                            prevWorks.map(w =>
                              w.id === work.id ? { ...w, acceptance: newReview } : w
                            )
                          );
                          updateTask.mutate({ id: work.id, dto: { acceptance: newReview as AcceptanceStatus } });
                        }}
                        isActive={isActive}
                      />
                    </td>
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <CompactDateCell 
                        startDate={work.dateStart}
                        dueDate={work.dateEnd}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 relative h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
                          <div 
                            className="absolute top-0 left-0 h-full rounded-full transition-all"
                            style={{ 
                              width: `${work.progress}%`,
                              backgroundColor: 'var(--accent-primary)',
                              opacity: isActive ? 1 : 0.7
                            }}
                          />
                        </div>
                        <span 
                          className="text-xs min-w-[3ch]" 
                          style={{ 
                            color: 'var(--text-tertiary)',
                            fontWeight: isActive ? 500 : 400
                          }}
                        >
                          {work.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <EditableWorkCell
                        field="workType"
                        value={work.workType}
                        onChange={(newType) => handleUpdateWork(work.id, 'workType', newType)}
                      />
                    </td>
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2 h-full">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                          className="p-1.5 rounded transition-colors" 
                          style={{ color: 'var(--text-tertiary)' }}
                          title="Edit task"
                          onClick={() => { setEditingTask(work); setEditModalOpen(true); }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--text-tertiary)';
                          }}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-1.5 rounded transition-colors" 
                          style={{ color: 'var(--text-tertiary)' }}
                          title="Duplicate"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--text-tertiary)';
                          }}>
                          <Copy className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-1.5 rounded transition-colors" 
                          style={{ color: 'var(--text-tertiary)' }}
                          title="Comment"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--text-tertiary)';
                          }}>
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-1.5 rounded transition-colors" 
                          style={{ color: 'var(--text-tertiary)' }}
                          title="More"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--text-tertiary)';
                          }}>
                          <Ellipsis className="w-4 h-4" />
                        </button>
                        </div>
                        <TaskTimeTrackingControl taskId={work.id} />
                      </div>
                    </td>
                    <td className="px-4 py-4"></td>
                  </tr>
                );

                const dividerRows = isLastActiveTask ? [
                  <tr key={`${work.id}-divider-space`}>
                      <td colSpan={13} className="px-4 py-0 h-3" style={{ 
                        backgroundColor: 'var(--bg-secondary)'
                      }}>
                        <div className="h-full" />
                      </td>
                    </tr>,
                  <tr key={`${work.id}-completed-label`}>
                      <td colSpan={13} className="px-4 py-2 border-b" style={{ 
                        backgroundColor: 'var(--surface-primary)',
                        borderColor: 'var(--border-secondary)'
                      }}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase tracking-wider" style={{ 
                            color: 'var(--text-tertiary)',
                            fontWeight: 500
                          }}>
                            Other Tasks
                          </span>
                        </div>
                      </td>
                    </tr>,
                  <tr key={`${work.id}-completed-header`} style={{ 
                      backgroundColor: 'var(--surface-primary)',
                      borderBottom: '1px solid var(--border-secondary)'
                    }}>
                      <th className="w-12 px-4 py-2"></th>
                      <th className="px-4 py-2 text-left text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        <div className="flex items-center h-full">
                          <span>ID</span>
                        </div>
                      </th>
                      <th className="px-4 py-2 text-left text-xs min-w-[280px]" style={{ color: 'var(--text-secondary)' }}>
                        <div className="flex items-center gap-2">
                          <LayoutList className="w-3.5 h-3.5" style={{ opacity: 0.6 }} />
                          <span>Task title</span>
                        </div>
                      </th>
                      <th className="px-4 py-2 text-left text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-3.5 h-3.5" style={{ opacity: 0.6 }} />
                          <span>Project</span>
                        </div>
                      </th>
                      <th className="pl-4 pr-2 py-2 text-left text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5" style={{ opacity: 0.6 }} />
                          <span>Assignee</span>
                        </div>
                      </th>
                      <th className="pl-2 pr-4 py-2 text-left text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5" style={{ opacity: 0.6 }} />
                          <span>Participants</span>
                        </div>
                      </th>
                      <th className="px-4 py-2 text-left text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <div className="flex items-center gap-2">
                          <GitBranch className="w-3.5 h-3.5" style={{ opacity: 0.6 }} />
                          <span>Workflow</span>
                        </div>
                      </th>
                      <th className="px-4 py-2 text-left text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" style={{ opacity: 0.6 }} />
                          <span>Start date</span>
                        </div>
                      </th>
                      <th className="px-4 py-2 text-left text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        <div className="flex items-center gap-2">
                          <CalendarClock className="w-3.5 h-3.5" style={{ opacity: 0.6 }} />
                          <span>Due date</span>
                        </div>
                      </th>
                      <th className="px-4 py-2 text-left text-xs min-w-[120px]" style={{ color: 'var(--text-secondary)' }}>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-3.5 h-3.5" style={{ opacity: 0.6 }} />
                          <span>Progress</span>
                        </div>
                      </th>
                      <th className="px-4 py-2 text-left text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        <div className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5" style={{ opacity: 0.6 }} />
                          <span>Work type</span>
                        </div>
                      </th>
                      <th className="w-32 px-4 py-2 text-left text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        <div className="flex items-center h-full">
                          <span>Actions</span>
                        </div>
                      </th>
                      <th className="w-12 px-4 py-2"></th>
                    </tr>
                ] : [];

                // Subtask rows (only if expanded)
                const subtaskRows = work.subtasks && expandedTasks.has(work.id) ? work.subtasks.map((subtask, subIndex) => {
                  const SubtaskTypeIcon = getTaskTypeIcon(subtask.title);
                  const subtaskPriorityInfo = getPriorityIcon(subtask.priority);
                  const isLastSubtask = subIndex === work.subtasks!.length - 1;
                  
                  return (
                    <tr
                      key={`${work.id}-subtask-${subIndex}`}
                      className="subtask-row-item transition-all group relative animate-in fade-in slide-in-from-top-2 duration-200"
                      style={{
                        backgroundColor: 'var(--subtask-row-bg, #F9FAFB)',
                        borderBottomColor: isLastSubtask ? 'var(--border-primary)' : 'var(--border-secondary)',
                        borderBottomWidth: '1px',
                        borderBottomStyle: 'solid',
                        borderLeftWidth: '0',
                        boxShadow: 'none',
                        animationDelay: `${subIndex * 30}ms`,
                        animationFillMode: 'backwards'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--subtask-row-hover, #F3F4F6)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--subtask-row-bg, #F9FAFB)';
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Checkbox cell */}
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={subtask.completed}
                            onChange={(e) => {
                              const newCompleted = e.target.checked;
                              setWorksData(prevWorks =>
                                prevWorks.map(w =>
                                  w.id === work.id && w.subtasks
                                    ? {
                                        ...w,
                                        subtasks: w.subtasks.map((st, i) =>
                                          i === subIndex
                                            ? { ...st, completed: newCompleted }
                                            : st
                                        )
                                      }
                                    : w
                                )
                              );
                              // Persist to API using the real task ID
                              if (subtask.id && !subtask.id.includes('-sub-')) {
                                updateTask.mutate({
                                  id: subtask.id,
                                  dto: { status: newCompleted ? 'DONE' : 'PLANNING' },
                                });
                              }
                            }}
                            className="w-4 h-4 rounded"
                            style={{
                              borderColor: 'var(--border-primary)',
                              backgroundColor: 'var(--input-bg)',
                              accentColor: 'var(--accent-primary)'
                            }}
                          />
                        </div>
                      </td>
                      {/* Empty ID cell for subtasks - merged with title */}
                      <td className="px-4 py-4" style={{ width: '0', padding: '0' }}></td>
                      {/* Subtask Title with Tree Connector */}
                      <td className="px-4 py-4" style={{ position: 'relative' }}>
                        {/* TREE STRUCTURE: Complete connector line with vertical spine + curved branch */}
                        <svg 
                          className="subtask-connector transition-all duration-200"
                          style={{
                            position: 'absolute',
                            left: '27px',
                            top: '0',
                            width: '50px',
                            height: '100%',
                            overflow: 'visible',
                            pointerEvents: 'none'
                          }}
                          preserveAspectRatio="none"
                          viewBox="0 0 50 100"
                        >
                          {/* Continuous vertical main line */}
                          <line
                            x1="5"
                            y1="0"
                            x2="5"
                            y2={isLastSubtask ? '50' : '100'}
                            stroke="#9ca3af"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            opacity="0.5"
                            vectorEffect="non-scaling-stroke"
                          />
                          
                          {/* Smooth curved branch extending to the right */}
                          <path
                            d="M 5 50 Q 5 60, 15 60 L 42 60"
                            fill="none"
                            stroke="#9ca3af"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity="0.5"
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>
                        
                        <div className="flex flex-col gap-1.5" style={{ paddingLeft: '74px' }}>
                          <div className="flex items-center gap-2">
                            <SubtaskTypeIcon 
                              className="w-3.5 h-3.5 flex-shrink-0" 
                              style={{ color: 'var(--text-tertiary)', opacity: 0.4 }} 
                            />
                            <span
                              className="text-sm"
                              style={{
                                color: subtask.completed ? 'var(--text-tertiary)' : 'var(--text-secondary)',
                                textDecoration: subtask.completed ? 'line-through' : 'none',
                                fontSize: '13px',
                                fontWeight: 400
                              }}
                            >
                              {subtask.title}
                            </span>
                          </div>
                          {/* Priority + Add sub-subtask */}
                          <div className="flex items-center gap-2">
                            <Select
                              value={subtask.priority}
                              onValueChange={(newPriority) => {
                                setWorksData(prevWorks =>
                                  prevWorks.map(w =>
                                    w.id === work.id && w.subtasks
                                      ? {
                                          ...w,
                                          subtasks: w.subtasks.map((st, i) =>
                                            i === subIndex
                                              ? { ...st, priority: newPriority }
                                              : st
                                          )
                                        }
                                      : w
                                  )
                                );
                              }}
                            >
                              <SelectTrigger
                                className="h-auto border-0 shadow-none p-0 hover:opacity-80 transition-opacity focus:ring-0 focus:ring-offset-0"
                                style={{ width: 'auto', backgroundColor: 'transparent' }}
                              >
                                <SelectValue>
                                  <span className={`text-xs ${subtaskPriorityInfo.className}`} style={{ fontSize: '11px' }}>
                                    {subtask.priority}
                                  </span>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent style={{
                                backgroundColor: 'var(--surface-primary)',
                                borderColor: 'var(--border-primary)'
                              }}>
                                {priorityOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    <span className={`text-xs ${option.className}`}>
                                      {option.value}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <button
                              title="Add subtask"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSubtaskParent({ id: subtask.id, title: subtask.title, projectId: work.projectId ?? '' });
                              }}
                              className="flex items-center justify-center w-5 h-5 rounded hover:bg-[var(--surface-hover)] ml-auto"
                              style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}
                            >
                              <Plus style={{ width: '13px', height: '13px' }} />
                            </button>
                          </div>
                        </div>
                      </td>
                      {/* Project - inherited from parent */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2" style={{ opacity: 0.5 }}>
                          <FolderOpen 
                            className="w-3 h-3 flex-shrink-0" 
                            style={{ color: 'var(--text-tertiary)' }} 
                          />
                          <span className="text-xs" style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>
                            {work.project}
                          </span>
                        </div>
                      </td>
                      {/* Assignee */}
                      <td className="pl-4 pr-1 py-4">
                        {subtask.assignee && (
                          <div className="flex items-center gap-2">
                            <div className="relative group/avatar">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className={`${subtask.assignee.color} text-white text-xs`} style={{ fontSize: '10px' }}>
                                  {subtask.assignee.initials}
                                </AvatarFallback>
                              </Avatar>
                              {/* Tooltip on hover */}
                              <div
                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded opacity-0 group-hover/avatar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50"
                                style={{
                                  fontSize: '10px',
                                  fontFamily: 'var(--font-text)',
                                  backgroundColor: 'var(--popover)',
                                  color: 'var(--popover-foreground)',
                                  boxShadow: 'var(--shadow-md)',
                                  border: '1px solid var(--border)'
                                }}
                              >
                                {subtask.assignee.name}
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                      {/* Participants */}
                      <td className="pl-1 pr-4 py-4">
                        {subtask.participants && subtask.participants.length > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2.5">
                              {subtask.participants.map((participant, i) => (
                                <div key={i} className="relative group/avatar">
                                  <Avatar className="w-8 h-8 border-2" style={{ borderColor: 'var(--bg-secondary)' }}>
                                    <AvatarFallback className={`${participant.color} text-white text-xs`} style={{ fontSize: '10px' }}>
                                      {participant.initials}
                                    </AvatarFallback>
                                  </Avatar>
                                  {/* Tooltip on hover */}
                                  <div
                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded opacity-0 group-hover/avatar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50"
                                    style={{
                                      fontSize: '10px',
                                      fontFamily: 'var(--font-text)',
                                      backgroundColor: 'var(--popover)',
                                      color: 'var(--popover-foreground)',
                                      boxShadow: 'var(--shadow-md)',
                                      border: '1px solid var(--border)'
                                    }}
                                  >
                                    {participant.name}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                      {/* Workflow */}
                      <td className="px-4 py-4">
                        <UnifiedWorkflowCell
                          executionState={subtask.status}
                          reviewState={subtask.acceptance}
                          onExecutionChange={(newStatusKey) => {
                            setWorksData(prevWorks =>
                              prevWorks.map(w =>
                                w.id === work.id && w.subtasks
                                  ? {
                                      ...w,
                                      subtasks: w.subtasks.map((st, i) =>
                                        i === subIndex
                                          ? { ...st, status: newStatusKey }
                                          : st
                                      )
                                    }
                                  : w
                              )
                            );
                          }}
                          onReviewChange={(newReview) => {
                            setWorksData(prevWorks =>
                              prevWorks.map(w =>
                                w.id === work.id && w.subtasks
                                  ? {
                                      ...w,
                                      subtasks: w.subtasks.map((st, i) =>
                                        i === subIndex
                                          ? { ...st, acceptance: newReview }
                                          : st
                                      )
                                    }
                                  : w
                              )
                            );
                          }}
                          isActive={subtask.status === 'IN_PROGRESS'}
                        />
                      </td>
                      {/* Dates - Compact View */}
                      <td className="px-4 py-4">
                        <CompactDateCell 
                          startDate={subtask.dateStart}
                          dueDate={subtask.dateEnd}
                        />
                      </td>
                      {/* Progress */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 relative h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
                            <div 
                              className="absolute top-0 left-0 h-full rounded-full transition-all"
                              style={{ 
                                width: `${subtask.progress}%`,
                                backgroundColor: 'var(--accent-primary)',
                                opacity: 0.7
                              }}
                            />
                          </div>
                          <span 
                            className="text-xs min-w-[3ch]" 
                            style={{ 
                              color: 'var(--text-tertiary)',
                              fontSize: '11px'
                            }}
                          >
                            {subtask.progress}%
                          </span>
                        </div>
                      </td>
                      {/* Work Type */}
                      <td className="px-4 py-4">
                        <EditableWorkCell
                          field="workType"
                          value={subtask.workType}
                          onChange={(newType) => {
                            setWorksData(prevWorks =>
                              prevWorks.map(w =>
                                w.id === work.id && w.subtasks
                                  ? {
                                      ...w,
                                      subtasks: w.subtasks.map((st, i) =>
                                        i === subIndex
                                          ? { ...st, workType: newType }
                                          : st
                                      )
                                    }
                                  : w
                              )
                            );
                          }}
                        />
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 h-full">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                            className="p-1.5 rounded transition-colors" 
                            style={{ color: 'var(--text-tertiary)' }}
                            title="Edit subtask"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Convert subtask to Work format for modal
                              const subtaskAsWork = {
                                id: subtask.id,
                                title: subtask.title,
                                project: work.project,
                                projectId: work.projectId,
                                assignee: subtask.assignee || work.assignee,
                                participants: subtask.participants || [],
                                status: subtask.status,
                                priority: subtask.priority,
                                dateStart: subtask.dateStart,
                                dateEnd: subtask.dateEnd,
                                progress: subtask.progress,
                                workType: subtask.workType,
                                acceptance: subtask.acceptance,
                              };
                              handleOpenTaskDetail(subtaskAsWork);
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                              e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = 'var(--text-tertiary)';
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1.5 rounded transition-colors" 
                            style={{ color: 'var(--text-tertiary)' }}
                            title="Comment"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                              e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = 'var(--text-tertiary)';
                            }}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1.5 rounded transition-colors" 
                            style={{ color: 'var(--text-tertiary)' }}
                            title="More"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                              e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = 'var(--text-tertiary)';
                            }}
                          >
                            <Ellipsis className="w-4 h-4" />
                          </button>
                          </div>
                          <TaskTimeTrackingControl taskId={subtask.id} />
                        </div>
                      </td>
                      <td className="px-4 py-4"></td>
                    </tr>
                  );
                }) : [];

                // Add a subtle separator after subtasks if expanded
                const subtaskSeparator = work.subtasks && work.subtasks.length > 0 && expandedTasks.has(work.id) ? (
                  <tr key={`${work.id}-subtask-separator`} className="animate-in fade-in duration-200">
                    <td colSpan={13} className="px-4 py-0 h-2" style={{ 
                      backgroundColor: 'var(--bg-secondary)',
                      borderBottom: '1px solid var(--border-primary)'
                    }}>
                      <div className="h-full" />
                    </td>
                  </tr>
                ) : null;

                return [mainRow, ...subtaskRows, subtaskSeparator, ...dividerRows].filter(Boolean);
              })}
              
              {/* Add Task Row */}
              <AddTaskRow 
                onAddTask={handleAddTask}
                colSpan={13}
                mode="works"
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}