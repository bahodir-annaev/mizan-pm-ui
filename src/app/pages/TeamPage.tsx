import { useState } from 'react';
import { X, UserPlus, UserCheck } from 'lucide-react';
import { SearchInput } from '../components/SearchInput';
import { UserAvatar } from '../components/UserAvatar';
import { AddMemberModal } from '../components/AddMemberModal';
import { useTranslation } from '../contexts/TranslationContext';
import { useUsers, useAssignUserToOrg } from '@/hooks/api/useUsers';
import { useAuth } from '../auth/AuthContext';

// interface TeamMember {
//   id: string;
//   name: string;
//   position: string;
//   email: string;
//   phone: string;
//   avatar?: string;
// }

export function TeamPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: teamMembers = [], isLoading, isError } = useUsers();
  const assignToOrg = useAssignUserToOrg();
  const { user: currentUser } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);

  // const teamMembers: TeamMember[] = [
  //   { id: '1', name: 'ABDULLA ABDULLAYEV', position: 'Дизайнер интерфейса', email: 'abdulla@gmail.com', phone: '+998936343555' },
  //   { id: '2', name: 'ADIZ SAIDOV', position: 'Grafik Dizayner', email: 'adizdesign017@gmail.com', phone: '+998995140117' },
  //   { id: '3', name: 'AZIZ MUJAMEDOV', position: 'Дизайнер интерфейса', email: 'Azizaall@gmail.com', phone: '+998890511188' },
  //   { id: '4', name: 'AZIZ OMINOV', position: 'Главный архитектор', email: 'avi3@gmail.com', phone: '+998946831191' },
  //   { id: '5', name: 'BEHJOD NIYAZOV', position: 'Менеджер', email: 'behzod@gmail.com', phone: '+998886668888' },
  //   { id: '6', name: 'DAVRON DJURAYEV', position: '3D-дь Visualization', email: 'davron.djurayev@gmail.com', phone: '+998974585093' },
  //   { id: '7', name: 'IBRSIM ISLOMOV', position: 'Архитектор', email: 'ibrsim@gmail.com', phone: '+998997923007' },
  //   { id: '8', name: 'ISKANDAR XUDOYEERDIYEV', position: 'Архитектор', email: 'iskandar@gmail.com', phone: '+998901234106' },
  //   { id: '9', name: 'ISLOM DJURAYEV', position: 'Визуализатор', email: 'islom.djurayev02@gmail.com', phone: '+998881440777' },
  //   { id: '10', name: 'JAHONGIR IROMOV', position: 'Директор', email: 'jahongir@gmail.com', phone: '+998797409607' },
  //   { id: '11', name: 'MIZAN ARCHITECTURE', position: 'info', email: 'info@mizanarchitect.uz', phone: '' },
  //   { id: '12', name: 'OLCHINNBEK OLIMOV', position: 'Interior Designer', email: 'olchinkek@gmail.com', phone: '+998799548865' },
  //   { id: '13', name: 'RAMZIDDIN MURITDINOV', position: 'Визуализатор', email: 'ramziddin@gmail.com', phone: '+998890424511' },
  //   { id: '14', name: 'Sanjar 2.5', position: 'Test', email: 'abdullayew@ya.ru', phone: '' },
  //   { id: '15', name: 'Sanjar Abdulganiev', position: 'Admin', email: 's.abdulganiev@gmail.com', phone: '+998888868098' },
  //   { id: '16', name: 'SARDOR XAKIMOV', position: 'Фэм', email: 'sardoruka5977@gmail.com', phone: '+998944322797' },
  // ];

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (member.position ?? member.role ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div 
        className="border-b px-8 py-6"
        style={{ 
          backgroundColor: 'var(--surface-primary)',
          borderColor: 'var(--border-primary)'
        }}
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
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff',
              fontWeight: 500
            }}
          >
            <UserPlus style={{ width: '16px', height: '16px' }} />
            Add Member
          </button>
        </div>

        {/* Search */}
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search team members..."
        />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-16" style={{ color: 'var(--text-tertiary)' }}>
            <p className="text-sm">Loading team members...</p>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-16" style={{ color: '#EF4444' }}>
            <p className="text-sm">Failed to load team members.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead
              className="sticky top-0 z-10"
              style={{ backgroundColor: 'var(--surface-secondary)' }}
            >
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs uppercase tracking-wider"
                  style={{
                    color: 'var(--text-tertiary)',
                    fontWeight: 600,
                    borderBottom: '1px solid var(--border-primary)'
                  }}
                >
                  Name
                </th>
                <th
                  className="px-6 py-3 text-left text-xs uppercase tracking-wider"
                  style={{
                    color: 'var(--text-tertiary)',
                    fontWeight: 600,
                    borderBottom: '1px solid var(--border-primary)'
                  }}
                >
                  Position
                </th>
                <th
                  className="px-6 py-3 text-left text-xs uppercase tracking-wider"
                  style={{
                    color: 'var(--text-tertiary)',
                    fontWeight: 600,
                    borderBottom: '1px solid var(--border-primary)'
                  }}
                >
                  Email
                </th>
                <th
                  className="px-6 py-3 text-left text-xs uppercase tracking-wider"
                  style={{
                    color: 'var(--text-tertiary)',
                    fontWeight: 600,
                    borderBottom: '1px solid var(--border-primary)'
                  }}
                >
                  Phone
                </th>
                <th
                  className="px-6 py-3 text-right text-xs uppercase tracking-wider"
                  style={{
                    color: 'var(--text-tertiary)',
                    fontWeight: 600,
                    borderBottom: '1px solid var(--border-primary)'
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member, index) => (
                <tr
                  key={member.id}
                  className="transition-colors"
                  style={{
                    borderBottom: index !== filteredMembers.length - 1 ? '1px solid var(--border-primary)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={member.name}
                        color={member.color}
                        size="md"
                      />
                      <span
                        className="text-sm"
                        style={{
                          color: 'var(--text-primary)',
                          fontWeight: 500
                        }}
                      >
                        {member.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {member.position ?? member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {member.email}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {member.phone || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!member.orgId && currentUser?.orgId && (
                        <button
                          onClick={() => assignToOrg.mutate({ userId: member.id, orgId: currentUser.orgId! })}
                          disabled={assignToOrg.isPending}
                          title="Add to organization"
                          className="p-2 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 text-xs font-medium disabled:opacity-50"
                          style={{
                            backgroundColor: 'var(--accent-primary)',
                            color: '#ffffff',
                          }}
                        >
                          <UserCheck style={{ width: '14px', height: '14px' }} />
                          Add to org
                        </button>
                      )}
                      <button
                        className="p-2 rounded-lg transition-colors inline-flex items-center justify-center"
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!isLoading && !isError && filteredMembers.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-16"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <p className="text-sm">No team members found</p>
          </div>
        )}
      </div>

      <AddMemberModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />

      {/* Footer Stats */}
      <div 
        className="border-t px-8 py-4"
        style={{ 
          backgroundColor: 'var(--surface-primary)',
          borderColor: 'var(--border-primary)'
        }}
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
