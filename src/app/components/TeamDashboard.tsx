import { useState } from 'react';
import { Users, UserCheck, Clock, CheckCircle2, Activity, TrendingUp, Briefcase } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { EmployeeProfile, type Employee } from './EmployeeProfile';
import { EmployeeProjectMatrix } from './EmployeeProjectMatrix';

// Mock employee data
const initialEmployees: Employee[] = [
  {
    id: 'EMP-001',
    name: 'Sarah Chen',
    role: 'Senior Architect',
    status: 'working',
    currentProject: 'Bobur residence interior',
    tasksCompleted: 4,
    tasksTotal: 6,
    hoursToday: 6.5,
    lastActive: '2 min ago',
    email: 'sarah.chen@company.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, USA',
    joinDate: 'Jan 2021',
    department: 'Architecture',
    totalProjects: 32,
    weeklyHours: 42.5,
    monthlyTasksCompleted: 48,
    performance: 96,
    skills: ['AutoCAD', 'Revit', '3D Modeling', 'Interior Design', 'Project Management'],
    recentProjects: [
      { name: 'Bobur residence interior', role: 'Lead Architect', completion: 75 },
      { name: 'Corporate Office Redesign', role: 'Senior Architect', completion: 100 },
      { name: 'Luxury Villa Project', role: 'Lead Designer', completion: 90 }
    ]
  },
  {
    id: 'EMP-002',
    name: 'Mike Johnson',
    role: 'Interior Designer',
    status: 'working',
    currentProject: 'Modern Spaces LLC',
    tasksCompleted: 3,
    tasksTotal: 5,
    hoursToday: 5.2,
    lastActive: '5 min ago',
    email: 'mike.j@company.com',
    phone: '+1 (555) 234-5678',
    location: 'Los Angeles, USA',
    joinDate: 'Mar 2022',
    department: 'Interior Design',
    totalProjects: 18,
    weeklyHours: 38.0,
    performance: 92,
    skills: ['SketchUp', 'Rendering', 'Color Theory', 'Space Planning'],
    recentProjects: [
      { name: 'Modern Spaces LLC', role: 'Lead Designer', completion: 65 },
      { name: 'Boutique Hotel Interior', role: 'Interior Designer', completion: 100 }
    ]
  },
  {
    id: 'EMP-003',
    name: 'Emma Davis',
    role: 'Project Manager',
    status: 'idle',
    currentProject: null,
    tasksCompleted: 2,
    tasksTotal: 3,
    hoursToday: 4.0,
    lastActive: '45 min ago',
    email: 'emma.davis@company.com',
    phone: '+1 (555) 345-6789',
    location: 'Chicago, USA',
    joinDate: 'Jun 2020',
    department: 'Management',
    totalProjects: 45,
    weeklyHours: 40.0,
    performance: 94,
    skills: ['Project Management', 'Agile', 'Stakeholder Management', 'Budgeting'],
    recentProjects: [
      { name: 'Tech Campus Development', role: 'Project Manager', completion: 100 },
      { name: 'Residential Complex', role: 'PM', completion: 85 }
    ]
  },
  {
    id: 'EMP-004',
    name: 'Alex Martinez',
    role: '3D Visualizer',
    status: 'working',
    currentProject: 'Heritage Builders',
    tasksCompleted: 5,
    tasksTotal: 5,
    hoursToday: 7.0,
    lastActive: '1 min ago',
    email: 'alex.m@company.com',
    phone: '+1 (555) 456-7890',
    location: 'Miami, USA',
    joinDate: 'Sep 2021',
    department: 'Visualization',
    totalProjects: 28,
    weeklyHours: 45.0,
    performance: 98,
    skills: ['3ds Max', 'V-Ray', 'Photoshop', 'After Effects', 'Unreal Engine'],
    recentProjects: [
      { name: 'Heritage Builders', role: '3D Visualizer', completion: 100 },
      { name: 'Luxury Penthouse Render', role: 'Lead Visualizer', completion: 100 }
    ]
  },
  {
    id: 'EMP-005',
    name: 'Lisa Wang',
    role: 'Junior Designer',
    status: 'offline',
    currentProject: null,
    tasksCompleted: 0,
    tasksTotal: 4,
    hoursToday: 0,
    lastActive: '3 hours ago',
    email: 'lisa.wang@company.com',
    phone: '+1 (555) 567-8901',
    location: 'San Francisco, USA',
    joinDate: 'Feb 2023',
    department: 'Design',
    totalProjects: 8,
    weeklyHours: 35.0,
    performance: 85,
    skills: ['AutoCAD', 'SketchUp', 'Photoshop', 'InDesign'],
    recentProjects: [
      { name: 'Small Office Fitout', role: 'Junior Designer', completion: 100 },
      { name: 'Cafe Interior', role: 'Assistant Designer', completion: 90 }
    ]
  },
  {
    id: 'EMP-006',
    name: 'David Kim',
    role: 'Technical Lead',
    status: 'working',
    currentProject: 'Prestige Homes',
    tasksCompleted: 6,
    tasksTotal: 8,
    hoursToday: 6.8,
    lastActive: 'Just now',
    email: 'david.kim@company.com',
    phone: '+1 (555) 678-9012',
    location: 'Seattle, USA',
    joinDate: 'May 2019',
    department: 'Technical',
    totalProjects: 52,
    weeklyHours: 43.0,
    performance: 97,
    skills: ['BIM', 'Revit', 'Navisworks', 'Construction Documentation', 'Coordination'],
    recentProjects: [
      { name: 'Prestige Homes', role: 'Technical Lead', completion: 78 },
      { name: 'High-rise Development', role: 'BIM Manager', completion: 100 }
    ]
  },
  {
    id: 'EMP-007',
    name: 'Sofia Rodriguez',
    role: 'CAD Specialist',
    status: 'working',
    currentProject: 'Skyline Architects',
    tasksCompleted: 4,
    tasksTotal: 7,
    hoursToday: 5.5,
    lastActive: '10 min ago',
    email: 'sofia.r@company.com',
    phone: '+1 (555) 789-0123',
    location: 'Austin, USA',
    joinDate: 'Nov 2021',
    department: 'CAD',
    totalProjects: 24,
    weeklyHours: 39.0,
    performance: 91,
    skills: ['AutoCAD', 'MicroStation', 'Technical Drawing', 'Construction Details'],
    recentProjects: [
      { name: 'Skyline Architects', role: 'CAD Specialist', completion: 60 },
      { name: 'Mixed-use Development', role: 'CAD Lead', completion: 100 }
    ]
  },
  {
    id: 'EMP-008',
    name: 'James Wilson',
    role: 'Interior Designer',
    status: 'idle',
    currentProject: null,
    tasksCompleted: 1,
    tasksTotal: 4,
    hoursToday: 3.2,
    lastActive: '1 hour ago',
    email: 'james.w@company.com',
    phone: '+1 (555) 890-1234',
    location: 'Boston, USA',
    joinDate: 'Jul 2022',
    department: 'Interior Design',
    totalProjects: 15,
    weeklyHours: 37.5,
    performance: 88,
    skills: ['Space Planning', 'Material Selection', 'Lighting Design', 'FF&E'],
    recentProjects: [
      { name: 'Restaurant Interior', role: 'Interior Designer', completion: 100 },
      { name: 'Retail Store Design', role: 'Designer', completion: 95 }
    ]
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'working':
      return { bg: 'var(--status-progress-bg)', text: 'var(--status-progress-text)', dot: '#10b981' };
    case 'idle':
      return { bg: 'var(--status-burning-bg)', text: 'var(--status-burning-text)', dot: '#f59e0b' };
    case 'offline':
      return { bg: 'var(--surface-tertiary)', text: 'var(--text-tertiary)', dot: '#6b7280' };
    default:
      return { bg: 'var(--surface-tertiary)', text: 'var(--text-secondary)', dot: '#6b7280' };
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'working':
      return 'Working';
    case 'idle':
      return 'Idle';
    case 'offline':
      return 'Offline';
    default:
      return status;
  }
};

