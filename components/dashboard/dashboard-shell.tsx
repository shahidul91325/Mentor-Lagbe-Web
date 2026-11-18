"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Logo } from "@/components/shared/logo";
import { SidebarContent } from "@/components/dashboard/sidebar-content";
import type { Role } from "@/types";

interface DashboardShellProps {
  role: Role;
  children: React.ReactNode;
}

/**
 * Responsive dashboard frame:
 * - fixed sidebar on large screens
 * - hamburger + slide-in drawer on mobile/tablet
 * - sticky topbar with theme toggle (user menu added in Phase 3)
 */
export function DashboardShell({ role, children }: DashboardShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-sidebar lg:block">
        <SidebarContent role={role} />
      </aside>

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open dashboard menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Dashboard menu</SheetTitle>
                <SidebarContent role={role} onNavigate={() => setDrawerOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="lg:hidden">
              <Logo href="/dashboard" />
            </div>
            <p className="hidden text-sm font-medium text-muted-foreground lg:block">
              Smart Tuition &amp; Mentorship Platform
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* User avatar + logout are added in Phase 3 (auth) */}
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
