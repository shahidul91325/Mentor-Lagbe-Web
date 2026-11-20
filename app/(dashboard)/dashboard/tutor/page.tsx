"use client";

import { useAuth } from "@/providers/auth-provider";
import { RoleGuard } from "@/components/auth/role-guard";
import { TutorDashboardView } from "@/components/dashboard/tutor/tutor-dashboard-view";
import { PageLoader } from "@/components/shared/loading";

export default function TutorDashboardPage() {
  const { user } = useAuth();

  return (
    <RoleGuard allowed={["tutor"]}>
      {user ? <TutorDashboardView user={user} /> : <PageLoader label="Loading tutor dashboard…" />}
    </RoleGuard>
  );
}
