/**
 * WorksTableWrapper Component
 * Wrapper that manages view switching between List, Board, and Gantt views
 */

import { useState } from 'react';
import { WorksTable } from './WorksTable';
import { BoardView } from './BoardView';
import { GanttView } from './GanttView';
import { FilterBar } from './FilterBar';
import { TaskDetailModal } from './TaskDetailModal';
import { useBoardTasks } from '@/hooks/api/useTasks';

type ViewType = 'list' | 'board' | 'gantt';

// Legacy mock array kept only for reference during Phase 2 migration
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _LEGACY_BOARD_TASKS = [
    {
      id: '001',
      title: 'Residential house conceptual design',
      assignee: { name: 'John Doe', initials: 'JD', color: 'bg-blue-500' },
      participants: [
        { name: 'Sarah Miller', initials: 'SM', color: 'bg-green-500' },
        { name: 'Alex Kim', initials: 'AK', color: 'bg-purple-500' },
      ],
      priority: 'High',
      dateStart: '18 Jan 2025',
      dateEnd: '25 Jan 2025',
      status: 'In Progress',
      typeOfWork: 'Design',
      volume: '250',
      unit: 'm²',
      progress: 65
    },
    {
      id: '002',
      title: 'Architectural site analysis report',
      assignee: { name: 'Sarah Miller', initials: 'SM', color: 'bg-green-500' },
      participants: [
        { name: 'John Doe', initials: 'JD', color: 'bg-blue-500' },
      ],
      priority: 'Medium',
      dateStart: '20 Jan 2025',
      dateEnd: '27 Jan 2025',
      status: 'Started',
      typeOfWork: 'Analysis',
      volume: '1',
      unit: 'site',
      progress: 30
    },
    {
      id: '003',
      title: 'Foundation structural design',
      assignee: { name: 'Alex Kim', initials: 'AK', color: 'bg-purple-500' },
      participants: [
        { name: 'Mike Chen', initials: 'MC', color: 'bg-orange-500' },
        { name: 'Emma Wilson', initials: 'EW', color: 'bg-pink-500' },
        { name: 'Tom Garcia', initials: 'TG', color: 'bg-indigo-500' },
      ],
      priority: 'High',
      dateStart: '22 Jan 2025',
      dateEnd: '30 Jan 2025',
      status: 'Pending review',
      typeOfWork: 'Engineering',
      volume: '180',
      unit: 'm²',
      progress: 90
    },
    {
      id: '004',
      title: 'Interior space planning',
      assignee: { name: 'Mike Chen', initials: 'MC', color: 'bg-orange-500' },
      participants: [],
      priority: 'Low',
      dateStart: '27 Jan 2025',
      dateEnd: '5 Feb 2025',
      status: 'Not Started',
      typeOfWork: 'Design',
      volume: '120',
      unit: 'm²',
      progress: 0
    },
    {
      id: '005',
      title: 'Building permit documentation',
      assignee: { name: 'Emma Wilson', initials: 'EW', color: 'bg-pink-500' },
      participants: [
        { name: 'Lisa Brown', initials: 'LB', color: 'bg-teal-500' },
      ],
      priority: 'High',
      dateStart: '19 Jan 2025',
      dateEnd: '24 Jan 2025',
      status: 'In Progress',
      typeOfWork: 'Documentation',
      volume: '1',
      unit: 'set',
      progress: 75
    },
    {
      id: '006',
      title: 'MEP system design coordination',
      assignee: { name: 'Tom Garcia', initials: 'TG', color: 'bg-indigo-500' },
      participants: [
        { name: 'David Lee', initials: 'DL', color: 'bg-cyan-500' },
        { name: 'Anna Taylor', initials: 'AT', color: 'bg-lime-500' },
      ],
      priority: 'Medium',
      dateStart: '21 Jan 2025',
      dateEnd: '28 Jan 2025',
      status: 'Started',
      typeOfWork: 'Engineering',
      volume: '3',
      unit: 'systems',
      progress: 45
    },
    {
      id: '007',
      title: 'Facade design development',
      assignee: { name: 'Lisa Brown', initials: 'LB', color: 'bg-teal-500' },
      participants: [
        { name: 'Chris Martin', initials: 'CM', color: 'bg-amber-500' },
        { name: 'John Doe', initials: 'JD', color: 'bg-blue-500' },
        { name: 'Sarah Miller', initials: 'SM', color: 'bg-green-500' },
        { name: 'Alex Kim', initials: 'AK', color: 'bg-purple-500' },
      ],
      priority: 'High',
      dateStart: '23 Jan 2025',
      dateEnd: '31 Jan 2025',
      status: 'In Progress',
      typeOfWork: 'Design',
      volume: '320',
      unit: 'm²',
      progress: 55
    },
    {
      id: '008',
      title: 'Landscape architecture design',
      assignee: { name: 'David Lee', initials: 'DL', color: 'bg-cyan-500' },
      participants: [],
      priority: 'Low',
      dateStart: '29 Jan 2025',
      dateEnd: '7 Feb 2025',
      status: 'Not Started',
      typeOfWork: 'Design',
      volume: '500',
      unit: 'm²',
      progress: 0
    },
    {
      id: '009',
      title: 'Construction cost estimate',
      assignee: { name: 'Anna Taylor', initials: 'AT', color: 'bg-lime-500' },
      participants: [
        { name: 'Emma Wilson', initials: 'EW', color: 'bg-pink-500' },
      ],
      priority: 'Medium',
      dateStart: '15 Jan 2025',
      dateEnd: '20 Jan 2025',
      status: 'Completed',
      typeOfWork: 'Analysis',
      volume: '1',
      unit: 'estimate',
      progress: 100
    },
    {
      id: '010',
      title: '3D visualization renderings',
      assignee: { name: 'Chris Martin', initials: 'CM', color: 'bg-amber-500' },
      participants: [
        { name: 'John Doe', initials: 'JD', color: 'bg-blue-500' },
        { name: 'Lisa Brown', initials: 'LB', color: 'bg-teal-500' },
      ],
      priority: 'Low',
      dateStart: '24 Jan 2025',
      dateEnd: '1 Feb 2025',
      status: 'Pending review',
      typeOfWork: 'Visualization',
      volume: '12',
      unit: 'views',
      progress: 85
    },
    {
      id: '011',
      title: 'Structural beam calculations',
      assignee: { name: 'Alex Kim', initials: 'AK', color: 'bg-purple-500' },
      participants: [
        { name: 'Mike Chen', initials: 'MC', color: 'bg-orange-500' },
      ],
      priority: 'High',
      dateStart: '18 Jan 2025',
      dateEnd: '22 Jan 2025',
      status: 'In Progress',
      typeOfWork: 'Engineering',
      volume: '45',
      unit: 'beams',
      progress: 70
    },
    {
      id: '012',
      title: 'HVAC system specifications',
      assignee: { name: 'Tom Garcia', initials: 'TG', color: 'bg-indigo-500' },
      participants: [],
      priority: 'Medium',
      dateStart: '20 Jan 2025',
      dateEnd: '26 Jan 2025',
      status: 'Started',
      typeOfWork: 'Engineering',
      volume: '1',
      unit: 'system',
      progress: 25
    },
  ];

