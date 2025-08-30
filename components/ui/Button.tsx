'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'spin';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const buttonVariants = {
  primary: [
    "bg-[var(--accent-primary)] text-white",
    "hover:shadow-[0_5px_15px_rgba(145,70,255,0.3)]",
    "hover:transform hover:-translate-y-0.5",
    "disabled:opacity-60 disabled:transform-none disabled:shadow-none"
  ],
  secondary: [
    "bg-[var(--bg-tertiary)] text-[var(--text-primary)]",
    "border border-[var(--border-color)]",
    "hover:bg-[var(--bg-secondary)]",
    "hover:transform hover:-translate-y-0.5"
  ],
  danger: [
    "bg-[var(--error-color)] text-white",
    "hover:shadow-[0_5px_15px_rgba(255,107,107,0.3)]",
    "hover:transform hover:-translate-y-0.5"
  ],
  spin: [
    "bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]",
    "text-white text-xl font-bold",
    "hover:shadow-[0_8px_20px_rgba(145,70,255,0.4)]",
    "hover:transform hover:-translate-y-1",
    "disabled:opacity-60 disabled:cursor-not-allowed",
    "disabled:transform-none disabled:shadow-none"
  ]
};

const buttonSizes = {
  sm: "px-3 py-2 text-sm",
  md: "px-5 py-3 text-base",
  lg: "px-8 py-4 text-lg"
};

export function Button({ 
  variant = 'primary', 
  size = 'md',
  className, 
  children, 
  disabled,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "border-none rounded-lg cursor-pointer font-semibold",
        "transition-all duration-300 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-1",
        buttonVariants[variant],
        buttonSizes[size],
        disabled && "cursor-not-allowed",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}