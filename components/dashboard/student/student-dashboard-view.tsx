"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  ArrowRight,
  BookOpen,
  MapPin,
  CalendarDays,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  UserRound,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import {
  fetchStudentDashboard,
  fetchTuitionOpportunities,
  type StudentDashboardData,
  type StudentStats,
} from "@/lib/dashboard";
import type { Tuition, User } from "@/types";

interface StudentDashboardViewProps {
  user: User;
}

const emptyStats: StudentStats = {
  total: 0,
  pending: 0,
  accepted: 0,
  rejected: 0,
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
    case "accepted":
    case "approved":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-800";
    default:
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800";
  }
};

export function StudentDashboardView({ user }: StudentDashboardViewProps) {
  const [dashboard, setDashboard] = useState<StudentDashboardData>({
    stats: emptyStats,
    recentApplications: [],
    recentTuitions: [],
  });
  const [opportunities, setOpportunities] = useState<Tuition[]>([]);
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

      // Fetch student dashboard aggregated data
      const result = await fetchStudentDashboard();
      if (!result || !result.stats) {
        throw new Error("Invalid response format received from student dashboard.");
      }

      setDashboard({
        stats: {
          ...emptyStats,
          ...result.stats,
        },
        recentApplications: Array.isArray(result.recentApplications) ? result.recentApplications : [],
        recentTuitions: Array.isArray(result.recentTuitions) ? result.recentTuitions : [],
      });

      // Fetch tuition opportunities (public approved tuitions)
      try {
        const oppsResult = await fetchTuitionOpportunities();
        if (oppsResult && Array.isArray(oppsResult.tuitions)) {
          setOpportunities(oppsResult.tuitions);
        }
      } catch {
        // Opportunities are complementary — don't fail the whole dashboard if optional
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load student dashboard.");
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
          <h2 className="text-lg font-semibold">Unable to Load Student Dashboard</h2>
          <p className="max-w-md text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={() => loadData()} className="mt-2">
            <RefreshCw className="mr-2 size-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { stats, recentApplications } = dashboard;

  const statsCards = [
    {
      title: "Total Applications",
      value: stats.total,
      sub: "Tuitions you have applied to",
      icon: ClipboardList,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-950/40",
    },
    {
      title: "Pending Review",
      value: stats.pending,
      sub: "Awaiting tutor confirmation",
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-950/40",
    },
    {
      title: "Accepted Applications",
      value: stats.accepted,
      sub: "Ready to begin learning",
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-950/40",
    },
    {
      title: "Rejected Applications",
      value: stats.rejected,
      sub: "Archived submissions",
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-950/40",
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome & Overview Header */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary gap-1 px-2.5 py-0.5">
              <GraduationCap className="size-3.5" />
              Student Learning Hub
            </Badge>
            <Badge variant="secondary" className="capitalize text-xs">
              {user.plan || "free"} Plan
            </Badge>
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {user.name || "Student"}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Track your tuition applications, discover expert tutors, and excel in your studies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => loadData(true)} disabled={refreshing}>
            <RefreshCw className={`mr-2 size-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>

          <Button asChild size="sm">
            <Link href="/tuitions">
              <Search className="mr-1.5 size-4" />
              Browse Tuitions
            </Link>
          </Button>
        </div>
      </section>

      {/* Prominent Action Banner */}
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <CardContent className="flex flex-col items-start justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" />
              Find The Perfect Mentor
            </div>

            <h2 className="text-xl font-bold sm:text-2xl">Ready to Learn Something New?</h2>

            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Explore hundreds of verified tuition opportunities across diverse subjects, classes, and modes (Online &amp; In-Person).
            </p>

            <Button asChild size="default" className="mt-2">
              <Link href="/tuitions">
                <Search className="mr-2 size-4" />
                Browse Available Tuitions
              </Link>
            </Button>
          </div>

          <div className="hidden h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-primary/15 sm:flex">
            <GraduationCap className="size-14 text-primary" />
          </div>
        </CardContent>
      </Card>

      {/* Application Statistics */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">My Application Progress</h2>
          <span className="text-xs text-muted-foreground">Live application stats</span>
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

      {/* Recent Applications & Recommended Tuitions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Recent Applications</h2>
              <p className="text-xs text-muted-foreground">Status of your submitted applications</p>
            </div>

            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
              <Link href="/dashboard/student/my-applications">
                View All
                <ArrowUpRight className="size-3" />
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-4 sm:p-5">
              {recentApplications.length === 0 ? (
                <EmptyState
                  icon={ClipboardList}
                  title="No Applications Yet"
                  description="You have not applied to any tuition posts yet. Browse available tuitions to find your ideal tutor."
                  action={
                    <Button asChild size="sm" className="mt-3">
                      <Link href="/tuitions">
                        <Search className="mr-1.5 size-4" />
                        Explore Tuitions
                      </Link>
                    </Button>
                  }
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
                          {app.tuitionTitle || "Tuition Post"}
                        </p>
                        {app.subject && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <BookOpen className="size-3" />
                            {app.subject}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground">
                          <CalendarDays className="mr-1 inline size-3" />
                          Applied on {formatDate(app.appliedAt || app.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={`text-xs ${getStatusStyle(app.status)}`}>
                          {app.status || "Pending"}
                        </Badge>
                        <Button size="sm" variant="ghost" asChild className="h-7 px-2 text-xs">
                          <Link href="/dashboard/student/my-applications">Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Recommended Tuition Opportunities */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Tuition Opportunities</h2>
              <p className="text-xs text-muted-foreground">Recommended offerings available right now</p>
            </div>

            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
              <Link href="/tuitions">
                Explore More
                <ArrowUpRight className="size-3" />
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-4 sm:p-5">
              {opportunities.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No Tuitions Available"
                  description="Check back soon for new tuition opportunities or try browsing the catalog."
                  action={
                    <Button asChild size="sm" variant="outline" className="mt-3">
                      <Link href="/tuitions">Browse Catalog</Link>
                    </Button>
                  }
                />
              ) : (
                <div className="divide-y divide-border">
                  {opportunities.slice(0, 4).map((opp) => (
                    <div
                      key={opp._id}
                      className="py-3.5 first:pt-0 last:pb-0 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="font-semibold text-sm truncate">{opp.title}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {opp.subject && <span>{opp.subject}</span>}
                          {opp.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3" />
                              {opp.location}
                            </span>
                          )}
                          {opp.monthlyFee != null && (
                            <span className="font-medium text-foreground">
                              ৳{opp.monthlyFee}/mo
                            </span>
                          )}
                        </div>
                      </div>

                      <Button size="sm" variant="outline" asChild className="h-8 shrink-0 text-xs">
                        <Link href={`/tuitions/${opp._id}`}>
                          View Tuition
                          <ArrowRight className="ml-1 size-3" />
                        </Link>
                      </Button>
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

        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="group hover:border-primary/40 transition-all">
            <CardHeader className="pb-2">
              <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Search className="size-5" />
              </div>
              <CardTitle className="text-base">Browse Tuitions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <p>Explore all active and approved tuition listings.</p>
              <Button asChild size="sm" className="w-full">
                <Link href="/tuitions">
                  Browse Now
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:border-primary/40 transition-all">
            <CardHeader className="pb-2">
              <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <ClipboardList className="size-5" />
              </div>
              <CardTitle className="text-base">My Applications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <p>Track responses and status of submitted applications.</p>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/dashboard/student/my-applications">
                  View Status
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
              <CardTitle className="text-base">My Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <p>Update your personal information and contact details.</p>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/dashboard/profile">
                  Edit Profile
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:border-primary/40 transition-all">
            <CardHeader className="pb-2">
              <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <CreditCard className="size-5" />
              </div>
              <CardTitle className="text-base">Subscription Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <p>Unlock premium features and apply to unlimited tuitions.</p>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/pricing">
                  View Plans
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
