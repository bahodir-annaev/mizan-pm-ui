import { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useOverheadCosts, useOverheadSummary, useCreateOverheadCost, useUpdateOverheadCost, useDeleteOverheadCost } from '@/hooks/api/useFinance';
import type { OverheadCost } from '@/types/domain';
import type { CreateOverheadCostDto, OverheadCategory } from '@/types/api';

const CATEGORIES: OverheadCategory[] = ['RENT', 'UTILITIES', 'INTERNET', 'SOFTWARE_LICENSES', 'OFFICE_SUPPLIES', 'MARKETING', 'TRAINING', 'INSURANCE', 'LEGAL', 'OTHER'];
const CATEGORY_LABELS: Record<OverheadCategory, string> = {
  RENT: 'Rent', UTILITIES: 'Utilities', INTERNET: 'Internet', SOFTWARE_LICENSES: 'Software Licenses',
  OFFICE_SUPPLIES: 'Office Supplies', MARKETING: 'Marketing', TRAINING: 'Training',
  INSURANCE: 'Insurance', LEGAL: 'Legal', OTHER: 'Other',
};
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtUzs(n: number) { return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n) + ' UZS'; }

const inputStyle: React.CSSProperties = { backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', borderRadius: 8, padding: '8px 12px', width: '100%', fontSize: 14 };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' };

export function OverheadCostsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: costs = [], isLoading } = useOverheadCosts({ year, month });
  const { data: summary = [] } = useOverheadSummary(year, month);
  const createMutation = useCreateOverheadCost();
  const updateMutation = useUpdateOverheadCost();
  const deleteMutation = useDeleteOverheadCost();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateOverheadCostDto>({ periodYear: year, periodMonth: month, category: 'RENT', amountUzs: 0, description: '' });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function openAdd() {
    setForm({ periodYear: year, periodMonth: month, category: 'RENT', amountUzs: 0, description: '' });
    setEditingId(null); setModalOpen(true);
  }
  function openEdit(c: OverheadCost) {
    setForm({ periodYear: c.periodYear, periodMonth: c.periodMonth, category: c.category as OverheadCategory, amountUzs: c.amountUzs, description: c.description });
    setEditingId(c.id); setModalOpen(true);
  }
  function save() {
    if (editingId) {
      updateMutation.mutate({ id: editingId, dto: form }, { onSuccess: () => setModalOpen(false) });
    } else {
      createMutation.mutate(form, { onSuccess: () => setModalOpen(false) });
    }
  }
  function confirmDelete() {
    if (deleteId) deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
  }
  const f = (k: keyof CreateOverheadCostDto, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const total = costs.reduce((s, c) => s + c.amountUzs, 0);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="px-6 py-5 border-b flex items-center justify-between flex-wrap gap-3" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--surface-primary)' }}>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Overhead Costs</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Monthly non-payroll costs distributed across production employees</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Period selectors */}
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
          <button onClick={openAdd} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: 'var(--accent-primary)' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            <Plus className="w-4 h-4" /> Add Entry
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {summary.length > 0 && (
        <div className="px-6 py-4 grid grid-cols-5 gap-3">
          <div className="col-span-1 rounded-xl p-4" style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}>
            <p className="text-xs opacity-80">Total Overhead</p>
            <p className="text-lg font-bold mt-1">{fmtUzs(total)}</p>
            <p className="text-xs opacity-70 mt-0.5">{MONTHS[month - 1]} {year}</p>
          </div>
          {summary.slice(0, 4).map(s => (
            <div key={s.category} className="rounded-xl p-4" style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-primary)' }}>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{CATEGORY_LABELS[s.category as OverheadCategory] ?? s.category}</p>
              <p className="text-base font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>{fmtUzs(s.total)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-primary)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--surface-secondary)', borderBottom: '1px solid var(--border-primary)' }}>
                {['Category', 'Description', 'Amount (UZS)', 'Added', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading…</td></tr>
              ) : costs.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>No overhead entries for {MONTHS[month - 1]} {year}.</td></tr>
              ) : costs.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-primary)', backgroundColor: 'var(--surface-primary)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-secondary)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--surface-primary)')}>
                  <td className="px-5 py-3">
                    <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--text-secondary)' }}>
                      {CATEGORY_LABELS[c.category as OverheadCategory] ?? c.category}
                    </span>
                  </td>
                  <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{c.description ?? '—'}</td>
                  <td className="px-5 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{fmtUzs(c.amountUzs)}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>{c.createdAt.slice(0, 10)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-md" style={{ color: 'var(--text-tertiary)' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-md" style={{ color: 'var(--text-tertiary)' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {costs.length > 0 && (
                <tr style={{ backgroundColor: 'var(--surface-secondary)', borderTop: '2px solid var(--border-primary)' }}>
                  <td className="px-5 py-3 text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Total</td>
                  <td />
                  <td className="px-5 py-3 font-bold" style={{ color: 'var(--text-primary)' }}>{fmtUzs(total)}</td>
                  <td colSpan={2} />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-2xl w-full max-w-sm shadow-2xl" style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-primary)' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{editingId ? 'Edit Entry' : 'Add Overhead Entry'}</h2>
              <button onClick={() => setModalOpen(false)} style={{ color: 'var(--text-tertiary)' }}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label style={labelStyle}>Category</label>
                <select value={form.category} onChange={e => f('category', e.target.value)} style={inputStyle}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Amount (UZS)</label><input type="number" value={form.amountUzs || ''} onChange={e => f('amountUzs', parseFloat(e.target.value) || 0)} style={inputStyle} placeholder="e.g. 3500000" /></div>
              <div><label style={labelStyle}>Description (optional)</label><input value={form.description ?? ''} onChange={e => f('description', e.target.value)} style={inputStyle} placeholder="Monthly office rent" /></div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}>Cancel</button>
              <button onClick={save} disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: 'var(--accent-primary)' }}>
                {editingId ? 'Save Changes' : 'Add Entry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-2xl p-6 w-full max-w-sm shadow-2xl" style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-primary)' }}>
            <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}><Trash2 className="w-5 h-5" style={{ color: '#ef4444' }} /></div><h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Delete Entry</h3></div>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>This cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}>Cancel</button>
              <button onClick={confirmDelete} disabled={deleteMutation.isPending} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: '#ef4444' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
