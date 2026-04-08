import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import * as analyticsService from '@/services/analytics.service';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: queryKeys.analytics.overview(),
    queryFn: analyticsService.getAnalyticsOverview,
    staleTime: STALE_TIME,
  });
}

export function useTaskCompletion(days = 30) {
  return useQuery({
    queryKey: queryKeys.analytics.taskCompletion(days),
    queryFn: () => analyticsService.getTaskCompletion(days),
    staleTime: STALE_TIME,
  });
}

export function useTaskDistribution() {
  return useQuery({
    queryKey: queryKeys.analytics.taskDistribution(),
    queryFn: analyticsService.getTaskDistribution,
    staleTime: STALE_TIME,
  });
}

export function useTeamPerformance() {
  return useQuery({
    queryKey: queryKeys.analytics.teamPerformance(),
    queryFn: analyticsService.getTeamPerformance,
    staleTime: STALE_TIME,
  });
}

export function useTimeByProject() {
  return useQuery({
    queryKey: queryKeys.analytics.timeByProject(),
    queryFn: analyticsService.getTimeByProject,
    staleTime: STALE_TIME,
  });
}

export function useTimeByType() {
  return useQuery({
    queryKey: queryKeys.analytics.timeByType(),
    queryFn: analyticsService.getTimeByType,
    staleTime: STALE_TIME,
  });
}

export function useWeeklyProductivity() {
  return useQuery({
    queryKey: queryKeys.analytics.weeklyProductivity(),
    queryFn: analyticsService.getWeeklyProductivity,
    staleTime: STALE_TIME,
  });
}

export function useMonthlyReport(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.analytics.monthlyReport(year, month),
    queryFn: () => analyticsService.getMonthlyReport(year, month),
    staleTime: STALE_TIME,
    enabled: !!year && !!month,
  });
}

export function useRecentlyCompleted(limit = 10) {
  return useQuery({
    queryKey: queryKeys.analytics.recentlyCompleted(limit),
    queryFn: () => analyticsService.getRecentlyCompleted(limit),
    staleTime: STALE_TIME,
  });
}

export function useTimeMatrix(days = 30) {
  return useQuery({
    queryKey: queryKeys.analytics.timeMatrix(days),
    queryFn: () => analyticsService.getTimeMatrix(days),
    staleTime: STALE_TIME,
  });
}
