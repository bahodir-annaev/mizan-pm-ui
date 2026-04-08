import { useState, useMemo } from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Building2, Info, Trees, Sofa, TreePine, X } from 'lucide-react';
import { TimeScopeSelector, type TimeScopeState } from './TimeScopeSelector';
import { useTimeMatrix } from '@/hooks/api/useAnalytics';

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


const PROJECT_COLORS = ['#FEF3F2', '#F0FDF4', '#EFF6FF', '#FDF4FF', '#F0FDFA', '#FEF9C3', '#ECFDF5', '#F5F3FF', '#FFF7ED', '#DBEAFE'];

const TYPE_TO_ICON: Record<string, ProjectData['iconType']> = {
  RESIDENTIAL: 'interior',
  COMMERCIAL: 'exterior',
  LANDSCAPE: 'landscape',
  INDUSTRIAL: 'yard',
  OTHER: 'yard',
};

const fmt = (d: Date) => d.toISOString().slice(0, 10);

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

/** Number of calendar days from `a` to `b` (b - a). */
function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86_400_000
  );
}

/**
 * How many days to request from the API so the response covers the full scope,
 * counting back from today.
 */
function timeScopeToDays(scope: TimeScopeState): number {
  const todayStr = fmt(new Date());
  switch (scope.scope) {
    case 'daily': {
      const diff = daysBetween(fmt(scope.date), todayStr);
      return Math.max(1, diff + 1);
    }
    case 'weekly': {
      const ws = scope.weekStart ?? getWeekStart(scope.date);
      const wsStr = fmt(ws);
      if (wsStr > todayStr) return 1;
      return daysBetween(wsStr, todayStr) + 1;
    }
    case 'monthly': {
      const month = scope.month ?? new Date().getMonth();
      const year = scope.year ?? new Date().getFullYear();
      const monthStart = fmt(new Date(year, month, 1));
      if (monthStart > todayStr) return 1;
      return daysBetween(monthStart, todayStr) + 1;
    }
    case 'yearly': {
      const year = scope.year ?? new Date().getFullYear();
      const yearStart = `${year}-01-01`;
      if (yearStart > todayStr) return 1;
      return daysBetween(yearStart, todayStr) + 1;
    }
    case 'all-time':
      return 365;
  }
}

/** ISO date range the current scope covers (capped at today). */
function timeScopeToRange(scope: TimeScopeState): { from: string; to: string } {
  const todayStr = fmt(new Date());
  const cap = (s: string) => (s > todayStr ? todayStr : s);
  switch (scope.scope) {
    case 'daily': {
      const d = fmt(scope.date);
      return { from: d, to: d };
    }
    case 'weekly': {
      const ws = scope.weekStart ?? getWeekStart(scope.date);
      const we = scope.weekEnd ?? getWeekEnd(scope.date);
      return { from: fmt(ws), to: cap(fmt(we)) };
    }
    case 'monthly': {
      const month = scope.month ?? new Date().getMonth();
      const year = scope.year ?? new Date().getFullYear();
      return { from: fmt(new Date(year, month, 1)), to: cap(fmt(new Date(year, month + 1, 0))) };
    }
    case 'yearly': {
      const year = scope.year ?? new Date().getFullYear();
      return { from: `${year}-01-01`, to: cap(`${year}-12-31`) };
    }
    case 'all-time':
      return { from: '', to: todayStr };
  }
}

/** Sum only the hours within [scopeFrom, scopeTo] using dateRange.from as the array origin. */
function getHoursInRange(
  hours: number[],
  dateRangeFrom: string,
  scopeFrom: string,
  scopeTo: string
): number {
  const startIdx = Math.max(0, daysBetween(dateRangeFrom, scopeFrom));
  const endIdx = Math.min(hours.length - 1, daysBetween(dateRangeFrom, scopeTo));
  if (startIdx > endIdx) return 0;
  let sum = 0;
  for (let i = startIdx; i <= endIdx; i++) sum += hours[i] || 0;
  return parseFloat(sum.toFixed(1));
}

