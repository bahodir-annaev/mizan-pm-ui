import { useState } from 'react';
import { Trash2, FolderOpen, CheckCircle, Clock, FileText, Mail, Filter, ChevronDown, Edit2, X, Phone, Building2, User, ExternalLink, ArrowUpDown, Search } from 'lucide-react';
import { SearchInput } from '../components/SearchInput';
import { UserAvatar } from '../components/UserAvatar';
import { useTranslation } from '../contexts/TranslationContext';
import { ClientDetail } from '../components/ClientDetail';
import { EditClientModal } from '../components/EditClientModal';
import { useClients } from '@/hooks/api/useClients';
import type { Client } from '@/types/domain';

type ClientTab = 'overview' | 'clients' | 'contacts';

export function ClientsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ClientTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const { data: filteredClients = [] } = useClients({ search: searchQuery || undefined });

  const AVATAR_COLORS = [
    '#5B9AFF', '#FFB547', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1'
  ];
  const getAvatarColor = (name: string) => AVATAR_COLORS[name.length % AVATAR_COLORS.length];

  // If a client is selected, show detail view
  if (selectedClient) {
    return <ClientDetail client={selectedClient} onBack={() => setSelectedClient(null)} />;
  }

  const tabs = [
    { key: 'overview' as const, label: 'Overview' },
    { key: 'clients' as const, label: 'Clients' },
    { key: 'contacts' as const, label: 'Contact Persons' },
  ];

  const stats = [
    {
      icon: Trash2,
      label: 'Total Clients',
      value: String(filteredClients.length),
      color: '#5B9AFF'
    },
    {
      icon: FolderOpen,
      label: 'Total Contacts',
      value: '0',
      color: '#FFB547'
    },
    {
      icon: CheckCircle,
      label: 'Contacts added today to the system',
      value: '0',
      color: '#5B9AFF'
    },
    {
      icon: Mail,
      label: 'Clients received in the system for the last 7 days',
      value: '0',
      color: '#5B9AFF'
    }
  ];

  const projectStats = [
    {
      icon: FolderOpen,
      label: 'Clients have open projects',
      value: '6',
      color: 'var(--text-secondary)'
    },
    {
      icon: CheckCircle,
      label: 'Clients have completed projects',
      value: '',
      color: 'var(--text-secondary)'
    },
    {
      icon: Clock,
      label: 'Clients have % received projects',
      value: '0',
      color: 'var(--text-secondary)'
    },
    {
      icon: FileText,
      label: 'Clients marked project',
      value: '1',
      color: 'var(--text-secondary)'
    }
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Edit Modal */}
      {editingClient && (
        <EditClientModal
          client={editingClient}
          onClose={() => setEditingClient(null)}
        />
      )}

      {/* Header with Tabs */}
      <div 
        className="border-b"
        style={{ 
          backgroundColor: 'var(--surface-primary)',
          borderColor: 'var(--border-primary)'
        }}
      >
        <div className="px-8 py-6">
          <h1 className="text-2xl mb-1" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            Clients
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Manage your clients and contacts
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center px-8 gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="pb-3 text-sm relative transition-colors"
              style={{
                color: activeTab === tab.key ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab.key ? 600 : 400
              }}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div 
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="p-6 rounded-xl"
                    style={{
                      backgroundColor: 'var(--surface-primary)',
                      border: '1px solid var(--border-primary)'
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: stat.color + '20' }}
                      >
                        <Icon style={{ width: '24px', height: '24px', color: stat.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-3xl mb-1" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                          {stat.value}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Projects Section */}
            <div
              className="rounded-xl p-6"
              style={{
                backgroundColor: 'var(--surface-primary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              <h2 className="text-lg mb-4" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                Projects
              </h2>

              <div className="space-y-3">
                {projectStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg"
                      style={{ backgroundColor: 'var(--surface-secondary)' }}
                    >
                      <div className="flex items-center gap-3">
                        <Icon style={{ width: '20px', height: '20px', color: stat.color }} />
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          {stat.label}
                        </span>
                      </div>
                      {stat.value && (
                        <span 
                          className="text-sm px-3 py-1 rounded-full"
                          style={{ 
                            backgroundColor: 'var(--accent-primary)',
                            color: '#ffffff',
                            fontWeight: 600
                          }}
                        >
                          {stat.value}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Clients Table */}
        {activeTab === 'clients' && (
          <div>
            {/* Filters and Search */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex items-center gap-3">
                <button
                  className="px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)'
                  }}
                >
                  <Filter style={{ width: '16px', height: '16px' }} />
                  Quick Filters
                  <ChevronDown style={{ width: '16px', height: '16px' }} />
                </button>

                <button
                  className="px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)'
                  }}
                >
                  Owner
                  <ChevronDown style={{ width: '16px', height: '16px' }} />
                </button>

                <button
                  className="px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)'
                  }}
                >
                  Client Group
                  <ChevronDown style={{ width: '16px', height: '16px' }} />
                </button>

                <button
                  className="px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)'
                  }}
                >
                  Language
                  <ChevronDown style={{ width: '16px', height: '16px' }} />
                </button>
              </div>

              <div className="flex-1" />

              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search clients..."
                width={250}
              />
            </div>

            {/* Table */}
            <div
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: 'var(--surface-primary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              <table className="w-full">
                <thead style={{ backgroundColor: 'var(--surface-secondary)' }}>
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs uppercase tracking-wider"
                      style={{ 
                        color: 'var(--text-tertiary)',
                        fontWeight: 600,
                        borderBottom: '1px solid var(--border-primary)'
                      }}
                    >
                      ID
                    </th>
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
                      Primary Contact
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
                      className="px-6 py-3 text-left text-xs uppercase tracking-wider"
                      style={{ 
                        color: 'var(--text-tertiary)',
                        fontWeight: 600,
                        borderBottom: '1px solid var(--border-primary)'
                      }}
                    >
                      Client Group
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs uppercase tracking-wider"
                      style={{ 
                        color: 'var(--text-tertiary)',
                        fontWeight: 600,
                        borderBottom: '1px solid var(--border-primary)'
                      }}
                    >
                      Labels
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs uppercase tracking-wider"
                      style={{ 
                        color: 'var(--text-tertiary)',
                        fontWeight: 600,
                        borderBottom: '1px solid var(--border-primary)'
                      }}
                    >
                      Projects
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
                  {filteredClients.map((client, index) => (
                    <tr 
                      key={client.id}
                      className="transition-colors"
                      style={{
                        borderBottom: index !== filteredClients.length - 1 ? '1px solid var(--border-primary)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                        setHoveredRow(client.id);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        setHoveredRow(null);
                      }}
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {client.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedClient(client)}
                          className="flex items-center gap-3 w-full text-left transition-opacity"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.8';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1';
                          }}
                        >
                          <UserAvatar
                            name={client.name}
                            color={getAvatarColor(client.name)}
                            size="md"
                          />
                          {/* Name */}
                          <div className="flex flex-col">
                            <span 
                              className="text-sm hover:underline"
                              style={{ 
                                color: 'var(--text-primary)',
                                fontWeight: 500
                              }}
                            >
                              {client.name}
                            </span>
                          </div>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {client.contactPerson ? (
                            <>
                              <User style={{ width: '14px', height: '14px', color: 'var(--text-tertiary)' }} />
                              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {client.contactPerson}
                              </span>
                            </>
                          ) : (
                            <span 
                              className="text-xs italic"
                              style={{ color: 'var(--text-tertiary)', opacity: 0.6 }}
                            >
                              Not specified
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {client.phone ? (
                            <>
                              <Phone style={{ width: '14px', height: '14px', color: 'var(--text-tertiary)' }} />
                              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {client.phone}
                              </span>
                            </>
                          ) : (
                            <span 
                              className="text-xs italic"
                              style={{ color: 'var(--text-tertiary)', opacity: 0.6 }}
                            >
                              Not specified
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-xs italic"
                          style={{ color: 'var(--text-tertiary)', opacity: 0.6 }}
                        >
                          Not specified
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-xs italic"
                          style={{ color: 'var(--text-tertiary)', opacity: 0.6 }}
                        >
                          No labels
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {(client.projectCount ?? 0) > 0 ? (
                          <div className="flex items-center gap-2">
                            <span
                              className="px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-2"
                              style={{
                                backgroundColor: (client.projectCount ?? 0) >= 10
                                  ? '#10B98120'
                                  : '#5B9AFF20',
                                color: (client.projectCount ?? 0) >= 10
                                  ? '#10B981'
                                  : '#5B9AFF',
                                fontWeight: 600,
                                border: `1px solid ${(client.projectCount ?? 0) >= 10 ? '#10B98130' : '#5B9AFF30'}`
                              }}
                            >
                              <FolderOpen style={{ width: '14px', height: '14px' }} />
                              {client.projectCount}
                            </span>
                          </div>
                        ) : (
                          <span
                            className="text-sm px-3 py-1.5 rounded-lg inline-block"
                            style={{ color: 'var(--text-tertiary)', backgroundColor: 'var(--surface-secondary)' }}
                          >
                            0
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end">
                          <button
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: 'var(--text-tertiary)' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                              e.currentTarget.style.color = 'var(--accent-primary)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = 'var(--text-tertiary)';
                            }}
                            onClick={() => setEditingClient(client)}
                          >
                            <Edit2 style={{ width: '18px', height: '18px' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredClients.length === 0 && (
                <div 
                  className="flex flex-col items-center justify-center py-16"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  <Search style={{ width: '48px', height: '48px', marginBottom: '12px', opacity: 0.3 }} />
                  <p className="text-sm">No clients found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}