export function WorksTableWrapper() {
  const { data: boardTasks = [] } = useBoardTasks();
  const [activeView, setActiveView] = useState<ViewType>('list');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const handleTaskMove = (taskId: string, newStatus: string) => {
    console.log(`Task ${taskId} moved to ${newStatus}`);
    // In real app, this would update the backend
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const handleCloseModal = () => {
    setSelectedTaskId(null);
  };

  const selectedTask = selectedTaskId 
    ? boardTasks.find(task => task.id === selectedTaskId)
    : null;

  // Add sample data for modal (checklist, subtasks, activity)
  const getEnhancedTaskData = (task: any) => {
    if (!task) return null;

    return {
      ...task,
      projectName: 'Main Building Project',
      controlPoint: 'CP-2025-001',
      label: 'Architecture',
      checklist: [
        { id: 'c1', text: 'Review initial sketches', completed: true },
        { id: 'c2', text: 'Client approval required', completed: false },
        { id: 'c3', text: 'Update technical drawings', completed: false },
      ],
      subtasks: [
        { id: 's1', title: 'Floor plan layout', status: 'Completed', completed: true },
        { id: 's2', title: 'Elevation drawings', status: 'In Progress', completed: false },
        { id: 's3', title: 'Section details', status: 'Not Started', completed: false },
      ],
      activity: [
        {
          id: 'a1',
          user: { name: 'John Doe', initials: 'JD', color: 'bg-blue-500' },
          action: 'Updated' as const,
          field: 'Progress',
          oldValue: '50%',
          newValue: '65%',
          timestamp: '2 hours ago'
        },
        {
          id: 'a2',
          user: { name: 'Sarah Miller', initials: 'SM', color: 'bg-green-500' },
          action: 'Updated' as const,
          field: 'Status',
          oldValue: 'Started',
          newValue: 'In Progress',
          timestamp: '5 hours ago'
        },
        {
          id: 'a3',
          user: { name: 'Alex Kim', initials: 'AK', color: 'bg-purple-500' },
          action: 'Added' as const,
          timestamp: '1 day ago'
        },
      ]
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
          tasks={boardTasks} 
          onTaskMove={handleTaskMove}
          onTaskClick={handleTaskClick}
        />
      )}
      {activeView === 'gantt' && (
        <GanttView 
          tasks={boardTasks}
          onTaskClick={handleTaskClick}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={getEnhancedTaskData(selectedTask)!}
          isOpen={!!selectedTaskId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}