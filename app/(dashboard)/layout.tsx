import { ProtectedRoute } from "@/components/auth/protected-route";

/**
 * Dashboard layout (role-aware).
 *
 * `ProtectedRoute` is a client component: it checks the session,
 * redirects to /sign-in when there is none, and renders the shell with
 * the real role from server-side session data.
 *
 * `instant = false`: the dashboard intentionally waits for the client
 * session before rendering, so navigations into it are not instant.
 */
export const instant = false;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
