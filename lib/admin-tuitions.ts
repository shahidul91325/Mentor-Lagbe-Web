// Admin Tuition API helpers
import { apiFetch } from "@/lib/api";
import type { Tuition } from "@/types";

export interface AdminTuitionsResponse {
  tuitions: Tuition[];
  total: number;
  page: number;
  limit: number;
}

/** Fetch paginated list of all tuitions (admin) */
export function fetchAdminTuitions(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
} = {}): Promise<AdminTuitionsResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  const path = `/api/admin/tuitions${query.toString() ? `?${query}` : ""}`;
  return apiFetch<AdminTuitionsResponse>(path);
}

/** Approve a pending tuition */
export function approveTuition(id: string): Promise<{ tuition: Tuition }> {
  return apiFetch<{ tuition: Tuition }>(`/api/admin/tuitions/${id}/approve`, {
    method: "PATCH",
  });
}

/** Reject a pending tuition */
export function rejectTuition(id: string): Promise<{ tuition: Tuition }> {
  return apiFetch<{ tuition: Tuition }>(`/api/admin/tuitions/${id}/reject`, {
    method: "PATCH",
  });
}
