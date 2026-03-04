import { useState } from 'react';
import { 
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  TrendingUp,
  TrendingDown,
  Users,
  FolderOpen,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Filter,
  X,
  ChevronDown,
  ArrowUpDown,
  User,
  Zap,
  Target,
  Award
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { useTranslation } from '../contexts/TranslationContext';

// Mock data for analytics
const completionTrendData = [
  { date: 'Jan 1', completed: 4, hours: 12 },
  { date: 'Jan 2', completed: 7, hours: 18 },
  { date: 'Jan 3', completed: 5, hours: 15 },
  { date: 'Jan 4', completed: 9, hours: 22 },
  { date: 'Jan 5', completed: 6, hours: 16 },
  { date: 'Jan 6', completed: 8, hours: 20 },
  { date: 'Jan 7', completed: 11, hours: 26 },
];

const statusDistributionData = [
  { name: 'Completed', value: 45, color: 'var(--status-end)' },
  { name: 'In Progress', value: 12, color: 'var(--status-progress)' },
  { name: 'Late', value: 3, color: 'var(--status-late)' },
  { name: 'Cancelled', value: 2, color: 'var(--text-tertiary)' },
];

const timeByProjectData = [
  { name: 'Villa Aurora', hours: 145, tasks: 18 },
  { name: 'Office Tower', hours: 98, tasks: 12 },
  { name: 'Urban Plaza', hours: 67, tasks: 9 },
  { name: 'Residential Complex', hours: 54, tasks: 7 },
  { name: 'Shopping Center', hours: 42, tasks: 5 },
];

const timeByTypeData = [
  { name: 'Architecture', hours: 156, tasks: 15 },
  { name: 'Interior Design', hours: 89, tasks: 10 },
  { name: 'Working Drawings', hours: 78, tasks: 8 },
  { name: '3D Visualization', hours: 65, tasks: 9 },
  { name: 'Engineering', hours: 45, tasks: 6 },
  { name: 'Documentation', hours: 38, tasks: 7 },
];

const completedTasksData = [
  {
    id: 'TSK-045',
    name: 'Residential house conceptual design',
    project: 'Villa Aurora',
    assignee: 'John Doe',
    completedDate: '18 Dec 2024',
    timeSpent: 24,
  },
  {
    id: 'TSK-042',
    name: 'Living room interior layouts',
    project: 'Villa Aurora',
    assignee: 'Sarah Miller',
    completedDate: '17 Dec 2024',
    timeSpent: 16,
  },
  {
    id: 'TSK-038',
    name: 'Facade material selection',
    project: 'Office Tower',
    assignee: 'Alex Kim',
    completedDate: '16 Dec 2024',
    timeSpent: 12,
  },
  {
    id: 'TSK-035',
    name: 'Construction drawings package',
    project: 'Office Tower',
    assignee: 'Mike Chen',
    completedDate: '15 Dec 2024',
    timeSpent: 32,
  },
  {
    id: 'TSK-031',
    name: 'Exterior rendering presentation',
    project: 'Urban Plaza',
    assignee: 'John Doe',
    completedDate: '14 Dec 2024',
    timeSpent: 18,
  },
];

// Team performance data
const teamPerformanceData = [
  {
    name: 'John Doe',
    initials: 'JD',
    completed: 18,
    active: 3,
    hours: 142,
    efficiency: 95,
    color: 'bg-blue-500'
  },
  {
    name: 'Sarah Miller',
    initials: 'SM',
    completed: 15,
    active: 4,
    hours: 128,
    efficiency: 92,
    color: 'bg-green-500'
  },
  {
    name: 'Alex Kim',
    initials: 'AK',
    completed: 12,
    active: 2,
    hours: 98,
    efficiency: 88,
    color: 'bg-purple-500'
  },
  {
    name: 'Mike Chen',
    initials: 'MC',
    completed: 10,
    active: 3,
    hours: 86,
    efficiency: 85,
    color: 'bg-orange-500'
  },
];

// Weekly productivity data
const weeklyProductivityData = [
  { day: 'Mon', tasks: 8, hours: 18 },
  { day: 'Tue', tasks: 12, hours: 24 },
  { day: 'Wed', tasks: 9, hours: 20 },
  { day: 'Thu', tasks: 15, hours: 28 },
  { day: 'Fri', tasks: 11, hours: 22 },
  { day: 'Sat', tasks: 4, hours: 8 },
  { day: 'Sun', tasks: 2, hours: 4 },
];

// Priority distribution
const priorityDistributionData = [
  { name: 'High', value: 24, color: '#ef4444' },
  { name: 'Medium', value: 32, color: '#f59e0b' },
  { name: 'Low', value: 14, color: '#10b981' },
];

// Monthly time report data (last 30 days)
const monthlyTimeReportData = [
  { 
    project: 'Villa Aurora', 
    hours: 245, 
    percentage: 28,
    tasks: 32,
    team: 6,
    status: 'In Progress',
    color: 'var(--status-progress)'
  },
  { 
    project: 'Office Tower', 
    hours: 198, 
    percentage: 23,
    tasks: 28,
    team: 5,
    status: 'In Progress',
    color: 'var(--status-progress)'
  },
  { 
    project: 'Urban Plaza', 
    hours: 167, 
    percentage: 19,
    tasks: 24,
    team: 4,
    status: 'Late',
    color: 'var(--status-late)'
  },
  { 
    project: 'Residential Complex', 
    hours: 134, 
    percentage: 15,
    tasks: 18,
    team: 4,
    status: 'In Progress',
    color: 'var(--status-progress)'
  },
  { 
    project: 'Shopping Center', 
    hours: 89, 
    percentage: 10,
    tasks: 12,
    team: 3,
    status: 'Start',
    color: 'var(--status-start)'
  },
  { 
    project: 'Heritage Builders', 
    hours: 45, 
    percentage: 5,
    tasks: 8,
    team: 2,
    status: 'Completed',
    color: 'var(--status-end)'
  },
];

const totalMonthlyHours = monthlyTimeReportData.reduce((sum, p) => sum + p.hours, 0);
const totalMonthlyTasks = monthlyTimeReportData.reduce((sum, p) => sum + p.tasks, 0);

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
}

