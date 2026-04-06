/**
 * WorksTableWrapper Component
 * Wrapper that manages view switching between List, Board, and Gantt views
 */

import { useState } from 'react';
import { WorksTable } from '../components/WorksTable';
import { BoardView } from '../components/BoardView';
import { GanttView } from '../components/GanttView';
import { FilterBar } from '../components/FilterBar';
import { TaskDetailModal } from '../components/TaskDetailModal';
import { useAllTasks, useTask, useUpdateTask } from '@/hooks/api/useTasks';

type ViewType = 'list' | 'board' | 'gantt';

export function TasksPage() {
  const { data: allTasks = [] } = useAllTasks();
  const [activeView, setActiveView] = useState<ViewType>('list');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { data: selectedTaskData } = useTask(selectedTaskId ?? '');
  const updateTask = useUpdateTask();

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
      <FilterBar activeView={activeView} onViewChange={setActiveView} />
      
      {/* Conditional View Rendering */}
      {activeView === 'list' && <WorksTable />}
      {activeView === 'board' && (
        <BoardView
          tasks={allTasks}
          onTaskMove={handleTaskMove}
          onTaskClick={handleTaskClick}
        />
      )}
      {activeView === 'gantt' && (
        <GanttView
          tasks={allTasks}
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