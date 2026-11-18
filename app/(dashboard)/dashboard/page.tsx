import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { LayoutDashboard } from "lucide-react";

/**
 * Placeholder /dashboard overview.
 * TODO(Phase 3): replace with role-based redirect:
 * student → /dashboard/student, tutor → /dashboard/tutor, admin → /dashboard/admin
 */
export default function DashboardIndexPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to your dashboard</CardTitle>
        <CardDescription>
          Choose your workspace from the sidebar. Role-based pages arrive with the student,
          tutor and admin dashboards.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={LayoutDashboard}
          title="Nothing to show here yet"
          description="Your personalized overview will appear here once your role dashboard is ready."
        />
      </CardContent>
    </Card>
  );
}
