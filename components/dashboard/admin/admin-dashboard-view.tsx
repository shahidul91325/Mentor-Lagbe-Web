"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  Wallet,
  ClipboardCheck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  ArrowUpRight,
  Receipt,
  UserCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { fetchAdminDashboard, type AdminDashboardData } from "@/lib/dashboard";
import type { User } from "@/types";

interface AdminDashboardViewProps {
  user: User;
}

const formatDate = (date?: string) => {
  if (!date) return "Date unavailable";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Date unavailable";
  return parsed.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getStatusBadge = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "approved":
    case "paid":
    case "active":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    case "rejected":
    case "failed":
      return "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-800";
    default:
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800";
  }
};

export function AdminDashboardView({ user }: AdminDashboardViewProps) {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      setError(null);
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const result = await fetchAdminDashboard();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  if (loading) {
    return (
      <div className="space-y-8 pb-10">
        {/* Welcome Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        {/* Stats Grid Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-3 h-8 w-20" />
              <Skeleton className="mt-2 h-3 w-32" />
            </Card>
          ))}
        </div>
        {/* Content Skeletons */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-5">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="mt-4 h-48 w-full rounded-xl" />
          </Card>
          <Card className="p-5">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="mt-4 h-48 w-full rounded-xl" />
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30 my-8">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <AlertCircle className="size-10 text-destructive" />
          <h2 className="text-lg font-semibold">Unable to Load Admin Dashboard</h2>
          <p className="max-w-md text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={() => loadData()} className="mt-2">
            <RefreshCw className="mr-2 size-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const usersStats = data?.users || { total: 0, studentCount: 0, tutorCount: 0, adminCount: 0, recent: [] };
  const tuitionsStats = data?.tuitions || { total: 0, pending: 0, approved: 0, rejected: 0, recent: [] };
  const applicationsStats = data?.applications || { total: 0 };
  const paymentsStats = data?.payments || { totalPaid: 0, totalRevenue: 0, recent: [] };

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome & Overview Header */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary gap-1 px-2.5 py-0.5">
              <ShieldCheck className="size-3.5" />
              Administrator Control Center
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {user.name || "Administrator"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage users, review tuition posts, track platform revenue, and monitor platform health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </section>

      {/* Pending Tuitions Alert Banner (if any) */}
      {tuitionsStats.pending > 0 && (
        <Card className="border-amber-300 bg-amber-50/70 dark:border-amber-800 dark:bg-amber-950/20">
          <CardContent className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                <Clock className="size-5" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground text-sm sm:text-base">
                  {tuitionsStats.pending} Tuition {tuitionsStats.pending === 1 ? "Listing" : "Listings"} Awaiting Approval
                </h2>
                <p className="text-xs text-muted-foreground">
                  New tuition posts require your moderation before they appear on the public website.
                </p>
              </div>
            </div>
            <Button size="sm" asChild className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white">
              <Link href="/dashboard/admin/tuitions">
                Review Listings
                <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics / Admin Overview Statistics */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Platform Overview</h2>
          <span className="text-xs text-muted-foreground">Live metrics</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Users */}
          <Card className="hover:shadow-xs transition-shadow">
            <CardContent className="flex items-center justify-between p-5">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{usersStats.total}</p>
                <p className="text-[11px] text-muted-foreground">
                  {usersStats.studentCount} students • {usersStats.tutorCount} tutors
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <Users className="size-5.5" />
              </div>
            </CardContent>
          </Card>

          {/* Total Tuitions */}
          <Card className="hover:shadow-xs transition-shadow">
            <CardContent className="flex items-center justify-between p-5">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Total Tuitions</p>
                <p className="text-2xl font-bold">{tuitionsStats.total}</p>
                <p className="text-[11px] text-muted-foreground">
                  {tuitionsStats.approved} approved • {tuitionsStats.pending} pending
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <BookOpen className="size-5.5" />
              </div>
            </CardContent>
          </Card>

          {/* Total Applications */}
          <Card className="hover:shadow-xs transition-shadow">
            <CardContent className="flex items-center justify-between p-5">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Applications Submitted</p>
                <p className="text-2xl font-bold">{applicationsStats.total}</p>
                <p className="text-[11px] text-muted-foreground">Across all tuitions</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <ClipboardCheck className="size-5.5" />
              </div>
            </CardContent>
          </Card>

          {/* Platform Revenue */}
          <Card className="hover:shadow-xs transition-shadow">
            <CardContent className="flex items-center justify-between p-5">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ৳{paymentsStats.totalRevenue ? paymentsStats.totalRevenue.toLocaleString() : 0}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {paymentsStats.totalPaid} paid subscriptions
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Wallet className="size-5.5" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tuition Approval Breakdown Grid */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Tuition Approval Breakdown</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-amber-200/80 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/10">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg p-2.5 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                <Clock className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending Review</p>
                <p className="text-xl font-bold">{tuitionsStats.pending}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200/80 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/10">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg p-2.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Approved &amp; Live</p>
                <p className="text-xl font-bold">{tuitionsStats.approved}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200/80 bg-red-50/30 dark:border-red-900/40 dark:bg-red-950/10">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg p-2.5 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400">
                <XCircle className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rejected</p>
                <p className="text-xl font-bold">{tuitionsStats.rejected}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Administrative Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="group hover:border-primary/40 transition-all">
            <CardHeader className="pb-2">
              <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <UserCheck className="size-5" />
              </div>
              <CardTitle className="text-base">User Directory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <p>Search, inspect, and update roles for all students, tutors, and administrators.</p>
              <Button asChild variant="outline" size="sm" className="w-full justify-between">
                <Link href="/dashboard/admin/users">
                  Manage Users
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:border-primary/40 transition-all">
            <CardHeader className="pb-2">
              <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                <BookOpen className="size-5" />
              </div>
              <CardTitle className="text-base">Tuition Moderation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <p>Review new tuition posts, approve verified postings, or reject non-compliant items.</p>
              <Button asChild variant="outline" size="sm" className="w-full justify-between">
                <Link href="/dashboard/admin/tuitions">
                  Moderate Tuitions
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:border-primary/40 transition-all">
            <CardHeader className="pb-2">
              <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Receipt className="size-5" />
              </div>
              <CardTitle className="text-base">Transactions &amp; Billing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <p>Monitor subscription payments, revenue receipts, and Stripe transaction logs.</p>
              <Button asChild variant="outline" size="sm" className="w-full justify-between">
                <Link href="/dashboard/admin/transactions">
                  View Transactions
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Activities Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Tuition Submissions */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Tuition Submissions</h2>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
              <Link href="/dashboard/admin/tuitions">
                View All
                <ArrowUpRight className="size-3" />
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-4 sm:p-5">
              {tuitionsStats.recent.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No Tuitions Found"
                  description="No tuition postings have been created yet."
                />
              ) : (
                <div className="divide-y divide-border">
                  {tuitionsStats.recent.slice(0, 5).map((tuition) => (
                    <div key={tuition._id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="font-medium text-sm truncate">{tuition.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {tuition.subject} • {tuition.tutorName || "Tutor"} • {formatDate(tuition.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={`text-xs ${getStatusBadge(tuition.approvalStatus)}`}>
                          {tuition.approvalStatus || "pending"}
                        </Badge>
                        <Button size="sm" variant="ghost" asChild className="h-7 px-2 text-xs">
                          <Link href="/dashboard/admin/tuitions">Review</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Recent Users */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Registered Users</h2>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
              <Link href="/dashboard/admin/users">
                View All
                <ArrowUpRight className="size-3" />
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-4 sm:p-5">
              {usersStats.recent.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No Users Registered"
                  description="New user registrations will appear here."
                />
              ) : (
                <div className="divide-y divide-border">
                  {usersStats.recent.slice(0, 5).map((u) => (
                    <div key={u._id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="font-medium text-sm truncate">{u.name || "Unnamed User"}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary" className="capitalize text-xs">
                          {u.role || "student"}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground hidden sm:inline">
                          {formatDate(u.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Recent Payments Section */}
      {paymentsStats.recent.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Subscription Payments</h2>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
              <Link href="/dashboard/admin/transactions">
                View All Transactions
                <ArrowUpRight className="size-3" />
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="divide-y divide-border">
                {paymentsStats.recent.slice(0, 5).map((payment) => (
                  <div key={payment._id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium text-sm truncate">
                        {payment.userName || payment.userEmail || "Subscriber"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Plan: {payment.planName || "Pro"} • Transaction ID: {payment.transactionId || "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-semibold text-sm">৳{payment.amount || 0}</span>
                      <Badge variant="outline" className={`text-xs ${getStatusBadge(payment.paymentStatus)}`}>
                        {payment.paymentStatus || "paid"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
