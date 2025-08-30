'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ 
  label, 
  error, 
  className, 
  ...props 
}: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={props.id}
          className="block text-sm font-medium text-[var(--text-primary)]"
        >
          {label}
        </label>
      )}
      
      <input
        className={cn(
          "w-full px-4 py-3 text-base",
          "bg-[var(--bg-tertiary)] text-[var(--text-primary)]",
          "border border-[var(--border-color)] rounded-lg",
          "transition-all duration-300 ease-in-out",
          "focus:outline-none focus:border-[var(--accent-primary)]",
          "focus:shadow-[0_0_0_3px_rgba(145,70,255,0.1)]",
          "placeholder:text-[var(--text-secondary)]",
          error && "border-[var(--error-color)] focus:border-[var(--error-color)]",
          className
        )}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-[var(--error-color)] mt-1">
          {error}
        </p>
      )}
    </div>
  );
}