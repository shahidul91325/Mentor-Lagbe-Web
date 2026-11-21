"use client";

/**
 * Guards every dashboard route.
 *
 * - while the session is being checked → route-level loader
 * - no session → redirect to /sign-in (remembering where the user
 *   wanted to go so they land back there after signing in)
 * - signed in → renders the dashboard shell with the role that came
 *   from the server-side session (never from client input)
 */
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PageLoader } from "@/components/shared/loading";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useAuth } from "@/providers/auth-provider";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, user, router, pathname]);

  // The children must always stay in the tree — even while the session is
  // unknown or the redirect is pending — but hidden. Next.js validates that
  // every route segment actually renders (instant-navigation validation);
  // returning early here would drop `page.tsx` segments from rendering and
  // fail with "Could not validate that a segment in your UI has instant
  // navigation." Keeping them hidden also guarantees protected content is
  // never visible before the session is confirmed.
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PageLoader label="Checking your session…" />
        <div hidden>{children}</div>
      </div>
    );
  }

  if (!user) {
    // Already redirecting — keep children mounted but hidden so protected
    // content never flashes while still satisfying segment rendering.
    return <div hidden>{children}</div>;
  }

  return <DashboardShell role={user.role}>{children}</DashboardShell>;
}
