# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm i              # Install dependencies
npm run dev        # Start Vite dev server
npm run build      # Production build
```

No test runner, linter, or formatter is configured.

## Tech Stack

- **React 18.3** with Vite 6.3 (ES modules, `"type": "module"`)
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (no PostCSS config needed)
- **shadcn/ui** (48 Radix UI-based components in `src/app/components/ui/`)
- **Material-UI (MUI) v7** used alongside shadcn/ui
- **Recharts** for data visualization
- **react-dnd** for drag-and-drop
- **react-hook-form** for forms
- **date-fns** for date utilities
- **motion** (Framer Motion) for animations

## Path Alias

`@` maps to `./src` (configured in `vite.config.ts`). Use `@/app/components/ui/button` style imports.

## Architecture

**Routing:** State-based view switching via `activeView` string in `App.tsx` — no router library. Views: dashboard, projects, tasks, analytics, settings, team, clients.

**State management:** React Context API only (no Redux/Zustand):
- `TranslationContext` — i18n for English, Russian, Uzbek (150+ translation keys)
- `BudgetContext` — global project budget tracking (10B limit)
- `OverlayContext` — overlay/modal state to prevent background interaction
- `MediaPlayerContext` — task media playback state

**Component hierarchy:**
```
App.tsx
├── Sidebar (navigation, project list, pinning)
├── Header (search, theme, language, user menu)
└── Main Content (switches on activeView)
    ├── TeamDashboard
    ├── ProjectTable / ProjectDetail / BudgetDisplay
    ├── WorksTableWrapper → WorksTable (tasks)
    ├── AnalyticsDashboard
    ├── TeamManagement
    ├── Clients
    └── Settings
```

**Figma components:** `src/app/components/figma/` contains components generated from Figma Make. The shadcn/ui library lives in `src/app/components/ui/`.

## Theming

5 themes controlled via `data-theme` attribute on `<html>` and CSS custom properties:
- `light-soft`, `dark-calm` (default), `graphite-blue`, `warm-sand`, `abba-brand`
- Theme persists in localStorage key `app-theme`
- Variables defined in `src/styles/theme.css` and `src/styles/themes.css`
- 40+ CSS variables covering backgrounds, surfaces, borders, text, status colors, priority colors

## Key Patterns

- **Inline editing:** Extensive use of editable cell components (`EditableCell`, `EditableWorkCell`, `EditableProjectCell`, etc.) for table data
- **Overlay management:** `OverlayContext` + `useOverlayManager` hook centralizes modal/overlay tracking and body scroll locking
- **Column configuration:** `useColumnConfig` hook manages custom table column visibility and ordering
- **No backend:** All data is client-side mock data in component state — no API integration
