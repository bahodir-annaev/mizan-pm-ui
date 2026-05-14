import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, X, Users } from 'lucide-react';
import { UserAvatar } from '../components/UserAvatar';
import { CreateTeamModal } from '../components/teams/CreateTeamModal';
import { EditTeamModal } from '../components/teams/EditTeamModal';
import { AddTeamMemberModal } from '../components/teams/AddTeamMemberModal';
import { useTeams, useTeamMembers, useDeleteTeam, useUpdateTeamMemberRole, useRemoveTeamMember } from '@/hooks/api/useTeams';
import { useUsers } from '@/hooks/api/useUsers';
import type { ApiTeam } from '@/types/api';
import type { TeamRole } from '@/types/api';

const TEAM_ROLES: TeamRole[] = ['owner', 'admin', 'manager', 'member'];

const ROLE_STYLES: Record<TeamRole, { bg: string; color: string }> = {
  owner:   { bg: 'rgba(99,102,241,0.15)',  color: 'var(--accent-primary)' },
  admin:   { bg: 'rgba(168,85,247,0.15)',  color: '#a855f7' },
  manager: { bg: 'rgba(20,184,166,0.15)',  color: '#14b8a6' },
  member:  { bg: 'var(--surface-secondary)', color: 'var(--text-secondary)' },
};

