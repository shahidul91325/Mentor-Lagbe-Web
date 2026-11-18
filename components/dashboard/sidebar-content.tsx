"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crown } from "lucide-react";
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
  const items = NAV_ITEMS[role];

  const isActive = (href: string) =>
    href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="px-1">
        <Logo href="/dashboard" />
      </div>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Dashboard navigation">
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
            <Link href="/pricing">Upgrade Now</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
