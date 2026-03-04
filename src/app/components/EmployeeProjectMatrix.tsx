import { useState } from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ChevronDown, ChevronUp, Wifi, WifiOff, Building2, Clock, Info, MoreHorizontal, Trees, Sofa, Warehouse, TreePine, Mountain, X, Calendar, Users } from 'lucide-react';
import { TimeScopeSelector, type TimeScopeState } from './TimeScopeSelector';

interface ProjectData {
  id: string;
  name: string;
  color: string;
  taskName: string; // Current task being worked on
  employee: {
    name: string;
    initials: string;
    avatar?: string;
  };
  isActive: boolean; // true = working (green), false = not working (red)
  iconType: 'landscape' | 'interior' | 'exterior' | 'yard'; // Architecture icon type
}

interface EmployeeTimeData {
  employeeId: string;
  employeeName: string;
  projects: {
    [projectId: string]: number[]; // 30 days of hours
  };
}

// Helper function to shorten project names for column headers
const shortenName = (name: string, maxLength: number = 12): string => {
  if (name.length <= maxLength) return name;
  
  const words = name.split(' ');
  if (words.length === 1) {
    return name.substring(0, maxLength - 1) + '.';
  }
  
  // Take first word and first letter of remaining words
  const firstWord = words[0];
  if (firstWord.length >= maxLength) {
    return firstWord.substring(0, maxLength - 1) + '.';
  }
  
  // Build abbreviated name
  let result = firstWord;
  for (let i = 1; i < words.length && result.length < maxLength - 2; i++) {
    result += ' ' + words[i].charAt(0) + '.';
  }
  
  return result;
};

// Mock projects data with modern colors
const projects: ProjectData[] = [
  { 
    id: 'p1', 
    name: 'Mehnat bozorini', 
    color: '#FEF3F2',
    taskName: 'Market Research',
    employee: { name: 'Sarah Johnson', initials: 'SJ' },
    isActive: false,
    iconType: 'landscape'
  },
  { 
    id: 'p2', 
    name: 'Xolis Ismailov', 
    color: '#F0FDF4',
    taskName: 'Product Development',
    employee: { name: 'Alex Kim', initials: 'AK' },
    isActive: true,
    iconType: 'interior'
  },
  { 
    id: 'p3', 
    name: 'John Company', 
    color: '#EFF6FF',
    taskName: 'Sales Strategy',
    employee: { name: 'Mike Chen', initials: 'MC' },
    isActive: true,
    iconType: 'exterior'
  },
  { 
    id: 'p4', 
    name: 'Akfa Mekhnatbonisi', 
    color: '#FDF4FF',
    taskName: 'Quality Assurance',
    employee: { name: 'Emily Davis', initials: 'ED' },
    isActive: false,
    iconType: 'yard'
  },
  { 
    id: 'p5', 
    name: 'Market Aligarx', 
    color: '#F0FDFA',
    taskName: 'Marketing Campaign',
    employee: { name: 'John Doe', initials: 'JD' },
    isActive: true,
    iconType: 'landscape'
  },
  { 
    id: 'p6', 
    name: 'Texno Galactica', 
    color: '#FEF9C3',
    taskName: 'Software Testing',
    employee: { name: 'Sarah Miller', initials: 'SM' },
    isActive: true,
    iconType: 'interior'
  },
  { 
    id: 'p7', 
    name: 'French Heights', 
    color: '#ECFDF5',
    taskName: 'Project Management',
    employee: { name: 'Tom Wilson', initials: 'TW' },
    isActive: true,
    iconType: 'exterior'
  },
  { 
    id: 'p8', 
    name: 'Garden Suites', 
    color: '#F5F3FF',
    taskName: 'Customer Support',
    employee: { name: 'Lisa Brown', initials: 'LB' },
    isActive: true,
    iconType: 'yard'
  },
  { 
    id: 'p9', 
    name: 'Residential Hamiltabonbonisi', 
    color: '#FFF7ED',
    taskName: 'Data Analysis',
    employee: { name: 'David Lee', initials: 'DL' },
    isActive: false,
    iconType: 'landscape'
  },
  { 
    id: 'p10', 
    name: 'Luxury Dreamer', 
    color: '#DBEAFE',
    taskName: 'Financial Planning',
    employee: { name: 'Anna Taylor', initials: 'AT' },
    isActive: true,
    iconType: 'interior'
  },
];

