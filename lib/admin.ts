// Admin related API helpers
import { apiFetch } from "@/lib/api";
import type { User } from "@/types";

// Re‑export User as AdminUser; no extra fields needed.
export type AdminUser = User;

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Fetch paginated list of all users (admin only) */
export function fetchAdminUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
} = {}): Promise<AdminUsersResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.role) query.set("role", params.role);
  const path = `/api/admin/users${query.toString() ? `?${query}` : ""}`;
  return apiFetch<AdminUsersResponse>(path);
}

/** Change a user's role */
export function patchUserRole(userId: string, role: "student" | "tutor" | "admin"): Promise<{ user: AdminUser }> {
  return apiFetch<{ user: AdminUser }>(`/api/admin/users/${userId}/role`, {
    method: "PATCH",
    body: { role },
  });
}
