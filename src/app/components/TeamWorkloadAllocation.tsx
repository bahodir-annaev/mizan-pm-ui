import { useState } from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ChevronLeft, ChevronRight, TrendingUp, Clock, Users, Briefcase, X } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  status: 'active' | 'idle' | 'partial'; // green, red, yellow
  activeProjects: string[];
  hoursToday: number;
}

interface Project {
  id: string;
  name: string;
  color: string;
  assignedEmployees: string[];
}

interface TimeRecord {
  employeeId: string;
  projectId: string;
  day: number;
  hours: number;
  startTime?: string;
  endTime?: string;
  taskName?: string;
}

// Mock data
const employees: Employee[] = [
  { 
    id: 'e1', 
    name: 'Sarah Johnson', 
    initials: 'SJ', 
    status: 'active',
    activeProjects: ['p1', 'p3'],
    hoursToday: 7.5
  },
  { 
    id: 'e2', 
    name: 'Alex Kim', 
    initials: 'AK', 
    status: 'active',
    activeProjects: ['p2', 'p4'],
    hoursToday: 6.0
  },
  { 
    id: 'e3', 
    name: 'Mike Chen', 
    initials: 'MC', 
    status: 'partial',
    activeProjects: ['p1'],
    hoursToday: 3.5
  },
  { 
    id: 'e4', 
    name: 'Emily Davis', 
    initials: 'ED', 
    status: 'idle',
    activeProjects: [],
    hoursToday: 0
  },
  { 
    id: 'e5', 
    name: 'John Doe', 
    initials: 'JD', 
    status: 'active',
    activeProjects: ['p3', 'p5'],
    hoursToday: 8.0
  },
  { 
    id: 'e6', 
    name: 'Lisa Brown', 
    initials: 'LB', 
    status: 'partial',
    activeProjects: ['p2'],
    hoursToday: 4.0
  },
  { 
    id: 'e7', 
    name: 'Tom Wilson', 
    initials: 'TW', 
    status: 'idle',
    activeProjects: [],
    hoursToday: 0
  },
  { 
    id: 'e8', 
    name: 'Anna Taylor', 
    initials: 'AT', 
    status: 'active',
    activeProjects: ['p4', 'p5'],
    hoursToday: 7.0
  },
];

const projects: Project[] = [
  { id: 'p1', name: 'Website Redesign', color: '#EFF6FF', assignedEmployees: ['e1', 'e3'] },
  { id: 'p2', name: 'Mobile App Development', color: '#F0FDF4', assignedEmployees: ['e2', 'e6'] },
  { id: 'p3', name: 'Marketing Campaign', color: '#FEF3F2', assignedEmployees: ['e1', 'e5'] },
  { id: 'p4', name: 'Database Migration', color: '#FDF4FF', assignedEmployees: ['e2', 'e8'] },
  { id: 'p5', name: 'Customer Portal', color: '#F0FDFA', assignedEmployees: ['e5', 'e8'] },
  { id: 'p6', name: 'API Integration', color: '#FEF9C3', assignedEmployees: [] },
  { id: 'p7', name: 'Security Audit', color: '#ECFDF5', assignedEmployees: [] },
];

// Generate mock time records
const generateTimeRecords = (): TimeRecord[] => {
  const records: TimeRecord[] = [];
  
  projects.forEach(project => {
    project.assignedEmployees.forEach(empId => {
      // Generate random time entries for different days
      const numDays = Math.floor(Math.random() * 15) + 5;
      for (let i = 0; i < numDays; i++) {
        const day = Math.floor(Math.random() * 30) + 1;
        const hours = Math.floor(Math.random() * 8) + 1;
        records.push({
          employeeId: empId,
          projectId: project.id,
          day,
          hours,
          startTime: '09:00',
          endTime: `${9 + hours}:00`,
          taskName: 'Development work'
        });
      }
    });
  });
  
  return records;
};

const timeRecords = generateTimeRecords();

