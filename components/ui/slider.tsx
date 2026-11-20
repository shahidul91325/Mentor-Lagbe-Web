import React from 'react';

/**
 * Minimal Slider stub to satisfy imports.
 * Renders a simple HTML range input that supports a single value or a pair (for range).
 * The original shadcn Slider expects `value` as number[] and `onValueChange` callback.
 */
export function Slider({
  min = 0,
  max = 100,
  step = 1,
  value,
  onValueChange,
}: {
  min?: number;
  max?: number;
  step?: number;
  value: number[]; // expecting [min, max] for range
  onValueChange: (value: number[]) => void;
}) {
  const [low, high] = value;
  // For simplicity render two range inputs to emulate a range slider.
  const handleLowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLow = Number(e.target.value);
    if (newLow <= high) onValueChange([newLow, high]);
  };
  const handleHighChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHigh = Number(e.target.value);
    if (newHigh >= low) onValueChange([low, newHigh]);
  };
  return (
    <div className="flex flex-col gap-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={low}
        onChange={handleLowChange}
        className="w-full"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={high}
        onChange={handleHighChange}
        className="w-full"
      />
    </div>
  );
}
