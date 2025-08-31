'use client';

import { useState, useCallback, useEffect } from 'react';

interface SectionLayout {
  id: string;
  position: { x: number; y: number };
  isLocked: boolean;
  isVisible: boolean;
}

interface UseLayoutManagerReturn {
  sectionLayouts: Map<string, SectionLayout>;
  updateSectionPosition: (id: string, position: { x: number; y: number }) => void;
  toggleSectionLock: (id: string, locked: boolean) => void;
  toggleSectionVisibility: (id: string, visible: boolean) => void;
  resetLayout: () => void;
  saveCurrentLayout: () => void;
  isDragMode: boolean;
  toggleDragMode: () => void;
}

const STORAGE_KEY = 'twitch-wheel-layout';

const DEFAULT_SECTIONS: SectionLayout[] = [
  { id: 'how-to-use', position: { x: 0, y: 0 }, isLocked: false, isVisible: true },
  { id: 'manual-controls', position: { x: 0, y: 200 }, isLocked: false, isVisible: true },
  { id: 'participant-list', position: { x: 0, y: 400 }, isLocked: false, isVisible: true },
  { id: 'wheel-section', position: { x: 400, y: 0 }, isLocked: false, isVisible: true },
  { id: 'connection-controls', position: { x: 400, y: 500 }, isLocked: false, isVisible: true }
];

const BASE_LAYOUT_KEY = 'twitch-wheel-base-layout';

export function useLayoutManager(): UseLayoutManagerReturn {
  const [sectionLayouts, setSectionLayouts] = useState<Map<string, SectionLayout>>(new Map());
  const [isDragMode, setIsDragMode] = useState(false);

  // Initialize layouts from localStorage or defaults
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const layouts = JSON.parse(saved) as SectionLayout[];
        // Migrate old layouts that don't have isVisible property
        const migratedLayouts = layouts.map(layout => ({
          ...layout,
          isVisible: layout.isVisible !== undefined ? layout.isVisible : true
        }));
        setSectionLayouts(new Map(migratedLayouts.map(layout => [layout.id, layout])));
      } else {
        setSectionLayouts(new Map(DEFAULT_SECTIONS.map(layout => [layout.id, layout])));
      }
    } catch (error) {
      console.error('Failed to load layout from localStorage:', error);
      setSectionLayouts(new Map(DEFAULT_SECTIONS.map(layout => [layout.id, layout])));
    }
  }, []);

  // Save to localStorage whenever layouts change
  const saveLayoutsToStorage = useCallback((layouts: Map<string, SectionLayout>) => {
    try {
      const layoutsArray = Array.from(layouts.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layoutsArray));
    } catch (error) {
      console.error('Failed to save layout to localStorage:', error);
    }
  }, []);

  const updateSectionPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setSectionLayouts(prev => {
      const newLayouts = new Map(prev);
      const existing = newLayouts.get(id);
      if (existing) {
        newLayouts.set(id, { ...existing, position });
        saveLayoutsToStorage(newLayouts);
      }
      return newLayouts;
    });
  }, [saveLayoutsToStorage]);

  const toggleSectionLock = useCallback((id: string, locked: boolean) => {
    setSectionLayouts(prev => {
      const newLayouts = new Map(prev);
      const existing = newLayouts.get(id);
      if (existing) {
        newLayouts.set(id, { ...existing, isLocked: locked });
        saveLayoutsToStorage(newLayouts);
      }
      return newLayouts;
    });
  }, [saveLayoutsToStorage]);

  const toggleSectionVisibility = useCallback((id: string, visible: boolean) => {
    setSectionLayouts(prev => {
      const newLayouts = new Map(prev);
      const existing = newLayouts.get(id);
      if (existing) {
        newLayouts.set(id, { ...existing, isVisible: visible });
        saveLayoutsToStorage(newLayouts);
      }
      return newLayouts;
    });
  }, [saveLayoutsToStorage]);

  const saveCurrentLayout = useCallback(() => {
    // Save current layout as base layout for future resets
    try {
      const layoutsArray = Array.from(sectionLayouts.values());
      localStorage.setItem(BASE_LAYOUT_KEY, JSON.stringify(layoutsArray));
    } catch (error) {
      console.error('Failed to save base layout:', error);
    }
  }, [sectionLayouts]);

  const resetLayout = useCallback(() => {
    try {
      // Try to load from base layout first, then fall back to defaults
      const savedBase = localStorage.getItem(BASE_LAYOUT_KEY);
      const layoutsToUse: SectionLayout[] = savedBase ? JSON.parse(savedBase) as SectionLayout[] : DEFAULT_SECTIONS;
      const resetLayouts = new Map<string, SectionLayout>(layoutsToUse.map((layout: SectionLayout) => [layout.id, { ...layout }]));
      setSectionLayouts(resetLayouts);
      saveLayoutsToStorage(resetLayouts);
      setIsDragMode(false);
    } catch (error) {
      console.error('Failed to reset layout:', error);
      const defaultLayouts = new Map<string, SectionLayout>(DEFAULT_SECTIONS.map(layout => [layout.id, { ...layout }]));
      setSectionLayouts(defaultLayouts);
      saveLayoutsToStorage(defaultLayouts);
      setIsDragMode(false);
    }
  }, [saveLayoutsToStorage]);

  const toggleDragMode = useCallback(() => {
    setIsDragMode(prev => {
      const newDragMode = !prev;
      // Save current layout when exiting drag mode
      if (prev && !newDragMode) {
        saveCurrentLayout();
      }
      return newDragMode;
    });
  }, [saveCurrentLayout]);

  return {
    sectionLayouts,
    updateSectionPosition,
    toggleSectionLock,
    toggleSectionVisibility,
    resetLayout,
    saveCurrentLayout,
    isDragMode,
    toggleDragMode
  };
}