function StatCard({ icon: Icon, label, value, trend, trendUp }: StatCardProps) {
  return (
    <div 
      className="rounded-lg p-5 transition-colors hover:border-opacity-60"
      style={{
        backgroundColor: 'var(--surface-primary)',
        border: '1px solid var(--border-primary)'
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div 
          className="p-2 rounded-lg"
          style={{
            backgroundColor: 'var(--surface-secondary)'
          }}
        >
          <Icon className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
        </div>
        {trend && (
          <div className="flex items-center gap-1">
            <TrendingUp 
              className="w-3 h-3" 
              style={{ 
                color: trendUp ? 'var(--status-start)' : 'var(--status-late)',
                transform: trendUp ? 'none' : 'rotate(180deg)'
              }} 
            />
            <span 
              className="text-xs"
              style={{ 
                color: trendUp ? 'var(--status-start)' : 'var(--status-late)'
              }}
            >
              {trend}
            </span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div 
          className="text-2xl font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {value}
        </div>
        <div 
          className="text-xs uppercase tracking-wider"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('week');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [timeChartView, setTimeChartView] = useState('project');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { t } = useTranslation();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleExport = () => {
    alert('Exporting analytics data...');
  };

  const handleExportMonthlyReport = () => {
    // Create CSV content
    const headers = ['Project', 'Hours', 'Percentage', 'Tasks', 'Team Members', 'Status'];
    const csvContent = [
      headers.join(','),
      ...monthlyTimeReportData.map(project => 
        [
          `"${project.project}"`,
          project.hours,
          `${project.percentage}%`,
          project.tasks,
          project.team,
          `"${project.status}"`
        ].join(',')
      ),
      '', // Empty line
      'Summary',
      `Total Hours,${totalMonthlyHours}`,
      `Total Tasks,${totalMonthlyTasks}`,
      `Average Hours/Project,${Math.round(totalMonthlyHours / monthlyTimeReportData.length)}`,
      `Average Tasks/Project,${Math.round(totalMonthlyTasks / monthlyTimeReportData.length)}`,
      `Hours/Day,${Math.round(totalMonthlyHours / 30)}`,
      `Active Projects,${monthlyTimeReportData.length}`
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Generate filename with current date
    const today = new Date();
    const fileName = `Monthly_Time_Report_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="px-3 py-2 rounded-lg border"
          style={{
            backgroundColor: 'var(--surface-primary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      className="h-full flex flex-col"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 p-6 pb-4 border-b" style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-primary)'
      }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl mb-1" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              Analytics
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Insights and performance metrics
            </p>
          </div>

          {/* Action Buttons & Filters */}
          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg transition-all"
              style={{
                backgroundColor: 'var(--surface-primary)',
                borderColor: 'var(--border-primary)',
                border: '1px solid'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-primary)';
              }}
              title="Refresh data"
            >
              <RefreshCw 
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                style={{ color: 'var(--text-secondary)' }}
              />
            </button>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="px-3 py-2 rounded-lg transition-all flex items-center gap-2"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Export</span>
            </button>

            {/* Divider */}
            <div 
              className="w-px h-8"
              style={{ backgroundColor: 'var(--border-primary)' }}
            />
            
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger 
                className="w-[140px]"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-secondary)'
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{
                backgroundColor: 'var(--surface-primary)',
                borderColor: 'var(--border-primary)'
              }}>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger 
                className="w-[160px]"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-secondary)'
                }}
              >
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent style={{
                backgroundColor: 'var(--surface-primary)',
                borderColor: 'var(--border-primary)'
              }}>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="villa">Villa Aurora</SelectItem>
                <SelectItem value="office">Office Tower</SelectItem>
                <SelectItem value="plaza">Urban Plaza</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger 
                className="w-[160px]"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-secondary)'
                }}
              >
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent style={{
                backgroundColor: 'var(--surface-primary)',
                borderColor: 'var(--border-primary)'
              }}>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="john">John Doe</SelectItem>
                <SelectItem value="sarah">Sarah Miller</SelectItem>
                <SelectItem value="alex">Alex Kim</SelectItem>
                <SelectItem value="mike">Mike Chen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-5 gap-4">
          <StatCard 
            icon={CheckCircle2} 
            label="Completed Tasks" 
            value="45" 
            trend="+12%" 
            trendUp 
          />
          <StatCard 
            icon={Play} 
            label="Active Tasks" 
            value="12" 
          />
          <StatCard 
            icon={AlertCircle} 
            label="Overdue Tasks" 
            value="3" 
            trend="-2" 
            trendUp 
          />
          <StatCard 
            icon={Clock} 
            label="Total Hours" 
            value="406" 
            trend="+8%" 
            trendUp 
          />
          <StatCard 
            icon={BarChart3} 
            label="Avg. Time/Task" 
            value="9.0h" 
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Task Completion Timeline */}
          <div 
            className="col-span-2 rounded-lg p-5"
            style={{
              backgroundColor: 'var(--surface-primary)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <div className="mb-4">
              <h3 className="text-sm mb-1" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                Task Completion Timeline
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Daily productivity trend
              </p>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={completionTrendData}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="var(--border-secondary)" 
                  strokeOpacity={0.3}
                />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--text-tertiary)" 
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
                />
                <YAxis 
                  stroke="var(--text-tertiary)" 
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="var(--accent-primary)" 
                  strokeWidth={2}
                  fill="url(#colorCompleted)" 
                  name="Tasks Completed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Task Status Distribution */}
          <div 
            className="rounded-lg p-5"
            style={{
              backgroundColor: 'var(--surface-primary)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <div className="mb-4">
              <h3 className="text-sm mb-1" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                Task Distribution
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                By status
              </p>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <RechartsPie>
                <Pie
                  data={statusDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {statusDistributionData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                  </div>
                  <span style={{ color: 'var(--text-tertiary)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Performance & Weekly Productivity Row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Team Performance */}
          <div 
            className="col-span-2 rounded-lg p-5"
            style={{
              backgroundColor: 'var(--surface-primary)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <div className="mb-4">
              <h3 className="text-sm mb-1" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                Team Performance
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Individual member contributions
              </p>
            </div>
            <div className="space-y-4">
              {teamPerformanceData.map((member) => (
                <div key={member.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm ${member.color}`}
                      >
                        {member.initials}
                      </div>
                      <div>
                        <div className="text-sm" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                          {member.name}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {member.completed} completed, {member.active} active
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                          {member.hours}h
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          Total time
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm" style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>
                          {member.efficiency}%
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          Efficiency
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${member.efficiency}%`,
                        backgroundColor: 'var(--accent-primary)'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Distribution */}
          <div 
            className="rounded-lg p-5"
            style={{
              backgroundColor: 'var(--surface-primary)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <div className="mb-4">
              <h3 className="text-sm mb-1" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                Priority Distribution
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Tasks by priority
              </p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPie>
                <Pie
                  data={priorityDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {priorityDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {priorityDistributionData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                  </div>
                  <span style={{ color: 'var(--text-tertiary)' }}>{item.value} tasks</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Productivity */}
        <div 
          className="rounded-lg p-5"
          style={{
            backgroundColor: 'var(--surface-primary)',
            border: '1px solid var(--border-primary)'
          }}
        >
          <div className="mb-4">
            <h3 className="text-sm mb-1" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              Weekly Productivity
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Tasks completed and hours tracked per day
            </p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={weeklyProductivityData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="var(--border-secondary)" 
                strokeOpacity={0.3}
              />
              <XAxis 
                dataKey="day" 
                stroke="var(--text-tertiary)" 
                tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
              />
              <YAxis 
                stroke="var(--text-tertiary)" 
                tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '20px',
                  fontSize: '11px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="tasks" 
                stroke="var(--accent-primary)" 
                strokeWidth={2}
                name="Tasks"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="hours" 
                stroke="var(--status-start)" 
                strokeWidth={2}
                name="Hours"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Time Tracking Analytics */}
        <div 
          className="rounded-lg p-5"
          style={{
            backgroundColor: 'var(--surface-primary)',
            border: '1px solid var(--border-primary)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm mb-1" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                Time Tracking
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Hours spent by {timeChartView === 'project' ? 'project' : 'task type'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeChartView('project')}
                className="px-3 py-1.5 text-xs rounded transition-all"
                style={{
                  backgroundColor: timeChartView === 'project' ? 'var(--accent-primary-bg)' : 'transparent',
                  color: timeChartView === 'project' ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                  border: '1px solid ' + (timeChartView === 'project' ? 'var(--accent-primary)' : 'var(--border-secondary)')
                }}
              >
                By Project
              </button>
              <button
                onClick={() => setTimeChartView('type')}
                className="px-3 py-1.5 text-xs rounded transition-all"
                style={{
                  backgroundColor: timeChartView === 'type' ? 'var(--accent-primary-bg)' : 'transparent',
                  color: timeChartView === 'type' ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                  border: '1px solid ' + (timeChartView === 'type' ? 'var(--accent-primary)' : 'var(--border-secondary)')
                }}
              >
                By Type
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={timeChartView === 'project' ? timeByProjectData : timeByTypeData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="var(--border-secondary)" 
                strokeOpacity={0.3}
              />
              <XAxis 
                dataKey="name" 
                stroke="var(--text-tertiary)" 
                tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
              />
              <YAxis 
                stroke="var(--text-tertiary)" 
                tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
                label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: 'var(--text-tertiary)', fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="hours" 
                fill="var(--accent-primary)" 
                radius={[4, 4, 0, 0]}
                name="Hours"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Time Report - Last 30 Days */}
        <div 
          className="rounded-lg overflow-hidden"
          style={{
            backgroundColor: 'var(--surface-primary)',
            border: '1px solid var(--border-primary)'
          }}
        >
          <div className="p-5 border-b" style={{ borderColor: 'var(--border-primary)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm mb-1" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  Monthly Time Report
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Time breakdown by project - Last 30 days
                </p>
              </div>
              <div className="flex items-center gap-4">
                {/* Export to Excel Button */}
                <button
                  onClick={handleExportMonthlyReport}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
                  style={{
                    backgroundColor: 'var(--status-end-bg)',
                    color: 'var(--status-end-text)',
                    border: '1px solid var(--status-end)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--status-end)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--status-end-bg)';
                    e.currentTarget.style.color = 'var(--status-end-text)';
                  }}
                  title="Export to Excel"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Export to Excel</span>
                </button>
                
                <div className="text-right">
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Total Hours</div>
                  <div className="text-xl font-semibold" style={{ color: 'var(--accent-primary)' }}>
                    {totalMonthlyHours}h
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Total Tasks</div>
                  <div className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {totalMonthlyTasks}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-5">
            <div className="space-y-4">
              {monthlyTimeReportData.map((project, index) => (
                <div 
                  key={project.project}
                  className="p-4 rounded-lg border transition-all"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--border-secondary)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: 'var(--surface-primary)' }}
                      >
                        <FolderOpen className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {project.project}
                          </h4>
                          <span 
                            className="px-2 py-0.5 rounded text-xs"
                            style={{
                              backgroundColor: `${project.color}33`,
                              color: project.color
                            }}
                          >
                            {project.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {project.tasks} tasks
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {project.team} members
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-2xl font-semibold mb-1" style={{ color: 'var(--accent-primary)' }}>
                          {project.hours}h
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {project.percentage}% of total
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative">
                    <div 
                      className="w-full h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--surface-tertiary)' }}
                    >
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${project.percentage}%`,
                          backgroundColor: project.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div 
              className="mt-6 p-4 rounded-lg border"
              style={{
                backgroundColor: 'var(--accent-primary-bg)',
                borderColor: 'var(--accent-primary)'
              }}
            >
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
                    Avg Hours/Project
                  </div>
                  <div className="text-lg font-semibold" style={{ color: 'var(--accent-primary)' }}>
                    {Math.round(totalMonthlyHours / monthlyTimeReportData.length)}h
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
                    Avg Tasks/Project
                  </div>
                  <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {Math.round(totalMonthlyTasks / monthlyTimeReportData.length)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
                    Hours/Day
                  </div>
                  <div className="text-lg font-semibold" style={{ color: 'var(--accent-primary)' }}>
                    {Math.round(totalMonthlyHours / 30)}h
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
                    Active Projects
                  </div>
                  <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {monthlyTimeReportData.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Completed Tasks Table */}
        <div 
          className="rounded-lg overflow-hidden"
          style={{
            backgroundColor: 'var(--surface-primary)',
            border: '1px solid var(--border-primary)'
          }}
        >
          <div className="p-5 border-b" style={{ borderColor: 'var(--border-primary)' }}>
            <h3 className="text-sm mb-1" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              Recently Completed Tasks
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Last 5 completed tasks
            </p>
          </div>
          <table className="w-full">
            <thead 
              className="border-b"
              style={{ 
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <tr>
                <th 
                  className="px-5 py-3 text-left text-xs uppercase tracking-wider"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Task ID
                </th>
                <th 
                  className="px-5 py-3 text-left text-xs uppercase tracking-wider"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Task Name
                </th>
                <th 
                  className="px-5 py-3 text-left text-xs uppercase tracking-wider"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Project
                </th>
                <th 
                  className="px-5 py-3 text-left text-xs uppercase tracking-wider"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Assignee
                </th>
                <th 
                  className="px-5 py-3 text-left text-xs uppercase tracking-wider"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Completed
                </th>
                <th 
                  className="px-5 py-3 text-left text-xs uppercase tracking-wider"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Time Spent
                </th>
              </tr>
            </thead>
            <tbody>
              {completedTasksData.map((task) => (
                <tr
                  key={task.id}
                  className="border-b cursor-pointer transition-colors"
                  style={{ borderColor: 'var(--border-secondary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td className="px-5 py-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {task.id}
                  </td>
                  <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-primary)' }}>
                    {task.name}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)', opacity: 0.5 }} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {task.project}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {task.assignee}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)', opacity: 0.5 }} />
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {task.completedDate}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} />
                      <span className="text-sm" style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>
                        {task.timeSpent}h
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}