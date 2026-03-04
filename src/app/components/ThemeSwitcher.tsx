import { useState, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

export type Theme = 'light-soft' | 'dark-calm' | 'graphite-blue' | 'warm-sand' | 'abba-brand';

interface ThemeOption {
  id: Theme;
  label: string;
  description: string;
  preview: {
    bg: string;
    surface: string;
    text: string;
    accent: string;
  };
}

const themes: ThemeOption[] = [
  {
    id: 'light-soft',
    label: 'Light Soft',
    description: 'Warm light for comfort',
    preview: {
      bg: '#f7f7f5',
      surface: '#ffffff',
      text: '#1a1a1a',
      accent: '#5b8def',
    },
  },
  {
    id: 'dark-calm',
    label: 'Dark Calm',
    description: 'Easy on the eyes',
    preview: {
      bg: '#1a1a1a',
      surface: '#2a2a2a',
      text: '#e5e5e5',
      accent: '#6ea8fe',
    },
  },
  {
    id: 'graphite-blue',
    label: 'Graphite Blue',
    description: 'Professional depth',
    preview: {
      bg: '#1e2936',
      surface: '#2d3a4a',
      text: '#e1e7ef',
      accent: '#5b9bf5',
    },
  },
  {
    id: 'warm-sand',
    label: 'Warm Sand',
    description: 'Calm and editorial',
    preview: {
      bg: '#f5f1ea',
      surface: '#fefdfb',
      text: '#2a2520',
      accent: '#b8956a',
    },
  },
  {
    id: 'abba-brand',
    label: 'Abba Brand',
    description: 'Soft professional green',
    preview: {
      bg: '#f5f9f7',
      surface: '#fefdfb',
      text: '#03382f',
      accent: '#275236',
    },
  },
];

interface ThemeSwitcherProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function ThemeSwitcher({ currentTheme, onThemeChange }: ThemeSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="p-2 rounded-lg transition-colors"
          title="Change theme"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Palette 
            style={{ 
              width: '20px', 
              height: '20px',
              color: isHovered 
                ? 'rgba(59, 130, 246, 0.8)' // Light blue tint on hover
                : 'var(--text-secondary)', // Neutral secondary color
              transition: 'color 0.18s ease'
            }} 
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 shadow-xl" style={{
        backgroundColor: 'var(--surface-primary)',
        borderColor: 'var(--border-primary)'
      }} align="end">
        <div className="mb-3">
          <h3 className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Choose Theme</h3>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Select a color scheme</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => {
                onThemeChange(theme.id);
                setOpen(false);
              }}
              className="relative p-3 rounded-lg border-2 transition-all hover:scale-[1.02]"
              style={{
                borderColor: currentTheme === theme.id ? 'var(--accent-primary)' : 'var(--border-secondary)'
              }}
              onMouseEnter={(e) => {
                if (currentTheme !== theme.id) {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentTheme !== theme.id) {
                  e.currentTarget.style.borderColor = 'var(--border-secondary)';
                }
              }}
            >
              {/* Preview */}
              <div className="mb-2 rounded-md overflow-hidden border" style={{ borderColor: 'var(--border-secondary)' }}>
                <div
                  className="h-12 p-2 flex items-center justify-center gap-1"
                  style={{ backgroundColor: theme.preview.bg }}
                >
                  <div
                    className="w-full h-6 rounded"
                    style={{ backgroundColor: theme.preview.surface }}
                  />
                </div>
                <div
                  className="h-2"
                  style={{ backgroundColor: theme.preview.accent }}
                />
              </div>

              {/* Label */}
              <div className="text-left">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
                    {theme.label}
                  </span>
                  {currentTheme === theme.id && (
                    <Check className="w-3 h-3" style={{ color: 'var(--accent-primary)' }} />
                  )}
                </div>
                <p className="text-[10px] leading-tight" style={{ color: 'var(--text-tertiary)' }}>
                  {theme.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Theme hook to apply themes
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark-calm';
    const saved = localStorage.getItem('app-theme');
    return (saved as Theme) || 'dark-calm';
  });

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return { theme, setTheme };
}