'use client';

import { useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DraggableSectionProps {
  id: string;
  children: ReactNode;
  className?: string;
  defaultPosition?: { x: number; y: number };
  isLocked?: boolean;
  isVisible?: boolean;
  onLockToggle?: (id: string, locked: boolean) => void;
  onVisibilityToggle?: (id: string, visible: boolean) => void;
  onPositionChange?: (id: string, position: { x: number; y: number }) => void;
}

export function DraggableSection({
  id,
  children,
  className = '',
  defaultPosition = { x: 0, y: 0 },
  isLocked = false,
  isVisible = true,
  onLockToggle,
  onVisibilityToggle,
  onPositionChange
}: DraggableSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(defaultPosition);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLDivElement>(null);

  // Update position when defaultPosition changes (from saved layouts)
  useEffect(() => {
    setPosition(defaultPosition);
  }, [defaultPosition]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isLocked) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    // Store the offset from mouse to current position, not to element bounds
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [isLocked, position.x, position.y]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || isLocked) return;

    e.preventDefault();
    const newPosition = {
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    };

    // Constrain to viewport with some padding
    const padding = 20;
    const maxX = window.innerWidth - (sectionRef.current?.offsetWidth || 0) - padding;
    const maxY = window.innerHeight - (sectionRef.current?.offsetHeight || 0) - padding;
    
    newPosition.x = Math.max(padding, Math.min(maxX, newPosition.x));
    newPosition.y = Math.max(padding, Math.min(maxY, newPosition.y));

    setPosition(newPosition);
    onPositionChange?.(id, newPosition);
  }, [isDragging, isLocked, dragOffset, id, onPositionChange]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleLockToggle = () => {
    onLockToggle?.(id, !isLocked);
  };

  const handleVisibilityToggle = () => {
    onVisibilityToggle?.(id, !isVisible);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={sectionRef}
      className={cn(
        "relative group",
        isDragging && "z-50",
        className
      )}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.2s ease-out'
      }}
    >
      {/* Control Buttons */}
      <div className={cn(
        "absolute -top-2 -right-2 z-10 flex gap-1",
        "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      )}>
        {/* Visibility Button */}
        <button
          onClick={handleVisibilityToggle}
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-xs",
            "bg-[var(--bg-secondary)] border border-[var(--border-color)]",
            "hover:bg-[var(--bg-tertiary)] transition-colors",
            "focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]",
            "text-[var(--text-secondary)]"
          )}
          title="Hide section"
        >
          👁️
        </button>

        {/* Lock/Unlock Button */}
        <button
          onClick={handleLockToggle}
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-xs",
            "bg-[var(--bg-secondary)] border border-[var(--border-color)]",
            "hover:bg-[var(--bg-tertiary)] transition-colors",
            "focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]",
            isLocked 
              ? "text-[var(--error-color)]" 
              : "text-[var(--text-secondary)]"
          )}
          title={isLocked ? "Unlock section" : "Lock section"}
        >
          {isLocked ? '🔒' : '📌'}
        </button>

        {/* Drag Handle */}
        {!isLocked && (
          <div
            onMouseDown={handleMouseDown}
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs",
              "bg-[var(--bg-secondary)] border border-[var(--border-color)]",
              "hover:bg-[var(--bg-tertiary)] transition-colors cursor-grab",
              "active:cursor-grabbing",
              isDragging && "cursor-grabbing"
            )}
            title="Drag to move"
          >
            ⋮⋮
          </div>
        )}
      </div>

      {/* Section Content */}
      <div className={cn(
        "transition-all duration-200",
        isDragging && "shadow-2xl scale-105",
        isLocked && "ring-1 ring-[var(--error-color)] ring-opacity-30"
      )}>
        {children}
      </div>
    </div>
  );
}