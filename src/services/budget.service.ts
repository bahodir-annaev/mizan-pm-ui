import { apiClient } from '@/lib/api-client';
import type { BudgetOverview } from '@/types/api';

export async function getBudgetOverview(): Promise<BudgetOverview> {
  const { data } = await apiClient.get<BudgetOverview>('/budget');
  return data;
}

export async function updateBudgetLimit(limit: number): Promise<void> {
  await apiClient.patch('/budget/limit', { limit });
}
