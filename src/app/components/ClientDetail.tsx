import { useState } from 'react';
import { ArrowLeft, Star, Users, FileText, FolderOpen, CheckSquare, Paperclip, Calendar, Plus, Building2, User, MapPin, Phone, Hash, ChevronDown, HelpCircle, Check } from 'lucide-react';
import { ProjectDetail } from './ProjectDetail';

interface ClientDetailProps {
  client: {
    id: number;
    name: string;
    contactPerson: string;
    phone: string;
    group: string;
    labels: string[];
    projectsCount: number;
  };
  onBack: () => void;
}

type DetailTab = 'contacts' | 'info' | 'projects' | 'tasks' | 'files' | 'events';

export function ClientDetail({ client, onBack }: ClientDetailProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('contacts');
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedProject, setSelectedProject] = useState<{ id: string; name: string; badge?: string } | null>(null);
  
  // Form state for Client Information tab
  const [clientType, setClientType] = useState<'organization' | 'person'>('organization');
  const [formData, setFormData] = useState({
    companyName: client.name,
    owner: 'MIZAN ARCHITECTURE',
    address: 'Markaz',
    city: 'Toshkent',
    state: 'Штат',
    postalCode: '100000',
    country: 'Узбекистан',
    phone: client.phone || '+96888882332',
    website: 'Сайт',
    vatNumber: 'Регистрационный номер плательщика НДС',
    gstNumber: 'Номер GST',
    clientGroups: client.group || 'Группы клиентов',
    labels: client.labels.join(', ') || 'Ярлыки'
  });

  const handleSaveClientInfo = () => {
    console.log('Saving client info:', formData);
    // Here you would typically update the client data
  };

  // If a project is selected, show project detail view
  if (selectedProject) {
    return <ProjectDetail project={selectedProject} clientName={client.name} onBack={() => setSelectedProject(null)} />;
  }

  const tabs = [
    { key: 'contacts' as const, label: 'Contact Persons', icon: Users },
    { key: 'info' as const, label: 'Client Information', icon: FileText },
    { key: 'projects' as const, label: 'Projects', icon: FolderOpen },
    { key: 'tasks' as const, label: 'Tasks', icon: CheckSquare },
    { key: 'files' as const, label: 'Files', icon: Paperclip },
    { key: 'events' as const, label: 'Events', icon: Calendar },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div 
        className="border-b"
        style={{ 
          backgroundColor: 'var(--surface-primary)',
          borderColor: 'var(--border-primary)'
        }}
      >
        {/* Top Bar */}
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                e.currentTarget.style.color = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <ArrowLeft style={{ width: '20px', height: '20px' }} />
            </button>
            
            <div className="flex items-center gap-3">
              <h1 
                className="text-xl"
                style={{ 
                  color: 'var(--text-primary)',
                  fontWeight: 600
                }}
              >
                Client Information - {client.name}
              </h1>
              
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-1 transition-colors"
                style={{ 
                  color: isFavorite ? '#FFB547' : 'var(--text-tertiary)'
                }}
              >
                <Star 
                  style={{ 
                    width: '18px', 
                    height: '18px',
                    fill: isFavorite ? '#FFB547' : 'none'
                  }} 
                />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="px-4 py-2 rounded-lg text-sm transition-colors"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
              }}
            >
              Notifications
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center px-8 gap-6" style={{ borderTop: '1px solid var(--border-primary)' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="py-3 text-sm relative transition-colors flex items-center gap-2"
                style={{
                  color: activeTab === tab.key ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: activeTab === tab.key ? 600 : 400
                }}
              >
                <Icon style={{ width: '16px', height: '16px' }} />
                {tab.label}
                {activeTab === tab.key && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Contact Persons Tab */}
        {activeTab === 'contacts' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 
                className="text-lg"
                style={{ 
                  color: 'var(--text-primary)',
                  fontWeight: 600
                }}
              >
                Contact Persons
              </h2>
              
              <div className="flex items-center gap-3">
                <button
                  className="px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: '#ffffff',
                    fontWeight: 500
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  Send invitation
                </button>

                <button
                  className="px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: '#ffffff',
                    fontWeight: 500
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  Add contact person
                </button>
              </div>
            </div>

            {/* Empty State */}
            <div
              className="rounded-xl p-16 flex flex-col items-center justify-center"
              style={{
                backgroundColor: 'var(--surface-primary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{
                  backgroundColor: 'var(--surface-secondary)'
                }}
              >
                <Users 
                  style={{ 
                    width: '32px', 
                    height: '32px',
                    color: 'var(--text-tertiary)',
                    opacity: 0.5
                  }} 
                />
              </div>
              
              <h3 
                className="text-base mb-2"
                style={{ 
                  color: 'var(--text-primary)',
                  fontWeight: 500
                }}
              >
                No contact persons found
              </h3>
              
              <p 
                className="text-sm mb-6"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Add contact persons to start collaborating with this client
              </p>

              <button
                className="px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff',
                  fontWeight: 500
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                Add first contact
              </button>
            </div>
          </div>
        )}

        {/* Client Information Tab */}
        {activeTab === 'info' && (
          <div>
            <h2 
              className="text-lg mb-6"
              style={{ 
                color: 'var(--text-primary)',
                fontWeight: 600
              }}
            >
              Информация о клиенте
            </h2>

            <div className="space-y-8">
              {/* Type Selection - Card Style */}
              <div>
                <label 
                  className="text-sm mb-3 block"
                  style={{ 
                    color: 'var(--text-secondary)',
                    fontWeight: 500
                  }}
                >
                  Тип
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setClientType('organization')}
                    className="p-4 rounded-xl transition-all"
                    style={{
                      backgroundColor: clientType === 'organization' 
                        ? 'var(--accent-primary)' + '15' 
                        : 'var(--surface-primary)',
                      border: `2px solid ${clientType === 'organization' 
                        ? 'var(--accent-primary)' 
                        : 'var(--border-primary)'}`,
                      cursor: 'pointer'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: clientType === 'organization'
                            ? 'var(--accent-primary)'
                            : 'var(--surface-secondary)',
                          color: clientType === 'organization'
                            ? '#ffffff'
                            : 'var(--text-tertiary)'
                        }}
                      >
                        <Building2 style={{ width: '20px', height: '20px' }} />
                      </div>
                      <div className="text-left">
                        <div 
                          className="text-sm mb-0.5"
                          style={{ 
                            color: 'var(--text-primary)',
                            fontWeight: 600
                          }}
                        >
                          Организация
                        </div>
                        <div 
                          className="text-xs"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          Компания или бизнес
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setClientType('person')}
                    className="p-4 rounded-xl transition-all"
                    style={{
                      backgroundColor: clientType === 'person' 
                        ? 'var(--accent-primary)' + '15' 
                        : 'var(--surface-primary)',
                      border: `2px solid ${clientType === 'person' 
                        ? 'var(--accent-primary)' 
                        : 'var(--border-primary)'}`,
                      cursor: 'pointer'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: clientType === 'person'
                            ? 'var(--accent-primary)'
                            : 'var(--surface-secondary)',
                          color: clientType === 'person'
                            ? '#ffffff'
                            : 'var(--text-tertiary)'
                        }}
                      >
                        <User style={{ width: '20px', height: '20px' }} />
                      </div>
                      <div className="text-left">
                        <div 
                          className="text-sm mb-0.5"
                          style={{ 
                            color: 'var(--text-primary)',
                            fontWeight: 600
                          }}
                        >
                          Человек
                        </div>
                        <div 
                          className="text-xs"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          Частное лицо
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Basic Information Section */}
              <div
                className="p-6 rounded-xl space-y-5"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Building2 
                    style={{ 
                      width: '18px', 
                      height: '18px',
                      color: 'var(--accent-primary)'
                    }} 
                  />
                  <h3 
                    className="text-sm"
                    style={{ 
                      color: 'var(--text-primary)',
                      fontWeight: 600
                    }}
                  >
                    Основная информация
                  </h3>
                </div>

                {/* Company Name */}
                <div>
                  <label 
                    className="text-sm mb-2 block"
                    style={{ 
                      color: 'var(--text-secondary)',
                      fontWeight: 500
                    }}
                  >
                    Название компании
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg text-sm transition-all"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-primary)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-primary)' + '15';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Owner */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label 
                      className="text-sm"
                      style={{ 
                        color: 'var(--text-secondary)',
                        fontWeight: 500
                      }}
                    >
                      Владелец
                    </label>
                    <HelpCircle 
                      style={{ 
                        width: '14px', 
                        height: '14px',
                        color: 'var(--text-tertiary)'
                      }} 
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={formData.owner}
                      onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg text-sm appearance-none cursor-pointer transition-all"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-primary)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-primary)' + '15';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <option>MIZAN ARCHITECTURE</option>
                      <option>Other Owner 1</option>
                      <option>Other Owner 2</option>
                    </select>
                    <ChevronDown 
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '16px',
                        height: '16px',
                        color: 'var(--text-tertiary)',
                        pointerEvents: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Location Information Section */}
              <div
                className="p-6 rounded-xl space-y-5"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <MapPin 
                    style={{ 
                      width: '18px', 
                      height: '18px',
                      color: 'var(--accent-primary)'
                    }} 
                  />
                  <h3 
                    className="text-sm"
                    style={{ 
                      color: 'var(--text-primary)',
                      fontWeight: 600
                    }}
                  >
                    Местоположение
                  </h3>
                </div>

                {/* Address */}
                <div>
                  <label 
                    className="text-sm mb-2 block"
                    style={{ 
                      color: 'var(--text-secondary)',
                      fontWeight: 500
                    }}
                  >
                    Адрес
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg text-sm resize-none transition-all"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-primary)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-primary)' + '15';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* City */}
                  <div>
                    <label 
                      className="text-sm mb-2 block"
                      style={{ 
                        color: 'var(--text-secondary)',
                        fontWeight: 500
                      }}
                    >
                      Город
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg text-sm transition-all"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-primary)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-primary)' + '15';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label 
                      className="text-sm mb-2 block"
                      style={{ 
                        color: 'var(--text-secondary)',
                        fontWeight: 500
                      }}
                    >
                      Штат
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Штат"
                      className="w-full px-4 py-3 rounded-lg text-sm transition-all"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-primary)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-primary)' + '15';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Postal Code */}
                  <div>
                    <label 
                      className="text-sm mb-2 block"
                      style={{ 
                        color: 'var(--text-secondary)',
                        fontWeight: 500
                      }}
                    >
                      Индекс
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg text-sm transition-all"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-primary)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-primary)' + '15';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label 
                      className="text-sm mb-2 block"
                      style={{ 
                        color: 'var(--text-secondary)',
                        fontWeight: 500
                      }}
                    >
                      Страна
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg text-sm transition-all"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-primary)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-primary)' + '15';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div
                className="p-6 rounded-xl space-y-5"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Phone 
                    style={{ 
                      width: '18px', 
                      height: '18px',
                      color: 'var(--accent-primary)'
                    }} 
                  />
                  <h3 
                    className="text-sm"
                    style={{ 
                      color: 'var(--text-primary)',
                      fontWeight: 600
                    }}
                  >
                    Контактная информация
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label 
                      className="text-sm mb-2 block"
                      style={{ 
                        color: 'var(--text-secondary)',
                        fontWeight: 500
                      }}
                    >
                      Телефон
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg text-sm transition-all"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-primary)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-primary)' + '15';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label 
                      className="text-sm mb-2 block"
                      style={{ 
                        color: 'var(--text-secondary)',
                        fontWeight: 500
                      }}
                    >
                      Сайт
                    </label>
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 rounded-lg text-sm transition-all"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-primary)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-primary)' + '15';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information Section */}
              <div
                className="p-6 rounded-xl space-y-5"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Hash 
                    style={{ 
                      width: '18px', 
                      height: '18px',
                      color: 'var(--accent-primary)'
                    }} 
                  />
                  <h3 
                    className="text-sm"
                    style={{ 
                      color: 'var(--text-primary)',
                      fontWeight: 600
                    }}
                  >
                    Дополнительная информация
                  </h3>
                </div>

                {/* VAT Number */}
                <div>
                  <label 
                    className="text-sm mb-2 block"
                    style={{ 
                      color: 'var(--text-secondary)',
                      fontWeight: 500
                    }}
                  >
                    Регистрационный номер плательщика НДС
                  </label>
                  <input
                    type="text"
                    value={formData.vatNumber}
                    onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                    placeholder="Введите номер НДС"
                    className="w-full px-4 py-3 rounded-lg text-sm transition-all"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-primary)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-primary)' + '15';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* GST Number */}
                <div>
                  <label 
                    className="text-sm mb-2 block"
                    style={{ 
                      color: 'var(--text-secondary)',
                      fontWeight: 500
                    }}
                  >
                    Номер GST
                  </label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    placeholder="Введите номер GST"
                    className="w-full px-4 py-3 rounded-lg text-sm transition-all"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-primary)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-primary)' + '15';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Client Groups */}
                  <div>
                    <label 
                      className="text-sm mb-2 block"
                      style={{ 
                        color: 'var(--text-secondary)',
                        fontWeight: 500
                      }}
                    >
                      Группы клиентов
                    </label>
                    <input
                      type="text"
                      value={formData.clientGroups}
                      onChange={(e) => setFormData({ ...formData, clientGroups: e.target.value })}
                      placeholder="Группа"
                      className="w-full px-4 py-3 rounded-lg text-sm transition-all"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-primary)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-primary)' + '15';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Labels */}
                  <div>
                    <label 
                      className="text-sm mb-2 block"
                      style={{ 
                        color: 'var(--text-secondary)',
                        fontWeight: 500
                      }}
                    >
                      Ярлыки
                    </label>
                    <input
                      type="text"
                      value={formData.labels}
                      onChange={(e) => setFormData({ ...formData, labels: e.target.value })}
                      placeholder="Введите ярлыки"
                      className="w-full px-4 py-3 rounded-lg text-sm transition-all"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-primary)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-primary)' + '15';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-start pt-4">
                <button
                  onClick={handleSaveClientInfo}
                  className="px-6 py-3 rounded-lg text-sm transition-opacity flex items-center gap-2"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: '#ffffff',
                    fontWeight: 600
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <Check style={{ width: '16px', height: '16px' }} />
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 
                className="text-lg"
                style={{ 
                  color: 'var(--text-primary)',
                  fontWeight: 600
                }}
              >
                Проекты
              </h2>
              
              <button
                className="px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff',
                  fontWeight: 500
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                Создать новый проект
              </button>
            </div>

            {/* Filters */}
            <div 
              className="mb-4 p-4 rounded-xl flex items-center justify-between gap-4"
              style={{
                backgroundColor: 'var(--surface-primary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              <div className="flex items-center gap-4">
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Фильтр:</span>
                <button
                  className="px-3 py-1.5 rounded-lg text-xs transition-colors"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-primary)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                  }}
                >
                  Год
                </button>
                <button
                  className="px-3 py-1.5 rounded-lg text-xs transition-colors"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-primary)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                  }}
                >
                  Статус
                </button>
              </div>

              <div className="flex items-center gap-4">
                <button className="text-xs transition-colors" style={{ color: 'var(--text-tertiary)' }}>Excel</button>
                <button className="text-xs transition-colors" style={{ color: 'var(--text-tertiary)' }}>Печать</button>
                <button className="text-xs transition-colors" style={{ color: 'var(--text-tertiary)' }}>Поиск</button>
              </div>
            </div>

            {/* Projects Table */}
            <div
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: 'var(--surface-primary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: 'var(--surface-secondary)' }}>
                      <th className="px-4 py-3 text-left text-xs" style={{ color: 'var(--text-tertiary)', fontWeight: 500, borderBottom: '1px solid var(--border-primary)' }}>ID</th>
                      <th className="px-4 py-3 text-left text-xs" style={{ color: 'var(--text-tertiary)', fontWeight: 500, borderBottom: '1px solid var(--border-primary)' }}>Заглавние</th>
                      <th className="px-4 py-3 text-left text-xs" style={{ color: 'var(--text-tertiary)', fontWeight: 500, borderBottom: '1px solid var(--border-primary)' }}>Цена</th>
                      <th className="px-4 py-3 text-left text-xs" style={{ color: 'var(--text-tertiary)', fontWeight: 500, borderBottom: '1px solid var(--border-primary)' }}>Дата начала</th>
                      <th className="px-4 py-3 text-left text-xs" style={{ color: 'var(--text-tertiary)', fontWeight: 500, borderBottom: '1px solid var(--border-primary)' }}>Крайний срок</th>
                      <th className="px-4 py-3 text-left text-xs" style={{ color: 'var(--text-tertiary)', fontWeight: 500, borderBottom: '1px solid var(--border-primary)' }}>Приоритет</th>
                      <th className="px-4 py-3 text-left text-xs" style={{ color: 'var(--text-tertiary)', fontWeight: 500, borderBottom: '1px solid var(--border-primary)' }}>Статус</th>
                      <th className="px-4 py-3 text-left text-xs" style={{ color: 'var(--text-tertiary)', fontWeight: 500, borderBottom: '1px solid var(--border-primary)' }}>Площадь</th>
                      <th className="px-4 py-3 text-left text-xs" style={{ color: 'var(--text-tertiary)', fontWeight: 500, borderBottom: '1px solid var(--border-primary)' }}>Кадастр</th>
                      <th className="px-4 py-3 text-left text-xs" style={{ color: 'var(--text-tertiary)', fontWeight: 500, borderBottom: '1px solid var(--border-primary)' }}>Год</th>
                      <th className="px-4 py-3 text-left text-xs" style={{ color: 'var(--text-tertiary)', fontWeight: 500, borderBottom: '1px solid var(--border-primary)' }}>Стоимость</th>
                      <th className="px-4 py-3 text-left text-xs" style={{ color: 'var(--text-tertiary)', fontWeight: 500, borderBottom: '1px solid var(--border-primary)' }}>Тип</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: '211', name: 'Entrance', startDate: '2025-12-22', deadline: '2025-12-24', status: 'Открытый', area: 'м²', type: 'Дизайн' },
                      { id: '207', name: 'Masala xarajart taxciti', badge: 'Xorijdan', startDate: '2025-12-10', status: 'Открытый', year: '2025', type: 'Дизайн' },
                      { id: '203', name: 'House 100 sf+msr', startDate: '2025-12-03', status: 'Открытый', area: 'м²', type: 'Дизайн' },
                      { id: '201', name: 'Nufus P residence', startDate: '2025-12-01', status: 'Открытый', area: 'м²', type: 'Дизайн' },
                      { id: '200', name: 'House Jahongir aka Rakdi', startDate: '2025-12-01', status: 'Открытый', area: 'м²', type: 'Дизайн' },
                      { id: '199', name: 'House Sherzoq aka Limonsxaya', startDate: '2025-12-01', status: 'Открытый', area: 'м²', type: 'Дизайн' },
                      { id: '198', name: 'Atelier Neva! mashrabat', startDate: '2025-11-26', deadline: '2025-11-27', deadlineOverdue: true, status: 'Открытый', area: 'Комплект', type: 'Дизайн' },
                      { id: '197', name: 'Ilxom M Beamly dericus va kamil nohli', badge: 'Xorijdan', startDate: '2025-11-13', status: 'Открытый', year: '2025', type: 'Дизайн' },
                    ].map((project) => (
                      <tr 
                        key={project.id}
                        className="transition-colors"
                        style={{ borderBottom: '1px solid var(--border-primary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <td className="px-4 py-3">
                          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{project.id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => setSelectedProject({ id: project.id, name: project.name, badge: project.badge })}
                              className="text-sm cursor-pointer hover:underline text-left transition-opacity"
                              style={{ color: 'var(--text-primary)' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '0.8';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '1';
                              }}
                            >
                              {project.name}
                            </button>
                            {project.badge && (
                              <span className="px-2 py-0.5 rounded text-xs w-fit" style={{ backgroundColor: 'var(--accent-primary)' + '20', color: 'var(--accent-primary)', fontWeight: 500 }}>
                                {project.badge}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className="text-sm" style={{ color: 'var(--text-secondary)' }}>-</span></td>
                        <td className="px-4 py-3"><span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{project.startDate}</span></td>
                        <td className="px-4 py-3">
                          {project.deadline ? (
                            <span className="text-xs" style={{ color: project.deadlineOverdue ? '#EF4444' : 'var(--text-secondary)' }}>{project.deadline}</span>
                          ) : (
                            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>-</span>
                          )}
                        </td>
                        <td className="px-4 py-3"><span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>-</span></td>
                        <td className="px-4 py-3"><span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{project.status}</span></td>
                        <td className="px-4 py-3"><span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{project.area || '-'}</span></td>
                        <td className="px-4 py-3"><span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>-</span></td>
                        <td className="px-4 py-3"><span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{project.year || '-'}</span></td>
                        <td className="px-4 py-3"><span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>-</span></td>
                        <td className="px-4 py-3"><span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{project.type}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-4 py-3 flex items-center justify-between border-t" style={{ borderColor: 'var(--border-primary)' }}>
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Показано 8 из 8 проектов</span>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 rounded text-xs" style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }}>Назад</button>
                  <button className="px-3 py-1 rounded text-xs" style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }}>Вперед</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 
                className="text-lg"
                style={{ 
                  color: 'var(--text-primary)',
                  fontWeight: 600
                }}
              >
                Tasks
              </h2>
              
              <button
                className="px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff',
                  fontWeight: 500
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                Create new task
              </button>
            </div>

            <div
              className="rounded-xl p-16 flex flex-col items-center justify-center"
              style={{
                backgroundColor: 'var(--surface-primary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{
                  backgroundColor: 'var(--surface-secondary)'
                }}
              >
                <CheckSquare 
                  style={{ 
                    width: '32px', 
                    height: '32px',
                    color: 'var(--text-tertiary)',
                    opacity: 0.5
                  }} 
                />
              </div>
              
              <h3 
                className="text-base mb-2"
                style={{ 
                  color: 'var(--text-primary)',
                  fontWeight: 500
                }}
              >
                No tasks found
              </h3>
              
              <p 
                className="text-sm mb-6"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Create tasks to manage work for this client
              </p>

              <button
                className="px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff',
                  fontWeight: 500
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                Create task
              </button>
            </div>
          </div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 
                className="text-lg"
                style={{ 
                  color: 'var(--text-primary)',
                  fontWeight: 600
                }}
              >
                Files
              </h2>
              
              <button
                className="px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff',
                  fontWeight: 500
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                Upload file
              </button>
            </div>

            <div
              className="rounded-xl p-16 flex flex-col items-center justify-center"
              style={{
                backgroundColor: 'var(--surface-primary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{
                  backgroundColor: 'var(--surface-secondary)'
                }}
              >
                <Paperclip 
                  style={{ 
                    width: '32px', 
                    height: '32px',
                    color: 'var(--text-tertiary)',
                    opacity: 0.5
                  }} 
                />
              </div>
              
              <h3 
                className="text-base mb-2"
                style={{ 
                  color: 'var(--text-primary)',
                  fontWeight: 500
                }}
              >
                No files uploaded
              </h3>
              
              <p 
                className="text-sm mb-6"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Upload documents and files for this client
              </p>

              <button
                className="px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff',
                  fontWeight: 500
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                Upload file
              </button>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 
                className="text-lg"
                style={{ 
                  color: 'var(--text-primary)',
                  fontWeight: 600
                }}
              >
                Events
              </h2>
              
              <button
                className="px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff',
                  fontWeight: 500
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                Create event
              </button>
            </div>

            <div
              className="rounded-xl p-16 flex flex-col items-center justify-center"
              style={{
                backgroundColor: 'var(--surface-primary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{
                  backgroundColor: 'var(--surface-secondary)'
                }}
              >
                <Calendar 
                  style={{ 
                    width: '32px', 
                    height: '32px',
                    color: 'var(--text-tertiary)',
                    opacity: 0.5
                  }} 
                />
              </div>
              
              <h3 
                className="text-base mb-2"
                style={{ 
                  color: 'var(--text-primary)',
                  fontWeight: 500
                }}
              >
                No events scheduled
              </h3>
              
              <p 
                className="text-sm mb-6"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Schedule meetings and events with this client
              </p>

              <button
                className="px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff',
                  fontWeight: 500
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                Create event
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}