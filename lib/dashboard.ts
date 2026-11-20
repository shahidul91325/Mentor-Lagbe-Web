// lib/dashboard.ts
import { apiFetch } from "@/lib/api";
import type { Tuition, Role } from "@/types";

/** Types for Tutor dashboard */
export interface TutorStats {
  totalTuitions: number;
  pendingTuitions: number;
  approvedTuitions: number;
  rejectedTuitions: number;
  activeTuitions: number;
  totalApplicants: number;
  pendingApplicants: number;
  acceptedApplicants: number;
}

export interface TutorApplication {
  _id: string;
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  status?: string;
  appliedAt?: string;
  createdAt?: string;
  tuitionId?: string;
  tuitionTitle?: string;
  tuition?: {
    _id?: string;
    title?: string;
    subject?: string;
  };
}

export interface TutorDashboardData {
  stats: TutorStats;
  recentTuitions: Tuition[];
  recentApplications: TutorApplication[];
}

/** Types for Student dashboard */
export interface StudentStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
}

export interface StudentApplicationItem {
  _id: string;
  studentEmail?: string;
  tuitionId: string;
  tuitionTitle?: string;
  subject?: string;
  status: string;
  appliedAt?: string;
  createdAt?: string;
}

export interface StudentDashboardData {
  stats: StudentStats;
  recentApplications: StudentApplicationItem[];
  recentTuitions: Array<{
    _id: string;
    title: string;
    subject?: string;
    tutorName?: string;
  }>;
}

/** Types for Admin dashboard */
export interface AdminUserItem {
  _id: string;
  name?: string;
  email?: string;
  role?: Role;
  createdAt?: string;
}

export interface AdminPaymentItem {
  _id: string;
  userName?: string;
  userEmail?: string;
  amount?: number;
  currency?: string;
  paidAt?: string;
  transactionId?: string;
  paymentStatus?: string;
  planName?: string;
}

export interface AdminDashboardData {
  users: {
    total: number;
    studentCount: number;
    tutorCount: number;
    adminCount: number;
    recent: AdminUserItem[];
  };
  tuitions: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    recent: Tuition[];
  };
  applications: {
    total: number;
  };
  payments: {
    totalPaid: number;
    totalRevenue: number;
    recent: AdminPaymentItem[];
  };
}

/** Backward-compatibility aliases */
export type Application = TutorApplication;
export type StudentApplication = StudentApplicationItem;

/** Fetch helpers */
export const fetchTutorDashboard = () =>
  apiFetch<TutorDashboardData>("/api/dashboard/tutor");

export const fetchStudentDashboard = () =>
  apiFetch<StudentDashboardData>("/api/dashboard/student");

export const fetchAdminDashboard = () =>
  apiFetch<AdminDashboardData>("/api/dashboard/admin");

export const fetchTuitionOpportunities = () =>
  apiFetch<{ tuitions: Tuition[] }>("/api/tuitions?limit=4");