export function TeamWorkloadAllocation() {
  const [selectedMonth, setSelectedMonth] = useState(11); // December (0-indexed)
  const [selectedYear] = useState(2024);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ empId: string; projId: string; day: number } | null>(null);
  const [showDaysRange, setShowDaysRange] = useState<[number, number]>([1, 15]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const visibleDays = Array.from(
    { length: showDaysRange[1] - showDaysRange[0] + 1 }, 
    (_, i) => showDaysRange[0] + i
  );

  // Calculate analytics
  const totalHoursToday = employees.reduce((sum, emp) => sum + emp.hoursToday, 0);
  const totalHoursMonth = timeRecords.reduce((sum, record) => sum + record.hours, 0);
  const mostActiveEmployee = [...employees].sort((a, b) => b.hoursToday - a.hoursToday)[0];
  const projectHours = projects.map(p => ({
    project: p,
    hours: timeRecords.filter(r => r.projectId === p.id).reduce((sum, r) => sum + r.hours, 0)
  })).sort((a, b) => b.hours - a.hours);
  const mostTimeConsumingProject = projectHours[0];

  const getStatusColor = (status: Employee['status']) => {
    switch (status) {
      case 'active': return '#10b981'; // Green
      case 'partial': return '#f59e0b'; // Yellow
      case 'idle': return '#ef4444'; // Red
    }
  };

  const getHoursForCell = (empId: string, projId: string, day: number): number => {
    const record = timeRecords.find(
      r => r.employeeId === empId && r.projectId === projId && r.day === day
    );
    return record?.hours || 0;
  };

  const getCellRecord = (empId: string, projId: string, day: number): TimeRecord | null => {
    return timeRecords.find(
      r => r.employeeId === empId && r.projectId === projId && r.day === day
    ) || null;
  };

  const filteredEmployees = selectedEmployee 
    ? employees.filter(e => e.id === selectedEmployee)
    : employees;

  const navigateDays = (direction: 'prev' | 'next') => {
    const range = showDaysRange[1] - showDaysRange[0] + 1;
    if (direction === 'prev' && showDaysRange[0] > 1) {
      const newStart = Math.max(1, showDaysRange[0] - range);
      setShowDaysRange([newStart, newStart + range - 1]);
    } else if (direction === 'next' && showDaysRange[1] < daysInMonth) {
      const newStart = showDaysRange[1] + 1;
      setShowDaysRange([newStart, Math.min(daysInMonth, newStart + range - 1)]);
    }
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm mb-1" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              Team Workload & Time Allocation
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Visual overview of employee time distribution across projects
            </p>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedMonth(prev => Math.max(0, prev - 1))}
              className="p-2 rounded-lg transition-all"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="px-4 py-2 rounded-lg text-sm font-medium" style={{ 
              backgroundColor: 'var(--surface-secondary)',
              color: 'var(--text-primary)'
            }}>
              {monthNames[selectedMonth]} {selectedYear}
            </div>

            <button
              onClick={() => setSelectedMonth(prev => Math.min(11, prev + 1))}
              className="p-2 rounded-lg transition-all"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-4 gap-3">
          <div 
            className="p-3 rounded-lg"
            style={{ 
              backgroundColor: 'var(--surface-secondary)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Hours Today</span>
            </div>
            <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {totalHoursToday.toFixed(1)}h
            </div>
          </div>

          <div 
            className="p-3 rounded-lg"
            style={{ 
              backgroundColor: 'var(--surface-secondary)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Hours This Month</span>
            </div>
            <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {totalHoursMonth}h
            </div>
          </div>

          <div 
            className="p-3 rounded-lg"
            style={{ 
              backgroundColor: 'var(--surface-secondary)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Most Active</span>
            </div>
            <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {mostActiveEmployee?.name}
            </div>
          </div>

          <div 
            className="p-3 rounded-lg"
            style={{ 
              backgroundColor: 'var(--surface-secondary)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Top Project</span>
            </div>
            <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {mostTimeConsumingProject?.project.name}
            </div>
          </div>
        </div>
      </div>

      {/* Employee Avatars Row */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--surface-secondary)' }}>
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          {selectedEmployee && (
            <button
              onClick={() => setSelectedEmployee(null)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{
                backgroundColor: 'var(--surface-primary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-primary)';
              }}
            >
              <X className="w-3 h-3" />
              Clear Filter
            </button>
          )}
          
          {employees.map((employee) => {
            const isSelected = selectedEmployee === employee.id;
            return (
              <div
                key={employee.id}
                className="relative group cursor-pointer flex flex-col items-center gap-1"
                onClick={() => setSelectedEmployee(isSelected ? null : employee.id)}
              >
                {/* Avatar with status ring */}
                <div className="relative">
                  {/* Status ring */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      padding: '3px',
                      background: `conic-gradient(${getStatusColor(employee.status)} 0deg 360deg)`,
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      transition: 'transform 0.2s'
                    }}
                  >
                    <div 
                      className="w-full h-full rounded-full"
                      style={{ backgroundColor: 'var(--surface-secondary)' }}
                    />
                  </div>

                  {/* Avatar */}
                  <Avatar className="relative w-12 h-12 border-2" style={{ borderColor: 'var(--surface-secondary)' }}>
                    <AvatarFallback 
                      className="text-white text-sm font-semibold"
                      style={{ 
                        backgroundColor: getStatusColor(employee.status)
                      }}
                    >
                      {employee.initials}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Employee name */}
                <span 
                  className="text-xs font-medium text-center"
                  style={{ 
                    color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    maxWidth: '80px'
                  }}
                >
                  {employee.name.split(' ')[0]}
                </span>

                {/* Hover tooltip */}
                <div 
                  className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap"
                  style={{
                    backgroundColor: 'var(--surface-primary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {employee.name}
                  </div>
                  <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Projects: {employee.activeProjects.length}
                  </div>
                  <div className="text-xs font-medium" style={{ color: 'var(--accent-primary)' }}>
                    Today: {employee.hoursToday}h
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Days Header Row */}
          <div className="flex border-b" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--surface-secondary)' }}>
            {/* Project column header */}
            <div 
              className="sticky left-0 z-20 p-3 border-r flex items-center justify-between"
              style={{ 
                width: '250px',
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <span className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Projects
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigateDays('prev')}
                  disabled={showDaysRange[0] === 1}
                  className="p-1 rounded transition-all disabled:opacity-30"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button
                  onClick={() => navigateDays('next')}
                  disabled={showDaysRange[1] === daysInMonth}
                  className="p-1 rounded transition-all disabled:opacity-30"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Employee columns */}
            {filteredEmployees.map((employee) => (
              <div
                key={`header-${employee.id}`}
                className="flex border-r"
                style={{ borderColor: 'var(--border-primary)' }}
              >
                {visibleDays.map((day) => (
                  <div
                    key={`${employee.id}-day-${day}`}
                    className="flex-shrink-0 border-r p-2 flex items-center justify-center"
                    style={{ 
                      minWidth: '50px',
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border-primary)'
                    }}
                  >
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {day}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Project Rows */}
          {projects.map((project, projIndex) => (
            <div 
              key={project.id}
              className="flex border-b"
              style={{ 
                borderColor: 'var(--border-secondary)',
                backgroundColor: projIndex % 2 === 0 ? 'var(--surface-primary)' : 'var(--surface-secondary)'
              }}
            >
              {/* Project name */}
              <div 
                className="sticky left-0 z-10 px-4 py-3 border-r flex items-center gap-2 cursor-pointer transition-all"
                style={{ 
                  width: '250px',
                  backgroundColor: projIndex % 2 === 0 ? 'var(--surface-primary)' : 'var(--surface-secondary)',
                  borderColor: 'var(--border-secondary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = projIndex % 2 === 0 ? 'var(--surface-primary)' : 'var(--surface-secondary)';
                }}
              >
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color, border: '2px solid var(--border-primary)' }}
                />
                <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {project.name}
                </span>
              </div>

              {/* Employee time cells */}
              {filteredEmployees.map((employee) => (
                <div
                  key={`${project.id}-${employee.id}`}
                  className="flex border-r"
                  style={{ borderColor: 'var(--border-secondary)' }}
                >
                  {visibleDays.map((day) => {
                    const hours = getHoursForCell(employee.id, project.id, day);
                    const record = getCellRecord(employee.id, project.id, day);
                    const isAssigned = project.assignedEmployees.includes(employee.id);
                    const isHovered = hoveredCell?.empId === employee.id && 
                                     hoveredCell?.projId === project.id && 
                                     hoveredCell?.day === day;

                    // Determine cell background
                    let cellBg = 'transparent';
                    if (hours > 0) {
                      const intensity = Math.min(hours / 8, 1);
                      const greenValue = Math.floor(200 + (intensity * 55));
                      cellBg = `rgba(16, 185, 129, ${0.1 + intensity * 0.3})`;
                    } else if (isAssigned) {
                      cellBg = project.color;
                    }

                    return (
                      <div
                        key={`${employee.id}-${project.id}-${day}`}
                        className="flex-shrink-0 border-r flex items-center justify-center text-xs relative group cursor-pointer transition-all"
                        style={{ 
                          minWidth: '50px',
                          height: '44px',
                          borderColor: 'var(--border-secondary)',
                          backgroundColor: cellBg,
                          color: hours > 0 ? 'var(--text-primary)' : 'var(--text-disabled)',
                          fontWeight: hours > 0 ? 600 : 400
                        }}
                        onMouseEnter={() => setHoveredCell({ empId: employee.id, projId: project.id, day })}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        {hours > 0 ? `${hours}h` : isAssigned ? '·' : ''}

                        {/* Hover tooltip */}
                        {isHovered && record && (
                          <div 
                            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 z-50 whitespace-nowrap"
                            style={{
                              backgroundColor: 'var(--surface-primary)',
                              border: '1px solid var(--border-primary)',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                          >
                            <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                              {project.name}
                            </div>
                            <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                              {employee.name}
                            </div>
                            <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                              {record.startTime} - {record.endTime}
                            </div>
                            <div className="text-xs font-medium" style={{ color: 'var(--accent-primary)' }}>
                              {record.hours} hours
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
