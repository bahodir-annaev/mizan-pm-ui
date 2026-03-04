import { useState } from 'react';
import { ChevronDown, Upload, Download, HelpCircle } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import { useTheme } from './ThemeSwitcher';
import { AppearanceSettings } from './AppearanceSettings';

type SettingsCategory = 
  | 'general' 
  | 'appearance'
  | 'localization' 
  | 'blog' 
  | 'tags' 
  | 'medals' 
  | 'menu' 
  | 'notifications' 
  | 'integrations' 
  | 'cron'
  | 'permissions'
  | 'client-portal'
  | 'projects'
  | 'configuration'
  | 'plugins';

type SettingsTab = 'general-settings' | 'top-menu' | 'footer' | 'pwa';

export function Settings() {
  const { t, language, setLanguage } = useTranslation();
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('general');
  const [activeTab, setActiveTab] = useState<SettingsTab>('general-settings');

  const categories = [
    {
      title: 'Application Settings',
      items: [
        { key: 'general' as const, label: 'General' },
        { key: 'appearance' as const, label: 'Appearance & Views' },
        { key: 'localization' as const, label: 'Localization' },
        { key: 'blog' as const, label: 'Blog' },
        { key: 'tags' as const, label: 'Favorite Tags' },
        { key: 'medals' as const, label: 'Medals' },
        { key: 'menu' as const, label: 'Left Menu' },
        { key: 'notifications' as const, label: 'Notifications' },
        { key: 'integrations' as const, label: 'Integrations' },
        { key: 'cron' as const, label: 'Cron Jobs' },
      ]
    },
    {
      title: null,
      items: [
        { key: 'permissions' as const, label: 'Access Permissions' },
        { key: 'client-portal' as const, label: 'Client Portal' },
        { key: 'projects' as const, label: 'Projects & Bridges' },
        { key: 'configuration' as const, label: 'Configuration' },
        { key: 'plugins' as const, label: 'Plugins' },
      ]
    }
  ];

  const tabs = [
    { key: 'general-settings' as const, label: 'General Settings' },
    { key: 'top-menu' as const, label: 'Top Menu' },
    { key: 'footer' as const, label: 'Footer' },
    { key: 'pwa' as const, label: 'PWA' },
  ];

  return (
    <div className="h-full flex overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Left Sidebar Navigation */}
      <div 
        className="w-64 flex-shrink-0 overflow-y-auto border-r"
        style={{
          backgroundColor: 'var(--surface-primary)',
          borderColor: 'var(--border-primary)'
        }}
      >
        <div className="p-4">
          <h2 className="text-lg px-3 py-2 mb-2" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            Settings
          </h2>
          
          {categories.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6">
              {group.title && (
                <div className="px-3 py-2 text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>
                  {group.title}
                </div>
              )}
              
              {group.items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveCategory(item.key)}
                  className="w-full px-3 py-2 rounded-lg mb-1 text-sm text-left transition-colors"
                  style={{
                    backgroundColor: activeCategory === item.key ? 'var(--accent-primary)' : 'transparent',
                    color: activeCategory === item.key ? '#ffffff' : 'var(--text-secondary)'
                  }}
                  onMouseEnter={(e) => {
                    if (activeCategory !== item.key) {
                      e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeCategory !== item.key) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Tabs */}
        <div 
          className="border-b flex items-center px-6 pt-4"
          style={{ 
            backgroundColor: 'var(--surface-primary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-4 py-3 text-sm relative transition-colors"
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="max-w-4xl">
            {/* Appearance Settings */}
            {activeCategory === 'appearance' && <AppearanceSettings />}
            
            {/* General Settings (existing) */}
            {activeCategory === 'general' && (
              <>
            {/* Site Logo Section */}
            <div className="mb-6">
              <label className="block text-sm mb-2" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                Site Logo (175x40)
              </label>
              <div 
                className="h-20 rounded-lg border-2 border-dashed flex items-center justify-center gap-3"
                style={{ borderColor: 'var(--border-primary)' }}
              >
                <button 
                  className="px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)'
                  }}
                >
                  <Upload style={{ width: '16px', height: '16px' }} />
                  Upload
                </button>
                <button 
                  className="px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)'
                  }}
                >
                  <Download style={{ width: '16px', height: '16px' }} />
                  Download
                </button>
              </div>
            </div>

            {/* Favicon Section */}
            <div className="mb-6">
              <label className="block text-sm mb-2" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                Favicon (25x32)
              </label>
              <div 
                className="h-20 rounded-lg border-2 border-dashed flex items-center justify-center gap-3"
                style={{ borderColor: 'var(--border-primary)' }}
              >
                <div className="w-16 h-16 rounded flex items-center justify-center" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: 'var(--accent-primary)' }}></div>
                </div>
                <button 
                  className="px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)'
                  }}
                >
                  <Upload style={{ width: '16px', height: '16px' }} />
                  Upload
                </button>
                <button 
                  className="px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)'
                  }}
                >
                  <Download style={{ width: '16px', height: '16px' }} />
                  Download
                </button>
              </div>
            </div>

            {/* Display Logo on Login Page */}
            <div className="mb-6">
              <label className="block text-sm mb-2" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                Display logo on the login page
              </label>
              <div className="relative">
                <select 
                  className="w-full px-4 py-3 rounded-lg appearance-none cursor-pointer text-sm"
                  style={{
                    backgroundColor: 'var(--surface-primary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)'
                  }}
                >
                  <option>Yes</option>
                  <option>No</option>
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

            {/* Display Image Name on Login Page */}
            <div className="mb-6">
              <label className="block text-sm mb-2" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                Display image name on the login page
              </label>
              <div className="relative">
                <select 
                  className="w-full px-4 py-3 rounded-lg appearance-none cursor-pointer text-sm"
                  style={{
                    backgroundColor: 'var(--surface-primary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)'
                  }}
                >
                  <option>Yes</option>
                  <option>No</option>
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

            {/* Login Page Background */}
            <div className="mb-6">
              <label className="block text-sm mb-2" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                Login page background
              </label>
              <div 
                className="h-32 rounded-lg border-2 border-dashed flex items-center justify-center"
                style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--surface-secondary)' }}
              >
                <button 
                  className="px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: '#ffffff'
                  }}
                >
                  <Upload style={{ width: '16px', height: '16px' }} />
                  Upload Background
                </button>
              </div>
            </div>

            {/* Application Name */}
            <div className="mb-6">
              <label className="block text-sm mb-2" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                Application Name
              </label>
              <input 
                type="text"
                defaultValue="Nizam"
                className="w-full px-4 py-3 rounded-lg text-sm"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)'
                }}
              />
            </div>

            {/* Allowed File Format */}
            <div className="mb-6">
              <label className="block text-sm mb-2" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                Allowed File Format
              </label>
              <textarea 
                rows={3}
                defaultValue="jpg,gif,jpeg,png,doc,docx,xls,pdf,zip,rar,txt,css,js,mp4,mkv,avi,mov,wmv,flv,webm,ogg,mp3,wav,flac,aac,wma,m4a,zip,rar,7z,tar,gz,bz2,xz,iso,dmg,exe,msi,apk,ipa"
                className="w-full px-4 py-3 rounded-lg text-sm resize-none"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)'
                }}
              />
            </div>

            {/* Landing Page */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm mb-2" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                Landing Page
                <HelpCircle style={{ width: '14px', height: '14px', color: 'var(--text-tertiary)' }} />
              </label>
              <input 
                type="text"
                placeholder="Enter page URL"
                className="w-full px-4 py-3 rounded-lg text-sm"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)'
                }}
              />
            </div>

            {/* Items per Page */}
            <div className="mb-6">
              <label className="block text-sm mb-2" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                Items per Page
              </label>
              <div className="relative">
                <select 
                  className="w-full px-4 py-3 rounded-lg appearance-none cursor-pointer text-sm"
                  style={{
                    backgroundColor: 'var(--surface-primary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)'
                  }}
                  defaultValue="30"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
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

            {/* Scrollbar */}
            <div className="mb-6">
              <label className="block text-sm mb-2" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                Scrollbar
              </label>
              <div className="relative">
                <select 
                  className="w-full px-4 py-3 rounded-lg appearance-none cursor-pointer text-sm"
                  style={{
                    backgroundColor: 'var(--surface-primary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)'
                  }}
                  defaultValue="jquery"
                >
                  <option value="jquery">jQuery</option>
                  <option value="native">Native</option>
                  <option value="custom">Custom</option>
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

            {/* Enable Audio Recording */}
            <div className="mb-6">
              <label className="block text-sm mb-2" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                Enable Audio Recording
              </label>
              <div className="relative">
                <select 
                  className="w-full px-4 py-3 rounded-lg appearance-none cursor-pointer text-sm"
                  style={{
                    backgroundColor: 'var(--surface-primary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)'
                  }}
                >
                  <option>Yes</option>
                  <option>No</option>
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

            {/* Save Button */}
            <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
              <button 
                className="px-6 py-3 rounded-lg text-sm transition-colors"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff',
                  fontWeight: 500
                }}
              >
                Save Settings
              </button>
              <button 
                className="px-6 py-3 rounded-lg text-sm transition-colors"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                Reset to Default
              </button>
            </div>
          </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}