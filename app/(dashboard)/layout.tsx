import { DashboardShell } from "@/components/dashboard/dashboard-shell";

/**
 * Dashboard layout (role-aware).
 *
 * TODO(Phase 3): read the signed-in session and pass the real `role`
 * (and redirect to /sign-in when there is no session). Until auth lands,
 * the shell is rendered for the student role so the layout can be
 * designed and tested independently.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="student">{children}</DashboardShell>;
}
