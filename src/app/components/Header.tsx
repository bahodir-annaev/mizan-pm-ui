import { Search, Globe, ChevronDown, Check, User, Key, Settings, Palette } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useState } from 'react';
import { ThemeSwitcher, Theme } from './ThemeSwitcher';
import { useTranslation, Language } from '../contexts/TranslationContext';

interface HeaderProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  currentView?: 'dashboard' | 'projects' | 'works' | 'analytics';
  onNavigateToSettings?: () => void;
}

export function Header({ currentTheme, onThemeChange, currentView, onNavigateToSettings }: HeaderProps) {
  const { t, language, setLanguage } = useTranslation();

  const languages: { code: Language; name: string }[] = [
    { code: 'uz', name: t('lang.uz') },
    { code: 'ru', name: t('lang.ru') },
    { code: 'en', name: t('lang.en') },
  ];

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === language);
  };

  // Utility icon hover style helper
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  const getUtilityIconStyle = (iconId: string) => ({
    color: hoveredIcon === iconId 
      ? 'rgba(59, 130, 246, 0.8)' // Light blue tint on hover
      : 'var(--text-secondary)', // Neutral secondary color
    transition: 'color 0.18s ease',
  });

  return (
    <header className="sticky top-0 z-50 h-16 border-b flex items-center justify-between px-8 transition-shadow duration-200" style={{ 
      backgroundColor: 'var(--surface-primary)', 
      borderColor: 'var(--border-primary)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
    }}>
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-xl flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder={t('header.search')}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
            style={{ 
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)'
            }}
          />
        </div>
      </div>
      
      {/* Utility Icons - Clean, Consistent, Professional */}
      <div className="flex items-center gap-2">
        {/* Theme Switcher */}
        <ThemeSwitcher currentTheme={currentTheme} onThemeChange={onThemeChange} />
        
        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="p-2 rounded-lg transition-colors"
              onMouseEnter={() => setHoveredIcon('language')}
              onMouseLeave={() => setHoveredIcon(null)}
              title="Change language"
            >
              <Globe 
                style={{ 
                  width: '20px', 
                  height: '20px',
                  ...getUtilityIconStyle('language')
                }} 
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40" style={{
            backgroundColor: 'var(--surface-primary)',
            borderColor: 'var(--border-primary)'
          }}>
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className="flex items-center justify-between cursor-pointer"
                style={{ color: 'var(--text-primary)' }}
              >
                <span>{lang.name}</span>
                {language === lang.code && (
                  <Check className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings */}
        <button 
          className="p-2 rounded-lg transition-colors"
          onMouseEnter={() => setHoveredIcon('settings')}
          onMouseLeave={() => setHoveredIcon(null)}
          title="Settings"
          onClick={onNavigateToSettings}
        >
          <Settings 
            style={{ 
              width: '20px', 
              height: '20px',
              ...getUtilityIconStyle('settings')
            }} 
          />
        </button>

        {/* Divider */}
        <div 
          className="w-px h-6 mx-2"
          style={{ backgroundColor: 'var(--border-primary)' }}
        />
        
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center rounded-lg p-2 transition-colors" style={{
              backgroundColor: 'transparent'
            }} onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}>
              <div className="relative">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-blue-500 text-white">Tt</AvatarFallback>
                </Avatar>
                {/* Online Status Indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 bg-green-500 animate-pulse" style={{
                  borderColor: 'var(--surface-primary)',
                  boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.3)'
                }} />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" style={{
            backgroundColor: 'var(--surface-primary)',
            borderColor: 'var(--border-primary)'
          }}>
            <DropdownMenuItem className="flex items-center gap-3 py-3 cursor-pointer" style={{ color: 'var(--text-primary)' }}>
              <User className="w-5 h-5" />
              <span>{t('header.myProfile')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-3 py-3 cursor-pointer" style={{ color: 'var(--text-primary)' }}>
              <Key className="w-5 h-5" />
              <span>{t('header.changePassword')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-3 py-3 cursor-pointer" style={{ color: 'var(--text-primary)' }}>
              <Settings className="w-5 h-5" />
              <span>{t('header.myPreferences')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}