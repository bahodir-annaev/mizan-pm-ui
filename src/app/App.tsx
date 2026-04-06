import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ProjectTable } from './components/ProjectTable';
import { ProjectDetail } from './components/ProjectDetail';
import { WorksTableWrapper } from './components/WorksTableWrapper';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { TeamDashboard } from './components/TeamDashboard';
import { Settings } from './components/Settings';
import { TeamManagement } from './components/TeamManagement';
import { Clients } from './components/Clients';
// import { BudgetDisplay } from './components/BudgetDisplay';
import { useTheme } from './components/ThemeSwitcher';
import { TranslationProvider } from './contexts/TranslationContext';
import { TimeTrackingProvider } from '@/contexts/TimeTrackingContext';
import { OverlayProvider } from '@/app/contexts/OverlayContext';
import { BudgetProvider } from '@/app/contexts/BudgetContext';
import { AuthProvider } from '@/app/auth/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'projects' | 'tasks' | 'analytics' | 'settings' | 'team' | 'clients'>('tasks');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  return (
    <ErrorBoundary>
      <TranslationProvider>
        <OverlayProvider>
          <BudgetProvider>
            <AuthProvider>
              <TimeTrackingProvider>
              <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <Sidebar 
                  activeView={activeView} 
                  onViewChange={setActiveView}
                  onProjectSelect={setSelectedProjectId}
                  selectedProjectId={selectedProjectId}
                />
                
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Global Pinned Header - Always visible across all pages */}
                  <Header 
                    currentTheme={theme} 
                    onThemeChange={setTheme} 
                    currentView={activeView}
                    onNavigateToSettings={() => setActiveView('settings')}
                  />
                  
                  <main className="flex-1 overflow-hidden">
                    {activeView === 'projects' && (
                      selectedProjectId ? (
                        <ProjectDetail 
                          projectId={selectedProjectId}
                          onBack={() => setSelectedProjectId(null)}
                        />
                      ) : (
                        <div className="h-full flex flex-col">
                          {/* Sticky Header */}
                          <div className="sticky top-0 z-40 p-8 pb-4 border-b" style={{
                            backgroundColor: 'var(--bg-primary)',
                            borderColor: 'var(--border-primary)'
                          }}>
                            <div className="mb-6">
                              <h2 className="text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>Projects</h2>
                              <p style={{ color: 'var(--text-secondary)' }}>Manage and track all your projects</p>
                            </div>
                          </div>
                          
                          {/* Scrollable Content */}
                          <div className="flex-1 overflow-auto">
                            <div className="p-8 pt-6 space-y-6">
                              {/* <BudgetDisplay /> */}
                              <ProjectTable />
                            </div>
                          </div>
                        </div>
                      )
                    )}
                    
                    {activeView === 'tasks' && <WorksTableWrapper />}
                    
                    {activeView === 'dashboard' && (
                      <TeamDashboard />
                    )}
                    
                    {activeView === 'analytics' && (
                      <AnalyticsDashboard />
                    )}
                    
                    {activeView === 'team' && (
                      <TeamManagement />
                    )}
                    
                    {activeView === 'settings' && (
                      <Settings />
                    )}
                    
                    {activeView === 'clients' && (
                      <Clients />
                    )}
                  </main>
                </div>
              </div>
              </TimeTrackingProvider>
            </AuthProvider>
          </BudgetProvider>
        </OverlayProvider>
      </TranslationProvider>
    </ErrorBoundary>
  );
}