import { useState } from 'react';
import { Users, UserCheck, Clock, CheckCircle2, Activity, TrendingUp, Briefcase } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { EmployeeProfile, type Employee } from './EmployeeProfile';
import { EmployeeProjectMatrix } from './EmployeeProjectMatrix';
const initialEmployees: Employee[] = [];

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