'use client';

import { cn } from '@/lib/utils';

interface WeightInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}

export function WeightInput({
  value,
  onChange,
  min = 0.1,
  max = 10,
  step = 0.1,
  className,
  disabled = false
}: WeightInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <input
      type="number"
      value={value}
      onChange={handleChange}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      className={cn(
        "w-16 px-2 py-1 text-xs text-center",
        "bg-[var(--bg-tertiary)] text-[var(--text-primary)]",
        "border border-[var(--border-color)] rounded",
        "transition-colors duration-200",
        "focus:outline-none focus:border-[var(--accent-primary)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "hover:border-[var(--accent-primary)] hover:border-opacity-50",
        className
      )}
    />
  );
}