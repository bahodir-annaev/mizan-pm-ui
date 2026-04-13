import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Activity, RefreshCw, ChevronDown } from 'lucide-react';
import { useFinanceOverview, useProjectProfitability, useEmployeeCostBreakdown, useDepartmentCost } from '@/hooks/api/useFinance';
import type { ProjectProfitabilityItem, EmployeeCostBreakdownItem, DepartmentCostItem } from '@/types/api';

// ─── Formatting helpers ───────────────────────────────────────────────────────

function fmtUzs(n: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n) + ' UZS';
}
function fmtM(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return String(n);
}

// ─── Mock data (used when backend not available) ──────────────────────────────

const MOCK_OVERVIEW = {
  periodYear: 2026, periodMonth: 4,
  totalPayrollCostUzs: 87_500_000,
  totalOverheadUzs: 12_850_000,
  totalEquipmentAmortizationUzs: 4_250_000,
  totalCostUzs: 104_600_000,
  totalContractValueUzs: 420_000_000,
  grossProfitUzs: 315_400_000,
  grossMarginPct: 75.1,
};

const MOCK_PROFITABILITY: ProjectProfitabilityItem[] = [
  { projectId: '1', projectName: 'Residence Aziz',    planUzs: 55_000_000,  factToDateUzs: 23_500_000, varianceUzs: 31_500_000,  variancePct: 57.3, monthsElapsed: 4, estimatedFinalCostUzs: 47_000_000  },
  { projectId: '2', projectName: 'Office Complex B',   planUzs: 92_000_000,  factToDateUzs: 61_200_000, varianceUzs: 30_800_000,  variancePct: 33.5, monthsElapsed: 7, estimatedFinalCostUzs: 105_000_000 },
  { projectId: '3', projectName: 'Tashkent Mall',      planUzs: 210_000_000, factToDateUzs: 87_400_000, varianceUzs: 122_600_000, variancePct: 58.4, monthsElapsed: 5, estimatedFinalCostUzs: 175_000_000 },
  { projectId: '4', projectName: 'Samarkand Villa',    planUzs: 38_500_000,  factToDateUzs: 41_200_000, varianceUzs: -2_700_000,  variancePct: -7.0, monthsElapsed: 6, estimatedFinalCostUzs: 43_000_000  },
  { projectId: '5', projectName: 'Industrial Depot',   planUzs: 72_000_000,  factToDateUzs: 29_800_000, varianceUzs: 42_200_000,  variancePct: 58.6, monthsElapsed: 3, estimatedFinalCostUzs: 60_000_000  },
];

const MOCK_EMPLOYEE_COST: EmployeeCostBreakdownItem[] = [
  { userId: 'u1', name: 'Aziz Karimov',    hours: 168, costUzs: 9_840_000,  costUsd: 765.9  },
  { userId: 'u2', name: 'Zulfiya Rahimova',hours: 152, costUzs: 7_980_000,  costUsd: 621.2  },
  { userId: 'u3', name: 'Bobur Toshmatov', hours: 176, costUzs: 6_540_000,  costUsd: 509.3  },
  { userId: 'u4', name: 'Nilufar Yusupova',hours: 160, costUzs: 8_320_000,  costUsd: 647.7  },
  { userId: 'u5', name: 'Sardor Mirzayev', hours: 144, costUzs: 5_890_000,  costUsd: 458.8  },
  { userId: 'u6', name: 'Kamola Hasanova', hours: 176, costUzs: 10_560_000, costUsd: 822.0  },
];

const MOCK_DEPT_COST: DepartmentCostItem[] = [
  { department: 'Architecture',  costUzs: 32_400_000, employeeCount: 4 },
  { department: 'Interior',      costUzs: 18_700_000, employeeCount: 3 },
  { department: 'Engineering',   costUzs: 22_100_000, employeeCount: 3 },
  { department: 'Visualization', costUzs: 14_300_000, employeeCount: 2 },
];

