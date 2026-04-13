import { apiClient } from '@/lib/api-client';
import type {
  ApiExchangeRate, CreateExchangeRateDto, UpdateExchangeRateDto,
  ApiHourlyRate, CreateHourlyRateDto,
  ApiOverheadCost, CreateOverheadCostDto, UpdateOverheadCostDto, OverheadCategorySummary,
  ApiEquipment, CreateEquipmentDto, UpdateEquipmentDto, AmortizationSummary,
  ApiProjectPlan, CreateProjectPlanDto, ApiProjectMonthlyCost, ApiPlanVsFact,
  FinanceOverviewData, ProjectProfitabilityItem, EmployeeCostBreakdownItem, DepartmentCostItem,
} from '@/types/api';
import type {
  ExchangeRate, HourlyRate, OverheadCost, Equipment,
  ProjectPlan, ProjectMonthlyCost, PlanVsFact,
} from '@/types/domain';

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapExchangeRate(r: ApiExchangeRate): ExchangeRate {
  return { id: r.id, rateDate: r.rateDate, uzsPerUsd: r.uzsPerUsd, source: r.source, createdAt: r.createdAt, updatedAt: r.updatedAt };
}

function mapHourlyRate(r: ApiHourlyRate & { userName?: string; userInitials?: string; userColor?: string }): HourlyRate {
  return {
    id: r.id, userId: r.userId,
    userName: r.userName ?? 'Unknown',
    userInitials: r.userInitials ?? '?',
    userColor: r.userColor ?? '#6366f1',
    effectiveDate: r.effectiveDate,
    salaryUzs: r.salaryUzs, bonusUzs: r.bonusUzs, taxUzs: r.taxUzs, jssmUzs: r.jssmUzs,
    adminShareUzs: r.adminShareUzs, equipmentShareUzs: r.equipmentShareUzs, overheadShareUzs: r.overheadShareUzs,
    totalMonthlyCostUzs: r.totalMonthlyCostUzs, hourlyRateUzs: r.hourlyRateUzs, hourlyRateUsd: r.hourlyRateUsd,
    exchangeRateUsed: r.exchangeRateUsed, productionEmployeeCount: r.productionEmployeeCount,
    workingHoursPerMonth: r.workingHoursPerMonth,
    notes: r.notes,
    isCronGenerated: !r.notes,
    createdAt: r.createdAt,
  };
}

function mapOverheadCost(o: ApiOverheadCost): OverheadCost {
  return { id: o.id, periodYear: o.periodYear, periodMonth: o.periodMonth, category: o.category, amountUzs: o.amountUzs, description: o.description, createdAt: o.createdAt, updatedAt: o.updatedAt };
}

function mapEquipment(e: ApiEquipment): Equipment {
  return { id: e.id, name: e.name, category: e.category, purchaseDate: e.purchaseDate, purchaseCostUzs: e.purchaseCostUzs, usefulLifeMonths: e.usefulLifeMonths, residualValueUzs: e.residualValueUzs, monthlyAmortizationUzs: e.monthlyAmortizationUzs, isActive: e.isActive, serialNumber: e.serialNumber, createdAt: e.createdAt, updatedAt: e.updatedAt };
}

function mapProjectPlan(p: ApiProjectPlan): ProjectPlan {
  return { id: p.id, projectId: p.projectId, version: p.version, isCurrent: p.isCurrent, contractValueUzs: p.contractValueUzs, contractValueUsd: p.contractValueUsd, contractSignedDate: p.contractSignedDate, plannedHoursTotal: p.plannedHoursTotal, avgHourlyRateUzs: p.avgHourlyRateUzs, riskCoefficient: p.riskCoefficient, mizanCostUzs: p.mizanCostUzs, plannedProfitUzs: p.plannedProfitUzs, plannedMarginPct: p.plannedMarginPct, exchangeRateAtSigning: p.exchangeRateAtSigning, notes: p.notes, createdAt: p.createdAt };
}

