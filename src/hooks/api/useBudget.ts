import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import * as budgetService from '@/services/budget.service';
import type { BudgetOverview } from '@/types/api';

export function useBudgetOverview() {
  return useQuery({
    queryKey: queryKeys.budget.overview(),
    queryFn: budgetService.getBudgetOverview,
    staleTime: 60000, // 1 minute
  });
}

export function useUpdateBudgetLimit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (limit: number) => budgetService.updateBudgetLimit(limit),
    onSuccess: (_, limit) => {
      qc.setQueryData<BudgetOverview>(queryKeys.budget.overview(), (old) => {
        if (!old) return old;
        return { ...old, limit, remaining: limit - old.used };
      });
    },
  });
}
