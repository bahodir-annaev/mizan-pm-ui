interface MiroSidebarMenuProps {
  currentView?: string;
}

export function MiroSidebarMenu({ currentView = 'dashboard' }: MiroSidebarMenuProps) {
  return (
    <div className="px-3 pb-6 border-t pt-4" style={{ borderColor: 'var(--border-primary)' }}>
      {/* Header Section */}
      <div className="mb-3 px-4">
        <div className="flex items-center gap-2 mb-1">
          <svg 
            width="16" 
            height="16" 
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
          <h3 className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            Miro Boards
          </h3>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Jamoaviy hamkorlik
        </p>
      </div>
    </div>
  );
}