function mapMonthlyCost(c: ApiProjectMonthlyCost): ProjectMonthlyCost {
  return { id: c.id, projectId: c.projectId, year: c.year, month: c.month, totalHours: c.totalHours, totalCostUzs: c.totalCostUzs, totalCostUsd: c.totalCostUsd, employeeCount: c.employeeCount, isFinalized: c.isFinalized };
}

// ─── Exchange Rates ───────────────────────────────────────────────────────────

export async function getExchangeRates(params?: { year?: number; month?: number }): Promise<ExchangeRate[]> {
  const q = new URLSearchParams();
  if (params?.year) q.set('year', String(params.year));
  if (params?.month) q.set('month', String(params.month));
  const { data } = await apiClient.get<ApiExchangeRate[]>(`/finance/exchange-rates?${q}`);
  return data.map(mapExchangeRate);
}

export async function getLatestExchangeRate(): Promise<ExchangeRate> {
  const { data } = await apiClient.get<ApiExchangeRate>('/finance/exchange-rates/latest');
  return mapExchangeRate(data);
}

export async function createExchangeRate(dto: CreateExchangeRateDto): Promise<ExchangeRate> {
  const { data } = await apiClient.post<ApiExchangeRate>('/finance/exchange-rates', dto);
  return mapExchangeRate(data);
}

export async function updateExchangeRate(id: string, dto: UpdateExchangeRateDto): Promise<ExchangeRate> {
  const { data } = await apiClient.patch<ApiExchangeRate>(`/finance/exchange-rates/${id}`, dto);
  return mapExchangeRate(data);
}

export async function deleteExchangeRate(id: string): Promise<void> {
  await apiClient.delete(`/finance/exchange-rates/${id}`);
}

// ─── Hourly Rates ─────────────────────────────────────────────────────────────

export async function getHourlyRates(): Promise<HourlyRate[]> {
  const { data } = await apiClient.get<ApiHourlyRate[]>('/finance/hourly-rates');
  return data.map(mapHourlyRate);
}

export async function getUserHourlyRates(userId: string): Promise<HourlyRate[]> {
  const { data } = await apiClient.get<ApiHourlyRate[]>(`/finance/hourly-rates/user/${userId}`);
  return data.map(mapHourlyRate);
}

export async function createHourlyRate(dto: CreateHourlyRateDto): Promise<HourlyRate> {
  const { data } = await apiClient.post<ApiHourlyRate>('/finance/hourly-rates', dto);
  return mapHourlyRate(data);
}

export async function deleteHourlyRate(id: string): Promise<void> {
  await apiClient.delete(`/finance/hourly-rates/${id}`);
}

// ─── Overhead Costs ───────────────────────────────────────────────────────────

export async function getOverheadCosts(params?: { year?: number; month?: number; category?: string }): Promise<OverheadCost[]> {
  const q = new URLSearchParams();
  if (params?.year) q.set('year', String(params.year));
  if (params?.month) q.set('month', String(params.month));
  if (params?.category) q.set('category', params.category);
  const { data } = await apiClient.get<ApiOverheadCost[]>(`/finance/overhead-costs?${q}`);
  return data.map(mapOverheadCost);
}

export async function getOverheadSummary(year: number, month: number): Promise<OverheadCategorySummary[]> {
  const { data } = await apiClient.get<OverheadCategorySummary[]>(`/finance/overhead-costs/summary?year=${year}&month=${month}`);
  return data;
}

export async function createOverheadCost(dto: CreateOverheadCostDto): Promise<OverheadCost> {
  const { data } = await apiClient.post<ApiOverheadCost>('/finance/overhead-costs', dto);
  return mapOverheadCost(data);
}

export async function updateOverheadCost(id: string, dto: UpdateOverheadCostDto): Promise<OverheadCost> {
  const { data } = await apiClient.patch<ApiOverheadCost>(`/finance/overhead-costs/${id}`, dto);
  return mapOverheadCost(data);
}

export async function deleteOverheadCost(id: string): Promise<void> {
  await apiClient.delete(`/finance/overhead-costs/${id}`);
}

// ─── Equipment ────────────────────────────────────────────────────────────────

