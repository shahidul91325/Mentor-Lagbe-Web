"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

/**
 * Theme toggle supporting Light, Dark, and System modes.
 * Clean, accessible dropdown with smooth feedback.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          className="relative size-9 rounded-xl border-border bg-surface text-foreground transition-all duration-200 hover:border-primary/50 hover:bg-elevated"
          aria-label="Select theme (Light, Dark, System)"
        >
          <Sun className="size-4 rotate-0 scale-100 text-amber-500 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 text-orange-400 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 rounded-xl border-border bg-card shadow-lg">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`flex cursor-pointer items-center gap-2 rounded-lg py-2 text-sm transition-colors ${
            theme === "light" ? "bg-primary/10 font-semibold text-primary" : "text-foreground hover:bg-muted"
          }`}
        >
          <Sun className="size-4 text-amber-500" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`flex cursor-pointer items-center gap-2 rounded-lg py-2 text-sm transition-colors ${
            theme === "dark" ? "bg-primary/10 font-semibold text-primary" : "text-foreground hover:bg-muted"
          }`}
        >
          <Moon className="size-4 text-orange-400" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`flex cursor-pointer items-center gap-2 rounded-lg py-2 text-sm transition-colors ${
            theme === "system" ? "bg-primary/10 font-semibold text-primary" : "text-foreground hover:bg-muted"
          }`}
        >
          <Monitor className="size-4 text-muted-foreground" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