// Mock employee time data
const employeeTimeData: EmployeeTimeData[] = [
  {
    employeeId: 'e1',
    employeeName: 'Mirziz',
    projects: {
      'p1': Array(30).fill(0).map((_, i) => i < 5 ? Math.floor(Math.random() * 8) : 0),
      'p2': Array(30).fill(0).map((_, i) => i >= 5 && i < 15 ? Math.floor(Math.random() * 8) : 0),
      'p3': Array(30).fill(0).map((_, i) => i >= 15 ? Math.floor(Math.random() * 8) : 0),
    }
  },
  {
    employeeId: 'e2',
    employeeName: 'Rixsix Uzbbetzimonov',
    projects: {
      'p2': Array(30).fill(0).map((_, i) => i < 10 ? Math.floor(Math.random() * 8) : 0),
      'p4': Array(30).fill(0).map((_, i) => i >= 10 ? Math.floor(Math.random() * 8) : 0),
    }
  },
  {
    employeeId: 'e3',
    employeeName: 'Mukhammad Abdullayev Olimov',
    projects: {
      'p1': Array(30).fill(0).map((_, i) => i < 7 ? Math.floor(Math.random() * 8) : 0),
      'p5': Array(30).fill(0).map((_, i) => i >= 7 && i < 20 ? Math.floor(Math.random() * 8) : 0),
      'p6': Array(30).fill(0).map((_, i) => i >= 20 ? Math.floor(Math.random() * 8) : 0),
    }
  },
  {
    employeeId: 'e4',
    employeeName: 'ONMR',
    projects: {
      'p3': Array(30).fill(0).map((_, i) => Math.floor(Math.random() * 8)),
    }
  },
  {
    employeeId: 'e5',
    employeeName: 'Khasan Nurmukhammad',
    projects: {
      'p7': Array(30).fill(0).map((_, i) => i < 15 ? Math.floor(Math.random() * 8) : 0),
      'p8': Array(30).fill(0).map((_, i) => i >= 15 ? Math.floor(Math.random() * 8) : 0),
    }
  },
  {
    employeeId: 'e6',
    employeeName: 'Shox Majlis',
    projects: {
      'p2': Array(30).fill(0).map((_, i) => i < 12 ? Math.floor(Math.random() * 8) : 0),
      'p9': Array(30).fill(0).map((_, i) => i >= 12 ? Math.floor(Math.random() * 8) : 0),
    }
  },
];

