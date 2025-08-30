'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-[var(--bg-secondary)] border border-[var(--border-color)]",
          "rounded-2xl p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto",
          "shadow-[0_20px_40px_var(--shadow-color)]",
          "backdrop-blur-md",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8 border-b border-[var(--border-color)] pb-5">
          <h2 className="text-2xl font-bold text-[var(--accent-primary)]">
            {title}
          </h2>
          
          <button
            onClick={onClose}
            className={cn(
              "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
              "text-2xl hover:bg-[var(--bg-tertiary)] rounded-full",
              "w-8 h-8 flex items-center justify-center",
              "transition-all duration-200"
            )}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        
        {children}
      </div>
    </div>
  );
}