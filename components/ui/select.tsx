// Minimal shadcn/ui Select component stubs to satisfy imports.
// These components render their children directly without styling.
// They expose the same API used in the project (value, onValueChange).

import React, { createContext, useContext } from 'react';

interface SelectContextProps {
  value: string;
  onValueChange: (value: string) => void;
}

const SelectContext = createContext<SelectContextProps | undefined>(undefined);

export function Select({
  value,
  onValueChange,
  children,
  disabled,
}: {
  value: string;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  // disabled is ignored in this stub implementation
  return (
    <SelectContext.Provider value={{ value, onValueChange }}>
      {children}
    </SelectContext.Provider>
  );
}

export function SelectTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  // Simple wrapper to allow className styling.
  return <div className={className}>{children}</div>;
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = useContext(SelectContext);
  if (!ctx) return null;
  return <span>{ctx.value || placeholder}</span>;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function SelectItem({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  const ctx = useContext(SelectContext);
  const handleClick = () => {
    ctx?.onValueChange(value);
  };
  return (
    <div
      onClick={handleClick}
      role="option"
      aria-selected={ctx?.value === value}
      style={{ cursor: 'pointer', padding: '0.25rem' }}
    >
      {children}
    </div>
  );
}