export function TeamDashboard() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'working' | 'idle' | 'offline'>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);

  const workingCount = employees.filter(e => e.status === 'working').length;
  const idleCount = employees.filter(e => e.status === 'idle').length;
  const offlineCount = employees.filter(e => e.status === 'offline').length;
  const totalHoursToday = employees.reduce((sum, e) => sum + e.hoursToday, 0);
  const totalTasksCompleted = employees.reduce((sum, e) => sum + e.tasksCompleted, 0);
  const totalTasks = employees.reduce((sum, e) => sum + e.tasksTotal, 0);
  const completionRate = totalTasks > 0 ? Math.round((totalTasksCompleted / totalTasks) * 100) : 0;

  const filteredEmployees = filterStatus === 'all' 
    ? employees 
    : employees.filter(e => e.status === filterStatus);

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
    setSelectedEmployee(updatedEmployee);
  };

  // Show employee profile if selected
  if (selectedEmployee) {
    return (
      <EmployeeProfile 
        employee={selectedEmployee}
        onBack={() => setSelectedEmployee(null)}
        onUpdateEmployee={handleUpdateEmployee}
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 p-8 pb-4 border-b" style={{
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border-primary)'
      }}>
        <div className="mb-6">
          <h2 className="text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>Team Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Real-time overview of team activity and project assignments</p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8 pt-6">
        {/* Employee-Project Time Matrix - MOVED TO TOP */}
        <div className="mb-6">
          <EmployeeProjectMatrix />
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Team Members */}
          <div 
            className="rounded-xl p-5 border"
            style={{ 
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--accent-primary-subtle)' }}
              >
                <Users className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Total</span>
            </div>
            <div className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              {employees.length}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Team Members
            </div>
          </div>

          {/* Working Now */}
          <div 
            className="rounded-xl p-5 border"
            style={{ 
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--status-progress-bg)' }}
              >
                <UserCheck className="w-5 h-5" style={{ color: 'var(--status-progress-text)' }} />
              </div>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Active</span>
            </div>
            <div className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              {workingCount}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Currently Working
            </div>
          </div>

          {/* Total Hours Today */}
          <div 
            className="rounded-xl p-5 border"
            style={{ 
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--accent-secondary-subtle)' }}
              >
                <Clock className="w-5 h-5" style={{ color: 'var(--accent-secondary)' }} />
              </div>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Today</span>
            </div>
            <div className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              {totalHoursToday.toFixed(1)}h
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Total Hours Logged
            </div>
          </div>

          {/* Task Completion */}
          <div 
            className="rounded-xl p-5 border"
            style={{ 
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--status-end-bg)' }}
              >
                <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--status-end-text)' }} />
              </div>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{completionRate}%</span>
            </div>
            <div className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              {totalTasksCompleted}/{totalTasks}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Tasks Completed Today
            </div>
          </div>
        </div>

        {/* Quick Status Filter */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Filter by status:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className="px-3 py-1.5 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: filterStatus === 'all' ? 'var(--accent-primary)' : 'var(--surface-secondary)',
                color: filterStatus === 'all' ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              All ({employees.length})
            </button>
            <button
              onClick={() => setFilterStatus('working')}
              className="px-3 py-1.5 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: filterStatus === 'working' ? 'var(--status-progress-bg)' : 'var(--surface-secondary)',
                color: filterStatus === 'working' ? 'var(--status-progress-text)' : 'var(--text-secondary)'
              }}
            >
              Working ({workingCount})
            </button>
            <button
              onClick={() => setFilterStatus('idle')}
              className="px-3 py-1.5 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: filterStatus === 'idle' ? 'var(--status-burning-bg)' : 'var(--surface-secondary)',
                color: filterStatus === 'idle' ? 'var(--status-burning-text)' : 'var(--text-secondary)'
              }}
            >
              Idle ({idleCount})
            </button>
            <button
              onClick={() => setFilterStatus('offline')}
              className="px-3 py-1.5 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: filterStatus === 'offline' ? 'var(--surface-tertiary)' : 'var(--surface-secondary)',
                color: filterStatus === 'offline' ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
            >
              Offline ({offlineCount})
            </button>
          </div>
        </div>

        {/* Employee Activity Table */}
        <div 
          className="rounded-xl shadow-sm border overflow-hidden"
          style={{
            backgroundColor: 'var(--surface-primary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-primary)' }}>
                  <th 
                    className="px-6 py-4 text-left text-xs uppercase tracking-wider font-medium"
                    style={{ 
                      color: 'var(--text-secondary)',
                      backgroundColor: 'var(--surface-secondary)'
                    }}
                  >
                    Employee
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs uppercase tracking-wider font-medium"
                    style={{ 
                      color: 'var(--text-secondary)',
                      backgroundColor: 'var(--surface-secondary)'
                    }}
                  >
                    Status
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs uppercase tracking-wider font-medium"
                    style={{ 
                      color: 'var(--text-secondary)',
                      backgroundColor: 'var(--surface-secondary)'
                    }}
                  >
                    Current Project
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs uppercase tracking-wider font-medium"
                    style={{ 
                      color: 'var(--text-secondary)',
                      backgroundColor: 'var(--surface-secondary)'
                    }}
                  >
                    Tasks Today
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs uppercase tracking-wider font-medium"
                    style={{ 
                      color: 'var(--text-secondary)',
                      backgroundColor: 'var(--surface-secondary)'
                    }}
                  >
                    Hours Today
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs uppercase tracking-wider font-medium"
                    style={{ 
                      color: 'var(--text-secondary)',
                      backgroundColor: 'var(--surface-secondary)'
                    }}
                  >
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => {
                  const statusColors = getStatusColor(employee.status);
                  const taskProgress = employee.tasksTotal > 0 
                    ? Math.round((employee.tasksCompleted / employee.tasksTotal) * 100) 
                    : 0;

                  return (
                    <tr 
                      key={employee.id}
                      className="border-b transition-colors hover:bg-opacity-50 cursor-pointer"
                      style={{ borderColor: 'var(--border-secondary)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      onClick={() => setSelectedEmployee(employee)}
                    >
                      {/* Employee Name & Role */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9">
                            <AvatarFallback style={{ 
                              backgroundColor: 'var(--accent-primary-subtle)',
                              color: 'var(--accent-primary)'
                            }}>
                              {employee.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                            {employee.avatar && <AvatarImage src={employee.avatar} />}
                          </Avatar>
                          <div>
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                              {employee.name}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                              {employee.role}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: statusColors.dot }}
                          />
                          <span 
                            className="text-sm px-2.5 py-1 rounded-md"
                            style={{ 
                              backgroundColor: statusColors.bg,
                              color: statusColors.text
                            }}
                          >
                            {getStatusLabel(employee.status)}
                          </span>
                        </div>
                      </td>

                      {/* Current Project */}
                      <td className="px-6 py-4">
                        {employee.currentProject ? (
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5 opacity-50" style={{ color: 'var(--text-tertiary)' }} />
                            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                              {employee.currentProject}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm opacity-50" style={{ color: 'var(--text-tertiary)' }}>
                            No active project
                          </span>
                        )}
                      </td>

                      {/* Tasks Today */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Progress 
                            value={taskProgress} 
                            className="flex-1 h-2 max-w-[100px]"
                            style={{ backgroundColor: 'var(--surface-tertiary)' }}
                          />
                          <span className="text-sm min-w-[4ch]" style={{ color: 'var(--text-secondary)' }}>
                            {employee.tasksCompleted}/{employee.tasksTotal}
                          </span>
                        </div>
                      </td>

                      {/* Hours Today */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 opacity-50" style={{ color: 'var(--text-tertiary)' }} />
                          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                            {employee.hoursToday.toFixed(1)}h
                          </span>
                        </div>
                      </td>

                      {/* Last Active */}
                      <td className="px-6 py-4">
                        <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                          {employee.lastActive}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Average Hours */}
          <div 
            className="rounded-xl p-5 border"
            style={{ 
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Average Hours/Person</span>
            </div>
            <div className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {(totalHoursToday / employees.length).toFixed(1)}h
            </div>
          </div>

          {/* Productivity Rate */}
          <div 
            className="rounded-xl p-5 border"
            style={{ 
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5" style={{ color: 'var(--status-progress-text)' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Team Productivity</span>
            </div>
            <div className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {completionRate}%
            </div>
          </div>

          {/* Active Projects */}
          <div 
            className="rounded-xl p-5 border"
            style={{ 
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="w-5 h-5" style={{ color: 'var(--accent-secondary)' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Active Projects</span>
            </div>
            <div className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {new Set(employees.filter(e => e.currentProject).map(e => e.currentProject)).size}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}