/**
 * Shared domain types for MentorLagbe.
 * Each interface mirrors one MongoDB collection (exactly four).
 */

/** user collection */
export type Role = "student" | "tutor" | "admin";
export type Plan = "free" | "pro";

export interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: Role;
  phone?: string;
  bio?: string;
  plan: Plan;
  createdAt: string;
}

/** tuitions collection */
export type TuitionMode = "Online" | "Offline" | "online" | "offline" | "hybrid";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface TutorSummary {
  _id?: string;
  name?: string;
  email?: string;
  image?: string;
  phone?: string;
  bio?: string;
  role?: string;
}

export interface Tuition {
  _id: string;
  title: string;
  subject: string;
  classLevel: string;
  mode: TuitionMode;
  location: string;
  monthlyFee: number;
  price?: number;
  daysPerWeek: number;
  bannerImage?: string;
  description: string;
  requirements?: string | string[];
  preferredSchedule?: string;
  tutorName: string;
  tutorEmail: string;
  tutorId?: string;
  tutor?: TutorSummary;
  approvalStatus: ApprovalStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

/** applications collection */
export type ApplicationStatus = "pending" | "accepted" | "rejected";

export interface Application {
  _id: string;
  tuitionId: string;
  tuitionTitle: string;
  subject: string;
  monthlyFee: number;
  tutorEmail: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  preferredSchedule: string;
  studentNote?: string;
  status: ApplicationStatus;
  appliedAt: string;
}

/** payments collection */
export interface Payment {
  _id: string;
  userEmail: string;
  userName: string;
  userRole: Role;
  planName: string;
  amount: number;
  currency: string;
  transactionId: string;
  stripeSessionId: string;
  paymentStatus: "paid";
  paidAt: string;
}

/** Shape returned by the API for list endpoints with pagination. */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
