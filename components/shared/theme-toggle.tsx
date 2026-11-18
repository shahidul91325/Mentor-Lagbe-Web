"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

/**
 * Dark/light pill switch (matches the reference design).
 * The knob slides over the moon (dark) or sun (light) icon.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="relative flex h-9 w-[68px] shrink-0 items-center justify-between rounded-full border border-border bg-surface px-2 shadow-sm"
    >
      <Moon className="size-4 text-muted-foreground" aria-hidden />
      <Sun className="size-4 text-amber-500" aria-hidden />
      <span
        className={`absolute top-1 size-7 rounded-full bg-primary shadow transition-transform duration-200 ${
          isDark ? "translate-x-0" : "translate-x-[32px]"
        }`}
      >
        <span className="flex size-full items-center justify-center text-white">
          {isDark ? <Moon className="size-3.5" aria-hidden /> : <Sun className="size-3.5" aria-hidden />}
        </span>
      </span>
    </button>
  );
}