export function EmployeeProjectMatrix() {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [hoveredEmployee, setHoveredEmployee] = useState<string | null>(null);
  const [selectedProjectInfo, setSelectedProjectInfo] = useState<ProjectData | null>(null);
  const [timeScope, setTimeScope] = useState<TimeScopeState>({
    scope: 'weekly',
    date: new Date()
  });
  
  const handleEmployeeSelect = (employeeName: string) => {
    if (selectedEmployee === employeeName) {
      setSelectedEmployee(null);
    } else {
      setSelectedEmployee(employeeName);
    }
  };
  
  // Find selected employee's project
  const selectedEmployeeProject = selectedEmployee 
    ? projects.find(p => p.employee.name === selectedEmployee)
    : null;
  
  // Calculate hours based on time scope
  const getFilteredHours = (hours: number[]): number => {
    const now = new Date();
    const today = now.getDate() - 1; // 0-indexed
    
    switch (timeScope.scope) {
      case 'daily':
        return hours[today] || 0;
      case 'weekly':
        const weekStart = Math.max(0, today - 6);
        return hours.slice(weekStart, today + 1).reduce((sum, h) => sum + h, 0);
      case 'monthly':
        return hours.reduce((sum, h) => sum + h, 0);
      case 'yearly':
        return hours.reduce((sum, h) => sum + h, 0) * 12; // Mock: multiply by 12
      case 'all-time':
        return hours.reduce((sum, h) => sum + h, 0) * 24; // Mock: multiply by 24
      default:
        return 0;
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
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-primary)' }}>
        <div>
          <h3 className="text-sm mb-1" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
            Employee-Project Time Matrix
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Track hours by employee and project
          </p>
        </div>
        
        {/* Advanced Time Scope Selector */}
        <TimeScopeSelector value={timeScope} onChange={setTimeScope} />
      </div>

      {/* Scrollable Table Container */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Projects Header Row */}
          <div className="flex border-b" style={{ borderColor: 'var(--border-primary)' }}>
            {/* Employee Column Header */}
            <div 
              className="sticky left-0 z-20 px-2 py-1.5 border-r"
              style={{ 
                width: '200px',
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                Xodimlar ismi
              </div>
            </div>

            {/* Unified Employee Headers - Rectangular, Consistent */}
            {projects.map((project) => {
              const isSelectedEmployee = selectedEmployee === project.employee.name;
              const isHovered = hoveredEmployee === project.employee.name;
              
              return (
                <div
                  key={project.id}
                  className="flex-shrink-0 border-r p-2"
                  style={{ 
                    width: '80px',
                    backgroundColor: isSelectedEmployee ? 'rgba(59, 130, 246, 0.15)' : 'var(--surface-secondary)',
                    borderColor: 'var(--border-primary)',
                    transform: isHovered ? 'translateY(-8px) scale(1.05)' : 'translateY(0) scale(1)',
                    boxShadow: isHovered 
                      ? '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)' 
                      : '0 1px 3px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: isHovered ? 30 : 'auto'
                  }}
                  onMouseEnter={() => setHoveredEmployee(project.employee.name)}
                  onMouseLeave={() => setHoveredEmployee(null)}
                >
                  {/* Rectangular Employee Header Container */}
                  <div 
                    className="flex flex-col items-center gap-2 p-2 rounded-lg cursor-pointer relative overflow-hidden"
                    style={{
                      backgroundColor: isSelectedEmployee ? 'rgba(59, 130, 246, 0.2)' : 'var(--surface-primary)',
                      border: '1px solid var(--border-primary)',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => handleEmployeeSelect(project.employee.name)}
                  >
                    {/* Shimmer overlay effect - only on hover */}
                    {isHovered && (
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                          animation: 'shimmer 1.5s infinite',
                          zIndex: 1
                        }}
                      />
                    )}
                    
                    {/* Animated gradient background - only on hover */}
                    {isHovered && (
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `radial-gradient(circle at center, ${project.isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'} 0%, transparent 70%)`,
                          animation: 'pulse 2s ease-in-out infinite',
                          zIndex: 0
                        }}
                      />
                    )}
                    
                    {/* Avatar with subtle status indicator */}
                    <div className="relative z-10">
                      <Avatar className="w-9 h-9">
                        <AvatarFallback 
                          style={{ 
                            backgroundColor: isSelectedEmployee ? 'var(--accent-primary)' : 'var(--surface-hover)',
                            color: isSelectedEmployee ? '#ffffff' : 'var(--text-primary)',
                            fontSize: '11px',
                            fontWeight: 600
                          }}
                        >
                          {project.employee.initials}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Small status dot */}
                      <div 
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 animate-pulse"
                        style={{ 
                          backgroundColor: project.isActive ? '#10b981' : '#ef4444',
                          borderColor: 'var(--surface-primary)',
                          animation: project.isActive 
                            ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' 
                            : 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                        }}
                      />
                    </div>
                    
                    {/* Employee name - single line, truncated */}
                    <div 
                      className="text-center w-full overflow-hidden"
                      style={{
                        fontSize: '10px',
                        color: isSelectedEmployee ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        lineHeight: '1.3',
                        fontWeight: isSelectedEmployee ? 600 : 400
                      }}
                    >
                      <div className="truncate" title={project.employee.name}>
                        {project.employee.name}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current Tasks Row */}
          <div className="flex border-b" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--surface-secondary)' }}>
            <div 
              className="sticky left-0 z-20 px-2 py-1 border-r text-xs font-medium flex items-center gap-2 group"
              style={{ 
                width: '200px',
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-tertiary)'
              }}
            >
              <span>Jarayondagi ishlar</span>
              <div className="relative ml-auto">
                <Info 
                  className="cursor-pointer opacity-40 hover:opacity-100 transition-opacity" 
                  style={{ 
                    width: '14px', 
                    height: '14px',
                    color: 'var(--text-tertiary)'
                  }} 
                />
                {/* Info Tooltip */}
                <div 
                  className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-4 py-3 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-primary)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    minWidth: '240px',
                    whiteSpace: 'normal'
                  }}
                >
                  <div 
                    className="font-semibold mb-2"
                    style={{ 
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      lineHeight: '1.4'
                    }}
                  >
                    Loyihalar haqida
                  </div>
                  <div 
                    className="mb-2"
                    style={{ 
                      color: 'var(--text-secondary)',
                      fontSize: '11px',
                      lineHeight: '1.6'
                    }}
                  >
                    Bu qatorda har bir loyihaning rangi va ikonkasi ko'rsatilgan. Loyiha ustiga bosing yoki hover qiling batafsil ma'lumot olish uchun.
                  </div>
                  <div 
                    style={{ 
                      color: 'var(--text-tertiary)',
                      fontSize: '10px',
                      lineHeight: '1.5'
                    }}
                  >
                    💡 <strong>Maslahat:</strong> Loyiha rangidan foydalanib tez aniqlash mumkin.
                  </div>
                </div>
              </div>
            </div>
            {projects.map((project) => {
              // Calculate today's hours for this project
              const todayHours = employeeTimeData.reduce((sum, emp) => {
                const projectHours = emp.projects[project.id];
                if (!projectHours) return sum;
                const now = new Date();
                const today = now.getDate() - 1; // 0-indexed
                return sum + (projectHours[today] || 0);
              }, 0);
              
              // Check if this is the selected employee's project
              const isSelectedEmployeeProject = selectedEmployeeProject?.id === project.id;
              
              // Use appropriate colors based on theme and active status
              const cellBackgroundColor = isSelectedEmployeeProject
                ? 'var(--accent-primary-bg)'  // Blue for selected employee
                : project.isActive 
                  ? 'var(--status-start-bg)'  // Green for working
                  : 'var(--status-late-bg)';  // Red for not working
              
              // Determine which icon to render based on iconType
              const getProjectIcon = () => {
                const iconProps = {
                  className: "opacity-70",
                  style: {
                    color: isSelectedEmployeeProject 
                      ? 'var(--accent-primary)'
                      : project.isActive ? 'var(--status-start-text)' : 'var(--status-late-text)',
                    width: '18px',
                    height: '18px'
                  }
                };
                
                switch (project.iconType) {
                  case 'landscape':
                    return <Trees {...iconProps} />;
                  case 'interior':
                    return <Sofa {...iconProps} />;
                  case 'exterior':
                    return <Building2 {...iconProps} />;
                  case 'yard':
                    return <TreePine {...iconProps} />;
                  default:
                    return <Building2 {...iconProps} />;
                }
              };
              
              // Get icon component for tooltip based on iconType
              const getTooltipIcon = () => {
                const iconProps = {
                  className: "flex-shrink-0",
                  style: {
                    color: 'var(--text-tertiary)',
                    width: '14px',
                    height: '14px'
                  }
                };
                
                switch (project.iconType) {
                  case 'landscape':
                    return <Trees {...iconProps} />;
                  case 'interior':
                    return <Sofa {...iconProps} />;
                  case 'exterior':
                    return <Building2 {...iconProps} />;
                  case 'yard':
                    return <TreePine {...iconProps} />;
                  default:
                    return <Building2 {...iconProps} />;
                }
              };

              return (
                <div
                  key={`task-${project.id}`}
                  className="flex-shrink-0 border-r flex flex-col items-center justify-between relative cursor-default overflow-hidden"
                  style={{ 
                    width: '80px',
                    height: '180px',
                    backgroundColor: cellBackgroundColor,
                    borderColor: 'var(--border-primary)',
                    padding: '12px 8px',
                    transform: hoveredEmployee === project.employee.name 
                      ? 'translateY(-8px) scale(1.05)' 
                      : 'translateY(0) scale(1)',
                    boxShadow: hoveredEmployee === project.employee.name
                      ? '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)' 
                      : '0 1px 3px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: hoveredEmployee === project.employee.name ? 30 : 'auto'
                  }}
                >
                  {/* Shimmer overlay effect - only when employee is hovered */}
                  {hoveredEmployee === project.employee.name && (
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
                        animation: 'shimmer 1.5s infinite',
                        zIndex: 1
                      }}
                    />
                  )}
                  
                  {/* Animated gradient background - only when employee is hovered */}
                  {hoveredEmployee === project.employee.name && (
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at center, ${project.isActive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'} 0%, transparent 70%)`,
                        animation: 'pulse 2.5s ease-in-out infinite',
                        zIndex: 0
                      }}
                    />
                  )}
                  
                  {/* Top content: Icon and names */}
                  <div className="flex flex-col items-center gap-3 w-full relative z-10">
                    {/* Architecture Icon - Different for each project type */}
                    <div className="relative">
                      {getProjectIcon()}
                    </div>
                    
                    {/* Task and Project names - small text */}
                    <div className="flex flex-col items-center gap-1 w-full text-center">
                      {/* Task name */}
                      <div 
                        className="font-semibold line-clamp-2 w-full px-1"
                        style={{ 
                          color: 'var(--text-primary)',
                          fontSize: '9px',
                          lineHeight: '1.3',
                          opacity: 0.7
                        }}
                        title={project.taskName}
                      >
                        {project.taskName}
                      </div>
                      
                      {/* Project name */}
                      <div 
                        className="line-clamp-2 w-full px-1"
                        style={{ 
                          color: 'var(--text-secondary)',
                          fontSize: '8px',
                          lineHeight: '1.3',
                          opacity: 0.5
                        }}
                        title={project.name}
                      >
                        {project.name}
                      </div>
                    </div>
                  </div>
                  
                  {/* Info icon - always at bottom, aligned */}
                  <div className="relative group/info">
                    <Info 
                      className="cursor-pointer opacity-30 hover:opacity-70 transition-opacity" 
                      style={{ 
                        color: 'var(--text-primary)',
                        width: '14px',
                        height: '14px'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProjectInfo(project);
                      }}
                    />
                    
                    {/* Backdrop overlay for tooltip */}
                    <div 
                      className="fixed inset-0 opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none"
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.08)',
                        backdropFilter: 'blur(1px)',
                        zIndex: 40
                      }}
                    />
                    
                    {/* Enhanced Task-focused Tooltip on info hover - Opens DOWNWARD */}
                    <div 
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 px-6 py-5 rounded-xl opacity-0 group-hover/info:opacity-100 pointer-events-none"
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-primary)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                        minWidth: '320px',
                        maxWidth: '320px',
                        zIndex: 50,
                        transition: 'opacity 120ms ease-in-out'
                      }}
                    >
                      {/* Task Name - Primary */}
                      <div 
                        className="font-bold mb-3"
                        style={{ 
                          color: 'var(--text-primary)',
                          fontSize: '16px',
                          lineHeight: '1.3',
                          letterSpacing: '-0.02em'
                        }}
                      >
                        {project.taskName}
                      </div>
                      
                      {/* Project Name - Secondary with icon */}
                      <div className="flex items-center gap-2 mb-4 pb-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                        {getTooltipIcon()}
                        <div 
                          className="font-medium"
                          style={{ 
                            color: 'var(--text-secondary)',
                            fontSize: '13px',
                            lineHeight: '1.4'
                          }}
                        >
                          {project.name}
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ 
                              backgroundColor: project.isActive ? '#10b981' : '#ef4444'
                            }}
                          />
                          <span 
                            className="px-3 py-1 rounded-md font-semibold"
                            style={{ 
                              backgroundColor: project.isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                              color: project.isActive ? '#059669' : '#dc2626',
                              fontSize: '11px',
                              letterSpacing: '0.02em',
                              textTransform: 'uppercase'
                            }}
                          >
                            {project.isActive ? 'In Progress' : 'Paused'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Time worked today */}
                      <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                        <Clock 
                          className="flex-shrink-0" 
                          style={{ 
                            color: 'var(--accent-primary)',
                            width: '13px',
                            height: '13px'
                          }} 
                        />
                        <div className="flex items-baseline gap-1.5">
                          <span 
                            className="font-bold"
                            style={{ 
                              color: 'var(--text-primary)',
                              fontSize: '15px'
                            }}
                          >
                            {todayHours}h
                          </span>
                          <span 
                            style={{ 
                              color: 'var(--text-tertiary)',
                              fontSize: '11px'
                            }}
                          >
                            worked today
                          </span>
                        </div>
                      </div>
                      
                      {/* Assigned employee info */}
                      <div className="flex items-center gap-2.5 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                        <div 
                          className="rounded-full p-0.5"
                          style={{ 
                            backgroundColor: project.isActive ? '#10b981' : '#ef4444'
                          }}
                        >
                          <Avatar className="w-6 h-6">
                            <AvatarFallback 
                              style={{ 
                                backgroundColor: 'var(--surface-secondary)',
                                color: 'var(--text-primary)',
                                fontSize: '10px',
                                fontWeight: 600
                              }}
                            >
                              {project.employee.initials}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div 
                            style={{ 
                              color: 'var(--text-tertiary)',
                              fontSize: '10px',
                              fontWeight: 500,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              marginBottom: '2px'
                            }}
                          >
                            Assigned to
                          </div>
                          <div 
                            className="font-medium"
                            style={{ 
                              color: 'var(--text-primary)',
                              fontSize: '13px',
                              lineHeight: '1.3'
                            }}
                          >
                            {project.employee.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Statistics Row - Summary for each project */}
          <div className="border-b-2" style={{ borderColor: 'var(--border-primary)' }}>
            {/* Label Row */}
            <div 
              className="flex border-b"
              style={{ 
                borderColor: 'var(--border-primary)',
                backgroundColor: 'var(--surface-secondary)'
              }}
            >
              <div 
                className="sticky left-0 z-10 px-2 py-2 border-r font-bold"
                style={{ 
                  width: '200px',
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              >
                <span className="text-xs">Sarflangan vaqt</span>
              </div>
              
              {/* Statistics for each project */}
              {projects.map((project) => {
                // Calculate total hours for this project
                const totalProjectHours = employeeTimeData.reduce((sum, employee) => {
                  const projectHours = employee.projects[project.id];
                  return sum + (projectHours ? getFilteredHours(projectHours) : 0);
                }, 0);
                
                // Check if this is the selected employee's project
                const isSelectedEmployeeProject = selectedEmployeeProject?.id === project.id;
                const isHovered = hoveredEmployee === project.employee.name;

                return (
                  <div
                    key={`stats-${project.id}`}
                    className="flex-shrink-0 border-r p-2 relative overflow-hidden"
                    style={{ 
                      width: '80px',
                      backgroundColor: isSelectedEmployeeProject ? 'var(--accent-primary-bg)' : 'var(--surface-secondary)',
                      borderColor: 'var(--border-primary)',
                      transform: isHovered 
                        ? 'translateY(-8px) scale(1.05)' 
                        : 'translateY(0) scale(1)',
                      boxShadow: isHovered
                        ? '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)' 
                        : '0 1px 3px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      zIndex: isHovered ? 30 : 'auto'
                    }}
                  >
                    {/* Shimmer overlay effect - only when employee is hovered */}
                    {isHovered && (
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
                          animation: 'shimmer 1.5s infinite',
                          zIndex: 1
                        }}
                      />
                    )}
                    
                    {/* Animated gradient background - only when employee is hovered */}
                    {isHovered && (
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `radial-gradient(circle at center, ${project.isActive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'} 0%, transparent 70%)`,
                          animation: 'pulse 2.5s ease-in-out infinite',
                          zIndex: 0
                        }}
                      />
                    )}
                    
                    <div className="flex flex-col items-center gap-1 relative z-10">
                      {/* Total Hours Only */}
                      <div 
                        className="text-xs font-bold"
                        style={{ 
                          color: isSelectedEmployeeProject ? 'var(--accent-primary)' : 'var(--text-primary)'
                        }}
                      >
                        {totalProjectHours}h
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Project Sections - Main rows show project names */}
          {projects.map((mainProject, projIndex) => {
            // Find all employees working on this project
            const employeesOnProject = employeeTimeData.filter(emp => emp.projects[mainProject.id]);
            
            // Calculate total hours for this project
            const totalProjectHours = employeesOnProject.reduce((sum, emp) => {
              const hours = emp.projects[mainProject.id];
              return sum + (hours ? getFilteredHours(hours) : 0);
            }, 0);

            // Check if selected employee works on this project
            const isEmployeeWorkingHere = selectedEmployee && 
              projects.find(p => p.employee.name === selectedEmployee && p.id === mainProject.id);

            return (
              <div key={mainProject.id}>
                {/* Project Name Row (Main Row) */}
                <div 
                  className="flex border-b transition-all"
                  style={{ 
                    borderColor: 'var(--border-primary)',
                    backgroundColor: isEmployeeWorkingHere ? 'rgba(59, 130, 246, 0.15)' : 'var(--surface-hover)'
                  }}
                >
                  <div 
                    className="sticky left-0 z-10 px-2 py-1 border-r font-semibold flex items-center gap-2"
                    style={{ 
                      width: '200px',
                      backgroundColor: isEmployeeWorkingHere ? 'rgba(59, 130, 246, 0.15)' : 'var(--surface-hover)',
                      borderColor: 'var(--border-primary)',
                      color: isEmployeeWorkingHere ? 'var(--accent-primary)' : 'var(--text-primary)'
                    }}
                  >
                    <span className="text-xs opacity-60">{projIndex + 1}.</span>
                    <span className="text-xs">{mainProject.name}</span>
                    {isEmployeeWorkingHere && (
                      <span className="text-xs ml-auto">👤</span>
                    )}
                  </div>
                  
                  {/* Show total hours in this project's column */}
                  {projects.map((project) => {
                    const isCurrentProject = project.id === mainProject.id;
                    
                    return (
                      <div
                        key={`${mainProject.id}-total-${project.id}`}
                        className="flex-shrink-0 border-r p-1.5 flex items-center justify-center"
                        style={{ 
                          width: '80px',
                          backgroundColor: isCurrentProject && totalProjectHours > 0 
                            ? 'var(--surface-tertiary)' 
                            : (isEmployeeWorkingHere ? 'rgba(59, 130, 246, 0.15)' : 'var(--surface-hover)'),
                          borderColor: 'var(--border-primary)'
                        }}
                      >
                        {isCurrentProject && (
                          <span 
                            className="text-xs font-bold"
                            style={{ 
                              color: totalProjectHours > 0 ? 'var(--text-primary)' : 'var(--text-disabled)'
                            }}
                          >
                            {totalProjectHours > 0 ? `${totalProjectHours}h` : '-'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Project Details Modal */}
      {selectedProjectInfo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setSelectedProjectInfo(null)}
        >
          <div 
            className="rounded-2xl overflow-hidden"
            style={{ 
              backgroundColor: 'var(--surface-primary)',
              border: '1px solid var(--border-primary)',
              maxWidth: '600px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div 
              className="px-8 py-6 border-b flex items-center justify-between"
              style={{ 
                borderColor: 'var(--border-primary)',
                backgroundColor: selectedProjectInfo.color
              }}
            >
              <div>
                <h2 
                  className="font-bold mb-1"
                  style={{ 
                    color: 'var(--text-primary)',
                    fontSize: '24px',
                    lineHeight: '1.2'
                  }}
                >
                  {selectedProjectInfo.name}
                </h2>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Loyiha ma'lumotlari
                </p>
              </div>
              <button
                className="rounded-lg p-2 hover:bg-opacity-50 transition-colors"
                style={{ backgroundColor: 'var(--surface-hover)' }}
                onClick={() => setSelectedProjectInfo(null)}
              >
                <X 
                  style={{ 
                    width: '20px', 
                    height: '20px',
                    color: 'var(--text-primary)'
                  }} 
                />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="px-8 py-6 space-y-6">
              {/* Status Section */}
              <div>
                <div 
                  className="text-xs uppercase tracking-wider mb-3"
                  style={{ 
                    color: 'var(--text-tertiary)',
                    fontWeight: 600
                  }}
                >
                  Holat
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ 
                      backgroundColor: selectedProjectInfo.isActive ? '#10b981' : '#ef4444',
                      animation: selectedProjectInfo.isActive 
                        ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' 
                        : 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }}
                  />
                  <span 
                    className="px-4 py-2 rounded-lg font-semibold"
                    style={{ 
                      backgroundColor: selectedProjectInfo.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: selectedProjectInfo.isActive ? '#059669' : '#dc2626',
                      fontSize: '13px',
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase'
                    }}
                  >
                    {selectedProjectInfo.isActive ? 'Jarayonda' : 'To\'xtatilgan'}
                  </span>
                </div>
              </div>
              
              {/* Current Task */}
              <div>
                <div 
                  className="text-xs uppercase tracking-wider mb-3"
                  style={{ 
                    color: 'var(--text-tertiary)',
                    fontWeight: 600
                  }}
                >
                  Joriy vazifa
                </div>
                <div 
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--surface-secondary)' }}
                >
                  <div 
                    className="font-medium"
                    style={{ 
                      color: 'var(--text-primary)',
                      fontSize: '16px'
                    }}
                  >
                    {selectedProjectInfo.taskName}
                  </div>
                </div>
              </div>
              
              {/* Assigned Employee */}
              <div>
                <div 
                  className="text-xs uppercase tracking-wider mb-3"
                  style={{ 
                    color: 'var(--text-tertiary)',
                    fontWeight: 600
                  }}
                >
                  Tayinlangan xodim
                </div>
                <div className="flex items-center gap-4">
                  <div 
                    className="rounded-full p-1"
                    style={{ 
                      backgroundColor: selectedProjectInfo.isActive ? '#10b981' : '#ef4444'
                    }}
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarFallback 
                        style={{ 
                          backgroundColor: 'var(--surface-secondary)',
                          color: 'var(--text-primary)',
                          fontSize: '14px',
                          fontWeight: 600
                        }}
                      >
                        {selectedProjectInfo.employee.initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <div 
                      className="font-semibold"
                      style={{ 
                        color: 'var(--text-primary)',
                        fontSize: '16px'
                      }}
                    >
                      {selectedProjectInfo.employee.name}
                    </div>
                    <div 
                      className="text-xs"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      Loyiha menejeri
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Project Statistics */}
              <div 
                className="grid grid-cols-2 gap-4 p-5 rounded-lg"
                style={{ backgroundColor: 'var(--surface-secondary)' }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock 
                      style={{ 
                        width: '16px', 
                        height: '16px',
                        color: 'var(--accent-primary)'
                      }} 
                    />
                    <span 
                      className="text-xs uppercase tracking-wider"
                      style={{ 
                        color: 'var(--text-tertiary)',
                        fontWeight: 600
                      }}
                    >
                      Jami vaqt
                    </span>
                  </div>
                  <div 
                    className="font-bold"
                    style={{ 
                      color: 'var(--text-primary)',
                      fontSize: '24px'
                    }}
                  >
                    {(() => {
                      const totalHours = employeeTimeData.reduce((sum, emp) => {
                        const projectHours = emp.projects[selectedProjectInfo.id];
                        if (!projectHours) return sum;
                        return sum + getFilteredHours(projectHours);
                      }, 0);
                      return totalHours;
                    })()}h
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users 
                      style={{ 
                        width: '16px', 
                        height: '16px',
                        color: 'var(--accent-primary)'
                      }} 
                    />
                    <span 
                      className="text-xs uppercase tracking-wider"
                      style={{ 
                        color: 'var(--text-tertiary)',
                        fontWeight: 600
                      }}
                    >
                      Jamoa
                    </span>
                  </div>
                  <div 
                    className="font-bold"
                    style={{ 
                      color: 'var(--text-primary)',
                      fontSize: '24px'
                    }}
                  >
                    {(() => {
                      const teamCount = employeeTimeData.filter(emp => emp.projects[selectedProjectInfo.id]).length;
                      return teamCount;
                    })()}
                  </div>
                </div>
              </div>
              
              {/* Project Type */}
              <div>
                <div 
                  className="text-xs uppercase tracking-wider mb-3"
                  style={{ 
                    color: 'var(--text-tertiary)',
                    fontWeight: 600
                  }}
                >
                  Loyiha turi
                </div>
                <div className="flex items-center gap-3">
                  {selectedProjectInfo.iconType === 'landscape' && <Trees style={{ width: '20px', height: '20px', color: 'var(--text-secondary)' }} />}
                  {selectedProjectInfo.iconType === 'interior' && <Sofa style={{ width: '20px', height: '20px', color: 'var(--text-secondary)' }} />}
                  {selectedProjectInfo.iconType === 'exterior' && <Building2 style={{ width: '20px', height: '20px', color: 'var(--text-secondary)' }} />}
                  {selectedProjectInfo.iconType === 'yard' && <TreePine style={{ width: '20px', height: '20px', color: 'var(--text-secondary)' }} />}
                  <span 
                    className="font-medium capitalize"
                    style={{ 
                      color: 'var(--text-primary)',
                      fontSize: '15px'
                    }}
                  >
                    {selectedProjectInfo.iconType}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div 
              className="px-8 py-5 border-t flex items-center justify-end gap-3"
              style={{ 
                borderColor: 'var(--border-primary)',
                backgroundColor: 'var(--surface-secondary)'
              }}
            >
              <button
                className="px-5 py-2 rounded-lg font-medium transition-colors"
                style={{ 
                  backgroundColor: 'var(--surface-hover)',
                  color: 'var(--text-primary)'
                }}
                onClick={() => setSelectedProjectInfo(null)}
              >
                Yopish
              </button>
              <button
                className="px-5 py-2 rounded-lg font-medium transition-colors"
                style={{ 
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff'
                }}
              >
                Batafsil ko'rish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}