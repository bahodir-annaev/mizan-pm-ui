import { apiClient } from '@/lib/api-client';
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

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const { data } = await apiClient.get<AnalyticsOverview>('/analytics/overview');
  return data;
}

export async function getTaskCompletion(days = 30): Promise<TaskCompletionData> {
  const { data } = await apiClient.get<TaskCompletionData>(`/analytics/task-completion?days=${days}`);
  return data;
}

export async function getTaskDistribution(): Promise<TaskDistributionData> {
  const { data } = await apiClient.get<TaskDistributionData>('/analytics/task-distribution');
  return data;
}

export async function getTeamPerformance(): Promise<TeamPerformanceData> {
  const { data } = await apiClient.get<TeamPerformanceData>('/analytics/team-performance');
  return data;
}

export async function getTimeByProject(): Promise<TimeByProjectData> {
  const { data } = await apiClient.get<TimeByProjectData>('/analytics/time-by-project');
  return data;
}

export async function getTimeByType(): Promise<TimeByTypeData> {
  const { data } = await apiClient.get<TimeByTypeData>('/analytics/time-by-type');
  return data;
}

export async function getWeeklyProductivity(): Promise<WeeklyProductivityData> {
  const { data } = await apiClient.get<WeeklyProductivityData>('/analytics/weekly-productivity');
  return data;
}

export async function getMonthlyReport(year: number, month: number): Promise<MonthlyReport> {
  const { data } = await apiClient.get<MonthlyReport>(`/analytics/monthly-report?year=${year}&month=${month}`);
  return data;
}

export async function getRecentlyCompleted(limit = 10): Promise<RecentlyCompletedData> {
  const { data } = await apiClient.get<RecentlyCompletedData>(`/analytics/recently-completed?limit=${limit}`);
  return data;
}

export async function getTimeMatrix(days = 30): Promise<TimeMatrixResponse> {
  const { data } = await apiClient.get<TimeMatrixResponse>(`/analytics/time-matrix?days=${days}`);
  return data;
}
