import { apiClient } from '@/lib/api-client';
import { USE_MOCK_DATA } from '@/lib/config';
import type {
  AnalyticsOverview,
  TaskCompletionData,
  TaskDistributionData,
  TeamPerformanceData,
  TimeByProjectData,
  TimeByTypeData,
  WeeklyProductivityData,
  MonthlyReport,
  RecentlyCompletedData,
  TimeMatrixResponse,
} from '@/types/api';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_OVERVIEW: AnalyticsOverview = {
  totalProjects: 12,
  activeProjects: 7,
  completedProjects: 4,
  totalTasks: 62,
  completedTasks: 45,
  teamSize: 8,
  budgetUsed: 11000,
  budgetTotal: 10000,
};

const MOCK_TASK_COMPLETION: TaskCompletionData = [
  { date: 'Jan 1', completed: 4, hours: 12 },
  { date: 'Jan 2', completed: 7, hours: 18 },
  { date: 'Jan 3', completed: 5, hours: 15 },
  { date: 'Jan 4', completed: 9, hours: 22 },
  { date: 'Jan 5', completed: 6, hours: 16 },
  { date: 'Jan 6', completed: 8, hours: 20 },
  { date: 'Jan 7', completed: 11, hours: 26 },
];

const MOCK_TASK_DISTRIBUTION: TaskDistributionData = [
  { name: 'Completed', value: 45 },
  { name: 'In Progress', value: 12 },
  { name: 'Late', value: 3 },
  { name: 'Cancelled', value: 2 },
];

const MOCK_TEAM_PERFORMANCE: TeamPerformanceData = {
  members: [
    { name: 'Sarah Chen', tasksCompleted: 48, hoursLogged: 42.5, performance: 96 },
    { name: 'Mike Johnson', tasksCompleted: 32, hoursLogged: 38.0, performance: 92 },
    { name: 'Emma Davis', tasksCompleted: 40, hoursLogged: 40.0, performance: 94 },
    { name: 'Alex Martinez', tasksCompleted: 55, hoursLogged: 45.0, performance: 98 },
    { name: 'David Kim', tasksCompleted: 52, hoursLogged: 43.0, performance: 97 },
  ],
};

const MOCK_TIME_BY_PROJECT: TimeByProjectData = [
  { name: 'Villa Aurora', hours: 145, tasks: 18 },
  { name: 'Office Tower', hours: 98, tasks: 12 },
  { name: 'Urban Plaza', hours: 67, tasks: 9 },
  { name: 'Residential Complex', hours: 54, tasks: 7 },
  { name: 'Shopping Center', hours: 42, tasks: 5 },
];

const MOCK_TIME_BY_TYPE: TimeByTypeData = [
  { name: 'Architecture', hours: 156, tasks: 15 },
  { name: 'Interior Design', hours: 89, tasks: 10 },
  { name: 'Working Drawings', hours: 78, tasks: 8 },
  { name: '3D Visualization', hours: 65, tasks: 9 },
  { name: 'Engineering', hours: 45, tasks: 6 },
  { name: 'Documentation', hours: 38, tasks: 7 },
];

const MOCK_WEEKLY_PRODUCTIVITY: WeeklyProductivityData = [
  { day: 'Mon', tasks: 12, hours: 48 },
  { day: 'Tue', tasks: 15, hours: 54 },
  { day: 'Wed', tasks: 10, hours: 42 },
  { day: 'Thu', tasks: 18, hours: 62 },
  { day: 'Fri', tasks: 14, hours: 52 },
  { day: 'Sat', tasks: 5, hours: 18 },
  { day: 'Sun', tasks: 2, hours: 8 },
];

const MOCK_RECENTLY_COMPLETED: RecentlyCompletedData = [
  { id: 'TSK-045', name: 'Residential house conceptual design', project: 'Villa Aurora', assignee: 'Sarah Chen', completedDate: '18 Dec 2024', timeSpent: 24 },
  { id: 'TSK-042', name: 'Living room interior layouts', project: 'Villa Aurora', assignee: 'Mike Johnson', completedDate: '17 Dec 2024', timeSpent: 16 },
  { id: 'TSK-039', name: 'Structural engineering review', project: 'Office Tower', assignee: 'David Kim', completedDate: '16 Dec 2024', timeSpent: 8 },
  { id: 'TSK-037', name: '3D render - exterior view', project: 'Urban Plaza', assignee: 'Alex Martinez', completedDate: '15 Dec 2024', timeSpent: 32 },
  { id: 'TSK-035', name: 'Construction document set', project: 'Residential Complex', assignee: 'Sofia Rodriguez', completedDate: '14 Dec 2024', timeSpent: 20 },
];

// ─── Service Functions ────────────────────────────────────────────────────────

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  if (USE_MOCK_DATA) return { ...MOCK_OVERVIEW };
  const { data } = await apiClient.get<AnalyticsOverview>('/analytics/overview');
  return data;
}

export async function getTaskCompletion(days = 30): Promise<TaskCompletionData> {
  if (USE_MOCK_DATA) return [...MOCK_TASK_COMPLETION];
  const { data } = await apiClient.get<TaskCompletionData>(`/analytics/task-completion?days=${days}`);
  return data;
}

