/**
 * Backdrop Component
 * 
 * Standardized backdrop overlay for modals, dialogs, and drawers
 * Features:
 * - Consistent dimming across all themes
 * - Smooth fade-in animation
 * - Click-to-close functionality
 * - Proper z-index layering
 * - Blocks pointer events to background
 */

interface BackdropProps {
  onClick?: () => void;
  className?: string;
  zIndex?: number;
}

export function Backdrop({ onClick, className = '', zIndex = 40 }: BackdropProps) {
  return (
    <div
      className={`fixed inset-0 animate-in fade-in duration-200 ${className}`}
      style={{
        backgroundColor: 'var(--overlay-backdrop)',
        backdropFilter: 'blur(var(--overlay-blur))',
        WebkitBackdropFilter: 'blur(var(--overlay-blur))',
        zIndex,
      }}
      onClick={onClick}
      aria-hidden="true"
    />
  );
}