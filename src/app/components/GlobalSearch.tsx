import { Search, FolderOpen, CheckSquare, Users, Building2, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalSearch } from '@/hooks/api/useSearch';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: results, isFetching } = useGlobalSearch(query);

  const hasResults =
    results &&
    (results.projects.length + results.tasks.length + results.clients.length + results.users.length > 0);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(path: string) {
    setOpen(false);
    setQuery('');
    navigate(path);
  }

  return (
    <div ref={containerRef} className="relative max-w-xl flex-1">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
        style={{ color: 'var(--text-tertiary)' }}
      />
      <input
        ref={inputRef}
        type="text"
        value={query}
        placeholder="Search projects, tasks, clients..."
        className="w-full pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
        style={{
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border-primary)',
          color: 'var(--text-primary)',
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(e.target.value.length >= 2);
        }}
        onFocus={() => query.length >= 2 && setOpen(true)}
      />
      {query && (
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-tertiary)' }}
          onClick={() => { setQuery(''); setOpen(false); }}
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {open && query.length >= 2 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-lg border shadow-lg overflow-hidden z-50"
          style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--border-primary)' }}
        >
          {isFetching ? (
            <div className="py-6 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Searching...
            </div>
          ) : !hasResults ? (
            <div className="py-6 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
              No results for "{query}"
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {results!.projects.length > 0 && (
                <ResultGroup
                  label="Projects"
                  icon={<FolderOpen className="w-3.5 h-3.5" />}
                  items={results!.projects.map((p) => ({ id: p.id, label: p.name, path: `/projects/${p.id}` }))}
                  onSelect={handleSelect}
                />
              )}
              {results!.tasks.length > 0 && (
                <ResultGroup
                  label="Tasks"
                  icon={<CheckSquare className="w-3.5 h-3.5" />}
                  items={results!.tasks.map((t) => ({ id: t.id, label: t.title, path: `/tasks` }))}
                  onSelect={handleSelect}
                />
              )}
              {results!.clients.length > 0 && (
                <ResultGroup
                  label="Clients"
                  icon={<Building2 className="w-3.5 h-3.5" />}
                  items={results!.clients.map((c) => ({ id: c.id, label: c.name, path: `/clients` }))}
                  onSelect={handleSelect}
                />
              )}
              {results!.users.length > 0 && (
                <ResultGroup
                  label="Team Members"
                  icon={<Users className="w-3.5 h-3.5" />}
                  items={results!.users.map((u) => ({
                    id: u.id,
                    label: `${u.firstName} ${u.lastName}`,
                    path: `/team`,
                  }))}
                  onSelect={handleSelect}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ResultGroupProps {
  label: string;
  icon: React.ReactNode;
  items: Array<{ id: string; label: string; path: string }>;
  onSelect: (path: string) => void;
}

function ResultGroup({ label, icon, items, onSelect }: ResultGroupProps) {
  return (
    <div>
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"
        style={{ color: 'var(--text-tertiary)', backgroundColor: 'var(--surface-secondary)' }}
      >
        {icon}
        {label}
      </div>
      {items.map((item) => (
        <button
          key={item.id}
          className="w-full text-left px-4 py-2 text-sm transition-colors"
          style={{ color: 'var(--text-primary)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-secondary)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
          onClick={() => onSelect(item.path)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
