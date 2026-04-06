import { apiClient } from '@/lib/api-client';
import { USE_MOCK_DATA } from '@/lib/config';
import type { BudgetOverview } from '@/types/api';

const MOCK_BUDGET: BudgetOverview = {
  limit: 12000,
  used: 11000,
  remaining: 1000,
  projectBreakdown: [
    { projectId: 'PRJ-001', projectName: 'Bobur residence interior', budget: 3500 },
    { projectId: 'PRJ-002', projectName: 'Elite residential development', budget: 4200 },
    { projectId: 'PRJ-003', projectName: 'Office Renovation', budget: 1800 },
    { projectId: 'PRJ-004', projectName: 'City Plaza Development', budget: 1500 },
  ],
};

export async function getBudgetOverview(): Promise<BudgetOverview> {
  if (USE_MOCK_DATA) return { ...MOCK_BUDGET };
  const { data } = await apiClient.get<BudgetOverview>('/budget');
  return data;
}

export async function updateBudgetLimit(limit: number): Promise<void> {
  if (USE_MOCK_DATA) {
    MOCK_BUDGET.limit = limit;
    MOCK_BUDGET.remaining = limit - MOCK_BUDGET.used;
    return;
  }
  await apiClient.patch('/budget/limit', { limit });
}
