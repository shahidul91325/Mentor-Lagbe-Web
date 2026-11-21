"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Plus,
  ArrowRight,
  MapPin,
  CalendarDays,
  Wallet,
  RefreshCw,
  AlertCircle,
  BriefcaseBusiness,
  Sparkles,
  ArrowUpRight,
  UserRound,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { fetchTutorDashboard, fetchMySubscription, type TutorDashboardData, type TutorStats, type MySubscriptionResponse } from "@/lib/dashboard";
import type { User } from "@/types";

interface TutorDashboardViewProps {
  user: User;
}

const emptyStats: TutorStats = {
  totalTuitions: 0,
  pendingTuitions: 0,
  approvedTuitions: 0,
  rejectedTuitions: 0,
  activeTuitions: 0,
  totalApplicants: 0,
  pendingApplicants: 0,
  acceptedApplicants: 0,
};

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

const getStatusStyle = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "approved":
    case "accepted":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-800";
    default:
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800";
  }
};

export function TutorDashboardView({ user }: TutorDashboardViewProps) {
  const [dashboard, setDashboard] = useState<TutorDashboardData>({
    stats: emptyStats,
    recentTuitions: [],
    recentApplications: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<MySubscriptionResponse["subscription"] | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      setError(null);
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await fetchTutorDashboard();
      if (!result || !result.stats) {
        throw new Error("Invalid response format received from tutor dashboard.");
      }

      setDashboard({
        stats: {
          ...emptyStats,
          ...result.stats,
        },
        recentTuitions: Array.isArray(result.recentTuitions) ? result.recentTuitions : [],
        recentApplications: Array.isArray(result.recentApplications) ? result.recentApplications : [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tutor dashboard.");
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

  useEffect(() => {
    const timer = setTimeout(() => {
      (async () => {
        try {
          const result = await fetchMySubscription();
          setSubscription(result.subscription ?? null);
        } catch {
          // Subscription is optional; do not fail the dashboard.
        }
      })();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 pb-10">
        <div className="space-y-3">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-3 h-8 w-20" />
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-5">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="mt-4 h-44 w-full rounded-xl" />
          </Card>
          <Card className="p-5">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="mt-4 h-44 w-full rounded-xl" />
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
          <h2 className="text-lg font-semibold">Unable to Load Tutor Dashboard</h2>
          <p className="max-w-md text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={() => loadData()} className="mt-2">
            <RefreshCw className="mr-2 size-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { stats, recentTuitions, recentApplications } = dashboard;

  const statsCards = [
    {
      title: "Total Tuitions",
      value: stats.totalTuitions,
      sub: `${stats.activeTuitions} currently active`,
      icon: BookOpen,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-950/40",
    },
    {
      title: "Active Tuitions",
      value: stats.activeTuitions,
      sub: "Published and accepting students",
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-950/40",
    },
    {
      title: "Total Applicants",
      value: stats.totalApplicants,
      sub: "Students interested in your tuitions",
      icon: Users,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-100 dark:bg-violet-950/40",
    },
    {
      title: "Pending Applicants",
      value: stats.pendingApplicants,
      sub: "Awaiting your response",
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-950/40",
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome & Overview Header */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary gap-1 px-2.5 py-0.5">
              <BriefcaseBusiness className="size-3.5" />
              Tutor Dashboard
            </Badge>
            <Badge variant="secondary" className="capitalize text-xs">
              {user.plan || "free"} Plan
            </Badge>
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {user.name || "Tutor"}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your tuition posts, track student applications, and connect with prospective learners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => loadData(true)} disabled={refreshing}>
            <RefreshCw className={`mr-2 size-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>

          <Button asChild size="sm">
            <Link href="/dashboard/tutor/post-tuition">
              <Plus className="mr-1.5 size-4" />
              Post Tuition
            </Link>
          </Button>
        </div>
      </section>

      {/* Membership / Subscription Overview */}
      <Card className="overflow-hidden border-primary/20 bg-primary/[0.03]">
        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Your Membership</p>
            <p className="text-sm font-bold capitalize">{user.plan || "free"} {user.plan === "pro" ? "Member" : "Free"}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between w-full sm:w-auto">
            {subscription ? (
              <>
                <div className="flex items-center gap-2">
                  <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                    {subscription.status}
                  </Badge>
                  {subscription.cancelAtPeriodEnd && (
                    <Badge variant="outline" className="text-xs">
                      Cancels at period end
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Starts {formatDate(subscription.currentPeriodStart)} &bull;
                  Renews {formatDate(subscription.currentPeriodEnd)}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">No active subscription</Badge>
              </div>
            )}
            <Button asChild size="sm" variant="outline">
              <Link href="/pricing">
                {user.plan === "pro" ? "Manage Subscription" : "Upgrade to Pro"}
                <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prominent Action Banner */}
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <CardContent className="flex flex-col items-start justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" />
              Grow Your Teaching Career
            </div>

            <h2 className="text-xl font-bold sm:text-2xl">Find Your Next Student!</h2>

            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Create a targeted tuition post detailing your subjects, location, schedule, and monthly fees to attract motivated students.
            </p>

            <Button asChild size="default" className="mt-2">
              <Link href="/dashboard/tutor/post-tuition">
                <Plus className="mr-2 size-4" />
                Post a Tuition Now
              </Link>
            </Button>
          </div>

          <div className="hidden h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-primary/15 sm:flex">
            <BookOpen className="size-14 text-primary" />
          </div>
        </CardContent>
      </Card>

      {/* Primary Statistics */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Teaching Activity Overview</h2>
          <span className="text-xs text-muted-foreground">Live analytics</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="hover:shadow-xs transition-shadow">
                <CardContent className="flex items-center justify-between p-5">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground">{stat.sub}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${stat.bg}`}>
                    <Icon className={`size-6 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Tuition Approval Breakdown */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Tuition Approval Status</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-amber-200/80 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/10">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg p-2.5 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                <Clock className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending Approval</p>
                <p className="text-xl font-bold">{stats.pendingTuitions}</p>
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
                <p className="text-xl font-bold">{stats.approvedTuitions}</p>
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
                <p className="text-xl font-bold">{stats.rejectedTuitions}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Tuitions & Recent Applications */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Tuition Posts */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Recent Tuition Posts</h2>
              <p className="text-xs text-muted-foreground">Your recently created tuition offerings</p>
            </div>

            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
              <Link href="/dashboard/tutor/my-tuitions">
                View All
                <ArrowUpRight className="size-3" />
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-4 sm:p-5">
              {recentTuitions.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No Tuition Posts Yet"
                  description="Publish your first tuition post to start connecting with students."
                  action={
                    <Button asChild size="sm" className="mt-3">
                      <Link href="/dashboard/tutor/post-tuition">
                        <Plus className="mr-1.5 size-4" />
                        Post a Tuition
                      </Link>
                    </Button>
                  }
                />
              ) : (
                <div className="divide-y divide-border">
                  {recentTuitions.slice(0, 5).map((tuition) => (
                    <div
                      key={tuition._id}
                      className="py-3.5 first:pt-0 last:pb-0 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 space-y-1.5">
                        <h3 className="font-semibold text-sm truncate">{tuition.title}</h3>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {tuition.subject && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="size-3" />
                              {tuition.subject}
                            </span>
                          )}
                          {tuition.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3" />
                              {tuition.location}
                            </span>
                          )}
                          {tuition.monthlyFee != null && (
                            <span className="flex items-center gap-1 font-medium text-foreground">
                              <Wallet className="size-3" />
                              ৳{tuition.monthlyFee}/mo
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={`text-xs ${getStatusStyle(tuition.approvalStatus)}`}>
                          {tuition.approvalStatus || "Pending"}
                        </Badge>
                        <Button size="sm" variant="ghost" asChild className="h-7 px-2 text-xs">
                          <Link href="/dashboard/tutor/my-tuitions">Manage</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Recent Applications */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Recent Student Applications</h2>
              <p className="text-xs text-muted-foreground">Students who applied to your tuition posts</p>
            </div>

            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
              <Link href="/dashboard/tutor/applicants">
                View All
                <ArrowUpRight className="size-3" />
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-4 sm:p-5">
              {recentApplications.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No Applications Yet"
                  description="When students apply to your tuition posts, their submissions will appear here."
                />
              ) : (
                <div className="divide-y divide-border">
                  {recentApplications.slice(0, 5).map((app) => (
                    <div
                      key={app._id}
                      className="py-3.5 first:pt-0 last:pb-0 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="font-semibold text-sm truncate">
                          {app.studentName || app.studentEmail || "Student Applicant"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          Applied to: {app.tuition?.title || app.tuitionTitle || "Tuition Post"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          <CalendarDays className="mr-1 inline size-3" />
                          {formatDate(app.appliedAt || app.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={`text-xs ${getStatusStyle(app.status)}`}>
                          {app.status || "Pending"}
                        </Badge>
                        <Button size="sm" variant="ghost" asChild className="h-7 px-2 text-xs">
                          <Link href="/dashboard/tutor/applicants">Review</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Quick Action Navigation */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Quick Actions</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="group hover:border-primary/40 transition-all">
            <CardHeader className="pb-2">
              <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Plus className="size-5" />
              </div>
              <CardTitle className="text-base">Post a Tuition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <p>Create a new tuition offering and connect with prospective students.</p>
              <Button asChild size="sm" className="w-full">
                <Link href="/dashboard/tutor/post-tuition">
                  Create Tuition
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:border-primary/40 transition-all">
            <CardHeader className="pb-2">
              <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <FileText className="size-5" />
              </div>
              <CardTitle className="text-base">Manage My Tuitions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <p>Update, pause, or view performance of all your existing tuition listings.</p>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/dashboard/tutor/my-tuitions">
                  View Tuitions
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:border-primary/40 transition-all">
            <CardHeader className="pb-2">
              <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <UserRound className="size-5" />
              </div>
              <CardTitle className="text-base">Tutor Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <p>Update your bio, educational background, contact details, and teaching preferences.</p>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/dashboard/profile">
                  Edit Profile
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
