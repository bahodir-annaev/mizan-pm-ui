/**
 * ProjectDetail Component
 * Shows project details with tabs: Task List, Overview, Task Board, Gantt, Files
 */

import { useState } from 'react';
import { 
  ArrowLeft, 
  Pin, 
  MoreHorizontal, 
  Calendar, 
  CheckCircle2,
  Clock,
  TrendingUp,
  Folder,
  Plus,
  List,
  LayoutGrid,
  GanttChart,
  FileText
} from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { WorksTable } from './WorksTable';
import { BoardView } from './BoardView';
import { GanttView } from './GanttView';
import { AddTaskModal } from './AddTaskModal';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  isPinned: boolean;
  status: 'Active' | 'On Hold' | 'Completed';
  progress: number;
  startDate: string;
  endDate: string;
  budget: string;
  spent: string;
  team: Array<{
    name: string;
    initials: string;
    color: string;
    role: string;
  }>;
  subprojects: Array<{
    id: string;
    name: string;
    progress: number;
    status: string;
  }>;
  stats: {
    totalTasks: number;
    completedTasks: number;
    activeTasks: number;
    overdueTasks: number;
  };
}

// Sample project data
const getProjectById = (id: string): Project => {
  const projects: Record<string, Project> = {
    'proj-1': {
      id: 'proj-1',
      name: 'Main Building Project',
      description: 'Complete architectural design and construction documentation for the new main building complex including structural, MEP, and landscape design.',
      color: 'bg-blue-500',
      isPinned: false,
      status: 'Active',
      progress: 68,
      startDate: 'Jan 5, 2025',
      endDate: 'Mar 30, 2025',
      budget: '$2.5M',
      spent: '$1.7M',
      team: [
        { name: 'Sarah Chen', initials: 'SC', color: 'bg-blue-500', role: 'Project Manager' },
        { name: 'Mike Ross', initials: 'MR', color: 'bg-green-500', role: 'Lead Architect' },
        { name: 'Emma Wilson', initials: 'EW', color: 'bg-purple-500', role: 'Structural Engineer' },
        { name: 'Alex Kim', initials: 'AK', color: 'bg-pink-500', role: 'MEP Engineer' },
      ],
      subprojects: [
        { id: 'sub-1', name: 'Foundation Work', progress: 85, status: 'In Progress' },
        { id: 'sub-2', name: 'Structural Design', progress: 60, status: 'In Progress' },
      ],
      stats: {
        totalTasks: 48,
        completedTasks: 32,
        activeTasks: 12,
        overdueTasks: 4
      }
    },
    'proj-2': {
      id: 'proj-2',
      name: 'Residential Complex',
      description: 'Multi-tower residential development with shared amenities and underground parking structure.',
      color: 'bg-green-500',
      isPinned: false,
      status: 'Active',
      progress: 42,
      startDate: 'Feb 1, 2025',
      endDate: 'Jun 15, 2025',
      budget: '$5.2M',
      spent: '$2.1M',
      team: [
        { name: 'David Park', initials: 'DP', color: 'bg-indigo-500', role: 'Project Manager' },
        { name: 'Lisa Chang', initials: 'LC', color: 'bg-teal-500', role: 'Lead Architect' },
      ],
      subprojects: [
        { id: 'sub-3', name: 'Tower A', progress: 50, status: 'In Progress' },
        { id: 'sub-4', name: 'Tower B', progress: 35, status: 'In Progress' },
        { id: 'sub-5', name: 'Parking Structure', progress: 20, status: 'Not Started' },
      ],
      stats: {
        totalTasks: 67,
        completedTasks: 28,
        activeTasks: 25,
        overdueTasks: 14
      }
    },
    'proj-3': {
      id: 'proj-3',
      name: 'Office Renovation',
      description: 'Modern office space renovation with sustainable materials and energy-efficient systems.',
      color: 'bg-purple-500',
      isPinned: false,
      status: 'Active',
      progress: 25,
      startDate: 'Jan 15, 2025',
      endDate: 'Apr 20, 2025',
      budget: '$800K',
      spent: '$200K',
      team: [
        { name: 'Tom Garcia', initials: 'TG', color: 'bg-indigo-500', role: 'Project Manager' },
      ],
      subprojects: [],
      stats: {
        totalTasks: 32,
        completedTasks: 8,
        activeTasks: 15,
        overdueTasks: 9
      }
    },
    'proj-4': {
      id: 'proj-4',
      name: 'City Plaza Development',
      description: 'Mixed-use urban development with retail, residential and public spaces.',
      color: 'bg-orange-500',
      isPinned: false,
      status: 'Active',
      progress: 55,
      startDate: 'Dec 1, 2024',
      endDate: 'May 30, 2025',
      budget: '$3.2M',
      spent: '$1.8M',
      team: [
        { name: 'Anna Taylor', initials: 'AT', color: 'bg-lime-500', role: 'Project Manager' },
        { name: 'Chris Martin', initials: 'CM', color: 'bg-amber-500', role: 'Lead Architect' },
      ],
      subprojects: [
        { id: 'sub-6', name: 'Retail Spaces', progress: 70, status: 'In Progress' },
      ],
      stats: {
        totalTasks: 55,
        completedTasks: 30,
        activeTasks: 18,
        overdueTasks: 7
      }
    },
  };

  return projects[id] || projects['proj-1'];
};

// Sample task data for board/gantt views
const generateProjectTasks = (projectId: string) => {
  return [
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
  ];
};

