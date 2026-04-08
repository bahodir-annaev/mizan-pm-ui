import { Globe, Check, User, Key, Settings, LogOut } from 'lucide-react';
import { ActiveTimerWidget } from './ActiveTimerWidget';
import { UserAvatar } from './UserAvatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeSwitcher, Theme } from './ThemeSwitcher';
import { useTranslation, Language } from '../contexts/TranslationContext';
import { useAuth } from '@/app/auth/AuthContext';
import { NotificationBell } from './NotificationBell';
import { GlobalSearch } from './GlobalSearch';

interface HeaderProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  currentView?: string;
  onNavigateToSettings?: () => void;
}

export function Header({ currentTheme, onThemeChange, onNavigateToSettings }: HeaderProps) {
  const { t, language, setLanguage } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const handleSettings = onNavigateToSettings ?? (() => navigate('/settings'));

  const languages: { code: Language; name: string }[] = [
    { code: 'uz', name: t('lang.uz') },
    { code: 'ru', name: t('lang.ru') },
    { code: 'en', name: t('lang.en') },
  ];

  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  const getUtilityIconStyle = (iconId: string) => ({
    color: hoveredIcon === iconId
      ? 'rgba(59, 130, 246, 0.8)'
      : 'var(--text-secondary)',
    transition: 'color 0.18s ease',
  });

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header
      className="sticky top-0 z-50 h-16 border-b flex items-center justify-between px-8 transition-shadow duration-200"
      style={{
        backgroundColor: 'var(--surface-primary)',
        borderColor: 'var(--border-primary)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      }}
    >
      <div className="flex items-center gap-4 flex-1">
        <GlobalSearch />
      </div>

      {/* Active Timer */}
      <ActiveTimerWidget />

      {/* Utility Icons */}
      <div className="flex items-center gap-2">
        {/* Theme Switcher */}
        <ThemeSwitcher currentTheme={currentTheme} onThemeChange={onThemeChange} />

        {/* Notifications */}
        <NotificationBell />

        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 rounded-lg transition-colors"
              onMouseEnter={() => setHoveredIcon('language')}
              onMouseLeave={() => setHoveredIcon(null)}
              title="Change language"
            >
              <Globe style={{ width: '20px', height: '20px', ...getUtilityIconStyle('language') }} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-40"
            style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--border-primary)' }}
          >
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
          onClick={handleSettings}
        >
          <Settings style={{ width: '20px', height: '20px', ...getUtilityIconStyle('settings') }} />
        </button>

        {/* Divider */}
        <div className="w-px h-6 mx-2" style={{ backgroundColor: 'var(--border-primary)' }} />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-lg p-2 transition-colors"
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div className="relative">
                <UserAvatar
                  name={user?.name ?? 'User'}
                  color={user?.color ?? '#3B82F6'}
                  size="sm"
                />
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 bg-green-500"
                  style={{ borderColor: 'var(--surface-primary)' }}
                />
              </div>
              {user && (
                <span
                  className="text-sm font-medium hidden lg:block"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {user.name}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56"
            style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--border-primary)' }}
          >
            {user && (
              <>
                <div className="px-3 py-2">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {user.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {user.email}
                  </p>
                </div>
                <DropdownMenuSeparator style={{ backgroundColor: 'var(--border-primary)' }} />
              </>
            )}
            <DropdownMenuItem
              className="flex items-center gap-3 py-2.5 cursor-pointer"
              style={{ color: 'var(--text-primary)' }}
            >
              <User className="w-4 h-4" />
              <span>{t('header.myProfile')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-3 py-2.5 cursor-pointer"
              style={{ color: 'var(--text-primary)' }}
              onClick={() => navigate('/settings', { state: { category: 'security' } })}
            >
              <Key className="w-4 h-4" />
              <span>{t('header.changePassword')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-3 py-2.5 cursor-pointer"
              style={{ color: 'var(--text-primary)' }}
              onClick={handleSettings}
            >
              <Settings className="w-4 h-4" />
              <span>{t('header.myPreferences')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator style={{ backgroundColor: 'var(--border-primary)' }} />
            <DropdownMenuItem
              className="flex items-center gap-3 py-2.5 cursor-pointer"
              style={{ color: 'var(--status-late)' }}
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
