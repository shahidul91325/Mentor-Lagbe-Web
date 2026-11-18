"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

/**
 * Dark/light pill switch (matches the reference design).
 *
 * Rendering is driven entirely by CSS (`dark:` variants), so the server and
 * the client produce identical markup — no hydration mismatch. JavaScript is
 * only used to flip the theme on click.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle color theme"
      className="relative flex h-9 w-[68px] shrink-0 items-center justify-between rounded-full border border-border bg-surface px-2 shadow-sm"
    >
      <Moon className="size-4 text-muted-foreground" aria-hidden />
      <Sun className="size-4 text-amber-500" aria-hidden />
      {/* Knob: right position in light theme, slides left in dark theme */}
      <span className="absolute top-1 left-1 size-7 translate-x-[32px] rounded-full bg-primary shadow transition-transform duration-200 dark:translate-x-0">
        <span className="flex size-full items-center justify-center text-white">
          <Sun className="size-3.5 dark:hidden" aria-hidden />
          <Moon className="hidden size-3.5 dark:block" aria-hidden />
        </span>
      </span>
    </button>
  );
}
