"use client";

import { useAuth } from "@/providers/auth-provider";
import { RoleGuard } from "@/components/auth/role-guard";
import { AdminDashboardView } from "@/components/dashboard/admin/admin-dashboard-view";
import { PageLoader } from "@/components/shared/loading";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <RoleGuard allowed={["admin"]}>
      {user ? <AdminDashboardView user={user} /> : <PageLoader label="Loading admin dashboard…" />}
    </RoleGuard>
  );
}
