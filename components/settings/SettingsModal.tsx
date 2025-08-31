'use client';

import { useState } from 'react';
import type { WheelSettings } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  color: string;
  label: string;
  index: number;
  onColorChange: (index: number, color: string) => void;
}

function ColorPicker({ color, label, index, onColorChange }: ColorPickerProps) {
  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg",
        "bg-[var(--bg-tertiary)] border border-[var(--border-color)]"
      )}
    >
      <div 
        className="w-8 h-8 rounded-full border-2 border-[var(--border-color)]"
        style={{ backgroundColor: color }}
      />
      
      <div className="flex-1 font-medium text-[var(--text-primary)]">
        {label}
      </div>
      
      <input
        type="color"
        value={color}
        onChange={(e) => onColorChange(index, e.target.value)}
        className="w-12 h-10 border-none rounded-lg cursor-pointer"
      />
    </div>
  );
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: WheelSettings;
  onUpdateSettings: (settings: Partial<WheelSettings>) => void;
  onResetColors: () => void;
  onPreviewWinner?: (text: string) => void;
  participants?: { username: string; weight: number }[];
  onUpdateWeight?: (username: string, weight: number) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetColors,
  onPreviewWinner,
  participants = [],
  onUpdateWeight
}: SettingsModalProps) {
  const [localColors, setLocalColors] = useState(settings.colors);
  const [localWinnerText, setLocalWinnerText] = useState(settings.winnerText);
  const [localSpinDuration, setLocalSpinDuration] = useState(settings.spinDuration);
  const [isColorsExpanded, setIsColorsExpanded] = useState(false);
  const [isSpinDurationExpanded, setIsSpinDurationExpanded] = useState(false);
  const [isWinnerTextExpanded, setIsWinnerTextExpanded] = useState(false);
  const [isWeightsExpanded, setIsWeightsExpanded] = useState(false);

  const handleColorChange = (index: number, color: string) => {
    const newColors = [...localColors];
    newColors[index] = color;
    setLocalColors(newColors);
  };

  const handleSave = () => {
    onUpdateSettings({
      colors: localColors,
      winnerText: localWinnerText,
      spinDuration: localSpinDuration
    });
    onClose();
  };

  const handlePreview = () => {
    if (onPreviewWinner) {
      onPreviewWinner(localWinnerText);
    }
  };

  const handleReset = () => {
    onResetColors();
    setLocalColors(settings.colors);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⚙️ Wheel Settings"
    >
      <div className="space-y-8">
        {/* Wheel Colors */}
        <div className="space-y-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsColorsExpanded(!isColorsExpanded)}
          >
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">
              Wheel Colors
            </h3>
            <span className="text-2xl text-[var(--text-secondary)]">
              {isColorsExpanded ? '▼' : '▶'}
            </span>
          </div>
          
          <p className="text-[var(--text-secondary)]">
            Customize the 10 colors used for wheel segments. Colors cycle if you have more than 10 participants.
          </p>
          
          {isColorsExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {localColors.map((color, index) => (
                <ColorPicker
                  key={index}
                  color={color}
                  label={`Color ${index + 1}`}
                  index={index}
                  onColorChange={handleColorChange}
                />
              ))}
            </div>
          )}
        </div>

        {/* Spin Duration */}
        <div className="space-y-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsSpinDurationExpanded(!isSpinDurationExpanded)}
          >
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">
              Spin Duration
            </h3>
            <span className="text-2xl text-[var(--text-secondary)]">
              {isSpinDurationExpanded ? '▼' : '▶'}
            </span>
          </div>
          
          <p className="text-[var(--text-secondary)]">
            Control how long the wheel spins (base duration + random variation).
          </p>

          {isSpinDurationExpanded && (
            <div className="space-y-3">
              <Slider
                value={localSpinDuration}
                onChange={setLocalSpinDuration}
                min={2000}
                max={10000}
                step={500}
                label="Base Duration"
                unit="s"
              />
              
              <p className="text-xs text-[var(--text-secondary)]">
                Actual spin time includes random variation of 0-2 seconds.
              </p>
            </div>
          )}
        </div>

        {/* Winner Text */}
        <div className="space-y-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsWinnerTextExpanded(!isWinnerTextExpanded)}
          >
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">
              Winner Celebration Text
            </h3>
            <span className="text-2xl text-[var(--text-secondary)]">
              {isWinnerTextExpanded ? '▼' : '▶'}
            </span>
          </div>
          
          <p className="text-[var(--text-secondary)]">
            Customize what appears in the popup when someone wins. Use {'{winner}'} to show the winner&apos;s name.
          </p>

          {isWinnerTextExpanded && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[var(--text-primary)]">
                Celebration Message
              </label>
              
              <textarea
                value={localWinnerText}
                onChange={(e) => setLocalWinnerText(e.target.value)}
                placeholder="🎉 WINNER! 🎉&#10;{winner}"
                rows={3}
                className={cn(
                  "w-full px-4 py-3 text-base resize-vertical",
                  "bg-[var(--bg-tertiary)] text-[var(--text-primary)]",
                  "border border-[var(--border-color)] rounded-lg",
                  "transition-all duration-300 ease-in-out",
                  "focus:outline-none focus:border-[var(--accent-primary)]",
                  "focus:shadow-[0_0_0_3px_rgba(145,70,255,0.1)]",
                  "placeholder:text-[var(--text-secondary)]",
                  "font-inherit"
                )}
              />
              
              <p className="text-xs text-[var(--text-secondary)]">
                Press Enter for new lines. Use {'{winner}'} where you want the winner&apos;s name to appear.
              </p>

              {onPreviewWinner && (
                <Button
                  variant="secondary"
                  onClick={handlePreview}
                >
                  👁️ Preview Celebration
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Participant Weights */}
        {participants.length > 0 && onUpdateWeight && (
          <div className="space-y-4">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setIsWeightsExpanded(!isWeightsExpanded)}
            >
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                Participant Weights
              </h3>
              <span className="text-2xl text-[var(--text-secondary)]">
                {isWeightsExpanded ? '▼' : '▶'}
              </span>
            </div>
            
            <p className="text-[var(--text-secondary)]">
              Adjust individual participant win probabilities. Higher weights increase chances of winning.
            </p>

            {isWeightsExpanded && (
              <div className="space-y-3">
                <div className="max-h-64 overflow-y-auto space-y-3 border border-[var(--border-color)] rounded-lg p-4">
                  {participants.map((participant) => (
                    <div
                      key={participant.username}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg",
                        "bg-[var(--bg-tertiary)] border border-[var(--border-color)]"
                      )}
                    >
                      <span className="text-[var(--text-primary)] font-medium">
                        {participant.username}
                      </span>
                      
                      <div className="flex items-center gap-3">
                        <Slider
                          value={participant.weight}
                          onChange={(value) => onUpdateWeight(participant.username, value)}
                          min={0.1}
                          max={10}
                          step={0.1}
                          unit="x"
                          showValue={false}
                          className="w-32"
                        />
                        
                        <span className="text-sm font-medium text-[var(--text-primary)] min-w-[3rem] text-center">
                          {participant.weight.toFixed(1)}x
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <p className="text-xs text-[var(--text-secondary)]">
                  Use the !weight command in chat (mods only): !weight username 2.5
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div 
          className={cn(
            "flex gap-4 justify-end pt-6",
            "border-t border-[var(--border-color)]"
          )}
        >
          <Button
            variant="secondary"
            onClick={handleReset}
          >
            Reset Colors
          </Button>
          
          <Button
            variant="primary"
            onClick={handleSave}
          >
            Save Settings
          </Button>
        </div>
      </div>
    </Modal>
  );
}