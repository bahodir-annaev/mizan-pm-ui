import { useState, useEffect } from 'react';
import { X, GripVertical, Eye, EyeOff, RotateCcw, Settings2 } from 'lucide-react';
import { useOverlayManager } from '@/app/contexts/OverlayContext';
import { Backdrop } from '@/app/components/Backdrop';

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  locked?: boolean; // Some columns can't be hidden (e.g., checkbox, ID)
}

interface ColumnEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnConfig[];
  onSave: (columns: ColumnConfig[]) => void;
  onReset?: () => void;
}

export function ColumnEditorModal({
  isOpen,
  onClose,
  columns,
  onSave,
  onReset
}: ColumnEditorModalProps) {
  const [editedColumns, setEditedColumns] = useState<ColumnConfig[]>(columns);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  // Register overlay with global overlay system
  useOverlayManager('column-editor-modal', isOpen);

  useEffect(() => {
    setEditedColumns(columns);
  }, [columns]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLabelChange = (id: string, newLabel: string) => {
    setEditedColumns(editedColumns.map(col =>
      col.id === id ? { ...col, label: newLabel } : col
    ));
  };

  const handleVisibilityToggle = (id: string) => {
    setEditedColumns(editedColumns.map(col =>
      col.id === id ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleSave = () => {
    // Validate: at least one column must be visible
    const hasVisibleColumns = editedColumns.some(col => col.visible);
    if (!hasVisibleColumns) {
      alert('At least one column must be visible');
      return;
    }
    
    // Validate: no empty labels
    const hasEmptyLabels = editedColumns.some(col => !col.label.trim());
    if (hasEmptyLabels) {
      alert('Column names cannot be empty');
      return;
    }

    onSave(editedColumns);
    onClose();
  };

  const handleCancel = () => {
    setEditedColumns(columns);
    onClose();
  };

  const handleReset = () => {
    if (onReset && confirm('Reset all columns to default settings?')) {
      onReset();
      onClose();
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newColumns = [...editedColumns];
    const draggedColumn = newColumns[draggedIndex];
    newColumns.splice(draggedIndex, 1);
    newColumns.splice(index, 0, draggedColumn);
    
    setEditedColumns(newColumns);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <>
      {/* Backdrop */}
      <Backdrop onClick={handleCancel} />

      {/* Modal */}
      <div 
        data-overlay-content
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[80vh] flex flex-col rounded-xl shadow-2xl border"
        style={{
          backgroundColor: 'var(--surface-primary)',
          borderColor: 'var(--border-primary)'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <div className="flex items-center gap-3">
            <Settings2 className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            <h2 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
              Customize Columns
            </h2>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <div 
          className="px-6 py-3 text-sm border-b"
          style={{ 
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border-secondary)',
            color: 'var(--text-secondary)'
          }}
        >
          Rename, show/hide, and reorder columns. Drag rows to reorder.
        </div>

        {/* Column List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-2">
            {editedColumns.map((column, index) => (
              <div
                key={column.id}
                draggable={!column.locked}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border transition-all group"
                style={{
                  backgroundColor: draggedIndex === index ? 'var(--accent-primary-bg)' : 'var(--surface-secondary)',
                  borderColor: draggedIndex === index ? 'var(--accent-primary)' : 'var(--border-secondary)',
                  cursor: column.locked ? 'default' : 'grab',
                  opacity: column.visible ? 1 : 0.5
                }}
                onMouseEnter={(e) => {
                  if (draggedIndex === null) {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (draggedIndex === null) {
                    e.currentTarget.style.borderColor = 'var(--border-secondary)';
                  }
                }}
              >
                {/* Drag Handle */}
                <div 
                  className="flex-shrink-0 opacity-0 group-hover:opacity-40 transition-opacity"
                  style={{ 
                    color: 'var(--text-tertiary)',
                    cursor: column.locked ? 'not-allowed' : 'grab'
                  }}
                >
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Column Name Input */}
                <input
                  type="text"
                  value={column.label}
                  onChange={(e) => handleLabelChange(column.id, e.target.value)}
                  disabled={column.locked}
                  className="flex-1 px-3 py-2 rounded-md border text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--input-border)',
                    color: 'var(--text-primary)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--input-focus)';
                    e.target.style.boxShadow = `0 0 0 1px var(--input-focus)`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--input-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Column name"
                />

                {/* Visibility Toggle */}
                <button
                  onClick={() => handleVisibilityToggle(column.id)}
                  disabled={column.locked}
                  className="flex-shrink-0 p-2 rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ 
                    color: column.visible ? 'var(--accent-primary)' : 'var(--text-tertiary)'
                  }}
                  onMouseEnter={(e) => {
                    if (!column.locked) {
                      e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  title={column.visible ? 'Hide column' : 'Show column'}
                >
                  {column.visible ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div 
          className="flex items-center justify-between px-6 py-4 border-t"
          style={{ 
            borderColor: 'var(--border-primary)',
            backgroundColor: 'var(--surface-secondary)'
          }}
        >
          <div>
            {onReset && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <RotateCcw className="w-4 h-4" />
                Reset to default
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="px-5 py-2 rounded-md text-sm transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-md text-sm transition-all"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
              }}
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}