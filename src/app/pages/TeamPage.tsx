import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { SearchInput } from '../components/SearchInput';
import { UserAvatar } from '../components/UserAvatar';
import { AddMemberModal } from '../components/AddMemberModal';
import { useUsers, useUpdateUser, useDeleteUser } from '@/hooks/api/useUsers';

type OrgRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer';

const ORG_ROLES: OrgRole[] = ['owner', 'admin', 'manager', 'member', 'viewer'];

const ROLE_STYLES: Record<OrgRole, { bg: string; color: string }> = {
  owner:   { bg: 'rgba(99,102,241,0.15)',  color: 'var(--accent-primary)' },
  admin:   { bg: 'rgba(168,85,247,0.15)',  color: '#a855f7' },
  manager: { bg: 'rgba(20,184,166,0.15)',  color: '#14b8a6' },
  member:  { bg: 'var(--surface-secondary)', color: 'var(--text-secondary)' },
  viewer:  { bg: 'rgba(234,179,8,0.15)',   color: '#ca8a04' },
};

export function TeamPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: teamMembers = [], isLoading, isError, refetch } = useUsers();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (member.position ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handleRoleChange(id: string, role: OrgRole) {
    updateUser.mutate({ id, dto: { roles: [role] } });
  }

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Remove ${name} from the team?`)) return;
    deleteUser.mutate(id);
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        className="border-b px-8 py-6"
        style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--border-primary)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl mb-1" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              Team Management
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Manage your team members and their roles
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#ffffff', fontWeight: 500 }}
          >
            <UserPlus style={{ width: '16px', height: '16px' }} />
            Add Member
          </button>
        </div>
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search team members..." />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-16" style={{ color: 'var(--text-tertiary)' }}>
            <p className="text-sm">Loading team members...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <p className="text-sm" style={{ color: '#EF4444' }}>Failed to load team members.</p>
            <button
              onClick={() => refetch()}
              className="text-sm px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--text-secondary)' }}
            >
              Retry
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 z-10" style={{ backgroundColor: 'var(--surface-secondary)' }}>
              <tr>
                {['Name', 'Position', 'Role', 'Email', 'Phone', 'Actions'].map((col) => (
                  <th
                    key={col}
                    className={`px-6 py-3 text-xs uppercase tracking-wider ${col === 'Actions' ? 'text-right' : 'text-left'}`}
                    style={{ color: 'var(--text-tertiary)', fontWeight: 600, borderBottom: '1px solid var(--border-primary)' }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member, index) => {
                const orgRole = (member.orgRole ?? 'member') as OrgRole;
                const roleStyle = ROLE_STYLES[orgRole] ?? ROLE_STYLES.member;

                return (
                  <tr
                    key={member.id}
                    className="transition-colors"
                    style={{ borderBottom: index !== filteredMembers.length - 1 ? '1px solid var(--border-primary)' : 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={member.name} color={member.color} size="md" />
                        <span className="text-sm" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                          {member.name}
                        </span>
                      </div>
                    </td>

                    {/* Position */}
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {member.position || '—'}
                      </span>
                    </td>

                    {/* Role — editable dropdown */}
                    <td className="px-6 py-4">
                      <select
                        value={orgRole}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as OrgRole)}
                        disabled={updateUser.isPending}
                        className="text-xs font-medium capitalize rounded-full px-2.5 py-0.5 border-0 cursor-pointer disabled:opacity-50 focus:outline-none"
                        style={{ backgroundColor: roleStyle.bg, color: roleStyle.color }}
                      >
                        {ORG_ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {member.email}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {member.phone || '—'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(member.id, member.name)}
                        disabled={deleteUser.isPending}
                        className="p-2 rounded-lg transition-colors inline-flex items-center justify-center disabled:opacity-50"
                        style={{ color: 'var(--text-tertiary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                          e.currentTarget.style.color = '#EF4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-tertiary)';
                        }}
                      >
                        <X style={{ width: '18px', height: '18px' }} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!isLoading && !isError && filteredMembers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16" style={{ color: 'var(--text-tertiary)' }}>
            <p className="text-sm">No team members found</p>
          </div>
        )}
      </div>

      <AddMemberModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />

      {/* Footer Stats */}
      <div
        className="border-t px-8 py-4"
        style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--border-primary)' }}
      >
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>
            Total Members: <strong style={{ color: 'var(--text-primary)' }}>{isLoading ? '…' : teamMembers.length}</strong>
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>
            Showing: <strong style={{ color: 'var(--text-primary)' }}>{filteredMembers.length}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