export async function getTaskDistribution(): Promise<TaskDistributionData> {
  if (USE_MOCK_DATA) return [...MOCK_TASK_DISTRIBUTION];
  const { data } = await apiClient.get<TaskDistributionData>('/analytics/task-distribution');
  return data;
}

export async function getTeamPerformance(): Promise<TeamPerformanceData> {
  if (USE_MOCK_DATA) return { ...MOCK_TEAM_PERFORMANCE };
  const { data } = await apiClient.get<TeamPerformanceData>('/analytics/team-performance');
  return data;
}

export async function getTimeByProject(): Promise<TimeByProjectData> {
  if (USE_MOCK_DATA) return [...MOCK_TIME_BY_PROJECT];
  const { data } = await apiClient.get<TimeByProjectData>('/analytics/time-by-project');
  return data;
}

export async function getTimeByType(): Promise<TimeByTypeData> {
  if (USE_MOCK_DATA) return [...MOCK_TIME_BY_TYPE];
  const { data } = await apiClient.get<TimeByTypeData>('/analytics/time-by-type');
  return data;
}

export async function getWeeklyProductivity(): Promise<WeeklyProductivityData> {
  if (USE_MOCK_DATA) return [...MOCK_WEEKLY_PRODUCTIVITY];
  const { data } = await apiClient.get<WeeklyProductivityData>('/analytics/weekly-productivity');
  return data;
}

export async function getMonthlyReport(year: number, month: number): Promise<MonthlyReport> {
  if (USE_MOCK_DATA) {
    return { year, month, tasksCompleted: 148, hoursLogged: 420, projectsActive: 7 };
  }
  const { data } = await apiClient.get<MonthlyReport>(`/analytics/monthly-report?year=${year}&month=${month}`);
  return data;
}

export async function getRecentlyCompleted(limit = 10): Promise<RecentlyCompletedData> {
  if (USE_MOCK_DATA) return MOCK_RECENTLY_COMPLETED.slice(0, limit);
  const { data } = await apiClient.get<RecentlyCompletedData>(`/analytics/recently-completed?limit=${limit}`);
  return data;
}

function buildMockTimeMatrix(days: number): TimeMatrixResponse {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const from = new Date(today);
  from.setDate(from.getDate() - (days - 1));
  const fromStr = from.toISOString().slice(0, 10);
  const toStr = today.toISOString().slice(0, 10);

  const todayDow = today.getDay();
  const makeHours = (seed: number): number[] =>
    Array.from({ length: days }, (_, i) => {
      const dow = ((todayDow - (days - 1 - i)) % 7 + 7) % 7;
      if (dow === 0 || dow === 6) return 0;
      const r = (n: number) => { const x = Math.sin(seed * 31 + n * 17) * 10000; return x - Math.floor(x); };
      return r(i) < 0.15 ? 0 : parseFloat((4 + r(i + 100) * 4).toFixed(1));
    });

  return {
    dateRange: { from: fromStr, to: toStr, days },
    projects: [
      { id: 'proj-1', name: 'Villa Aurora', status: 'IN_PROGRESS', type: 'RESIDENTIAL', currentTaskName: 'Foundation drawings', assignedUserId: 'EMP-001', assignedUserName: 'Sarah Chen', assignedUserInitials: 'SC', assignedUserAvatarUrl: null },
      { id: 'proj-2', name: 'City Centre Tower', status: 'IN_PROGRESS', type: 'COMMERCIAL', currentTaskName: 'Structural analysis', assignedUserId: 'EMP-002', assignedUserName: 'Mike Johnson', assignedUserInitials: 'MJ', assignedUserAvatarUrl: null },
      { id: 'proj-3', name: 'Park Landscape', status: 'ON_HOLD', type: 'LANDSCAPE', currentTaskName: 'Site survey review', assignedUserId: 'EMP-003', assignedUserName: 'Lisa Wang', assignedUserInitials: 'LW', assignedUserAvatarUrl: null },
      { id: 'proj-4', name: 'Warehouse District', status: 'IN_PROGRESS', type: 'INDUSTRIAL', currentTaskName: '3D model drafts', assignedUserId: 'EMP-004', assignedUserName: 'Omar Patel', assignedUserInitials: 'OP', assignedUserAvatarUrl: null },
    ],
    employees: [
      { userId: 'EMP-001', userName: 'Sarah Chen', projects: { 'proj-1': makeHours(1), 'proj-3': makeHours(2) } },
      { userId: 'EMP-002', userName: 'Mike Johnson', projects: { 'proj-1': makeHours(3), 'proj-2': makeHours(4) } },
      { userId: 'EMP-003', userName: 'Lisa Wang', projects: { 'proj-3': makeHours(5), 'proj-4': makeHours(6) } },
      { userId: 'EMP-004', userName: 'Omar Patel', projects: { 'proj-2': makeHours(7), 'proj-4': makeHours(8) } },
    ],
  };
}

export async function getTimeMatrix(days = 30): Promise<TimeMatrixResponse> {
  if (USE_MOCK_DATA) return buildMockTimeMatrix(days);
  const { data } = await apiClient.get<TimeMatrixResponse>(`/analytics/time-matrix?days=${days}`);
  return data;
}
