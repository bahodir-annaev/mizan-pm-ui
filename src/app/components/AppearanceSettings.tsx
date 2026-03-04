/**
 * AppearanceSettings Component
 * 
 * Centralized appearance and view configuration panel
 * - Theme selection
 * - Column customization for List/Board/Gantt views
 * - View-specific layout settings
 * - Persistent per-user preferences
 */

import { useState } from 'react';
import { Settings2, LayoutList, LayoutGrid, GanttChart, RotateCcw } from 'lucide-react';
import { ColumnEditorModal, ColumnConfig } from './ColumnEditorModal';
import { useTheme } from './ThemeSwitcher';

type ViewType = 'list' | 'board' | 'gantt';

// Default column configurations for each view
const defaultListColumns: ColumnConfig[] = [
  { id: 'checkbox', label: '', visible: true, locked: true },
  { id: 'id', label: 'ID', visible: true },
  { id: 'title', label: 'Title', visible: true, locked: true },
  { id: 'project', label: 'Project', visible: true },
  { id: 'assignee', label: 'Assignee', visible: true },
  { id: 'workflow', label: 'Workflow', visible: true },
  { id: 'priority', label: 'Priority', visible: true },
  { id: 'dateStart', label: 'Date Start', visible: true },
  { id: 'dateEnd', label: 'Date End', visible: true },
  { id: 'workType', label: 'Work Type', visible: false },
  { id: 'volume', label: 'Volume', visible: false },
  { id: 'participants', label: 'Participants', visible: false },
  { id: 'progress', label: 'Progress', visible: false },
];

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [selectedView, setSelectedView] = useState<ViewType>('list');
  const [isColumnEditorOpen, setIsColumnEditorOpen] = useState(false);
  
  // Column configurations for each view (stored in localStorage in production)
  const [listColumns, setListColumns] = useState<ColumnConfig[]>(defaultListColumns);
  const [boardColumns, setBoardColumns] = useState<ColumnConfig[]>(defaultListColumns);
  const [ganttColumns, setGanttColumns] = useState<ColumnConfig[]>(defaultListColumns);

  const getCurrentColumns = () => {
    switch (selectedView) {
      case 'list': return listColumns;
      case 'board': return boardColumns;
      case 'gantt': return ganttColumns;
      default: return listColumns;
    }
  };

  const handleSaveColumns = (columns: ColumnConfig[]) => {
    switch (selectedView) {
      case 'list':
        setListColumns(columns);
        localStorage.setItem('column-config-list', JSON.stringify(columns));
        break;
      case 'board':
        setBoardColumns(columns);
        localStorage.setItem('column-config-board', JSON.stringify(columns));
        break;
      case 'gantt':
        setGanttColumns(columns);
        localStorage.setItem('column-config-gantt', JSON.stringify(columns));
        break;
    }
  };

  const handleResetColumns = () => {
    switch (selectedView) {
      case 'list':
        setListColumns(defaultListColumns);
        localStorage.removeItem('column-config-list');
        break;
      case 'board':
        setBoardColumns(defaultListColumns);
        localStorage.removeItem('column-config-board');
        break;
      case 'gantt':
        setGanttColumns(defaultListColumns);
        localStorage.removeItem('column-config-gantt');
        break;
    }
  };

  const themes = [
    { id: 'dark-calm', name: 'Dark Calm', description: 'ChatGPT-inspired dark theme' },
    { id: 'graphite-blue', name: 'Graphite Blue', description: 'Professional dark with blue accents' },
    { id: 'light-soft', name: 'Light Soft', description: 'Clean and minimal light theme' },
    { id: 'warm-sand', name: 'Warm Sand', description: 'Warm and comfortable light theme' },
    { id: 'abba-brand', name: 'Abba Brand', description: 'Soft professional green brand theme' },
  ];

  const views = [
    { type: 'list' as ViewType, icon: LayoutList, label: 'List View', description: 'Traditional table view with full details' },
    { type: 'board' as ViewType, icon: LayoutGrid, label: 'Board View', description: 'Kanban-style cards by status' },
    { type: 'gantt' as ViewType, icon: GanttChart, label: 'Gantt View', description: 'Timeline view for project planning' },
  ];

  return (
    <div className="space-y-8">
      {/* Theme Selection */}
      <section>
        <h3 
          className="text-lg font-semibold mb-4 pb-2 border-b"
          style={{ 
            color: 'var(--text-primary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          Theme
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          {themes.map((themeOption) => {
            const isActive = theme === themeOption.id;
            
            return (
              <button
                key={themeOption.id}
                onClick={() => setTheme(themeOption.id)}
                className="flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left"
                style={{
                  backgroundColor: isActive ? 'var(--accent-primary-bg)' : 'var(--surface-secondary)',
                  borderColor: isActive ? 'var(--accent-primary)' : 'var(--border-primary)',
                }}
              >
                <div 
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{
                    borderColor: isActive ? 'var(--accent-primary)' : 'var(--border-primary)',
                  }}
                >
                  {isActive && (
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--accent-primary)' }}
                    />
                  )}
                </div>
                
                <div className="flex-1">
                  <div 
                    className="font-medium text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {themeOption.name}
                  </div>
                  <div 
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {themeOption.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Column Customization */}
      <section>
        <h3 
          className="text-lg font-semibold mb-4 pb-2 border-b"
          style={{ 
            color: 'var(--text-primary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          Column Customization
        </h3>
        
        <p 
          className="text-sm mb-4"
          style={{ color: 'var(--text-secondary)' }}
        >
          Configure which columns are visible in each view. Settings are saved per view and persist across sessions.
        </p>

        {/* View Selector */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {views.map((view) => {
            const Icon = view.icon;
            const isActive = selectedView === view.type;
            
            return (
              <button
                key={view.type}
                onClick={() => setSelectedView(view.type)}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all"
                style={{
                  backgroundColor: isActive ? 'var(--accent-primary-bg)' : 'var(--surface-secondary)',
                  borderColor: isActive ? 'var(--accent-primary)' : 'var(--border-primary)',
                }}
              >
                <Icon 
                  style={{ 
                    width: '20px', 
                    height: '20px',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)'
                  }} 
                />
                <span 
                  className="text-xs font-medium"
                  style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)' }}
                >
                  {view.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Current View Info */}
        <div 
          className="p-4 rounded-lg border mb-4"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div 
                className="text-sm font-medium mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                {views.find(v => v.type === selectedView)?.label}
              </div>
              <div 
                className="text-xs"
                style={{ color: 'var(--text-secondary)' }}
              >
                {views.find(v => v.type === selectedView)?.description}
              </div>
              <div 
                className="text-xs mt-2"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {getCurrentColumns().filter(c => c.visible).length} of {getCurrentColumns().length} columns visible
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setIsColumnEditorOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff'
                }}
              >
                <Settings2 style={{ width: '14px', height: '14px' }} />
                Customize Columns
              </button>
              
              <button
                onClick={handleResetColumns}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                <RotateCcw style={{ width: '14px', height: '14px' }} />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Column List Preview */}
        <div 
          className="rounded-lg border overflow-hidden"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <div 
            className="px-4 py-2 text-xs font-medium border-b"
            style={{ 
              backgroundColor: 'var(--surface-tertiary)',
              color: 'var(--text-secondary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            Current Columns
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border-secondary)' }}>
            {getCurrentColumns().filter(c => c.visible).map((column) => (
              <div 
                key={column.id}
                className="px-4 py-2 flex items-center justify-between"
                style={{ backgroundColor: 'var(--surface-secondary)' }}
              >
                <span 
                  className="text-sm"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {column.label || column.id}
                </span>
                {column.locked && (
                  <span 
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ 
                      backgroundColor: 'var(--surface-tertiary)',
                      color: 'var(--text-tertiary)'
                    }}
                  >
                    Required
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Column Editor Modal */}
      <ColumnEditorModal
        isOpen={isColumnEditorOpen}
        onClose={() => setIsColumnEditorOpen(false)}
        columns={getCurrentColumns()}
        onSave={handleSaveColumns}
        onReset={handleResetColumns}
      />
    </div>
  );
}