export function TeamPage() {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  const { data: teams = [], isLoading: teamsLoading, isError: teamsError, refetch: refetchTeams } = useTeams();
  const { data: rawMembers = [], isLoading: membersLoading } = useTeamMembers(selectedTeamId ?? '');
  const { data: allUsers = [] } = useUsers();

  const deleteTeam = useDeleteTeam();
  const updateMemberRole = useUpdateTeamMemberRole();
  const removeMember = useRemoveTeamMember();

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) ?? null;

  // Build userId → TeamMember map for enrichment
  const userMap = useMemo(() => new Map(allUsers.map((u) => [u.id, u])), [allUsers]);

  // Enrich raw membership records with user display data
  const members = useMemo(
    () =>
      rawMembers.map((m) => {
        const user = userMap.get(m.userId);
        return {
          membershipId: m.id,
          userId: m.userId,
          role: m.teamRole,
          joinedAt: m.joinedAt,
          name: user?.name ?? m.userId,
          email: user?.email ?? '',
          position: user?.position,
          avatarUrl: user?.avatarUrl,
          initials: user?.initials ?? '?',
          color: user?.color ?? 'bg-gray-500',
        };
      }),
    [rawMembers, userMap],
  );

  const existingMemberIds = useMemo(() => rawMembers.map((m) => m.userId), [rawMembers]);

  function handleDeleteTeam(team: ApiTeam) {
    if (!window.confirm(`Delete "${team.name}"? This action cannot be undone.`)) return;
    deleteTeam.mutate(team.id, {
      onSuccess: () => { if (selectedTeamId === team.id) setSelectedTeamId(null); },
    });
  }

  function handleRoleChange(userId: string, teamRole: TeamRole) {
    if (!selectedTeamId) return;
    updateMemberRole.mutate({ teamId: selectedTeamId, userId, teamRole });
  }

  function handleRemoveMember(userId: string, name: string) {
    if (!selectedTeamId) return;
    if (!window.confirm(`Remove ${name} from this team?`)) return;
    removeMember.mutate({ teamId: selectedTeamId, userId });
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>

      {/* Page header */}
      <div
        className="border-b px-8 py-5 flex items-center justify-between flex-shrink-0"
        style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--border-primary)' }}
      >
        <div>
          <h1 className="text-2xl mb-0.5" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            Team Management
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Create teams, assign members, and manage roles
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--accent-primary)', color: '#ffffff', fontWeight: 500 }}
        >
          <Plus style={{ width: '16px', height: '16px' }} />
          New Team
        </button>
      </div>

      {/* Split body */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left panel: team list ── */}
        <div
          className="w-72 flex-shrink-0 border-r flex flex-col overflow-hidden"
          style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--surface-primary)' }}
        >
          <div className="px-4 py-3 border-b flex-shrink-0" style={{ borderColor: 'var(--border-primary)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
              Teams ({teams.length})
            </p>
          </div>

          <div className="flex-1 overflow-y-auto py-2 px-2">
            {teamsLoading ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--text-tertiary)' }}>Loading...</p>
            ) : teamsError ? (
              <div className="text-center py-8 space-y-2">
                <p className="text-sm" style={{ color: '#EF4444' }}>Failed to load teams</p>
                <button
                  onClick={() => refetchTeams()}
                  className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--text-secondary)' }}
                >
                  Retry
                </button>
              </div>
            ) : teams.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Users style={{ width: '32px', height: '32px', margin: '0 auto 8px', color: 'var(--text-tertiary)' }} />
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No teams yet</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-3 text-xs font-medium hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  + Create first team
                </button>
              </div>
            ) : (
              teams.map((team) => {
                const isSelected = team.id === selectedTeamId;
                return (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeamId(isSelected ? null : team.id)}
                    className="w-full text-left px-3 py-3 rounded-lg mb-1 transition-colors"
                    style={{
                      backgroundColor: isSelected ? 'var(--surface-hover)' : 'transparent',
                      border: isSelected ? '1px solid var(--accent-primary)' : '1px solid transparent',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {team.name}
                      </span>
                      {team.code && (
                        <span
                          className="text-xs font-mono flex-shrink-0 ml-2 px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--text-tertiary)' }}
                        >
                          {team.code}
                        </span>
                      )}
                    </div>
                    {team.description && (
                      <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                        {team.description}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right panel: team detail ── */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
          {!selectedTeam ? (
            <div className="flex-1 flex flex-col items-center justify-center" style={{ color: 'var(--text-tertiary)' }}>
              <Users style={{ width: '48px', height: '48px', marginBottom: '12px', opacity: 0.4 }} />
              <p className="text-sm">Select a team to view its members</p>
            </div>
          ) : (
            <>
              {/* Team header */}
              <div
                className="border-b px-6 py-4 flex-shrink-0"
                style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--border-primary)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h2 className="text-lg font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {selectedTeam.name}
                      </h2>
                      {selectedTeam.code && (
                        <span
                          className="text-xs font-mono px-2 py-0.5 rounded flex-shrink-0"
                          style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--text-tertiary)' }}
                        >
                          {selectedTeam.code}
                        </span>
                      )}
                    </div>
                    {selectedTeam.description && (
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {selectedTeam.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors"
                      style={{
                        color: 'var(--text-secondary)',
                        backgroundColor: 'var(--surface-secondary)',
                        border: '1px solid var(--border-primary)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      <Pencil style={{ width: '13px', height: '13px' }} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(selectedTeam)}
                      disabled={deleteTeam.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50"
                      style={{
                        color: '#EF4444',
                        backgroundColor: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.2)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.15)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'; }}
                    >
                      <Trash2 style={{ width: '13px', height: '13px' }} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Members section */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Members sub-header */}
                <div
                  className="px-6 py-3 border-b flex items-center justify-between flex-shrink-0"
                  style={{ borderColor: 'var(--border-primary)' }}
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Members {!membersLoading && `(${members.length})`}
                  </span>
                  <button
                    onClick={() => setShowAddMemberModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-opacity hover:opacity-80"
                    style={{ backgroundColor: 'var(--accent-primary)', color: '#ffffff', fontWeight: 500 }}
                  >
                    <Plus style={{ width: '14px', height: '14px' }} />
                    Add Member
                  </button>
                </div>

                {/* Members table */}
                <div className="flex-1 overflow-auto">
                  {membersLoading ? (
                    <p className="text-sm text-center py-10" style={{ color: 'var(--text-tertiary)' }}>Loading members...</p>
                  ) : members.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12" style={{ color: 'var(--text-tertiary)' }}>
                      <p className="text-sm mb-2">No members in this team</p>
                      <button
                        onClick={() => setShowAddMemberModal(true)}
                        className="text-xs font-medium hover:opacity-70 transition-opacity"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        + Add first member
                      </button>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="sticky top-0 z-10" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                        <tr>
                          {['Member', 'Position', 'Team Role', 'Email', ''].map((col, i) => (
                            <th
                              key={i}
                              className={`px-6 py-3 text-xs uppercase tracking-wider ${i === 4 ? 'text-right' : 'text-left'}`}
                              style={{
                                color: 'var(--text-tertiary)',
                                fontWeight: 600,
                                borderBottom: '1px solid var(--border-primary)',
                              }}
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((m, idx) => {
                          const roleStyle = ROLE_STYLES[m.role] ?? ROLE_STYLES.member;
                          return (
                            <tr
                              key={m.membershipId}
                              className="transition-colors"
                              style={{
                                borderBottom: idx !== members.length - 1 ? '1px solid var(--border-primary)' : 'none',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                              {/* Member name + avatar */}
                              <td className="px-6 py-3">
                                <div className="flex items-center gap-3">
                                  <UserAvatar name={m.name} color={m.color} size="sm" />
                                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                    {m.name}
                                  </span>
                                </div>
                              </td>

                              {/* Position */}
                              <td className="px-6 py-3">
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                  {m.position || '—'}
                                </span>
                              </td>

                              {/* Team role dropdown */}
                              <td className="px-6 py-3">
                                <select
                                  value={m.role}
                                  onChange={(e) => handleRoleChange(m.userId, e.target.value as TeamRole)}
                                  disabled={updateMemberRole.isPending}
                                  className="text-xs font-medium capitalize rounded-full px-2.5 py-0.5 border-0 cursor-pointer disabled:opacity-50 focus:outline-none"
                                  style={{ backgroundColor: roleStyle.bg, color: roleStyle.color }}
                                >
                                  {TEAM_ROLES.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                  ))}
                                </select>
                              </td>

                              {/* Email */}
                              <td className="px-6 py-3">
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                  {m.email}
                                </span>
                              </td>

                              {/* Remove */}
                              <td className="px-6 py-3 text-right">
                                <button
                                  onClick={() => handleRemoveMember(m.userId, m.name)}
                                  disabled={removeMember.isPending}
                                  className="p-1.5 rounded-lg transition-colors inline-flex items-center justify-center disabled:opacity-50"
                                  style={{ color: 'var(--text-tertiary)' }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                                    e.currentTarget.style.color = '#EF4444';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-tertiary)';
                                  }}
                                  title="Remove from team"
                                >
                                  <X style={{ width: '16px', height: '16px' }} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateTeamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={(id) => setSelectedTeamId(id)}
      />

      {selectedTeam && (
        <EditTeamModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          team={selectedTeam}
        />
      )}

      {selectedTeamId && (
        <AddTeamMemberModal
          isOpen={showAddMemberModal}
          onClose={() => setShowAddMemberModal(false)}
          teamId={selectedTeamId}
          existingMemberIds={existingMemberIds}
        />
      )}
    </div>
  );
}
