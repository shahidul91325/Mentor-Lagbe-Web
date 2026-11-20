"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Crown, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { NAV_ITEMS } from "@/components/dashboard/nav-config";
import type { Role } from "@/types";

interface SidebarContentProps {
  role: Role;
  /** Closes the mobile drawer after a link is clicked. */
  onNavigate?: () => void;
}

/**
 * Sidebar contents shared by the desktop sidebar and the mobile drawer.
 */
export function SidebarContent({ role, onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role] || [];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return (
        pathname === "/dashboard" ||
        pathname === "/dashboard/student" ||
        pathname === "/dashboard/tutor" ||
        pathname === "/dashboard/admin"
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex h-full flex-col gap-5 p-4">
      {/* Brand logo */}
      <div className="px-1">
        <Logo href="/dashboard" />
      </div>

      {/* Dedicated Visit Website navigation item */}
      <div className="px-1">
        <Link
          href="/"
          onClick={onNavigate}
          className="group flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/40 px-3.5 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          <div className="flex items-center gap-3">
            <Home className="size-4.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden />
            <span>Visit Website</span>
          </div>
          <ArrowUpRight className="size-3.5 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" aria-hidden />
        </Link>
      </div>

      {/* Role-specific dashboard navigation */}
      <nav className="flex flex-1 flex-col gap-1" aria-label="Dashboard navigation">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Menu
        </div>
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="size-4.5 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade card — hidden for admins (they do not subscribe). */}
      {role !== "admin" && (
        <div className="rounded-2xl border border-primary/25 bg-primary/10 p-4 text-center">
          <Crown className="mx-auto size-6 text-primary" aria-hidden />
          <p className="mt-2 text-sm font-semibold text-foreground">Upgrade to Pro</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Unlock more features and grow faster!
          </p>
          <Button asChild size="sm" className="mt-3 w-full">
            <Link href="/pricing" onClick={onNavigate}>Upgrade Now</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
