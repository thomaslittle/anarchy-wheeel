'use client';

import { useState } from 'react';
import Image from 'next/image';
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
  const [localWheelImage, setLocalWheelImage] = useState(settings.wheelImage || '');
  const [localWheelMode, setLocalWheelMode] = useState(settings.wheelMode || 'colors');
  const [isWheelCustomizationExpanded, setIsWheelCustomizationExpanded] = useState(false);
  const [isSpinDurationExpanded, setIsSpinDurationExpanded] = useState(false);
  const [isWinnerTextExpanded, setIsWinnerTextExpanded] = useState(false);
  const [isWeightsExpanded, setIsWeightsExpanded] = useState(false);

  const handleColorChange = (index: number, color: string) => {
    const newColors = [...localColors];
    newColors[index] = color;
    setLocalColors(newColors);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLocalWheelImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setLocalWheelImage('');
    setLocalWheelMode('colors');
  };

  const handleSave = () => {
    onUpdateSettings({
      colors: localColors,
      winnerText: localWinnerText,
      spinDuration: localSpinDuration,
      wheelImage: localWheelImage,
      wheelMode: localWheelMode
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
    setLocalWheelImage('');
    setLocalWheelMode('colors');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⚙️ Wheel Settings"
    >
      <div className="space-y-8">
        {/* Wheel Customization */}
        <div className="space-y-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsWheelCustomizationExpanded(!isWheelCustomizationExpanded)}
          >
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">
              Wheel Customization
            </h3>
            <span className="text-2xl text-[var(--text-secondary)]">
              {isWheelCustomizationExpanded ? '▼' : '▶'}
            </span>
          </div>
          
          <p className="text-[var(--text-secondary)]">
            Customize the wheel appearance with colors or upload your own image.
          </p>
          
          {isWheelCustomizationExpanded && (
            <div className="space-y-6">
              {/* Mode Toggle */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-[var(--text-primary)]">
                  Wheel Mode
                </h4>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="wheelMode"
                      value="colors"
                      checked={localWheelMode === 'colors'}
                      onChange={(e) => setLocalWheelMode(e.target.value as 'colors' | 'image')}
                      className="text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                    />
                    <span className="text-sm text-[var(--text-primary)]">Color Segments</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="wheelMode"
                      value="image"
                      checked={localWheelMode === 'image'}
                      onChange={(e) => setLocalWheelMode(e.target.value as 'colors' | 'image')}
                      className="text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                      disabled={!localWheelImage}
                    />
                    <span className={cn(
                      "text-sm",
                      localWheelImage ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                    )}>
                      Image Background
                    </span>
                  </label>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-[var(--text-primary)]">
                  Wheel Image
                </h4>
                <div className="flex flex-col gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={cn(
                      "block w-full text-sm text-[var(--text-primary)]",
                      "file:mr-4 file:py-2 file:px-4",
                      "file:rounded-lg file:border-0",
                      "file:text-sm file:font-medium",
                      "file:bg-[var(--accent-primary)] file:text-white",
                      "hover:file:bg-[var(--accent-secondary)]",
                      "file:cursor-pointer cursor-pointer"
                    )}
                  />
                  {localWheelImage && (
                    <div className="flex items-center gap-3">
                      <Image 
                        src={localWheelImage} 
                        alt="Wheel preview" 
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-full object-cover border-2 border-[var(--border-color)]"
                      />
                      <button
                        onClick={handleRemoveImage}
                        className={cn(
                          "px-3 py-1 text-sm rounded-md",
                          "bg-red-500 text-white hover:bg-red-600",
                          "transition-colors"
                        )}
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Color Segments (only show when in colors mode) */}
              {localWheelMode === 'colors' && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-[var(--text-primary)]">
                    Segment Colors
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Customize the 10 colors used for wheel segments. Colors cycle if you have more than 10 participants.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                </div>
              )}
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
            Reset Wheel
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