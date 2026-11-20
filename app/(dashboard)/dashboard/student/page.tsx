"use client";

import { useAuth } from "@/providers/auth-provider";
import { RoleGuard } from "@/components/auth/role-guard";
import { StudentDashboardView } from "@/components/dashboard/student/student-dashboard-view";
import { PageLoader } from "@/components/shared/loading";

export default function StudentDashboardPage() {
  const { user } = useAuth();

  return (
    <RoleGuard allowed={["student"]}>
      {user ? <StudentDashboardView user={user} /> : <PageLoader label="Loading student dashboard…" />}
    </RoleGuard>
  );
}