export async function getEquipment(isActive?: boolean): Promise<Equipment[]> {
  const q = isActive !== undefined ? `?isActive=${isActive}` : '';
  const { data } = await apiClient.get<ApiEquipment[]>(`/finance/equipment${q}`);
  return data.map(mapEquipment);
}

export async function getAmortizationSummary(): Promise<AmortizationSummary> {
  const { data } = await apiClient.get<AmortizationSummary>('/finance/equipment/amortization-summary');
  return data;
}

export async function createEquipment(dto: CreateEquipmentDto): Promise<Equipment> {
  const { data } = await apiClient.post<ApiEquipment>('/finance/equipment', dto);
  return mapEquipment(data);
}

export async function updateEquipment(id: string, dto: UpdateEquipmentDto): Promise<Equipment> {
  const { data } = await apiClient.patch<ApiEquipment>(`/finance/equipment/${id}`, dto);
  return mapEquipment(data);
}

export async function decommissionEquipment(id: string): Promise<void> {
  await apiClient.delete(`/finance/equipment/${id}`);
}

// ─── Project Finance ──────────────────────────────────────────────────────────

export async function getProjectPlan(projectId: string): Promise<ProjectPlan> {
  const { data } = await apiClient.get<ApiProjectPlan>(`/finance/projects/${projectId}/plan`);
  return mapProjectPlan(data);
}

export async function getProjectPlanHistory(projectId: string): Promise<ProjectPlan[]> {
  const { data } = await apiClient.get<ApiProjectPlan[]>(`/finance/projects/${projectId}/plan/history`);
  return data.map(mapProjectPlan);
}

export async function calculateProjectPlan(projectId: string, dto: CreateProjectPlanDto): Promise<ProjectPlan> {
  const { data } = await apiClient.post<ApiProjectPlan>(`/finance/projects/${projectId}/plan`, dto);
  return mapProjectPlan(data);
}

export async function getProjectMonthlyCosts(projectId: string): Promise<ProjectMonthlyCost[]> {
  const { data } = await apiClient.get<ApiProjectMonthlyCost[]>(`/finance/projects/${projectId}/monthly-costs`);
  return data.map(mapMonthlyCost);
}

export async function getProjectPlanVsFact(projectId: string): Promise<PlanVsFact> {
  const { data } = await apiClient.get<ApiPlanVsFact>(`/finance/projects/${projectId}/plan-vs-fact`);
  return {
    plan: mapProjectPlan(data.plan),
    factToDateUzs: data.factToDateUzs,
    remainingUzs: data.remainingUzs,
    burnRateUzs: data.burnRateUzs,
    estimatedFinalCostUzs: data.estimatedFinalCostUzs,
  };
}

// ─── Finance Analytics ────────────────────────────────────────────────────────

export async function getFinanceOverview(year: number, month: number): Promise<FinanceOverviewData> {
  const { data } = await apiClient.get<FinanceOverviewData>(`/analytics/finance-overview?year=${year}&month=${month}`);
  return data;
}

export async function getProjectProfitability(status?: string): Promise<ProjectProfitabilityItem[]> {
  const q = status ? `?status=${status}` : '';
  const { data } = await apiClient.get<ProjectProfitabilityItem[]>(`/analytics/project-profitability${q}`);
  return data;
}

export async function getEmployeeCostBreakdown(year: number, month: number): Promise<EmployeeCostBreakdownItem[]> {
  const { data } = await apiClient.get<EmployeeCostBreakdownItem[]>(`/analytics/employee-cost-breakdown?year=${year}&month=${month}`);
  return data;
}

export async function getDepartmentCost(year: number, month: number): Promise<DepartmentCostItem[]> {
  const { data } = await apiClient.get<DepartmentCostItem[]>(`/analytics/department-cost?year=${year}&month=${month}`);
  return data;
}

// ─── Recalculation Triggers ───────────────────────────────────────────────────

export async function recalculateHourlyRates(): Promise<void> {
  await apiClient.post('/finance/recalculate/hourly-rates');
}

export async function recalculateMonthlyCosts(year: number, month: number): Promise<void> {
  await apiClient.post('/finance/recalculate/monthly-costs', { year, month });
}
