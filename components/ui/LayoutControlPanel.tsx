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
  'connection-controls': 'Connection Controls',
  'connection-status': 'Connection Status',
  'obs-controls': 'OBS Controls'
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
        "rounded-xl p-4 w-64",
        // Add stronger background for transparent pages
        "obs-transparent:bg-black/80 obs-transparent:border-white/20"
      )}
    >
      <div className="mb-3">
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
          🎛️ Layout Controls
        </h3>
      </div>

      {/* Component Visibility Toggles */}
      <div className="space-y-2 mb-4">
        {Array.from(sectionLayouts.entries()).map(([id, layout]) => (
          <div key={id} className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-primary)] truncate layout-control-text">
              {SECTION_NAMES[id] || id}
            </span>
            <button
              onClick={() => onVisibilityToggle(id, !layout.isVisible)}
              className={cn(
                "w-7 h-3.5 rounded-full transition-colors relative flex-shrink-0 ml-2",
                "focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]",
                layout.isVisible 
                  ? "bg-[var(--accent-primary)]" 
                  : "bg-[var(--border-color)]"
              )}
            >
              <div className={cn(
                "w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5",
                layout.isVisible ? "translate-x-3.5" : "translate-x-0.5"
              )} />
            </button>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onReset}
          className={cn(
            "flex-1 px-3 py-1.5 text-xs font-medium rounded-md",
            "bg-[var(--bg-tertiary)] text-[var(--text-primary)]",
            "border border-[var(--border-color)]",
            "hover:bg-[var(--bg-secondary)] transition-colors",
            "focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
          )}
        >
          🔄
        </button>
        
        <button
          onClick={onExitLayoutMode}
          className={cn(
            "flex-1 px-3 py-1.5 text-xs font-medium rounded-md",
            "bg-[var(--accent-primary)] text-white",
            "hover:bg-[var(--accent-secondary)] transition-colors",
            "focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
          )}
        >
          ✓ Exit
        </button>
      </div>
    </div>
  );
}