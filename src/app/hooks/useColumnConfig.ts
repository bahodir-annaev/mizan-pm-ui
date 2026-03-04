import { useState, useEffect } from 'react';
import { ColumnConfig } from '../components/ColumnEditorModal';

interface UseColumnConfigOptions {
  storageKey: string;
  defaultColumns: ColumnConfig[];
}

export function useColumnConfig({ storageKey, defaultColumns }: UseColumnConfigOptions) {
  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse stored column config:', e);
        }
      }
    }
    return defaultColumns;
  });

  // Save to localStorage whenever columns change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(columns));
    }
  }, [columns, storageKey]);

  const updateColumn = (id: string, updates: Partial<ColumnConfig>) => {
    setColumns(columns.map(col =>
      col.id === id ? { ...col, ...updates } : col
    ));
  };

  const renameColumn = (id: string, newLabel: string) => {
    updateColumn(id, { label: newLabel });
  };

  const toggleColumnVisibility = (id: string) => {
    const column = columns.find(col => col.id === id);
    if (column && !column.locked) {
      updateColumn(id, { visible: !column.visible });
    }
  };

  const saveColumns = (newColumns: ColumnConfig[]) => {
    setColumns(newColumns);
  };

  const resetColumns = () => {
    setColumns(defaultColumns);
  };

  const getVisibleColumns = () => {
    return columns.filter(col => col.visible);
  };

  const getColumnById = (id: string) => {
    return columns.find(col => col.id === id);
  };

  return {
    columns,
    visibleColumns: getVisibleColumns(),
    renameColumn,
    toggleColumnVisibility,
    saveColumns,
    resetColumns,
    getColumnById,
    updateColumn
  };
}
