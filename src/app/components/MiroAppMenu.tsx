import { useState } from 'react';
import { LayoutDashboard, FolderKanban, ListChecks, BarChart3, ExternalLink } from 'lucide-react';

interface MiroAppMenuProps {
  currentView?: string;
}

export function MiroAppMenu({ currentView = 'dashboard' }: MiroAppMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview va real-time holat',
      miroUrl: 'https://miro.com/app/board/dashboard'
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FolderKanban,
      description: 'Loyihalar boshqaruvi',
      miroUrl: 'https://miro.com/app/board/projects'
    },
    {
      id: 'works',
      label: 'Works',
      icon: ListChecks,
      description: 'Vazifalar va ishlash jarayoni',
      miroUrl: 'https://miro.com/app/board/works'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Hisobotlar va tahlil',
      miroUrl: 'https://miro.com/app/board/analytics'
    }
  ];

  const handleOpenMiro = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 rounded-lg transition-all flex items-center gap-2 group"
        style={{
          backgroundColor: 'var(--surface-secondary)',
          border: '1px solid var(--border-primary)',
          color: 'var(--text-primary)',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
        }}
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ color: 'var(--accent-primary)' }}
        >
          <circle cx="6" cy="6" r="3" fill="currentColor" />
          <circle cx="18" cy="6" r="3" fill="currentColor" />
          <circle cx="6" cy="18" r="3" fill="currentColor" />
          <circle cx="18" cy="18" r="3" fill="currentColor" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
        <span className="text-sm font-medium">Miro Boards</span>
        <ExternalLink className="w-4 h-4 opacity-60" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Panel */}
          <div
            className="absolute top-full left-0 mt-2 rounded-xl shadow-2xl border z-50"
            style={{
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-primary)',
              minWidth: '320px',
              maxWidth: '360px'
            }}
          >
            {/* Header */}
            <div 
              className="px-4 py-3 border-b"
              style={{ borderColor: 'var(--border-secondary)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  <circle cx="6" cy="6" r="3" fill="currentColor" />
                  <circle cx="18" cy="6" r="3" fill="currentColor" />
                  <circle cx="6" cy="18" r="3" fill="currentColor" />
                  <circle cx="18" cy="18" r="3" fill="currentColor" />
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                </svg>
                <h3 
                  className="text-sm font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Miro Collaboration Boards
                </h3>
              </div>
              <p 
                className="text-xs"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Jamoaviy ishlash uchun Miro boardlarni oching
              </p>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleOpenMiro(item.miroUrl);
                      setIsOpen(false);
                    }}
                    className="w-full px-3 py-3 rounded-lg transition-all flex items-start gap-3 group mb-1"
                    style={{
                      backgroundColor: isActive ? 'var(--accent-primary-subtle)' : 'transparent',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {/* Icon Container */}
                    <div 
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: isActive ? 'var(--accent-primary)' : 'var(--surface-secondary)',
                        border: isActive ? 'none' : '1px solid var(--border-primary)'
                      }}
                    >
                      <Icon 
                        className="w-4 h-4"
                        style={{ 
                          color: isActive ? '#fff' : 'var(--text-primary)'
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between mb-0.5">
                        <span 
                          className="text-sm font-semibold"
                          style={{ 
                            color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)'
                          }}
                        >
                          {item.label}
                        </span>
                        <ExternalLink 
                          className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity"
                          style={{ color: 'var(--text-tertiary)' }}
                        />
                      </div>
                      <p 
                        className="text-xs"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div 
              className="px-4 py-3 border-t"
              style={{ 
                borderColor: 'var(--border-secondary)',
                backgroundColor: 'var(--surface-secondary)'
              }}
            >
              <p 
                className="text-xs text-center"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Miro board yangi tabda ochiladi
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
