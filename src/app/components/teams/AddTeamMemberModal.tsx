import { useState, useEffect, useMemo } from 'react';
import { Search, Check } from 'lucide-react';
import { ModalHeader } from '../ModalHeader';
import { UserAvatar } from '../UserAvatar';
import { useAddTeamMember } from '@/hooks/api/useTeams';
import { useUsers } from '@/hooks/api/useUsers';
import type { TeamRole } from '@/types/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  existingMemberIds: string[];
}

const TEAM_ROLES: { value: TeamRole; label: string }[] = [
  { value: 'member',  label: 'Member' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin',   label: 'Admin' },
  { value: 'owner',   label: 'Owner' },
];

export function AddTeamMemberModal({ isOpen, onClose, teamId, existingMemberIds }: Props) {
  const addMember = useAddTeamMember();
  const { data: allUsers = [] } = useUsers();

  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<TeamRole>('member');

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedUserId(null);
      setSelectedRole('member');
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      const root = document.getElementById('root');
      if (root) root.style.pointerEvents = 'none';
      return () => { if (root) root.style.pointerEvents = ''; };
    }
  }, [isOpen]);

  const eligibleUsers = useMemo(
    () => allUsers.filter((u) => !existingMemberIds.includes(u.id)),
    [allUsers, existingMemberIds],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return eligibleUsers;
    return eligibleUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.position ?? '').toLowerCase().includes(q),
    );
  }, [eligibleUsers, search]);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!selectedUserId) return;
    addMember.mutate(
      { teamId, userId: selectedUserId, role: selectedRole },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <>
      <div
        style={{
          position: 'fixed', inset: 0,
          backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)',
          zIndex: 49, pointerEvents: 'none',
        }}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ pointerEvents: 'auto' }}>
        <div
          className="relative w-full max-w-md overflow-hidden rounded-2xl flex flex-col"
          style={{
            maxHeight: '80vh',
            backgroundColor: 'var(--surface-primary)',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          <ModalHeader title="Add Team Member" onClose={onClose} />

          <div className="px-6 pt-4 pb-2">
            {/* Search */}
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
              style={{ backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border-primary)' }}
            >
              <Search style={{ width: '14px', height: '14px', color: 'var(--text-tertiary)', flexShrink: 0 }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or position..."
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: 'var(--text-primary)' }}
                autoFocus
              />
            </div>
          </div>

          {/* User list */}
          <div className="flex-1 overflow-y-auto px-3 pb-2">
            {filtered.length === 0 ? (
              <p className="text-center text-sm py-6" style={{ color: 'var(--text-tertiary)' }}>
                {search ? 'No users match your search' : 'All org members are already in this team'}
              </p>
            ) : (
              filtered.map((user) => {
                const isSelected = selectedUserId === user.id;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelectedUserId(isSelected ? null : user.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left"
                    style={{
                      backgroundColor: isSelected ? 'var(--surface-hover)' : 'transparent',
                      border: isSelected ? '1px solid var(--accent-primary)' : '1px solid transparent',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <UserAvatar name={user.name} color={user.color} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>{user.email}</p>
                    </div>
                    {user.position && (
                      <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>{user.position}</span>
                    )}
                    {isSelected && (
                      <Check style={{ width: '16px', height: '16px', color: 'var(--accent-primary)', flexShrink: 0 }} />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Role selector + footer */}
          <div
            className="px-6 py-4 border-t space-y-3"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Team role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as TeamRole)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                }}
              >
                {TEAM_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={!selectedUserId || addMember.isPending}
                className="px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent-primary)', color: '#ffffff' }}
              >
                {addMember.isPending ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