const DEPT_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#3b82f6', '#ec4899'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg p-3 shadow-lg text-xs" style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-primary)' }}>
      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.fill || p.stroke }}>{p.name}: {fmtUzs(p.value)}</p>
      ))}
    </div>
  );
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function FinanceDashboardPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: overview = MOCK_OVERVIEW, isLoading: overviewLoading } = useFinanceOverview(year, month);
  const { data: profitability = MOCK_PROFITABILITY } = useProjectProfitability();
  const { data: employeeCost = MOCK_EMPLOYEE_COST } = useEmployeeCostBreakdown(year, month);
  const { data: deptCost = MOCK_DEPT_COST } = useDepartmentCost(year, month);

  const kpis = [
    { label: 'Total Payroll Cost',      value: fmtM(overview.totalPayrollCostUzs) + ' UZS', sub: 'Salary + tax + JSSM',     icon: DollarSign,   color: '#6366f1' },
    { label: 'Total Overhead',           value: fmtM(overview.totalOverheadUzs) + ' UZS',    sub: 'Rent, utilities, etc.',   icon: Activity,     color: '#f59e0b' },
    { label: 'Equipment Amortization',   value: fmtM(overview.totalEquipmentAmortizationUzs) + ' UZS', sub: 'Monthly depreciation', icon: TrendingDown, color: '#3b82f6' },
    { label: 'Gross Margin',             value: overview.grossMarginPct?.toFixed(1) ?? "" + '%',     sub: fmtM(overview.grossProfitUzs) + ' UZS profit', icon: TrendingUp, color: '#22c55e' },
  ];

  return (
    <div className="flex flex-col h-full overflow-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="px-6 py-5 border-b flex items-center justify-between gap-4 flex-wrap" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--surface-primary)' }}>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Finance Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>MIZAN cost overview for the organisation</p>
        </div>
        {/* Period selector */}
        <div className="flex items-center gap-2">
          <select value={month} onChange={e => setMonth(Number(e.target.value))}
            className="text-sm rounded-lg px-3 py-1.5"
            style={{ backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="text-sm rounded-lg px-3 py-1.5"
            style={{ backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          {kpis.map(k => (
            <div key={k.label} className="rounded-xl p-5" style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-primary)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{k.label}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: k.color + '18' }}>
                  <k.icon className="w-4 h-4" style={{ color: k.color }} />
                </div>
              </div>
              <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{overviewLoading ? '…' : k.value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Department Cost + Employee Cost row */}
        <div className="grid grid-cols-5 gap-4">
          {/* Department bar chart */}
          <div className="col-span-2 rounded-xl p-5" style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-primary)' }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Cost by Department</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={deptCost} layout="vertical" margin={{ left: 0, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-secondary)" />
                <XAxis type="number" tickFormatter={v => fmtM(v)} tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="department" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} width={90} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="costUzs" name="Cost" radius={[0, 4, 4, 0]}>
                  {deptCost.map((_, i) => <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Employee cost table */}
          <div className="col-span-3 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-primary)' }}>
            <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--surface-secondary)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Employee Cost Breakdown</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-secondary)', borderBottom: '1px solid var(--border-primary)' }}>
                  {['Employee', 'Hours', 'Cost (UZS)', 'Cost (USD)'].map(h => (
                    <th key={h} className="text-left px-5 py-2.5 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employeeCost.map((e, i) => (
                  <tr key={e.userId} style={{ borderBottom: '1px solid var(--border-primary)', backgroundColor: 'var(--surface-primary)' }}
                    onMouseEnter={ev => (ev.currentTarget.style.backgroundColor = 'var(--surface-secondary)')}
                    onMouseLeave={ev => (ev.currentTarget.style.backgroundColor = 'var(--surface-primary)')}>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{e.name}</td>
                    <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{e.hours}h</td>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{fmtUzs(e.costUzs)}</td>
                    <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>${e.costUsd?.toFixed(2) ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Project Profitability */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-primary)' }}>
          <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--surface-secondary)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Project Profitability</h2>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Plan vs actual MIZAN cost</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--surface-secondary)', borderBottom: '1px solid var(--border-primary)' }}>
                {['Project', 'Plan (UZS)', 'Fact to Date', 'Remaining', 'Variance', 'Months', 'Est. Final Cost'].map(h => (
                  <th key={h} className="text-left px-5 py-2.5 text-xs font-medium" style={{ color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {profitability.map(p => {
                const isOver = p.varianceUzs < 0;
                const varianceColor = isOver ? '#ef4444' : '#22c55e';
                return (
                  <tr key={p.projectId} style={{ borderBottom: '1px solid var(--border-primary)', backgroundColor: 'var(--surface-primary)' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-secondary)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--surface-primary)')}>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{p.projectName}</td>
                    <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{fmtUzs(p.planUzs)}</td>
                    <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{fmtUzs(p.factToDateUzs)}</td>
                    <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{fmtUzs(p.planUzs - p.factToDateUzs)}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: varianceColor }}>
                        {isOver ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                        {Math.abs(p?.variancePct ?? 0).toFixed(1)}% {isOver ? 'over' : 'under'}
                      </span>
                    </td>
                    <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{p.monthsElapsed}mo</td>
                    <td className="px-5 py-3" style={{ color: isOver ? '#ef4444' : 'var(--text-secondary)' }}>{fmtUzs(p.estimatedFinalCostUzs)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
