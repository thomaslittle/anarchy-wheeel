'use client';

import { cn } from '@/lib/utils';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  unit?: string;
  className?: string;
  showValue?: boolean;
  disabled?: boolean;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  unit = '',
  className,
  showValue = true,
  disabled = false
}: SliderProps) {
  const formatValue = (val: number): string => {
    if (unit === 's') return `${(val / 1000).toFixed(1)}s`;
    if (unit === 'x') return `${val.toFixed(1)}x`;
    return `${val}${unit}`;
  };

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <label className="block text-sm font-medium text-[var(--text-primary)]">
          {label}
          {showValue && (
            <span className="ml-2 text-[var(--text-secondary)]">
              {formatValue(value)}
            </span>
          )}
        </label>
      )}
      
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className={cn(
          "w-full h-2 rounded-lg appearance-none cursor-pointer",
          "bg-[var(--bg-tertiary)] outline-none transition-opacity",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "[&::-webkit-slider-thumb]:appearance-none",
          "[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5",
          "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent-primary)]",
          "[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md",
          "[&::-webkit-slider-thumb]:disabled:cursor-not-allowed",
          "[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5",
          "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--accent-primary)]",
          "[&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:cursor-pointer",
          "[&::-moz-range-thumb]:disabled:cursor-not-allowed"
        )}
      />
      
      {min !== undefined && max !== undefined && (
        <div className="flex justify-between text-xs text-[var(--text-secondary)]">
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      )}
    </div>
  );
}