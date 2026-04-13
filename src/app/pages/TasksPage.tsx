/**
 * WorksTableWrapper Component
 * Wrapper that manages view switching between List, Board, and Gantt views
 */

import { useState, useMemo } from 'react';
import { WorksTable } from '../components/WorksTable';
import { BoardView } from '../components/BoardView';
import { GanttView } from '../components/GanttView';
import { FilterBar } from '../components/FilterBar';
import { TaskDetailModal } from '../components/TaskDetailModal';
import { useAllTasks, useTask, useUpdateTask } from '@/hooks/api/useTasks';
import type { TaskFilters } from '@/types/domain';

type ViewType = 'list' | 'board' | 'gantt';

const DEFAULT_FILTERS: TaskFilters = {
  search: '', project: null, status: null, assignee: null,
  priority: null, dueDate: null, workTypes: [],
};

export function TasksPage() {
  const allTasksQuery = useAllTasks();
  const allTasks = allTasksQuery.data?.flat ?? [];
  const [activeView, setActiveView] = useState<ViewType>('list');
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { data: selectedTaskData } = useTask(selectedTaskId ?? '');
  const updateTask = useUpdateTask();

  const projectOptions = useMemo(() => {
    const names = [...new Set(allTasks.map(t => t.project?.name).filter(Boolean) as string[])];
    return names.map(n => ({ id: n, label: n, value: n }));
  }, [allTasks]);

  const assigneeOptions = useMemo(() => {
    const seen = new Map<string, string>();
    allTasks.forEach(t => { if (t.assignee?.name) seen.set(t.assignee.name, t.assignee.name); });
    return [...seen.values()].map(n => ({ id: n, label: n, value: n }));
  }, [allTasks]);

  const handleTaskMove = (taskId: string, newStatus: string) => {
    updateTask.mutate({ id: taskId, dto: { status: newStatus } });
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const handleCloseModal = () => {
    setSelectedTaskId(null);
  };

  // Build enhanced task data from API response
  const getEnhancedTaskData = () => {
    if (!selectedTaskData) return null;
    return {
      ...selectedTaskData,
      projectName: selectedTaskData.projectId,
      controlPoint: '',
      label: selectedTaskData.workType ?? '',
      checklist: [],
      subtasks: (selectedTaskData.subtasks ?? []).map(st => ({
        id: st.id,
        title: st.title,
        status: st.status,
        completed: ['Done', 'End', 'Completed'].includes(st.status),
      })),
      activity: [],
    };
  };

  return (
    <div className="h-full overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Filter Bar with View Switcher */}
      <FilterBar
        activeView={activeView}
        onViewChange={setActiveView}
        projectOptions={projectOptions}
        assigneeOptions={assigneeOptions}
        onFiltersChange={setFilters}
      />

      {/* Conditional View Rendering */}
      {activeView === 'list' && <WorksTable filters={filters} />}
      {activeView === 'board' && (
        <BoardView
          tasks={allTasksQuery.data?.flat ?? []}
          onTaskMove={handleTaskMove}
          onTaskClick={handleTaskClick}
        />
      )}
      {activeView === 'gantt' && (
        <GanttView
          tasks={allTasksQuery.data?.flat ?? []}
          onTaskClick={handleTaskClick}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTaskData && (
        <TaskDetailModal
          task={getEnhancedTaskData()!}
          isOpen={!!selectedTaskId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}