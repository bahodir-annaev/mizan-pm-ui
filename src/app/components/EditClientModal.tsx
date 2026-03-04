import { useState } from 'react';
import { X, Check, ChevronDown, HelpCircle, Building2, User, MapPin, Globe, Phone, Hash, Tag } from 'lucide-react';

interface EditClientModalProps {
  client: {
    id: number;
    name: string;
    contactPerson: string;
    phone: string;
    group: string;
    labels: string[];
    projectsCount: number;
  };
  onClose: () => void;
  onSave: (data: any) => void;
}

export function EditClientModal({ client, onClose, onSave }: EditClientModalProps) {
  const [clientType, setClientType] = useState<'organization' | 'person'>('organization');
  const [formData, setFormData] = useState({
    companyName: client.name,
    owner: 'MIZAN ARCHITECTURE',
    address: 'Markaz',
    city: 'Toshkent',
    state: 'Штат',
    postalCode: '100000',
    country: 'Узбекистан',
    phone: client.phone || '+998888882332',
    website: '',
    vatNumber: '',
    gstNumber: '',
    clientGroups: client.group,
    labels: client.labels.join(', ')
  });

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-xl shadow-2xl"
        style={{
          backgroundColor: 'var(--surface-primary)',
          border: '1px solid var(--border-primary)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-8 py-5 border-b"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <div>
            <h2 
              className="text-xl mb-1"
              style={{ 
                color: 'var(--text-primary)',
                fontWeight: 600
              }}
            >
              Редактировать клиента
            </h2>
            <p 
              className="text-sm"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Обновите информацию о клиенте
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
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
                Тип клиента
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setClientType('organization')}
                  className="p-4 rounded-xl transition-all"
                  style={{
                    backgroundColor: clientType === 'organization' 
                      ? 'var(--accent-primary)' + '15' 
                      : 'var(--surface-secondary)',
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
                          : 'var(--surface-hover)',
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
                      : 'var(--surface-secondary)',
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
                          : 'var(--surface-hover)',
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
                backgroundColor: 'var(--surface-secondary)',
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
                backgroundColor: 'var(--surface-secondary)',
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
                backgroundColor: 'var(--surface-secondary)',
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
                backgroundColor: 'var(--surface-secondary)',
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
          </div>
        </div>

        {/* Footer */}
        <div 
          className="flex items-center justify-end gap-3 px-8 py-5 border-t"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg text-sm transition-colors flex items-center gap-2"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-primary)',
              fontWeight: 500
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X style={{ width: '16px', height: '16px' }} />
            Закрыть
          </button>

          <button
            onClick={handleSave}
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
  );
}