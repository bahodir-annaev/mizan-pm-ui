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

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Copy,
  FolderOpen,
  SquareCheck,
  Layers,
  Target,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Pencil,
  Users,
  MessageSquare,
  Ellipsis,
  Link2,
  User,
  GitBranch,
  Calendar,
  TrendingUp,
  LayoutList,
  ChevronsUpDown,
} from 'lucide-react';
import type { TaskFilters } from '@/types/domain';
import { Avatar, AvatarFallback } from './ui/avatar';
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
import { EditableWorkCell } from './EditableWorkCell';
import { TaskTimeTrackingControl } from './TaskTimeTrackingControl';
import { CompactDateCell } from './CompactDateCell';
import { useProjectTasks, useAllTasks, useUpdateTask } from '@/hooks/api/useTasks';
import type { Task, TreeTask } from '@/types/domain';
import type { TaskStatus, AcceptanceStatus } from '@/types/api';

// ─── Tree utilities ──────────────────────────────────────────────────────────

const TREE_INDENT = 20; // px per depth level

interface FlatWorkNode {
  work: Work;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  isLastSibling: boolean;
  ancestorIsLastSibling: boolean[];
  parentWork: Work | null;
  rootId: string;
}

function flattenVisibleWorks(
  works: Work[],
  expandedIds: Set<string>,
  depth = 0,
  ancestorFlags: boolean[] = [],
  parentWork: Work | null = null,
  rootId?: string,
): FlatWorkNode[] {
  const result: FlatWorkNode[] = [];
  works.forEach((work, i) => {
    const isLast = i === works.length - 1;
    const hasChildren = (work.children?.length ?? 0) > 0;
    const effectiveRootId = rootId ?? work.id;
    result.push({ work, depth, hasChildren, isExpanded: expandedIds.has(work.id), isLastSibling: isLast, ancestorIsLastSibling: ancestorFlags, parentWork, rootId: effectiveRootId });
    if (hasChildren && expandedIds.has(work.id)) {
      result.push(...flattenVisibleWorks(work.children!, expandedIds, depth + 1, [...ancestorFlags, isLast], work, effectiveRootId));
    }
  });
  return result;
}

function updateWorkById(works: Work[], id: string, updater: (w: Work) => Work): Work[] {
  return works.map(w => {
    if (w.id === id) return updater(w);
    if (w.children?.length) return { ...w, children: updateWorkById(w.children, id, updater) };
    return w;
  });
}

function TreeConnectors({ depth, hasChildren, isExpanded, isLastSibling, ancestorIsLastSibling }: {
  depth: number; hasChildren: boolean; isExpanded: boolean; isLastSibling: boolean; ancestorIsLastSibling: boolean[];
}) {
  if (depth === 0) {
    if (!hasChildren || !isExpanded) return null;
    return (
      <svg style={{ position: 'absolute', left: '27px', top: '0', width: '10px', height: '100%', overflow: 'visible', pointerEvents: 'none', zIndex: 1 }}
        preserveAspectRatio="none" viewBox="0 0 10 100">
        <circle cx="5" cy="50" r="4" fill="#9ca3af" opacity="0.6" vectorEffect="non-scaling-stroke" />
        <line x1="5" y1="54" x2="5" y2="100" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" vectorEffect="non-scaling-stroke" />
      </svg>
    );
  }
  const spineX = (depth - 1) * TREE_INDENT + 5;
  // X position where children of this node will draw their own spine — used for the dot and outgoing line
  const nextSpineX = depth * TREE_INDENT + 5;
  // For nodes with children the branch terminates at the dot (nextSpineX); leaf nodes extend further toward the title
  const branchEndX = hasChildren ? nextSpineX : 42 + (depth - 1) * TREE_INDENT;
  const svgWidth = 50 + (depth - 1) * TREE_INDENT;
  return (
    <svg style={{ position: 'absolute', left: '27px', top: '0', width: `${svgWidth}px`, height: '100%', overflow: 'visible', pointerEvents: 'none', zIndex: 1 }}
      preserveAspectRatio="none" viewBox={`0 0 ${svgWidth} 100`}>
      {Array.from({ length: depth - 1 }, (_, level) =>
        !ancestorIsLastSibling[level] ? (
          <line key={level} x1={level * TREE_INDENT + 5} y1="0" x2={level * TREE_INDENT + 5} y2="100"
            stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" vectorEffect="non-scaling-stroke" />
        ) : null
      )}
      <line x1={spineX} y1="0" x2={spineX} y2="50" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" vectorEffect="non-scaling-stroke" />
      {!isLastSibling && (
        <line x1={spineX} y1="50" x2={spineX} y2="100" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" vectorEffect="non-scaling-stroke" />
      )}
      <path d={`M ${spineX} 50 Q ${spineX} 60, ${spineX + 10} 60 L ${branchEndX} 60`}
        fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" vectorEffect="non-scaling-stroke" />
      {/* Dot at the junction for non-root nodes that are also parents */}
      {hasChildren && (
        <circle cx={nextSpineX} cy="60" r="3" fill="#9ca3af" opacity="0.6" vectorEffect="non-scaling-stroke" />
      )}
      {/* Outgoing line to children — drawn at nextSpineX so children's spine aligns with this line */}
      {hasChildren && isExpanded && (
        <line x1={nextSpineX} y1="63" x2={nextSpineX} y2="100" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" vectorEffect="non-scaling-stroke" />
      )}
    </svg>
  );
}

