import { useState } from 'react';
import { Plus, Edit2, Trash2, X, TrendingUp } from 'lucide-react';
import { useExchangeRates, useCreateExchangeRate, useUpdateExchangeRate, useDeleteExchangeRate } from '@/hooks/api/useFinance';
import type { ExchangeRate } from '@/types/domain';
import type { CreateExchangeRateDto } from '@/types/api';

const EMPTY_FORM: CreateExchangeRateDto = { rateDate: '', uzsPerUsd: 0, source: 'CBU' };

const inputStyle: React.CSSProperties = { backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', borderRadius: 8, padding: '8px 12px', width: '100%', fontSize: 14 };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' };

export function ExchangeRatesPage() {
  const { data: rates = [], isLoading } = useExchangeRates();
  const createMutation = useCreateExchangeRate();
  const updateMutation = useUpdateExchangeRate();
  const deleteMutation = useDeleteExchangeRate();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateExchangeRateDto>({ ...EMPTY_FORM });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function openAdd() { setForm({ ...EMPTY_FORM, rateDate: new Date().toISOString().slice(0, 10) }); setEditingId(null); setModalOpen(true); }
  function openEdit(r: ExchangeRate) {
    setForm({ rateDate: r.rateDate, uzsPerUsd: r.uzsPerUsd, source: r.source });
    setEditingId(r.id);
    setModalOpen(true);
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

  const f = (k: keyof CreateExchangeRateDto, v: string | number) =>
    setForm(prev => ({ ...prev, [k]: v }));

  // Latest rate for header
  const latest = rates[0];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--surface-primary)' }}>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Exchange Rates</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>UZS / USD rates used by the MIZAN cost engine</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: 'var(--accent-primary)' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
          <Plus className="w-4 h-4" /> Add Rate
        </button>
      </div>

      {/* Latest rate banner */}
      {latest && (
        <div className="mx-6 mt-4 rounded-xl p-4 flex items-center gap-4" style={{ backgroundColor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)' }}>
          <TrendingUp className="w-5 h-5" style={{ color: '#6366f1' }} />
          <div>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Latest rate ({latest.rateDate})</p>
            <p className="text-xl font-bold" style={{ color: '#6366f1' }}>{latest.uzsPerUsd.toLocaleString()} UZS / USD</p>
          </div>
          <span className="ml-auto text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(99,102,241,0.12)', color: '#6366f1' }}>{latest.source}</span>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-primary)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--surface-secondary)', borderBottom: '1px solid var(--border-primary)' }}>
                {['Date', 'UZS per USD', 'Source', 'Added', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading…</td></tr>
              ) : rates.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>No rates yet. Add the first one.</td></tr>
              ) : rates.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-primary)', backgroundColor: 'var(--surface-primary)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-secondary)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--surface-primary)')}>
                  <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{r.rateDate}</td>
                  <td className="px-5 py-3 text-base font-semibold" style={{ color: '#6366f1' }}>{r.uzsPerUsd.toLocaleString()}</td>
                  <td className="px-5 py-3"><span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--text-secondary)' }}>{r.source}</span></td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>{r.createdAt.slice(0, 10)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(r)} className="p-1.5 rounded-md" style={{ color: 'var(--text-tertiary)' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded-md" style={{ color: 'var(--text-tertiary)' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-2xl w-full max-w-sm shadow-2xl" style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-primary)' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{editingId ? 'Edit Rate' : 'Add Exchange Rate'}</h2>
              <button onClick={() => setModalOpen(false)} style={{ color: 'var(--text-tertiary)' }}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label style={labelStyle}>Date</label><input type="date" value={form.rateDate} onChange={e => f('rateDate', e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>UZS per USD</label><input type="number" value={form.uzsPerUsd || ''} onChange={e => f('uzsPerUsd', parseFloat(e.target.value) || 0)} style={inputStyle} placeholder="e.g. 12850" /></div>
              <div><label style={labelStyle}>Source</label>
                <select value={form.source} onChange={e => f('source', e.target.value)} style={inputStyle}>
                  {['CBU', 'NBU', 'Manual', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}>Cancel</button>
              <button onClick={save} disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: 'var(--accent-primary)', opacity: (createMutation.isPending || updateMutation.isPending) ? 0.7 : 1 }}>
                {editingId ? 'Save Changes' : 'Add Rate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-2xl p-6 w-full max-w-sm shadow-2xl" style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-primary)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}><Trash2 className="w-5 h-5" style={{ color: '#ef4444' }} /></div>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Delete Rate</h3>
            </div>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>This cannot be undone. Historical calculations that used this rate will not be affected.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}>Cancel</button>
              <button onClick={confirmDelete} disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: '#ef4444' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