export function ProjectDetail({ projectId, onBack }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'overview' | 'board' | 'gantt' | 'files'>('tasks');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const project = getProjectById(projectId);
  const [projectTasks] = useState(generateProjectTasks(projectId));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'On Hold': return { bg: '#FEF3C7', text: '#92400E' };
      case 'Completed': return { bg: '#D1FAE5', text: '#065F46' };
      default: return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const statusColor = getStatusColor(project.status);

  const tabs = [
    { key: 'tasks', label: 'Task List', icon: List },
    { key: 'overview', label: 'Overview', icon: CheckCircle2 },
    { key: 'board', label: 'Task Board', icon: LayoutGrid },
    { key: 'gantt', label: 'Gantt', icon: GanttChart },
    { key: 'files', label: 'Files', icon: FileText },
  ] as const;

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
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className={`w-3 h-3 rounded-full ${project.color}`} />

          <h1 
            className="text-2xl font-semibold flex-1"
            style={{ color: 'var(--text-primary)' }}
          >
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
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Pin className="w-5 h-5" />
          </button>

          <button
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        <p 
          className="text-sm mb-4 max-w-3xl"
          style={{ color: 'var(--text-secondary)' }}
        >
          {project.description}
        </p>

        {/* Status and Progress */}
        <div className="flex items-center gap-6 mb-6">
          <div
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: statusColor.bg,
              color: statusColor.text
            }}
          >
            {project.status}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-32 h-2 rounded-full bg-gray-200">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${project.progress}%`,
                  backgroundColor: 'var(--accent-primary)'
                }}
              />
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {project.progress}%
            </span>
          </div>
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
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
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
                <div
                  className="p-6 rounded-xl"
                  style={{ backgroundColor: 'var(--surface-primary)' }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Tasks</span>
                  </div>
                  <div className="text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {project.stats.totalTasks}
                  </div>
                </div>

                <div
                  className="p-6 rounded-xl"
                  style={{ backgroundColor: 'var(--surface-primary)' }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5" style={{ color: '#22C55E' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Completed</span>
                  </div>
                  <div className="text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {project.stats.completedTasks}
                  </div>
                </div>

                <div
                  className="p-6 rounded-xl"
                  style={{ backgroundColor: 'var(--surface-primary)' }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5" style={{ color: '#F59E0B' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Active</span>
                  </div>
                  <div className="text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {project.stats.activeTasks}
                  </div>
                </div>

                <div
                  className="p-6 rounded-xl"
                  style={{ backgroundColor: 'var(--surface-primary)' }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5" style={{ color: '#EF4444' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Overdue</span>
                  </div>
                  <div className="text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {project.stats.overdueTasks}
                  </div>
                </div>
              </div>

              {/* Project Info */}
              <div className="grid grid-cols-2 gap-6">
                <div
                  className="p-6 rounded-xl"
                  style={{ backgroundColor: 'var(--surface-primary)' }}
                >
                  <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Timeline
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Start: {project.startDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        End: {project.endDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="p-6 rounded-xl"
                  style={{ backgroundColor: 'var(--surface-primary)' }}
                >
                  <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Budget
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Budget</span>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {project.budget}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Spent</span>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {project.spent}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subprojects */}
              {project.subprojects.length > 0 && (
                <div
                  className="p-6 rounded-xl"
                  style={{ backgroundColor: 'var(--surface-primary)' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Subprojects
                    </h3>
                    <button
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      style={{ 
                        backgroundColor: 'var(--accent-primary)',
                        color: '#ffffff'
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Subproject
                    </button>
                  </div>

                  <div className="space-y-3">
                    {project.subprojects.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center gap-4 p-4 rounded-lg"
                        style={{ backgroundColor: 'var(--bg-secondary)' }}
                      >
                        <Folder className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                        <div className="flex-1">
                          <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                            {sub.name}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-1.5 rounded-full bg-gray-200">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${sub.progress}%`,
                                  backgroundColor: 'var(--accent-primary)'
                                }}
                              />
                            </div>
                            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                              {sub.progress}%
                            </span>
                          </div>
                        </div>
                        <span
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: 'var(--surface-tertiary)',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          {sub.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Team */}
              <div
                className="p-6 rounded-xl"
                style={{ backgroundColor: 'var(--surface-primary)' }}
              >
                <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Team Members
                </h3>
                <div className="space-y-3">
                  {project.team.map((member, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback
                          className={member.color}
                          style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#FFFFFF'
                          }}
                        >
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {member.name}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {member.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'board' && (
          <BoardView 
            tasks={projectTasks}
            onTaskMove={(taskId, newStatus) => console.log('Task moved:', taskId, newStatus)}
            onTaskClick={(taskId) => console.log('Task clicked:', taskId)}
          />
        )}

        {activeTab === 'gantt' && (
          <GanttView 
            tasks={projectTasks}
            onTaskClick={(taskId) => console.log('Task clicked:', taskId)}
          />
        )}

        {activeTab === 'files' && (
          <div className="h-full overflow-auto p-8">
            <div 
              className="p-12 rounded-xl text-center"
              style={{ backgroundColor: 'var(--surface-primary)' }}
            >
              <FileText 
                className="w-12 h-12 mx-auto mb-4" 
                style={{ color: 'var(--text-tertiary)' }} 
              />
              <h3 
                className="text-lg font-medium mb-2" 
                style={{ color: 'var(--text-primary)' }}
              >
                No files yet
              </h3>
              <p 
                className="text-sm mb-4" 
                style={{ color: 'var(--text-secondary)' }}
              >
                Upload files related to this project
              </p>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium mx-auto"
                style={{ 
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff'
                }}
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
