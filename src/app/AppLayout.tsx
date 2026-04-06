import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { useTheme } from './components/ThemeSwitcher';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

export function AppLayout() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  useRealtimeUpdates();

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar currentPath={location.pathname} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          currentTheme={theme}
          onThemeChange={setTheme}
          onNavigateToSettings={() => navigate('/settings')}
        />

        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
