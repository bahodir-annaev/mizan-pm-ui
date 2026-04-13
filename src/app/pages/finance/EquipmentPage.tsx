import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Package, AlertCircle } from 'lucide-react';
import { useEquipment, useAmortizationSummary, useCreateEquipment, useUpdateEquipment, useDecommissionEquipment } from '@/hooks/api/useFinance';
import type { Equipment } from '@/types/domain';
import type { CreateEquipmentDto } from '@/types/api';

function fmtUzs(n: number) { return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n) + ' UZS'; }

const CATEGORIES = ['Laptop', 'Workstation', 'Monitor', 'Plotter', 'Printer', 'Server', 'Tablet', 'Camera', 'Other'];
const EMPTY_FORM: CreateEquipmentDto = { name: '', category: 'Laptop', purchaseDate: '', purchaseCostUzs: 0, usefulLifeMonths: 36, residualValueUzs: 0, serialNumber: '' };

const inputStyle: React.CSSProperties = { backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', borderRadius: 8, padding: '8px 12px', width: '100%', fontSize: 14 };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' };

export function EquipmentPage() {
  const [showInactive, setShowInactive] = useState(false);
  const { data: equipment = [], isLoading } = useEquipment(showInactive ? undefined : true);
  const { data: amort } = useAmortizationSummary();
  const createMutation = useCreateEquipment();
  const updateMutation = useUpdateEquipment();
  const decommMutation = useDecommissionEquipment();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateEquipmentDto>({ ...EMPTY_FORM });
  const [decommId, setDecommId] = useState<string | null>(null);

  function openAdd() { setForm({ ...EMPTY_FORM, purchaseDate: new Date().toISOString().slice(0, 10) }); setEditingId(null); setModalOpen(true); }
  function openEdit(e: Equipment) {
    setForm({ name: e.name, category: e.category, purchaseDate: e.purchaseDate, purchaseCostUzs: e.purchaseCostUzs, usefulLifeMonths: e.usefulLifeMonths, residualValueUzs: e.residualValueUzs, serialNumber: e.serialNumber ?? '' });
    setEditingId(e.id); setModalOpen(true);
  }
  function save() {
    if (editingId) {
      updateMutation.mutate({ id: editingId, dto: form }, { onSuccess: () => setModalOpen(false) });
    } else {
      createMutation.mutate(form, { onSuccess: () => setModalOpen(false) });
    }
  }
  function confirmDecomm() {
    if (decommId) decommMutation.mutate(decommId, { onSuccess: () => setDecommId(null) });
  }

  const f = (k: keyof CreateEquipmentDto, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  // Preview monthly amortization in form
  const previewAmort = form.purchaseCostUzs > 0 && form.usefulLifeMonths > 0
    ? Math.round((form.purchaseCostUzs - (form.residualValueUzs || 0)) / form.usefulLifeMonths)
    : null;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="px-6 py-5 border-b flex items-center justify-between flex-wrap gap-3" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--surface-primary)' }}>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Equipment</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Track assets and monthly amortization for the MIZAN cost engine</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} className="rounded" />
            Show decommissioned
          </label>
          <button onClick={openAdd} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: 'var(--accent-primary)' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            <Plus className="w-4 h-4" /> Add Equipment
          </button>
        </div>
      </div>

      {/* Amortization summary */}
      {amort && (
        <div className="px-6 pt-4">
          <div className="rounded-xl p-4 flex items-center gap-6" style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-primary)' }}>
            <Package className="w-8 h-8" style={{ color: '#6366f1' }} />
            <div>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Total monthly amortization ({amort.itemCount} active items)</p>
              <p className="text-2xl font-bold" style={{ color: '#6366f1' }}>{fmtUzs(amort.total)}</p>
            </div>
            <p className="ml-auto text-xs" style={{ color: 'var(--text-tertiary)' }}>Distributed equally across production employees each month</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-primary)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--surface-secondary)', borderBottom: '1px solid var(--border-primary)' }}>
                {['Name', 'Category', 'Serial No.', 'Purchase Date', 'Cost (UZS)', 'Life', 'Monthly Amort.', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={9} className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading…</td></tr>
              ) : equipment.length === 0 ? (
                <tr><td colSpan={9} className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>No equipment registered yet.</td></tr>
              ) : equipment.map(e => (
                <tr key={e.id} style={{ borderBottom: '1px solid var(--border-primary)', backgroundColor: 'var(--surface-primary)', opacity: e.isActive ? 1 : 0.5 }}
                  onMouseEnter={ev => (ev.currentTarget.style.backgroundColor = 'var(--surface-secondary)')}
                  onMouseLeave={ev => (ev.currentTarget.style.backgroundColor = 'var(--surface-primary)')}>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{e.name}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--text-secondary)' }}>{e.category}</span></td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>{e.serialNumber ?? '—'}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{e.purchaseDate}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{fmtUzs(e.purchaseCostUzs)}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{e.usefulLifeMonths}mo</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: '#6366f1' }}>{fmtUzs(e.monthlyAmortizationUzs)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                      color: e.isActive ? '#22c55e' : '#6b7280',
                      backgroundColor: e.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.12)',
                    }}>{e.isActive ? 'Active' : 'Decommissioned'}</span>
                  </td>
                  <td className="px-4 py-3">
                    {e.isActive && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(e)} className="p-1.5 rounded-md" style={{ color: 'var(--text-tertiary)' }}
                          onMouseEnter={ev => { ev.currentTarget.style.backgroundColor = 'var(--surface-tertiary)'; ev.currentTarget.style.color = 'var(--text-primary)'; }}
                          onMouseLeave={ev => { ev.currentTarget.style.backgroundColor = 'transparent'; ev.currentTarget.style.color = 'var(--text-tertiary)'; }}><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDecommId(e.id)} className="p-1.5 rounded-md" title="Decommission" style={{ color: 'var(--text-tertiary)' }}
                          onMouseEnter={ev => { ev.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; ev.currentTarget.style.color = '#ef4444'; }}
                          onMouseLeave={ev => { ev.currentTarget.style.backgroundColor = 'transparent'; ev.currentTarget.style.color = 'var(--text-tertiary)'; }}><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
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
          <div className="rounded-2xl w-full max-w-lg shadow-2xl" style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-primary)' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{editingId ? 'Edit Equipment' : 'Add Equipment'}</h2>
              <button onClick={() => setModalOpen(false)} style={{ color: 'var(--text-tertiary)' }}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
              <div className="col-span-2"><label style={labelStyle}>Name</label><input value={form.name} onChange={e => f('name', e.target.value)} style={inputStyle} placeholder='MacBook Pro 16"' /></div>
              <div><label style={labelStyle}>Category</label><select value={form.category} onChange={e => f('category', e.target.value)} style={inputStyle}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label style={labelStyle}>Serial Number</label><input value={form.serialNumber ?? ''} onChange={e => f('serialNumber', e.target.value)} style={inputStyle} placeholder="SN-..." /></div>
              <div><label style={labelStyle}>Purchase Date</label><input type="date" value={form.purchaseDate} onChange={e => f('purchaseDate', e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Purchase Cost (UZS)</label><input type="number" value={form.purchaseCostUzs || ''} onChange={e => f('purchaseCostUzs', parseFloat(e.target.value) || 0)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Useful Life (months)</label><input type="number" value={form.usefulLifeMonths} onChange={e => f('usefulLifeMonths', parseInt(e.target.value) || 0)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Residual Value (UZS)</label><input type="number" value={form.residualValueUzs || ''} onChange={e => f('residualValueUzs', parseFloat(e.target.value) || 0)} style={inputStyle} /></div>
              {previewAmort !== null && (
                <div className="col-span-2 rounded-lg p-3" style={{ backgroundColor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <p className="text-xs" style={{ color: '#6366f1' }}>Monthly amortization (auto-calculated): <strong>{fmtUzs(previewAmort)}</strong></p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}>Cancel</button>
              <button onClick={save} disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: 'var(--accent-primary)' }}>
                {editingId ? 'Save Changes' : 'Add Equipment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decommission confirm */}
      {decommId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-2xl p-6 w-full max-w-sm shadow-2xl" style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-primary)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}><AlertCircle className="w-5 h-5" style={{ color: '#ef4444' }} /></div>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Decommission Equipment</h3>
            </div>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>This will mark the item as inactive and exclude it from future amortization calculations. Historical data will be preserved.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDecommId(null)} className="px-4 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}>Cancel</button>
              <button onClick={confirmDecomm} disabled={decommMutation.isPending}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: '#ef4444' }}>Decommission</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
