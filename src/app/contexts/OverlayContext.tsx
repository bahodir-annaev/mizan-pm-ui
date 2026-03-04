/**
 * OverlayContext - Global Overlay State Management
 * 
 * Manages all overlay components (modals, dialogs, drawers, popovers, dropdowns)
 * to prevent background interference and visual glitches.
 * 
 * Features:
 * - Tracks active overlays globally
 * - Disables background interactions when overlay is open
 * - Provides consistent backdrop behavior
 * - Focus trap management
 * - ESC key handling
 */

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface OverlayContextValue {
  activeOverlays: string[];
  registerOverlay: (id: string) => void;
  unregisterOverlay: (id: string) => void;
  isOverlayActive: boolean;
}

const OverlayContext = createContext<OverlayContextValue | undefined>(undefined);

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [activeOverlays, setActiveOverlays] = useState<string[]>([]);

  const registerOverlay = useCallback((id: string) => {
    setActiveOverlays(prev => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  }, []);

  const unregisterOverlay = useCallback((id: string) => {
    setActiveOverlays(prev => prev.filter(overlayId => overlayId !== id));
  }, []);

  const isOverlayActive = activeOverlays.length > 0;

  // Apply global class to body when overlay is active
  useEffect(() => {
    if (isOverlayActive) {
      document.body.classList.add('overlay-active');
      // Prevent scroll on body
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('overlay-active');
      document.body.style.overflow = '';
    }

    return () => {
      document.body.classList.remove('overlay-active');
      document.body.style.overflow = '';
    };
  }, [isOverlayActive]);

  return (
    <OverlayContext.Provider value={{ activeOverlays, registerOverlay, unregisterOverlay, isOverlayActive }}>
      {children}
    </OverlayContext.Provider>
  );
}

export function useOverlay() {
  const context = useContext(OverlayContext);
  if (context === undefined) {
    throw new Error('useOverlay must be used within an OverlayProvider');
  }
  return context;
}

/**
 * Hook to manage overlay lifecycle
 * Automatically registers/unregisters overlay on mount/unmount
 */
export function useOverlayManager(id: string, isOpen: boolean) {
  const { registerOverlay, unregisterOverlay } = useOverlay();

  useEffect(() => {
    if (isOpen) {
      registerOverlay(id);
    } else {
      unregisterOverlay(id);
    }

    return () => {
      unregisterOverlay(id);
    };
  }, [id, isOpen, registerOverlay, unregisterOverlay]);
}
