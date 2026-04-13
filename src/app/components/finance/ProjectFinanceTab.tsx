import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { RefreshCw, X, Lock, TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react';
import { useProjectPlan, useProjectMonthlyCosts, useProjectPlanVsFact, useCalculateProjectPlan } from '@/hooks/api/useFinance';
import type { CreateProjectPlanDto } from '@/types/api';

function fmtUzs(n: number) { return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n) + ' UZS'; }
function fmtM(n: number) { return n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M' : n >= 1_000 ? (n / 1_000).toFixed(0) + 'K' : String(n); }

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const inputStyle: React.CSSProperties = { backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', borderRadius: 8, padding: '8px 12px', width: '100%', fontSize: 14 };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' };

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg p-3 shadow-lg text-xs" style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-primary)' }}>
      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
      {payload.map((p: any) => <p key={p.dataKey} style={{ color: p.fill }}>{p.name}: {fmtUzs(p.value)}</p>)}
    </div>
  );
};

interface Props { projectId: string; }

export function ProjectFinanceTab({ projectId }: Props) {
  const { data: plan, isLoading: planLoading, error: planError } = useProjectPlan(projectId);
  const { data: monthlyCosts = [], isLoading: costsLoading } = useProjectMonthlyCosts(projectId);
  const { data: pvf } = useProjectPlanVsFact(projectId);
  const calcMutation = useCalculateProjectPlan(projectId);

  const [calcModalOpen, setCalcModalOpen] = useState(false);
  const [calcForm, setCalcForm] = useState<CreateProjectPlanDto>({
    contractValueUzs: 0, contractValueUsd: undefined,
    contractSignedDate: '', riskCoefficient: 1.15, notes: '',
  });

  function submitPlan() {
    calcMutation.mutate(calcForm, { onSuccess: () => setCalcModalOpen(false) });
  }

  const cf = (k: keyof CreateProjectPlanDto, v: any) => setCalcForm(prev => ({ ...prev, [k]: v }));

  // Build chart data: plan burn curve vs actual cumulative
  const chartData = monthlyCosts.map((mc, i) => {
    const burnPerMonth = plan ? plan.mizanCostUzs / Math.max(monthlyCosts.length, 1) : 0;
    return {
      label: `${MONTHS[mc.month - 1]} ${mc.year}`,
      planBurn: Math.round(burnPerMonth * (i + 1)),
      actualCumulative: monthlyCosts.slice(0, i + 1).reduce((s, c) => s + c.totalCostUzs, 0),
    };
  });

  const noPlan = !planLoading && (planError || !plan);

  return (
    <div className="h-full overflow-auto p-6 space-y-5" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* ── Contract & Plan ────────────────────────────────────────────────── */}
      <div className="rounded-xl" style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-primary)' }}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-primary)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Contract & MIZAN Plan</h2>
          <button onClick={() => setCalcModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            <RefreshCw className="w-3.5 h-3.5" /> {plan ? 'Recalculate' : 'Calculate Plan'}
          </button>
        </div>

        {planLoading ? (
          <div className="px-6 py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading…</div>
        ) : noPlan ? (
          <div className="px-6 py-8 text-center">
            <DollarSign className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>No financial plan yet</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Set the contract value and click Calculate Plan to generate MIZAN cost estimates.</p>
          </div>
        ) : (
          <div className="px-6 py-5">
            <div className="grid grid-cols-4 gap-4 mb-4">
              {[
                { label: 'Contract Value', value: fmtUzs(plan.contractValueUzs), icon: DollarSign, color: '#22c55e' },
                { label: 'MIZAN Cost', value: fmtUzs(plan.mizanCostUzs), icon: TrendingDown, color: '#6366f1' },
                { label: 'Planned Profit', value: fmtUzs(plan.plannedProfitUzs), icon: TrendingUp, color: '#22c55e' },
                { label: 'Planned Margin', value: plan.plannedMarginPct.toFixed(1) + '%', icon: Clock, color: '#f59e0b' },
              ].map(k => (
                <div key={k.label} className="rounded-xl p-4" style={{ backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border-primary)' }}>
                  <div className="flex items-center gap-2 mb-1"><k.icon className="w-4 h-4" style={{ color: k.color }} /><span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{k.label}</span></div>
                  <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{k.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              {[
                { k: 'Planned Hours', v: plan.plannedHoursTotal + 'h' },
                { k: 'Avg Hourly Rate', v: fmtUzs(plan.avgHourlyRateUzs) },
                { k: 'Risk Coefficient', v: plan.riskCoefficient + '×' },
                { k: 'Exchange Rate', v: plan.exchangeRateAtSigning.toLocaleString() + ' UZS/USD' },
                { k: 'Version', v: `v${plan.version}` },
                { k: 'Contract Signed', v: plan.contractSignedDate ?? '—' },
              ].map(({ k, v }) => (
                <div key={k} className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Plan vs Fact summary ─────────────────────────────────────────────── */}
      {pvf && (
        <div className="rounded-xl p-5" style={{ backgroundColor: pvf.factToDateUzs <= pvf.plan.mizanCostUzs ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${pvf.factToDateUzs <= pvf.plan.mizanCostUzs ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Plan vs Fact</h2>
            <Lock className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <div className="grid grid-cols-4 gap-4 text-sm">
            {[
              { label: 'Fact to Date', value: fmtUzs(pvf.factToDateUzs), color: 'var(--text-primary)' },
              { label: 'Remaining Budget', value: fmtUzs(pvf.remainingUzs), color: pvf.remainingUzs >= 0 ? '#22c55e' : '#ef4444' },
              { label: 'Monthly Burn Rate', value: fmtUzs(pvf.burnRateUzs), color: 'var(--text-primary)' },
              { label: 'Est. Final Cost', value: fmtUzs(pvf.estimatedFinalCostUzs), color: pvf.estimatedFinalCostUzs > pvf.plan.mizanCostUzs ? '#ef4444' : '#22c55e' },
            ].map(k => (
              <div key={k.label}>
                <p className="text-xs mb-0.5" style={{ color: 'var(--text-tertiary)' }}>{k.label}</p>
                <p className="font-semibold" style={{ color: k.color }}>{k.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Plan vs Fact chart ───────────────────────────────────────────────── */}
      {chartData.length > 0 && (
        <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-primary)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Burn Curve</h2>
            <Lock className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmtM(v)} tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              {plan && <ReferenceLine y={plan.mizanCostUzs} stroke="#6366f1" strokeDasharray="6 3" label={{ value: 'Plan ceiling', fill: '#6366f1', fontSize: 11, position: 'insideTopRight' }} />}
              <Bar dataKey="planBurn" name="Plan Burn" fill="#6366f138" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actualCumulative" name="Actual" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Monthly Cost History ─────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-primary)' }}>
        <div className="px-6 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--surface-secondary)' }}>
          <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Monthly Cost History</h2>
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}><Lock className="w-3 h-3" />Auto-generated by cron</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-secondary)', borderBottom: '1px solid var(--border-primary)' }}>
              {['Month', 'Hours', 'Cost (UZS)', 'Cost (USD)', 'Employees', 'Status'].map(h => (
                <th key={h} className="text-left px-5 py-2.5 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {costsLoading ? (
              <tr><td colSpan={6} className="px-5 py-6 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading…</td></tr>
            ) : monthlyCosts.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-6 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>No monthly cost data yet.</td></tr>
            ) : monthlyCosts.map(mc => (
              <tr key={mc.id} style={{ borderBottom: '1px solid var(--border-primary)', backgroundColor: 'var(--surface-primary)' }}>
                <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{MONTHS[mc.month - 1]} {mc.year}</td>
                <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{mc.totalHours}h</td>
                <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{fmtUzs(mc.totalCostUzs)}</td>
                <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>${mc.totalCostUsd.toFixed(2)}</td>
                <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{mc.employeeCount}</td>
                <td className="px-5 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                    color: mc.isFinalized ? '#22c55e' : '#f59e0b',
                    backgroundColor: mc.isFinalized ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                  }}>{mc.isFinalized ? 'Finalized' : 'Preliminary'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Calculate Plan modal ─────────────────────────────────────────────── */}
      {calcModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-2xl w-full max-w-md shadow-2xl" style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-primary)' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Calculate MIZAN Plan</h2>
              <button onClick={() => setCalcModalOpen(false)} style={{ color: 'var(--text-tertiary)' }}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 rounded-lg text-xs" style={{ backgroundColor: 'rgba(99,102,241,0.08)', color: '#6366f1' }}>
                The system will read estimated hours from all project tasks and current team member hourly rates, then compute: <strong>MIZAN Cost = Planned Hours × Avg Rate × Risk Coefficient</strong>
              </div>
              <div><label style={labelStyle}>Contract Value (UZS)</label><input type="number" value={calcForm.contractValueUzs || ''} onChange={e => cf('contractValueUzs', parseFloat(e.target.value) || 0)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Contract Value (USD, optional)</label><input type="number" value={calcForm.contractValueUsd ?? ''} onChange={e => cf('contractValueUsd', e.target.value ? parseFloat(e.target.value) : undefined)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Contract Signed Date</label><input type="date" value={calcForm.contractSignedDate ?? ''} onChange={e => cf('contractSignedDate', e.target.value)} style={inputStyle} /></div>
              <div>
                <label style={labelStyle}>Risk Coefficient <span style={{ color: 'var(--text-tertiary)' }}>(default 1.15)</span></label>
                <input type="number" step="0.01" min="1" max="2" value={calcForm.riskCoefficient ?? 1.15} onChange={e => cf('riskCoefficient', parseFloat(e.target.value) || 1.15)} style={inputStyle} />
              </div>
              <div><label style={labelStyle}>Notes (optional)</label><textarea value={calcForm.notes ?? ''} onChange={e => cf('notes', e.target.value)} style={{ ...inputStyle, minHeight: 56, resize: 'vertical' }} /></div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
              <button onClick={() => setCalcModalOpen(false)} className="px-4 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}>Cancel</button>
              <button onClick={submitPlan} disabled={calcMutation.isPending || !calcForm.contractValueUzs}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: 'var(--accent-primary)', opacity: !calcForm.contractValueUzs ? 0.5 : 1 }}>
                {calcMutation.isPending ? 'Calculating…' : 'Calculate & Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
