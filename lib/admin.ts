// Admin related API helpers
import { apiFetch } from "@/lib/api";
import type { Subscription, User } from "@/types";

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

/** Admin payment list filters */
export interface AdminPaymentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  plan?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface AdminPayment {
  _id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  planName?: string;
  amount?: number;
  currency?: string;
  transactionId?: string;
  stripeSessionId?: string;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  paymentMethod?: string;
  status?: string;
  paymentStatus?: string;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminPaymentsResponse {
  payments: AdminPayment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary?: {
    totalPaidAmount: number;
    paidCount: number;
    pendingCount: number;
    failedCount: number;
  };
}

/** Fetch paginated list of all payments (admin only) */
export function fetchAdminPayments(params: AdminPaymentsParams = {}): Promise<AdminPaymentsResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.plan) query.set("plan", params.plan);
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  const path = `/api/admin/payments${query.toString() ? `?${query}` : ""}`;
  return apiFetch<AdminPaymentsResponse>(path);
}

/** Fetch a single payment's details (admin only) */
export interface AdminPaymentDetail {
  payment: AdminPayment | null;
  subscription: Subscription | null;
}

export function fetchAdminPaymentDetail(paymentId: string): Promise<AdminPaymentDetail> {
  return apiFetch<AdminPaymentDetail>(`/api/admin/payments/${paymentId}`);
}

/** Approve a pending payment (admin only) */
export interface ApprovePaymentResponse {
  payment: AdminPayment | null;
  message: string;
}

export function approveAdminPayment(paymentId: string): Promise<ApprovePaymentResponse> {
  return apiFetch<ApprovePaymentResponse>(`/api/admin/payments/${paymentId}/approve`, {
    method: 'PATCH',
  });
}
