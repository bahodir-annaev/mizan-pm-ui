import { Clock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';

interface ActiveTask {
  id: string;
  title: string;
  projectName: string;
  projectColor: string;
  assignee: string;
  assigneeInitials: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  daysLeft: number;
  progress: number;
  status: 'In Progress' | 'Review' | 'Blocked';
}

const mockActiveTasks: ActiveTask[] = [
  {
    id: '1',
    title: 'Foundation excavation and site preparation',
    projectName: 'Mehnat bozorini',
    projectColor: '#FEF3F2',
    assignee: 'Mirziz',
    assigneeInitials: 'MZ',
    priority: 'Critical',
    daysLeft: 2,
    progress: 85,
    status: 'In Progress'
  },
  {
    id: '2',
    title: 'Structural steel framework installation',
    projectName: 'John Company',
    projectColor: '#EFF6FF',
    assignee: 'ONMR',
    assigneeInitials: 'ON',
    priority: 'High',
    daysLeft: 5,
    progress: 60,
    status: 'In Progress'
  },
  {
    id: '3',
    title: 'Electrical systems rough-in',
    projectName: 'Texno Galactica',
    projectColor: '#FEF9C3',
    assignee: 'Mukhammad Abdullayev Olimov',
    assigneeInitials: 'MA',
    priority: 'High',
    daysLeft: 7,
    progress: 45,
    status: 'Review'
  },
  {
    id: '4',
    title: 'HVAC system design approval',
    projectName: 'French Heights',
    projectColor: '#ECFDF5',
    assignee: 'Khasan Nurmukhammad',
    assigneeInitials: 'KN',
    priority: 'Medium',
    daysLeft: 10,
    progress: 30,
    status: 'Blocked'
  },
  {
    id: '5',
    title: 'Interior drywall finishing',
    projectName: 'Garden Suites',
    projectColor: '#F5F3FF',
    assignee: 'Rixsix Uzbbetzimonov',
    assigneeInitials: 'RU',
    priority: 'Medium',
    daysLeft: 14,
    progress: 20,
    status: 'In Progress'
  },
  {
    id: '6',
    title: 'Plumbing fixtures installation',
    projectName: 'Market Aligarx',
    projectColor: '#F0FDFA',
    assignee: 'Shox Majlis',
    assigneeInitials: 'SM',
    priority: 'Low',
    daysLeft: 18,
    progress: 15,
    status: 'In Progress'
  },
];

export function ActiveTasksSection() {
  const { t } = useTranslation();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return '#ef4444';
      case 'High': return '#f97316';
      case 'Medium': return '#eab308';
      case 'Low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return '#3b82f6';
      case 'Review': return '#8b5cf6';
      case 'Blocked': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getDeadlineColor = (daysLeft: number) => {
    if (daysLeft <= 3) return '#ef4444';
    if (daysLeft <= 7) return '#f97316';
    if (daysLeft <= 14) return '#eab308';
    return '#22c55e';
  };

  return (
    <div 
      className="rounded-lg overflow-hidden"
      style={{
        backgroundColor: 'var(--surface-primary)',
        border: '1px solid var(--border-primary)'
      }}
    >
      {/* Header */}
      <div className="p-5 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <h3 className="text-sm mb-1" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
          Aktual Zadachalar
        </h3>
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Hozirgi vaqtda bajarilayotgan muhim vazifalar
        </p>
      </div>

      {/* Tasks Grid */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockActiveTasks.map((task) => (
          <div
            key={task.id}
            className="rounded-lg border transition-all hover:shadow-lg"
            style={{
              backgroundColor: task.projectColor,
              borderColor: 'var(--border-primary)',
              padding: '16px'
            }}
          >
            {/* Header with Project and Priority */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div 
                  className="text-xs font-medium mb-1"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {task.projectName}
                </div>
                <h4 
                  className="text-sm font-semibold line-clamp-2 leading-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {task.title}
                </h4>
              </div>
              <div
                className="ml-2 px-2 py-0.5 rounded text-xs font-bold text-white whitespace-nowrap"
                style={{ backgroundColor: getPriorityColor(task.priority) }}
              >
                {task.priority}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Progress</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {task.progress}%
                </span>
              </div>
              <div 
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
              >
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${task.progress}%`,
                    backgroundColor: task.progress >= 80 ? '#22c55e' : task.progress >= 50 ? '#3b82f6' : '#f97316'
                  }}
                />
              </div>
            </div>

            {/* Footer with Assignee, Status, and Deadline */}
            <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
              {/* Assignee */}
              <div className="flex items-center gap-2">
                <div 
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  {task.assigneeInitials}
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {task.assignee.split(' ')[0]}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getStatusColor(task.status) }}
                />
                <span 
                  className="text-xs font-medium"
                  style={{ color: getStatusColor(task.status) }}
                >
                  {task.status}
                </span>
              </div>
            </div>

            {/* Deadline Warning */}
            <div 
              className="mt-2 flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.6)',
                color: getDeadlineColor(task.daysLeft)
              }}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>
                {task.daysLeft} kun qoldi
              </span>
              {task.daysLeft <= 3 && (
                <AlertCircle className="w-3.5 h-3.5 ml-auto animate-pulse" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div 
        className="px-5 py-3 border-t flex justify-between items-center"
        style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--surface-secondary)' }}
      >
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Jami {mockActiveTasks.length} ta aktual vazifa
        </span>
        <button
          className="text-xs font-medium px-3 py-1.5 rounded transition-all"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: '#ffffff'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          Barcha vazifalar
        </button>
      </div>
    </div>
  );
}
