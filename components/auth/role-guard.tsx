/*
 * RoleGuard – client component that ensures a page is only accessible to users
 * with one of the allowed roles. It relies on the AuthProvider session data.
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { PageLoader } from "@/components/shared/loading";
import type { Role } from "@/types";

interface RoleGuardProps {
  /** Roles allowed to view the wrapped content */
  allowed: Role[];
  children: React.ReactNode;
}

export function RoleGuard({ allowed, children }: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !allowed.includes(user.role as Role)) {
      const rolePathMap: Record<Role, string> = {
        admin: "/dashboard/admin",
        tutor: "/dashboard/tutor",
        student: "/dashboard/student",
      };
      const target = rolePathMap[user.role as Role] ?? "/dashboard";
      router.replace(target);
    }
  }, [isLoading, user, allowed, router]);

  // While the auth status is loading, show a spinner.
  if (isLoading) {
    return <PageLoader label="Checking your permissions…" />;
  }

  // If no user (handled by ProtectedRoute), render nothing.
  if (!user) {
    return null;
  }

  // If the user's role is not permitted, render nothing while redirecting.
  if (!allowed.includes(user.role as Role)) {
    return null;
  }

  return <>{children}</>;
}
