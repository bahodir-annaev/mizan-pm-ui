import { useState } from 'react';
import { Trash2, FolderOpen, CheckCircle, Clock, FileText, Mail, Search, Filter, ChevronDown, Edit2, X, Phone, Building2, User, ExternalLink, ArrowUpDown } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import { ClientDetail } from './ClientDetail';
import { EditClientModal } from './EditClientModal';

type ClientTab = 'overview' | 'clients' | 'contacts';

interface Client {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  group: string;
  labels: string[];
  projectsCount: number;
}

export function Clients() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ClientTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const clientsData: Client[] = [
    { id: 1, name: 'Discover Invest', contactPerson: '', phone: '+998888828532', group: '', labels: [], projectsCount: 114 },
    { id: 4, name: 'Prime-tower group', contactPerson: '', phone: '', group: '', labels: [], projectsCount: 0 },
    { id: 5, name: 'Usbekcom', contactPerson: '', phone: '', group: '', labels: [], projectsCount: 0 },
    { id: 6, name: '5QB', contactPerson: '', phone: '', group: '', labels: [], projectsCount: 1 },
    { id: 7, name: 'Toshkent shahar hokimiyati', contactPerson: '', phone: '71 210 03 47', group: '', labels: ['client'], projectsCount: 1 },
    { id: 8, name: 'Xurshid aka', contactPerson: '', phone: '', group: '', labels: [], projectsCount: 0 },
    { id: 9, name: 'ГП ООО «GLOBAL OPTICAL COMMUNICATION UZBEKISTAN»', contactPerson: '', phone: '', group: '', labels: [], projectsCount: 1 },
    { id: 10, name: 'Senjar aka', contactPerson: '', phone: '', group: '', labels: [], projectsCount: 1 },
    { id: 11, name: 'MANAR Development', contactPerson: '', phone: '', group: '', labels: [], projectsCount: 0 },
    { id: 12, name: 'CHORSU REAL ESTATE Development', contactPerson: '', phone: '', group: '', labels: [], projectsCount: 0 },
    { id: 13, name: 'Nodir aka MB', contactPerson: '', phone: '', group: '', labels: [], projectsCount: 1 },
    { id: 14, name: 'jahongir aka Uzneftkam', contactPerson: '', phone: '', group: '', labels: [], projectsCount: 0 },
    { id: 15, name: 'Autonet rzevniy', contactPerson: '', phone: '', group: '', labels: [], projectsCount: 1 },
  ];

  const filteredClients = clientsData.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper function to get initials
  const getInitials = (name: string) => {
    const words = name.split(' ').filter(word => word.length > 0);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Helper function to get color for avatar
  const getAvatarColor = (name: string) => {
    const colors = [
      '#5B9AFF', '#FFB547', '#10B981', '#F59E0B', '#EF4444',
      '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

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
      value: '13',
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
          onSave={(data) => {
            console.log('Saving client data:', data);
            // Here you would typically update the client data
            setEditingClient(null);
          }}
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

              <div className="relative">
                <Search 
                  style={{ 
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '18px',
                    height: '18px',
                    color: 'var(--text-tertiary)'
                  }}
                />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)',
                    width: '250px'
                  }}
                />
              </div>
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
                          {/* Avatar */}
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: getAvatarColor(client.name) + '20',
                              color: getAvatarColor(client.name),
                              fontWeight: 600,
                              fontSize: '13px'
                            }}
                          >
                            {getInitials(client.name)}
                          </div>
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
                        <div className="flex items-center gap-2">
                          {client.group ? (
                            <>
                              <Building2 style={{ width: '14px', height: '14px', color: 'var(--text-tertiary)' }} />
                              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {client.group}
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
                        {client.labels.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {client.labels.map((label, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-full text-xs"
                                style={{
                                  backgroundColor: 'var(--accent-primary)' + '20',
                                  color: 'var(--accent-primary)',
                                  fontWeight: 500,
                                  border: '1px solid ' + 'var(--accent-primary)' + '30'
                                }}
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span 
                            className="text-xs italic"
                            style={{ color: 'var(--text-tertiary)', opacity: 0.6 }}
                          >
                            No labels
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {client.projectsCount > 0 ? (
                          <div className="flex items-center gap-2">
                            <span
                              className="px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-2"
                              style={{
                                backgroundColor: client.projectsCount >= 10 
                                  ? '#10B98120' 
                                  : client.projectsCount >= 1 
                                    ? '#5B9AFF20' 
                                    : 'var(--surface-secondary)',
                                color: client.projectsCount >= 10 
                                  ? '#10B981' 
                                  : client.projectsCount >= 1 
                                    ? '#5B9AFF' 
                                    : 'var(--text-secondary)',
                                fontWeight: 600,
                                border: `1px solid ${
                                  client.projectsCount >= 10 
                                    ? '#10B98130' 
                                    : client.projectsCount >= 1 
                                      ? '#5B9AFF30' 
                                      : 'var(--border-primary)'
                                }`
                              }}
                            >
                              <FolderOpen style={{ width: '14px', height: '14px' }} />
                              {client.projectsCount}
                            </span>
                          </div>
                        ) : (
                          <span 
                            className="text-sm px-3 py-1.5 rounded-lg inline-block"
                            style={{ 
                              color: 'var(--text-tertiary)',
                              backgroundColor: 'var(--surface-secondary)'
                            }}
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