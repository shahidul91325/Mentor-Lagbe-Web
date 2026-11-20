"use client";

import { useAuth } from "@/providers/auth-provider";
import { PageLoader } from "@/components/shared/loading";
import { AdminDashboardView } from "@/components/dashboard/admin/admin-dashboard-view";
import { TutorDashboardView } from "@/components/dashboard/tutor/tutor-dashboard-view";
import { StudentDashboardView } from "@/components/dashboard/student/student-dashboard-view";

/**
 * Main unified dashboard route (/dashboard).
 * Dynamically presents a tailored, role-specific experience for Admin, Tutor, and Student.
 */
export default function MainDashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="py-20">
        <PageLoader label="Loading your personalized dashboard…" />
      </div>
    );
  }

  if (user.role === "admin") {
    return <AdminDashboardView user={user} />;
  }

  if (user.role === "tutor") {
    return <TutorDashboardView user={user} />;
  }

  return <StudentDashboardView user={user} />;
}
