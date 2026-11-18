"use client";

/**
 * Root client providers: dark/light theme + toast notifications.
 * Everything that must exist on every page lives here.
 */
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";

function AppToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      theme={resolvedTheme === "light" ? "light" : "dark"}
      position="top-right"
      closeButton
      richColors
    />
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      {children}
      <AppToaster />
    </ThemeProvider>
  );
}
