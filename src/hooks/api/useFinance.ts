import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import * as financeService from '@/services/finance.service';
import type { CreateExchangeRateDto, UpdateExchangeRateDto, CreateHourlyRateDto, CreateOverheadCostDto, UpdateOverheadCostDto, CreateEquipmentDto, UpdateEquipmentDto, CreateProjectPlanDto } from '@/types/api';

// ─── Exchange Rates ───────────────────────────────────────────────────────────

export function useExchangeRates(params?: { year?: number; month?: number }) {
  return useQuery({
    queryKey: queryKeys.finance.exchangeRates(params),
    queryFn: () => financeService.getExchangeRates(params),
  });
}

export function useLatestExchangeRate() {
  return useQuery({
    queryKey: queryKeys.finance.latestRate(),
    queryFn: financeService.getLatestExchangeRate,
    staleTime: 1000 * 60 * 60, // 1h — changes at most daily
  });
}

export function useCreateExchangeRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateExchangeRateDto) => financeService.createExchangeRate(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.finance.all }); },
  });
}

export function useUpdateExchangeRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateExchangeRateDto }) => financeService.updateExchangeRate(id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.finance.all }); },
  });
}

export function useDeleteExchangeRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeService.deleteExchangeRate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.finance.exchangeRates() }); },
  });
}

// ─── Hourly Rates ─────────────────────────────────────────────────────────────

export function useHourlyRates() {
  return useQuery({
    queryKey: queryKeys.finance.hourlyRates(),
    queryFn: financeService.getHourlyRates,
  });
}

export function useUserHourlyRates(userId: string) {
  return useQuery({
    queryKey: queryKeys.finance.userHourlyRates(userId),
    queryFn: () => financeService.getUserHourlyRates(userId),
    enabled: !!userId,
  });
}

export function useCreateHourlyRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateHourlyRateDto) => financeService.createHourlyRate(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.finance.hourlyRates() }); },
  });
}

export function useDeleteHourlyRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeService.deleteHourlyRate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.finance.hourlyRates() }); },
  });
}

// ─── Overhead Costs ───────────────────────────────────────────────────────────

export function useOverheadCosts(params?: { year?: number; month?: number; category?: string }) {
  return useQuery({
    queryKey: queryKeys.finance.overheadCosts(params),
    queryFn: () => financeService.getOverheadCosts(params),
  });
}

export function useOverheadSummary(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.finance.overheadSummary(year, month),
    queryFn: () => financeService.getOverheadSummary(year, month),
  });
}

export function useCreateOverheadCost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateOverheadCostDto) => financeService.createOverheadCost(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.finance.overheadCosts() }); },
  });
}

export function useUpdateOverheadCost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateOverheadCostDto }) => financeService.updateOverheadCost(id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.finance.overheadCosts() }); },
  });
}

export function useDeleteOverheadCost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeService.deleteOverheadCost(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.finance.overheadCosts() }); },
  });
}

// ─── Equipment ────────────────────────────────────────────────────────────────

export function useEquipment(isActive?: boolean) {
  return useQuery({
    queryKey: queryKeys.finance.equipment(isActive),
    queryFn: () => financeService.getEquipment(isActive),
  });
}

export function useAmortizationSummary() {
  return useQuery({
    queryKey: queryKeys.finance.amortizationSummary(),
    queryFn: financeService.getAmortizationSummary,
  });
}

export function useCreateEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateEquipmentDto) => financeService.createEquipment(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.finance.equipment() }); qc.invalidateQueries({ queryKey: queryKeys.finance.amortizationSummary() }); },
  });
}

export function useUpdateEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateEquipmentDto }) => financeService.updateEquipment(id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.finance.equipment() }); qc.invalidateQueries({ queryKey: queryKeys.finance.amortizationSummary() }); },
  });
}

export function useDecommissionEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeService.decommissionEquipment(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.finance.equipment() }); qc.invalidateQueries({ queryKey: queryKeys.finance.amortizationSummary() }); },
  });
}

// ─── Project Finance ──────────────────────────────────────────────────────────

export function useProjectPlan(projectId: string) {
  return useQuery({
    queryKey: queryKeys.finance.projectPlan(projectId),
    queryFn: () => financeService.getProjectPlan(projectId),
    enabled: !!projectId,
    retry: false, // 404 = no plan yet, don't hammer the server
  });
}

export function useProjectPlanHistory(projectId: string) {
  return useQuery({
    queryKey: queryKeys.finance.projectPlanHistory(projectId),
    queryFn: () => financeService.getProjectPlanHistory(projectId),
    enabled: !!projectId,
  });
}

export function useCalculateProjectPlan(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProjectPlanDto) => financeService.calculateProjectPlan(projectId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.finance.projectPlan(projectId) });
      qc.invalidateQueries({ queryKey: queryKeys.finance.projectPlanHistory(projectId) });
      qc.invalidateQueries({ queryKey: queryKeys.finance.projectPlanVsFact(projectId) });
    },
  });
}

export function useProjectMonthlyCosts(projectId: string) {
  return useQuery({
    queryKey: queryKeys.finance.projectMonthlyCosts(projectId),
    queryFn: () => financeService.getProjectMonthlyCosts(projectId),
    enabled: !!projectId,
  });
}

export function useProjectPlanVsFact(projectId: string) {
  return useQuery({
    queryKey: queryKeys.finance.projectPlanVsFact(projectId),
    queryFn: () => financeService.getProjectPlanVsFact(projectId),
    enabled: !!projectId,
    retry: false,
  });
}

// ─── Finance Analytics ────────────────────────────────────────────────────────

export function useFinanceOverview(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.finance.overview(year, month),
    queryFn: () => financeService.getFinanceOverview(year, month),
    staleTime: 1000 * 60 * 5,
  });
}

export function useProjectProfitability(status?: string) {
  return useQuery({
    queryKey: queryKeys.finance.projectProfitability(status),
    queryFn: () => financeService.getProjectProfitability(status),
    staleTime: 1000 * 60 * 5,
  });
}

export function useEmployeeCostBreakdown(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.finance.employeeCost(year, month),
    queryFn: () => financeService.getEmployeeCostBreakdown(year, month),
    staleTime: 1000 * 60 * 5,
  });
}

export function useDepartmentCost(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.finance.departmentCost(year, month),
    queryFn: () => financeService.getDepartmentCost(year, month),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRecalculateHourlyRates() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: financeService.recalculateHourlyRates,
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.finance.all }); },
  });
}
