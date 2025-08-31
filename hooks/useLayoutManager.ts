'use client';

import { useState, useCallback, useEffect } from 'react';

interface SectionLayout {
  id: string;
  position: { x: number; y: number };
  isLocked: boolean;
}

interface UseLayoutManagerReturn {
  sectionLayouts: Map<string, SectionLayout>;
  updateSectionPosition: (id: string, position: { x: number; y: number }) => void;
  toggleSectionLock: (id: string, locked: boolean) => void;
  resetLayout: () => void;
  isDragMode: boolean;
  toggleDragMode: () => void;
}

const STORAGE_KEY = 'twitch-wheel-layout';

const DEFAULT_SECTIONS: SectionLayout[] = [
  { id: 'how-to-use', position: { x: 0, y: 0 }, isLocked: false },
  { id: 'manual-controls', position: { x: 0, y: 200 }, isLocked: false },
  { id: 'participant-list', position: { x: 0, y: 400 }, isLocked: false },
  { id: 'wheel-section', position: { x: 400, y: 0 }, isLocked: false },
  { id: 'connection-controls', position: { x: 400, y: 500 }, isLocked: false }
];

export function useLayoutManager(): UseLayoutManagerReturn {
  const [sectionLayouts, setSectionLayouts] = useState<Map<string, SectionLayout>>(new Map());
  const [isDragMode, setIsDragMode] = useState(false);

  // Initialize layouts from localStorage or defaults
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const layouts = JSON.parse(saved) as SectionLayout[];
        setSectionLayouts(new Map(layouts.map(layout => [layout.id, layout])));
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

  const resetLayout = useCallback(() => {
    const defaultLayouts = new Map(DEFAULT_SECTIONS.map(layout => [layout.id, { ...layout }]));
    setSectionLayouts(defaultLayouts);
    saveLayoutsToStorage(defaultLayouts);
    setIsDragMode(false);
  }, [saveLayoutsToStorage]);

  const toggleDragMode = useCallback(() => {
    setIsDragMode(prev => !prev);
  }, []);

  return {
    sectionLayouts,
    updateSectionPosition,
    toggleSectionLock,
    resetLayout,
    isDragMode,
    toggleDragMode
  };
}