// ─── Map legacy display strings to TaskStatus enum values ────────────────────
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


// ─── Multi-level sorting ─────────────────────────────────────────────────────

type SortField = 'title' | 'project' | 'assignee' | 'status' | 'priority' | 'dateStart' | 'dateEnd' | 'progress';

interface SortConfig {
  field: SortField;
  direction: 'asc' | 'desc';
}

const PRIORITY_ORDER: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
const STATUS_ORDER: Record<string, number> = { IN_PROGRESS: 6, IN_REVIEW: 5, TODO: 4, PLANNING: 3, DONE: 2, CANCELLED: 1 };

function compareByField(a: Work, b: Work, field: SortField, dir: 'asc' | 'desc'): number {
  let cmp = 0;
  switch (field) {
    case 'title':    cmp = a.title.localeCompare(b.title); break;
    case 'project':  cmp = (a.project ?? '').localeCompare(b.project ?? ''); break;
    case 'assignee': cmp = a.assignee.name.localeCompare(b.assignee.name); break;
    case 'status':   cmp = (STATUS_ORDER[a.statusKey ?? ''] ?? 0) - (STATUS_ORDER[b.statusKey ?? ''] ?? 0); break;
    case 'priority': cmp = (PRIORITY_ORDER[a.priority] ?? 0) - (PRIORITY_ORDER[b.priority] ?? 0); break;
    case 'dateStart': cmp = (a.dateStart ?? '').localeCompare(b.dateStart ?? ''); break;
    case 'dateEnd':  cmp = (a.dateEnd ?? '').localeCompare(b.dateEnd ?? ''); break;
    case 'progress': cmp = a.progress - b.progress; break;
  }
  return dir === 'asc' ? cmp : -cmp;
}

function sortWorks(works: Work[], configs: SortConfig[]): Work[] {
  if (configs.length === 0) return works;
  return [...works]
    .sort((a, b) => {
      for (const cfg of configs) {
        const cmp = compareByField(a, b, cfg.field, cfg.direction);
        if (cmp !== 0) return cmp;
      }
      return 0;
    })
    .map(w => w.children?.length ? { ...w, children: sortWorks(w.children, configs) } : w);
}

// ─── Filtering ────────────────────────────────────────────────────────────────

function applyFilters(works: Work[], filters: TaskFilters): Work[] {
  const { search, project, status, assignee, priority, dueDate, workTypes } = filters;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd   = new Date(todayStart.getTime() + 86400000 - 1);
  const weekEnd    = new Date(todayStart.getTime() + 7 * 86400000 - 1);

  return works.filter(w => {
    if (search) {
      const q = search.toLowerCase();
      if (!w.title.toLowerCase().includes(q) &&
          !w.assignee.name.toLowerCase().includes(q) &&
          !(w.project ?? '').toLowerCase().includes(q)) return false;
    }
    if (project  && w.project !== project) return false;
    if (status   && w.statusKey !== status) return false;
    if (assignee && w.assignee.name !== assignee) return false;
    if (priority && w.priority !== priority) return false;
    if (workTypes.length > 0 && !workTypes.includes(w.workType)) return false;
    if (dueDate && w.dateEnd) {
      const due = new Date(w.dateEnd);
      if (dueDate === 'today'   && (due < todayStart || due > todayEnd)) return false;
      if (dueDate === 'week'    && (due < todayStart || due > weekEnd))  return false;
      if (dueDate === 'overdue' && due >= todayStart)                    return false;
    }
    return true;
  });
}