export function EmployeeProjectMatrix() {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [hoveredEmployee, setHoveredEmployee] = useState<string | null>(null);
  const [selectedProjectInfo, setSelectedProjectInfo] = useState<ProjectData | null>(null);
  const [timeScope, setTimeScope] = useState<TimeScopeState>({
    scope: 'weekly',
    date: new Date()
  });

  const days = useMemo(() => timeScopeToDays(timeScope), [timeScope]);
  const scopeRange = useMemo(() => timeScopeToRange(timeScope), [timeScope]);
  const { data: matrixData, isLoading } = useTimeMatrix(days);

  const projects = useMemo<ProjectData[]>(() => {
    return (matrixData?.projects ?? []).slice(0, 10).map((p, i) => ({
      id: p.id,
      name: p.name,
      color: PROJECT_COLORS[i % PROJECT_COLORS.length],
      taskName: p.currentTaskName,
      employee: {
        name: p.assignedUserName,
        initials: p.assignedUserInitials,
        avatar: p.assignedUserAvatarUrl ?? undefined,
      },
      isActive: p.status === 'IN_PROGRESS',
      iconType: TYPE_TO_ICON[p.type] ?? 'exterior',
    }));
  }, [matrixData]);

  const employeeTimeData = useMemo<EmployeeTimeData[]>(() => {
    return (matrixData?.employees ?? []).map((e) => ({
      employeeId: e.userId,
      employeeName: e.userName,
      projects: e.projects,
    }));
  }, [matrixData]);

  const handleEmployeeSelect = (employeeName: string) => {
    if (selectedEmployee === employeeName) {
      setSelectedEmployee(null);
    } else {
      setSelectedEmployee(employeeName);
    }
  };

  const dateRangeFrom = matrixData?.dateRange.from ?? '';

  // Sum hours only for the days covered by the active scope.
  const getFilteredHours = (hours: number[]): number => {
    if (!dateRangeFrom || !scopeRange.from) return 0;
    return getHoursInRange(hours, dateRangeFrom, scopeRange.from, scopeRange.to);
  };

  if (isLoading) {
    return (
      <div
        className="rounded-lg flex items-center justify-center p-10"
        style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-primary)' }}
      >
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading matrix…</span>
      </div>
    );
  }

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

          {/* ── Column Headers: one per employee ── */}
          <div className="flex border-b" style={{ borderColor: 'var(--border-primary)' }}>
            {/* Corner: "Project" label */}
            <div
              className="sticky left-0 z-20 px-3 py-2 border-r flex items-end"
              style={{ width: '240px', minWidth: '240px', backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border-primary)' }}
            >
              <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Loyiha</span>
            </div>

            {employeeTimeData.map((emp) => {
              const isSelected = selectedEmployee === emp.employeeName;
              const isHovered = hoveredEmployee === emp.employeeName;
              const initials = emp.employeeName.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div
                  key={emp.employeeId}
                  className="flex-shrink-0 border-r p-2"
                  style={{
                    width: '100px',
                    minWidth: '100px',
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'var(--surface-secondary)',
                    borderColor: 'var(--border-primary)',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={() => setHoveredEmployee(emp.employeeName)}
                  onMouseLeave={() => setHoveredEmployee(null)}
                >
                  <div
                    className="flex flex-col items-center gap-2 p-2 rounded-lg cursor-pointer relative overflow-hidden"
                    style={{
                      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'var(--surface-primary)',
                      border: '1px solid var(--border-primary)',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => handleEmployeeSelect(emp.employeeName)}
                  >
                    {isHovered && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                          animation: 'shimmer 1.5s infinite',
                          zIndex: 1
                        }}
                      />
                    )}
                    <div className="relative z-10">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback
                          style={{
                            backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--surface-hover)',
                            color: isSelected ? '#ffffff' : 'var(--text-primary)',
                            fontSize: '11px',
                            fontWeight: 600
                          }}
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div
                      className="text-center w-full truncate"
                      title={emp.employeeName}
                      style={{
                        fontSize: '10px',
                        color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        fontWeight: isSelected ? 600 : 400
                      }}
                    >
                      {emp.employeeName}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Totals row: sum per employee across all projects ── */}
          <div className="flex border-b" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--surface-secondary)' }}>
            <div
              className="sticky left-0 z-10 px-3 py-2 border-r font-semibold flex items-center"
              style={{ width: '240px', minWidth: '240px', backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
            >
              <span className="text-xs">Sarflangan vaqt</span>
            </div>
            {employeeTimeData.map((emp) => {
              const isSelected = selectedEmployee === emp.employeeName;
              const isHovered = hoveredEmployee === emp.employeeName;
              const total = parseFloat(
                projects.reduce((sum, p) => {
                  const h = emp.projects[p.id];
                  return sum + (h ? getFilteredHours(h) : 0);
                }, 0).toFixed(1)
              );
              return (
                <div
                  key={`total-${emp.employeeId}`}
                  className="flex-shrink-0 border-r flex items-center justify-center py-2"
                  style={{
                    width: '100px',
                    minWidth: '100px',
                    backgroundColor: isSelected ? 'var(--accent-primary-bg)' : 'var(--surface-secondary)',
                    borderColor: 'var(--border-primary)',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={() => setHoveredEmployee(emp.employeeName)}
                  onMouseLeave={() => setHoveredEmployee(null)}
                >
                  <span
                    className="text-xs font-bold"
                    style={{ color: isSelected ? 'var(--accent-primary)' : isHovered ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                  >
                    {total > 0 ? `${total}h` : '—'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ── Project rows (pivot): one row per project, one cell per employee ── */}
          {projects.map((project) => {
            const isSelectedProject = selectedProjectInfo?.id === project.id;

            const getIcon = (size = 14) => {
              const style = { width: size, height: size, color: project.isActive ? 'var(--status-start-text)' : 'var(--text-tertiary)', flexShrink: 0 as const };
              switch (project.iconType) {
                case 'landscape': return <Trees style={style} />;
                case 'interior':  return <Sofa style={style} />;
                case 'yard':      return <TreePine style={style} />;
                default:          return <Building2 style={style} />;
              }
            };

            return (
              <div key={project.id} className="flex border-b" style={{ borderColor: 'var(--border-primary)' }}>

                {/* Row label: project info */}
                <div
                  className="sticky left-0 z-10 border-r flex items-center gap-2 px-3 py-2 cursor-pointer group/row"
                  style={{
                    width: '240px',
                    minWidth: '240px',
                    backgroundColor: isSelectedProject ? 'var(--accent-primary-bg)' : 'var(--surface-primary)',
                    borderColor: 'var(--border-primary)',
                    transition: 'background-color 0.15s ease'
                  }}
                  onClick={() => setSelectedProjectInfo(isSelectedProject ? null : project)}
                >
                  {/* Status dot */}
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: project.isActive ? '#10b981' : '#ef4444' }}
                  />
                  {getIcon(13)}
                  <div className="flex-1 min-w-0">
                    <div
                      className="truncate text-xs font-medium"
                      title={project.name}
                      style={{ color: isSelectedProject ? 'var(--accent-primary)' : 'var(--text-primary)' }}
                    >
                      {project.name}
                    </div>
                    <div
                      className="truncate"
                      title={project.taskName}
                      style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '1px' }}
                    >
                      {project.taskName}
                    </div>
                  </div>
                  <Info
                    className="opacity-0 group-hover/row:opacity-40 flex-shrink-0 transition-opacity"
                    style={{ width: 12, height: 12, color: 'var(--text-tertiary)' }}
                  />
                </div>

                {/* One cell per employee */}
                {employeeTimeData.map((emp) => {
                  const isColSelected = selectedEmployee === emp.employeeName;
                  const isColHovered = hoveredEmployee === emp.employeeName;
                  const hours = emp.projects[project.id];
                  const cellHours = hours ? getFilteredHours(hours) : 0;
                  const hasHours = cellHours > 0;

                  return (
                    <div
                      key={`${project.id}-${emp.employeeId}`}
                      className="flex-shrink-0 border-r flex items-center justify-center py-3"
                      style={{
                        width: '100px',
                        minWidth: '100px',
                        borderColor: 'var(--border-primary)',
                        backgroundColor: hasHours
                          ? (isColSelected ? 'rgba(59, 130, 246, 0.12)' : 'var(--surface-secondary)')
                          : (isColSelected ? 'rgba(59, 130, 246, 0.06)' : 'var(--surface-primary)'),
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={() => setHoveredEmployee(emp.employeeName)}
                      onMouseLeave={() => setHoveredEmployee(null)}
                    >
                      {hasHours ? (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded"
                          style={{
                            color: isColSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                            backgroundColor: isColSelected
                              ? 'rgba(59, 130, 246, 0.15)'
                              : isColHovered
                                ? 'var(--surface-hover)'
                                : 'var(--surface-tertiary)'
                          }}
                        >
                          {cellHours}h
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-disabled)', fontSize: '12px' }}>—</span>
                      )}
                    </div>
                  );
                })}
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