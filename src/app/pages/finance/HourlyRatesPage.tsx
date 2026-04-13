import { useState } from 'react';
import { Plus, ChevronDown, ChevronRight, X, RefreshCw, Bot, User } from 'lucide-react';
import { useHourlyRates, useUserHourlyRates, useCreateHourlyRate, useRecalculateHourlyRates } from '@/hooks/api/useFinance';
import { useUsers } from '@/hooks/api/useUsers';
import type { HourlyRate } from '@/types/domain';
import type { CreateHourlyRateDto } from '@/types/api';

function fmtUzs(n: number) { return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n) + ' UZS'; }

const inputStyle: React.CSSProperties = { backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', borderRadius: 8, padding: '8px 12px', width: '100%', fontSize: 14 };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' };

const EMPTY_FORM: Omit<CreateHourlyRateDto, 'userId'> = {
  effectiveDate: new Date().toISOString().slice(0, 10),
  salaryUzs: 0, bonusUzs: 0, adminShareUzs: 0,
  equipmentShareUzs: 0, overheadShareUzs: 0,
  workingHoursPerMonth: 176, notes: '',
};

// Expandable row for a single employee showing their rate history
function EmployeeHistoryRow({ userId }: { userId: string }) {
  const { data: history = [], isLoading } = useUserHourlyRates(userId);
  return (
    <tr>
      <td colSpan={9} style={{ backgroundColor: 'var(--surface-secondary)', borderBottom: '1px solid var(--border-primary)' }}>
        <div className="px-8 py-3">
          {isLoading ? (
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Loading history…</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr>
                  {['Effective Date', 'Hourly (UZS)', 'Hourly (USD)', 'Total Monthly', 'Source', 'Notes'].map(h => (
                    <th key={h} className="text-left py-1 pr-6 font-medium" style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map(r => (
                  <tr key={r.id}>
                    <td className="py-1.5 pr-6" style={{ color: 'var(--text-secondary)' }}>{r.effectiveDate}</td>
                    <td className="py-1.5 pr-6 font-medium" style={{ color: 'var(--text-primary)' }}>{fmtUzs(r.hourlyRateUzs)}</td>
                    <td className="py-1.5 pr-6" style={{ color: 'var(--text-secondary)' }}>${r.hourlyRateUsd.toFixed(4)}</td>
                    <td className="py-1.5 pr-6" style={{ color: 'var(--text-secondary)' }}>{fmtUzs(r.totalMonthlyCostUzs)}</td>
                    <td className="py-1.5 pr-6">
                      {r.isCronGenerated
                        ? <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: 'rgba(99,102,241,0.12)', color: '#6366f1' }}><Bot className="w-3 h-3" />Auto</span>
                        : <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#22c55e' }}><User className="w-3 h-3" />Manual</span>
                      }
                    </td>
                    <td className="py-1.5" style={{ color: 'var(--text-tertiary)' }}>{r.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </td>
    </tr>
  );
}

export function HourlyRatesPage() {
  const { data: rates = [], isLoading } = useHourlyRates();
  const { data: users = [] } = useUsers();
  const createMutation = useCreateHourlyRate();
  const recalcMutation = useRecalculateHourlyRates();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [confirmRecalc, setConfirmRecalc] = useState(false);

  function openAdd(userId?: string) {
    setSelectedUserId(userId ?? (users[0]?.id ?? ''));
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  }

  function save() {
    createMutation.mutate(
      { userId: selectedUserId, ...form, salaryUzs: form.salaryUzs, bonusUzs: form.bonusUzs, adminShareUzs: form.adminShareUzs, equipmentShareUzs: form.equipmentShareUzs, overheadShareUzs: form.overheadShareUzs },
      { onSuccess: () => setModalOpen(false) }
    );
  }

  const f = (k: keyof typeof form, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  // Preview net pay computation
  const previewTotal = form.salaryUzs + form.bonusUzs + (form.salaryUzs * 0.12) + (form.salaryUzs * 0.12) + form.adminShareUzs + form.equipmentShareUzs + form.overheadShareUzs;
  const previewHourly = form.workingHoursPerMonth > 0 ? Math.round(previewTotal / form.workingHoursPerMonth) : 0;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="px-6 py-5 border-b flex items-center justify-between flex-wrap gap-3" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--surface-primary)' }}>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Hourly Rates</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Current effective cost per hour per employee. Rows marked <span style={{ color: '#6366f1' }}>Auto</span> are cron-generated and read-only.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setConfirmRecalc(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ border: '1px solid var(--border-primary)', color: 'var(--text-secondary)', backgroundColor: 'transparent' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            <RefreshCw className="w-4 h-4" /> Run Recalculation
          </button>
          <button onClick={() => openAdd()} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: 'var(--accent-primary)' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            <Plus className="w-4 h-4" /> Set Manual Rate
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-primary)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--surface-secondary)', borderBottom: '1px solid var(--border-primary)' }}>
                {['', 'Employee', 'Effective Date', 'Hourly Rate (UZS)', 'Hourly Rate (USD)', 'Total Monthly Cost', 'Source', 'Notes', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={9} className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading…</td></tr>
              ) : rates.length === 0 ? (
                <tr><td colSpan={9} className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>No rates found. Run the recalculation job or set a manual rate.</td></tr>
              ) : rates.map(r => (
                <>
                  <tr key={r.id} style={{ borderBottom: expandedUserId === r.userId ? 'none' : '1px solid var(--border-primary)', backgroundColor: 'var(--surface-primary)' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-secondary)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = expandedUserId === r.userId ? 'var(--surface-secondary)' : 'var(--surface-primary)')}>
                    {/* Expand toggle */}
                    <td className="px-4 py-3">
                      <button onClick={() => setExpandedUserId(expandedUserId === r.userId ? null : r.userId)} style={{ color: 'var(--text-tertiary)' }}>
                        {expandedUserId === r.userId ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{r.userName}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{r.effectiveDate}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: '#6366f1' }}>{fmtUzs(r.hourlyRateUzs)}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>${r.hourlyRateUsd.toFixed(4)}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{fmtUzs(r.totalMonthlyCostUzs)}</td>
                    <td className="px-4 py-3">
                      {r.isCronGenerated
                        ? <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(99,102,241,0.12)', color: '#6366f1' }}><Bot className="w-3 h-3" />Auto</span>
                        : <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#22c55e' }}><User className="w-3 h-3" />Manual</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-xs max-w-[160px] truncate" style={{ color: 'var(--text-tertiary)' }}>{r.notes ?? '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => openAdd(r.userId)} className="text-xs px-2 py-1 rounded-lg transition-colors" style={{ border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        Override
                      </button>
                    </td>
                  </tr>
                  {expandedUserId === r.userId && <EmployeeHistoryRow key={`hist-${r.userId}`} userId={r.userId} />}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual rate modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-2xl w-full max-w-lg shadow-2xl" style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-primary)' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Set Manual Rate</h2>
              <button onClick={() => setModalOpen(false)} style={{ color: 'var(--text-tertiary)' }}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
              <div className="col-span-2">
                <label style={labelStyle}>Employee</label>
                <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} style={inputStyle}>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="col-span-2"><label style={labelStyle}>Effective Date</label><input type="date" value={form.effectiveDate} onChange={e => f('effectiveDate', e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Base Salary (UZS)</label><input type="number" value={form.salaryUzs || ''} onChange={e => f('salaryUzs', parseFloat(e.target.value) || 0)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Bonus (UZS)</label><input type="number" value={form.bonusUzs || ''} onChange={e => f('bonusUzs', parseFloat(e.target.value) || 0)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Admin Share (UZS)</label><input type="number" value={form.adminShareUzs || ''} onChange={e => f('adminShareUzs', parseFloat(e.target.value) || 0)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Equipment Share (UZS)</label><input type="number" value={form.equipmentShareUzs || ''} onChange={e => f('equipmentShareUzs', parseFloat(e.target.value) || 0)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Overhead Share (UZS)</label><input type="number" value={form.overheadShareUzs || ''} onChange={e => f('overheadShareUzs', parseFloat(e.target.value) || 0)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Working Hours / Month</label><input type="number" value={form.workingHoursPerMonth} onChange={e => f('workingHoursPerMonth', parseInt(e.target.value) || 176)} style={inputStyle} /></div>
              <div className="col-span-2"><label style={labelStyle}>Notes (required for manual entries)</label><input value={form.notes ?? ''} onChange={e => f('notes', e.target.value)} style={inputStyle} placeholder="e.g. Q2 2026 raise" /></div>

              {/* Live preview */}
              <div className="col-span-2 rounded-lg p-3 space-y-1" style={{ backgroundColor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <p className="text-xs font-medium" style={{ color: '#6366f1' }}>Preview (tax + JSSM auto-computed as 12% each)</p>
                <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span>Total Monthly Cost</span><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{fmtUzs(previewTotal)}</span>
                </div>
                <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span>Hourly Rate</span><span className="font-semibold" style={{ color: '#6366f1' }}>{fmtUzs(previewHourly)} / hr</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}>Cancel</button>
              <button onClick={save} disabled={createMutation.isPending || !selectedUserId || !form.notes}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: 'var(--accent-primary)', opacity: (!selectedUserId || !form.notes) ? 0.5 : 1 }}>
                Save Rate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recalculate confirm */}
      {confirmRecalc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-2xl p-6 w-full max-w-sm shadow-2xl" style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-primary)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(99,102,241,0.12)' }}><RefreshCw className="w-5 h-5" style={{ color: '#6366f1' }} /></div>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Run Recalculation</h3>
            </div>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>This will run the nightly cron job logic immediately, recalculating hourly rates for all employees using the current exchange rate and overhead data.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmRecalc(false)} className="px-4 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}>Cancel</button>
              <button onClick={() => recalcMutation.mutate(undefined, { onSuccess: () => setConfirmRecalc(false) })}
                disabled={recalcMutation.isPending}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: '#6366f1' }}>
                {recalcMutation.isPending ? 'Running…' : 'Run Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