// ─── Sort indicator icon ──────────────────────────────────────────────────────

function SortIndicator({ field, sortConfigs }: { field: SortField; sortConfigs: SortConfig[] }) {
  const idx = sortConfigs.findIndex(s => s.field === field);
  if (idx === -1) return <ChevronsUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />;
  const dir = sortConfigs[idx].direction;
  return (
    <span className="flex items-center gap-0.5">
      {dir === 'asc'
        ? <ArrowUp className="w-3 h-3" style={{ color: 'var(--accent-primary)' }} />
        : <ArrowDown className="w-3 h-3" style={{ color: 'var(--accent-primary)' }} />
      }
      {sortConfigs.length > 1 && (
        <span className="text-[9px] font-bold leading-none" style={{ color: 'var(--accent-primary)' }}>
          {idx + 1}
        </span>
      )}
    </span>
  );
}

interface Work {
  id: string;
  code?: string;
  title: string;
  description?: string;
  project?: string;
  projectId?: string;
  teamId?: string;
  teamName?: string;
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
  /** Recursive children for multi-level tree rendering */
  children?: Work[];
}

function taskToWork(task: Task | TreeTask): Work {
  const childTasks = 'children' in task ? (task as TreeTask).children : undefined;
  const children = childTasks && childTasks.length > 0 ? childTasks.map(child => taskToWork(child)) : undefined;

  return {
    id: task.id,
    code: task.code,
    title: task.title,
    description: task.description,
    project: task?.project?.name ?? (task as any).project,
    projectId: task.projectId,
    teamId: task.teamId,
    teamName: task.teamName,
    assignee: task.assignee
      ? { id: task.assignee.id, name: task.assignee.name, initials: task.assignee.initials, color: task.assignee.color }
      : { name: 'Unassigned', initials: '?', color: 'bg-gray-400' },
    participants: (task.participants ?? []).map(p => ({ id: p.id, name: p.name, initials: p.initials, color: p.color })),
    status: task.status,
    statusKey: LEGACY_STATUS_TO_KEY[task.statusKey ?? task.status] ?? 'TODO',
    priority: task.priority,
    dateStart: task.startDate ?? task.dateStart ?? '',
    dateEnd: task.dueDate ?? task.dateEnd ?? '',
    progress: task.progress ?? 0,
    workType: task.workType ?? '',
    volume: task.volume,
    unit: task.unit,
    acceptance: LEGACY_ACCEPTANCE_TO_KEY[task.acceptance ?? ''] ?? 'PENDING',
    children,
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

// ─── Shared sub-components ────────────────────────────────────────────────────

function DependencyListItem({ taskId, depTask, color, onClick }: {
  taskId: string;
  depTask: Work | undefined;
  color: string;
  onClick: () => void;
}) {
  return (
    <div
      className="flex items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer"
      style={{ backgroundColor: 'var(--surface-secondary)' }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'; }}
      onClick={onClick}
    >
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{taskId}</div>
        <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
          {depTask?.title || 'Unknown task'}
        </div>
      </div>
    </div>
  );
}

function ActionIconButton({ icon: Icon, title, onClick }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  onClick?: () => void;
}) {
  return (
    <button
      className="p-1.5 rounded transition-colors"
      style={{ color: 'var(--text-tertiary)' }}
      title={title}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
        e.currentTarget.style.color = 'var(--text-secondary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = 'var(--text-tertiary)';
      }}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

function AvatarWithTooltip({ name, initials, color, className, style }: {
  name: string;
  initials: string;
  color: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className="relative group/avatar">
      <Avatar className={`w-10 h-10 ${className ?? ''}`} style={style}>
        <AvatarFallback className={`${color} text-white text-xs`}>
          {initials}
        </AvatarFallback>
      </Avatar>
      <div
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded opacity-0 group-hover/avatar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50"
        style={{
          fontSize: '11px',
          fontFamily: 'var(--font-text)',
          backgroundColor: 'var(--popover)',
          color: 'var(--popover-foreground)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border)',
        }}
      >
        {name}
      </div>
    </div>
  );
}

// ─── Row helper functions ─────────────────────────────────────────────────────

const getPriorityIcon = (priority: string) => {
  return priorityOptions.find(p => p.value === priority) || priorityOptions[0];
};

const getTaskTypeIcon = (title: string) => {
  // Simple logic: milestone has "milestone" in title, epic has "epic"
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('milestone')) return Target;
  if (lowerTitle.includes('epic')) return Layers;
  return SquareCheck;
};


// ─── TaskRow ──────────────────────────────────────────────────────────────────

interface TaskRowProps {
  node: FlatWorkNode;
  isSelected: boolean;
  isLastActiveRoot: boolean;
  worksData: Work[];
  canEditTasks: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onOpenDetail: (work: Work) => void;
  onToggleExpand: (id: string) => void;
  onPriorityChange: (id: string, priority: string) => void;
  onStatusChange: (id: string, newStatusKey: string) => void;
  onAcceptanceChange: (id: string, newReview: string) => void;
  onWorkTypeChange: (id: string, workType: string) => void;
  onEdit: (work: Work) => void;
  onAddSubtask: (parent: { id: string; title: string; projectId: string }) => void;
}

function TaskRow({
  node,
  isSelected,
  isLastActiveRoot,
  worksData,
  canEditTasks,
  onSelect,
  onOpenDetail,
  onToggleExpand,
  onPriorityChange,
  onStatusChange,
  onAcceptanceChange,
  onWorkTypeChange,
  onEdit,
  onAddSubtask,
}: TaskRowProps) {
  const { work, depth, hasChildren, isExpanded, isLastSibling, ancestorIsLastSibling } = node;
  const isActive = work.statusKey === 'IN_PROGRESS';
  const canStart = work.statusKey === 'TODO' || work.statusKey === 'PLANNING';
  const canPause = work.statusKey === 'IN_PROGRESS';
  const hasExpandedSubtasks = hasChildren && isExpanded;
  const priorityInfo = getPriorityIcon(work.priority);
  const TaskTypeIcon = getTaskTypeIcon(work.title);

  const bgColor = depth === 0
    ? (isSelected ? 'var(--accent-primary-bg)' : isActive ? 'var(--surface-secondary)' : 'transparent')
    : (isSelected ? 'var(--accent-primary-bg)' : `rgba(0,0,0,${Math.min(depth * 0.015, 0.06)})`);

  return (
    <tr
      className="transition-colors group relative"
      tabIndex={0}
      style={{
        borderBottomColor: hasExpandedSubtasks ? 'transparent' : (isLastActiveRoot ? 'var(--border-primary)' : 'var(--border-secondary)'),
        borderBottomWidth: isLastActiveRoot ? '2px' : '1px',
        borderBottomStyle: 'solid',
        backgroundColor: bgColor,
        borderLeftWidth: isActive && depth === 0 ? '3px' : '0',
        borderLeftColor: isActive && depth === 0 ? 'var(--accent-primary)' : 'transparent',
        borderLeftStyle: 'solid',
      }}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && canEditTasks && (canStart || canPause)) {
          e.preventDefault();
          onStatusChange(work.id, isActive ? 'TODO' : 'IN_PROGRESS');
        }
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isSelected ? 'var(--accent-primary-bg)' : bgColor;
      }}
    >
      {/* Checkbox */}
      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(work.id, e.target.checked)}
          className="w-4 h-4 rounded"
          style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--input-bg)', accentColor: 'var(--accent-primary)' }}
        />
      </td>

      {/* ID */}
      <td className="px-4 py-4 text-sm" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onOpenDetail(work)}
          className="font-mono hover:underline underline-offset-2 transition-colors cursor-pointer"
          style={{ color: 'var(--accent-primary)' }}
          title="Open task detail"
        >
          {work.code ?? work.id}
        </button>
      </td>

      {/* Title */}
      <td className="px-4 py-4" style={{ position: 'relative' }}>
        <TreeConnectors
          depth={depth}
          hasChildren={hasChildren}
          isExpanded={isExpanded}
          isLastSibling={isLastSibling}
          ancestorIsLastSibling={ancestorIsLastSibling}
        />
        <div className="flex flex-col gap-1.5" style={{ position: 'relative', zIndex: 2, paddingLeft: depth > 0 ? `${depth * TREE_INDENT + 54}px` : 0 }}>
          <div className="flex items-center gap-2.5">
            {hasChildren ? (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleExpand(work.id); }}
                className="flex-shrink-0 transition-all p-0.5 rounded relative"
                style={{ color: 'var(--text-tertiary)', backgroundColor: isExpanded ? 'var(--surface-secondary)' : 'transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                  e.currentTarget.style.backgroundColor = isExpanded ? 'var(--surface-secondary)' : 'transparent';
                }}
                title={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
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
              style={{ color: 'var(--text-primary)', fontWeight: isActive ? 500 : 400 }}
            >
              {work.title}
            </span>
            {hasChildren && (
              <div
                className="flex items-center gap-1 px-1.5 py-0.5 rounded transition-all"
                style={{
                  backgroundColor: isExpanded ? 'var(--accent-primary-bg)' : 'var(--surface-secondary)',
                  fontSize: '11px',
                  color: isExpanded ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                }}
              >
                <Layers className="w-3 h-3" />
                <span>{work.children!.filter(c => c.statusKey === 'DONE').length}/{work.children!.length}</span>
              </div>
            )}
            {work.dependencies && (work.dependencies.blockedBy.length > 0 || work.dependencies.blocks.length > 0) && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="p-1 rounded transition-colors"
                    style={{
                      color: work.dependencies.blockedBy.length > 0 ? '#F59E0B' : '#5B9AFF',
                      backgroundColor: work.dependencies.blockedBy.length > 0 ? '#F59E0B20' : '#5B9AFF20',
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
                  style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--border-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Link2 className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Task Dependencies</span>
                    </div>
                    {work.dependencies.blockedBy.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>
                          Blocked By ({work.dependencies.blockedBy.length})
                        </div>
                        <div className="space-y-2">
                          {work.dependencies.blockedBy.map((taskId) => (
                            <DependencyListItem
                              key={taskId}
                              taskId={taskId}
                              depTask={worksData.find(w => w.id === taskId)}
                              color="#F59E0B"
                              onClick={() => {
                                const dep = worksData.find(w => w.id === taskId);
                                if (dep) onOpenDetail(dep);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {work.dependencies.blocks.length > 0 && (
                      <div>
                        <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>
                          Blocks ({work.dependencies.blocks.length})
                        </div>
                        <div className="space-y-2">
                          {work.dependencies.blocks.map((taskId) => (
                            <DependencyListItem
                              key={taskId}
                              taskId={taskId}
                              depTask={worksData.find(w => w.id === taskId)}
                              color="#5B9AFF"
                              onClick={() => {
                                const dep = worksData.find(w => w.id === taskId);
                                if (dep) onOpenDetail(dep);
                              }}
                            />
                          ))}
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
            <Select value={work.priority} onValueChange={(newPriority) => onPriorityChange(work.id, newPriority)}>
              <SelectTrigger
                className="h-auto border-0 shadow-none p-0 hover:opacity-80 transition-opacity focus:ring-0 focus:ring-offset-0"
                style={{ width: 'auto', backgroundColor: 'transparent' }}
              >
                <SelectValue>
                  <span className={`text-xs ${priorityInfo.className}`}>{work.priority}</span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--border-primary)' }}>
                {priorityOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className={`text-xs ${option.className}`}>{option.value}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              title="Add subtask"
              onClick={() => onAddSubtask({ id: work.id, title: work.title, projectId: work.projectId ?? '' })}
              className="flex items-center justify-center w-5 h-5 rounded hover:bg-[var(--surface-hover)] ml-auto"
              style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}
            >
              <Plus style={{ width: '13px', height: '13px' }} />
            </button>
          </div>
        </div>
      </td>

      {/* Project */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-3.5 h-3.5 flex-shrink-0 opacity-30 group-hover:opacity-50 transition-opacity" style={{ color: 'var(--text-tertiary)' }} />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{work.project}</span>
        </div>
      </td>

      {/* Team */}
      <td className="px-4 py-4">
        {work.teamName ? (
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 flex-shrink-0 opacity-30 group-hover:opacity-50 transition-opacity" style={{ color: 'var(--text-tertiary)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{work.teamName}</span>
          </div>
        ) : (
          <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>—</span>
        )}
      </td>

      {/* Assignee */}
      <td className="pl-4 pr-1 py-4">
        <AvatarWithTooltip name={work.assignee.name} initials={work.assignee.initials} color={work.assignee.color} />
      </td>

      {/* Participants */}
      <td className="pl-1 pr-4 py-4">
        <div className="flex -space-x-3">
          {work.participants.map((participant, i) => (
            <AvatarWithTooltip
              key={i}
              name={participant.name}
              initials={participant.initials}
              color={participant.color}
              className="border-2"
              style={{ borderColor: 'var(--bg-secondary)' }}
            />
          ))}
        </div>
      </td>

      {/* Workflow */}
      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
        <UnifiedWorkflowCell
          executionState={work.statusKey ?? 'TODO'}
          reviewState={work.acceptance}
          onExecutionChange={(newStatusKey) => onStatusChange(work.id, newStatusKey)}
          onReviewChange={(newReview) => onAcceptanceChange(work.id, newReview)}
          isActive={isActive}
        />
      </td>

      {/* Dates */}
      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
        <CompactDateCell startDate={work.dateStart} dueDate={work.dateEnd} isDone={work.statusKey === 'DONE'} />
      </td>

      {/* Progress */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all"
              style={{ width: `${work.progress}%`, backgroundColor: 'var(--accent-primary)', opacity: isActive ? 1 : 0.7 }}
            />
          </div>
          <span className="text-xs min-w-[3ch]" style={{ color: 'var(--text-tertiary)', fontWeight: isActive ? 500 : 400 }}>
            {work.progress}%
          </span>
        </div>
      </td>

      {/* Work type */}
      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
        <EditableWorkCell field="workType" value={work.workType} onChange={(newType) => onWorkTypeChange(work.id, newType)} />
      </td>

      {/* Actions */}
      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 h-full">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ActionIconButton icon={Pencil} title="Edit task" onClick={() => onEdit(work)} />
            <ActionIconButton icon={Copy} title="Duplicate" />
            <ActionIconButton icon={MessageSquare} title="Comment" />
            <ActionIconButton icon={Ellipsis} title="More" />
          </div>
          <TaskTimeTrackingControl taskId={work.id} />
        </div>
      </td>

      <td className="px-4 py-4" />
    </tr>
  );
}

// Default column configuration
const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'checkbox', label: '', visible: true, locked: true },
  { id: 'id', label: 'ID', visible: true, locked: false },
  { id: 'title', label: 'Task title', visible: true, locked: false },
  { id: 'project', label: 'Project', visible: true, locked: false },
  { id: 'team', label: 'Team', visible: true, locked: false },
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
  filters?: TaskFilters;
}

const EMPTY_TREE: TreeTask[] = [];
const DEFAULT_FILTERS: TaskFilters = { search: '', project: null, status: null, assignee: null, priority: null, dueDate: null, workTypes: [] };

export function WorksTable({ projectId, filters = DEFAULT_FILTERS }: WorksTableProps = {}) {
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
  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([]);

  const handleSort = (field: SortField, e: React.MouseEvent) => {
    setSortConfigs(prev => {
      const idx = prev.findIndex(s => s.field === field);
      if (e.shiftKey) {
        // Shift+click: toggle as additional sort key
        if (idx === -1) return [...prev, { field, direction: 'asc' }];
        if (prev[idx].direction === 'asc') return prev.map((s, i) => i === idx ? { ...s, direction: 'desc' } : s);
        return prev.filter((_, i) => i !== idx);
      } else {
        // Regular click: single column sort cycling
        if (idx === -1 || prev.length > 1) return [{ field, direction: 'asc' }];
        if (prev[0].direction === 'asc') return [{ field, direction: 'desc' }];
        return [];
      }
    });
  };

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

  const filteredWorks = applyFilters(worksData, filters);
  const hasCustomSort = sortConfigs.length > 0;

  const sortedWorks = hasCustomSort
    ? sortWorks(filteredWorks, sortConfigs)
    : [...filteredWorks].sort((a, b) => {
        const aIn = a.statusKey === 'IN_PROGRESS';
        const bIn = b.statusKey === 'IN_PROGRESS';
        if (aIn && !bIn) return -1;
        if (!aIn && bIn) return 1;
        return 0;
      });

  // Count active tasks (only shown when no custom sort active)
  const activeTasksCount = hasCustomSort ? 0 : sortedWorks.filter(w => w.statusKey === 'IN_PROGRESS').length;

  // Set of root-level IN_PROGRESS task IDs — used to detect divider insertion point
  const activeRootSet = new Set(
    hasCustomSort ? [] : sortedWorks.filter(w => w.statusKey === 'IN_PROGRESS').map(w => w.id)
  );

  // Flatten the visible tree for unified row rendering (all depths)
  const flatRows = flattenVisibleWorks(sortedWorks, expandedTasks);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedWorks(filteredWorks.map(w => w.id));
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
    setWorksData(prev => updateWorkById(prev, workId, w => ({ ...w, [field]: value })));
    const apiField = WORK_FIELD_TO_DTO[field] ?? field;
    updateTask.mutate({ id: workId, dto: { [apiField]: value } });
  };

  const getAcceptanceColor = (acceptance: string) => {
    return acceptanceOptions.find(a => a.value === acceptance)?.style || acceptanceOptions[0].style;
  };

  const handleAddTask = (_task: {
    title: string;
    project?: string;
    status: string;
    assignee?: string;
    dueDate?: string;
  }) => {};

  const handlePriorityChange = (workId: string, newPriority: string) => {
    setWorksData(prev => updateWorkById(prev, workId, w => ({ ...w, priority: newPriority })));
    updateTask.mutate({ id: workId, dto: { priority: newPriority.toUpperCase() as TaskPriority } });
  };

  const handleStatusChange = (workId: string, newStatusKey: string) => {
    setWorksData(prev => updateWorkById(prev, workId, w => ({ ...w, statusKey: newStatusKey, status: STATUS_DISPLAY[newStatusKey] ?? newStatusKey })));
    updateTask.mutate({ id: workId, dto: { status: newStatusKey as TaskStatus } });
  };

  const handleAcceptanceChange = (workId: string, newReview: string) => {
    setWorksData(prev => updateWorkById(prev, workId, w => ({ ...w, acceptance: newReview })));
    updateTask.mutate({ id: workId, dto: { acceptance: newReview as AcceptanceStatus } });
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
            <thead style={{ backgroundColor: 'var(--surface-primary)', borderBottom: '1px solid var(--border-secondary)', position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                <th className="w-12 px-4 py-2.5">
                  <input type="checkbox" className="w-4 h-4 rounded" onChange={(e) => handleSelectAll(e.target.checked)}
                    style={{ borderColor: 'var(--border-primary)', accentColor: 'var(--accent-primary)' }} />
                </th>
                <th className="px-4 py-2.5 text-left">
                  <button className="group flex items-center gap-1 text-xs font-medium select-none"
                    style={{ color: 'var(--text-tertiary)' }} onClick={(e) => handleSort('title', e)} title="Sort by ID (Shift+click to add secondary sort)">
                    <span>ID</span>
                    <SortIndicator field="title" sortConfigs={sortConfigs} />
                  </button>
                </th>
                <th className="px-4 py-2.5 text-left min-w-[280px]">
                  <button className="group flex items-center gap-1.5 text-xs font-medium select-none"
                    style={{ color: sortConfigs.some(s => s.field === 'title') ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
                    onClick={(e) => handleSort('title', e)} title="Sort by title (Shift+click to add secondary sort)">
                    <LayoutList className="w-3.5 h-3.5 opacity-60" />
                    <span>Task title</span>
                    <SortIndicator field="title" sortConfigs={sortConfigs} />
                  </button>
                </th>
                <th className="px-4 py-2.5 text-left">
                  <button className="group flex items-center gap-1.5 text-xs font-medium select-none"
                    style={{ color: sortConfigs.some(s => s.field === 'project') ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}
                    onClick={(e) => handleSort('project', e)} title="Sort by project (Shift+click for secondary sort)">
                    <FolderOpen className="w-3.5 h-3.5 opacity-60" />
                    <span>Project</span>
                    <SortIndicator field="project" sortConfigs={sortConfigs} />
                  </button>
                </th>
                <th className="px-4 py-2.5 text-left">
                  <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                    <Users className="w-3.5 h-3.5 opacity-60" />
                    <span>Team</span>
                  </div>
                </th>
                <th className="pl-4 pr-2 py-2.5 text-left">
                  <button className="group flex items-center gap-1.5 text-xs font-medium select-none"
                    style={{ color: sortConfigs.some(s => s.field === 'assignee') ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
                    onClick={(e) => handleSort('assignee', e)} title="Sort by assignee">
                    <User className="w-3.5 h-3.5 opacity-60" />
                    <span>Assignee</span>
                    <SortIndicator field="assignee" sortConfigs={sortConfigs} />
                  </button>
                </th>
                <th className="pl-2 pr-4 py-2.5 text-left">
                  <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    <Users className="w-3.5 h-3.5 opacity-60" />
                    <span>Participants</span>
                  </div>
                </th>
                <th className="px-4 py-2.5 text-left">
                  <button className="group flex items-center gap-1.5 text-xs font-medium select-none"
                    style={{ color: sortConfigs.some(s => s.field === 'status') ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
                    onClick={(e) => handleSort('status', e)} title="Sort by status">
                    <GitBranch className="w-3.5 h-3.5 opacity-60" />
                    <span>Workflow</span>
                    <SortIndicator field="status" sortConfigs={sortConfigs} />
                  </button>
                </th>
                <th className="px-4 py-2.5 text-left">
                  <button className="group flex items-center gap-1.5 text-xs font-medium select-none"
                    style={{ color: sortConfigs.some(s => s.field === 'dateStart') ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}
                    onClick={(e) => handleSort('dateStart', e)} title="Sort by start date (Shift+click for secondary sort)">
                    <Calendar className="w-3.5 h-3.5 opacity-60" />
                    <span>Dates</span>
                    <SortIndicator field="dateStart" sortConfigs={sortConfigs} />
                  </button>
                </th>
                <th className="px-4 py-2.5 text-left min-w-[120px]">
                  <button className="group flex items-center gap-1.5 text-xs font-medium select-none"
                    style={{ color: sortConfigs.some(s => s.field === 'progress') ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
                    onClick={(e) => handleSort('progress', e)} title="Sort by progress">
                    <TrendingUp className="w-3.5 h-3.5 opacity-60" />
                    <span>Progress</span>
                    <SortIndicator field="progress" sortConfigs={sortConfigs} />
                  </button>
                </th>
                <th className="px-4 py-2.5 text-left">
                  <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                    <Layers className="w-3.5 h-3.5 opacity-60" />
                    <span>Work type</span>
                  </div>
                </th>
                <th className="w-32 px-4 py-2.5 text-left">
                  <div className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                    {sortConfigs.length > 0 && (
                      <button onClick={() => setSortConfigs([])}
                        className="text-xs px-1.5 py-0.5 rounded transition-colors"
                        style={{ color: 'var(--accent-primary)', backgroundColor: 'var(--accent-primary-bg)' }}
                        title="Clear all sorts">
                        Clear sort
                      </button>
                    )}
                  </div>
                </th>
                <th className="w-12 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {/* Active Tasks Label */}
              {activeTasksCount > 0 && (
                <>
                  <tr>
                    <td colSpan={14} className="px-4 py-2 border-b" style={{ 
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
                </>
              )}
              {flatRows.map((node, flatIndex) => {
                const { work, depth } = node;
                const isSelected = selectedWorks.includes(work.id);
                const isActive = work.statusKey === 'IN_PROGRESS';
                const isLastActiveRoot = depth === 0 && isActive && activeRootSet.has(work.id) &&
                  !flatRows.slice(flatIndex + 1).some(n => n.depth === 0 && activeRootSet.has(n.work.id));

                const dividerRows = isLastActiveRoot ? [
                  <tr key={`${work.id}-divider-space`}>
                    <td colSpan={14} className="px-4 py-0 h-3" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <div className="h-full" />
                    </td>
                  </tr>,
                  <tr key={`${work.id}-completed-label`}>
                    <td colSpan={14} className="px-4 py-2 border-b" style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--border-secondary)' }}>
                      <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>Other Tasks</span>
                    </td>
                  </tr>,
                ] : [];

                return [
                  <TaskRow
                    key={work.id}
                    node={node}
                    isSelected={isSelected}
                    isLastActiveRoot={isLastActiveRoot}
                    worksData={worksData}
                    canEditTasks={canEditTasks}
                    onSelect={handleSelectWork}
                    onOpenDetail={handleOpenTaskDetail}
                    onToggleExpand={toggleTaskExpansion}
                    onPriorityChange={handlePriorityChange}
                    onStatusChange={handleStatusChange}
                    onAcceptanceChange={handleAcceptanceChange}
                    onWorkTypeChange={(id, workType) => handleUpdateWork(id, 'workType', workType)}
                    onEdit={(w) => { setEditingTask(w); setEditModalOpen(true); }}
                    onAddSubtask={setSubtaskParent}
                  />,
                  ...dividerRows,
                ];
              })}
              
              {/* Add Task Row */}
              <AddTaskRow 
                onAddTask={handleAddTask}
                colSpan={14}
                mode="works"
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}