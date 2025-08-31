'use client';

import { cn } from '@/lib/utils';

interface SectionLayout {
  id: string;
  position: { x: number; y: number };
  isLocked: boolean;
  isVisible: boolean;
}

interface LayoutControlPanelProps {
  sectionLayouts: Map<string, SectionLayout>;
  onVisibilityToggle: (id: string, visible: boolean) => void;
  onReset: () => void;
  onExitLayoutMode: () => void;
}

const SECTION_NAMES: Record<string, string> = {
  'how-to-use': 'How To Use',
  'manual-controls': 'Manual Controls',
  'participant-list': 'Participant List',
  'wheel-section': 'Spinning Wheel',
  'connection-controls': 'Connection Controls'
};

export function LayoutControlPanel({ 
  sectionLayouts, 
  onVisibilityToggle, 
  onReset, 
  onExitLayoutMode 
}: LayoutControlPanelProps) {
  return (
    <div 
      className={cn(
        "fixed top-4 left-4 z-50",
        "bg-[var(--bg-secondary)] border border-[var(--border-color)]",
        "backdrop-blur-xl shadow-[0_8px_32px_var(--shadow-color)]",
        "rounded-2xl p-6 min-w-[280px]"
      )}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          🎛️ Layout Controls
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Drag components, toggle visibility, and arrange your layout.
        </p>
      </div>

      {/* Component Visibility Toggles */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
          👁️ Component Visibility
        </h4>
        {Array.from(sectionLayouts.entries()).map(([id, layout]) => (
          <div key={id} className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-primary)]">
              {SECTION_NAMES[id] || id}
            </span>
            <button
              onClick={() => onVisibilityToggle(id, !layout.isVisible)}
              className={cn(
                "w-8 h-4 rounded-full transition-colors relative",
                "focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-1",
                layout.isVisible 
                  ? "bg-[var(--accent-primary)]" 
                  : "bg-[var(--border-color)]"
              )}
            >
              <div className={cn(
                "w-3 h-3 rounded-full bg-white shadow-sm transition-transform absolute top-0.5",
                layout.isVisible ? "translate-x-4" : "translate-x-0.5"
              )} />
            </button>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onReset}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium rounded-lg",
            "bg-[var(--bg-tertiary)] text-[var(--text-primary)]",
            "border border-[var(--border-color)]",
            "hover:bg-[var(--bg-secondary)] transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
          )}
        >
          🔄 Reset
        </button>
        
        <button
          onClick={onExitLayoutMode}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium rounded-lg",
            "bg-[var(--accent-primary)] text-white",
            "hover:bg-[var(--accent-secondary)] transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-1"
          )}
        >
          ✓ Exit Layout
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-4 text-xs text-[var(--text-secondary)] space-y-1">
        <p>• Drag components by their handle (⋮⋮)</p>
        <p>• Lock components with 📌 to prevent moving</p>
        <p>• Hide components with 👁️ button</p>
        <p>• Layout is saved automatically on exit</p>
      </div>
    </div>
  );
}