'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Laptop,
  Home,
  BookOpen,
  DollarSign,
  GraduationCap,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
  RefreshCw,
  Send,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageContainer } from '@/components/shared/page-container';
import { EmptyState } from '@/components/shared/empty-state';
import { ApplyTuitionDialog } from '@/components/tuitions/apply-tuition-dialog';
import { fetchTuitionById } from '@/lib/tuition-api';
import { apiFetch, type ApiError } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import type { Tuition } from '@/types';

interface ExistingApplication {
  _id: string;
  status: string;
  appliedAt?: string;
  createdAt?: string;
  tuitionId?: string;
  tuition?: {
    _id?: string;
  };
}

interface TuitionDetailsViewProps {
  id: string;
}

export function TuitionDetailsView({ id }: TuitionDetailsViewProps) {
  const { user, isLoading: isAuthLoading } = useAuth();

  const [tuition, setTuition] = useState<Tuition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  // Application state for student
  const [existingApplication, setExistingApplication] = useState<ExistingApplication | null>(null);
  const [checkingApp, setCheckingApp] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  const loadTuition = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setIsNotFound(false);

      const data = await fetchTuitionById(id);
      if (!data) {
        setIsNotFound(true);
        return;
      }
      setTuition(data);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      if (
        apiError.status === 404 ||
        apiError.status === 400 ||
        apiError.message?.toLowerCase().includes('not found') ||
        apiError.message?.toLowerCase().includes('invalid tuition id')
      ) {
        setIsNotFound(true);
      } else {
        setError(apiError.message || 'Failed to load tuition details.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Check if current logged-in student has already applied
  const checkExistingApplication = useCallback(async () => {
    if (!user || user.role !== 'student') {
      setExistingApplication(null);
      return;
    }

    try {
      setCheckingApp(true);
      const res = await apiFetch<ExistingApplication[] | { applications?: ExistingApplication[] }>(
        '/api/applications/my-applications'
      );
      const list = Array.isArray(res) ? res : res.applications || [];
      const match = list.find(
        (app) =>
          app.tuitionId === id ||
          (typeof app.tuitionId === 'object' && String(app.tuitionId) === id) ||
          app.tuition?._id === id
      );
      if (match) {
        setExistingApplication(match);
      } else {
        setExistingApplication(null);
      }
    } catch {
      // If student application check fails silently, we allow the dialog to handle duplicates on submission
    } finally {
      setCheckingApp(false);
    }
  }, [id, user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTuition();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadTuition]);

  useEffect(() => {
    if (!isAuthLoading && user?.role === 'student') {
      const timer = setTimeout(() => {
        checkExistingApplication();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isAuthLoading, user, checkExistingApplication]);

  const handleApplicationSuccess = (createdApp?: unknown) => {
    if (createdApp && typeof createdApp === 'object' && '_id' in createdApp) {
      setExistingApplication(createdApp as ExistingApplication);
    } else {
      // Re-fetch to ensure fresh data
      checkExistingApplication();
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <section className="min-h-screen bg-background py-10 sm:py-14">
        <PageContainer>
          {/* Breadcrumb Skeleton */}
          <div className="mb-6 flex items-center gap-2">
            <Skeleton className="h-5 w-32" />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left 2 Cols: Main Info Skeleton */}
            <div className="space-y-6 lg:col-span-2">
              <div className="space-y-3">
                <Skeleton className="h-8 w-3/4" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>

              {/* Stats Grid Skeleton */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>

              {/* Description Skeleton */}
              <Skeleton className="h-44 rounded-xl" />

              {/* Tutor Card Skeleton */}
              <Skeleton className="h-36 rounded-xl" />
            </div>

            {/* Right 1 Col: Sidebar Skeleton */}
            <div className="lg:col-span-1">
              <Skeleton className="h-72 rounded-xl" />
            </div>
          </div>
        </PageContainer>
      </section>
    );
  }

  // 2. Not Found State
  if (isNotFound) {
    return (
      <section className="min-h-screen bg-background py-16 sm:py-24">
        <PageContainer size="sm">
          <EmptyState
            icon={FileQuestion}
            title="Tuition Not Found"
            description="The tuition listing you are looking for does not exist, has been removed, or is not currently active."
            action={
              <Button asChild className="mt-4">
                <Link href="/tuitions">
                  <ChevronLeft className="mr-1.5 size-4" />
                  Back to All Tuitions
                </Link>
              </Button>
            }
          />
        </PageContainer>
      </section>
    );
  }

  // 3. Error State with Retry
  if (error || !tuition) {
    return (
      <section className="min-h-screen bg-background py-16 sm:py-24">
        <PageContainer size="sm">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center sm:p-12">
            <AlertCircle className="mb-3 size-12 text-destructive" />
            <h2 className="text-xl font-bold text-foreground">Unable to Load Tuition</h2>
            <p className="mt-2 text-sm text-muted-foreground">{error || 'Something went wrong while fetching details.'}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => loadTuition()} variant="default">
                <RefreshCw className="mr-2 size-4" />
                Retry
              </Button>
              <Button asChild variant="outline">
                <Link href="/tuitions">
                  <ChevronLeft className="mr-1.5 size-4" />
                  Browse Other Tuitions
                </Link>
              </Button>
            </div>
          </div>
        </PageContainer>
      </section>
    );
  }

  // 4. Content Loaded Successfully
  const monthlySalary = tuition.monthlyFee ?? tuition.price ?? 0;
  const modeLower = (tuition.mode || 'online').toLowerCase();
  const ModeIcon = modeLower === 'online' ? Laptop : Home;
  const tutor = tuition.tutor;
  const tutorDisplayName = tutor?.name || tuition.tutorName || 'Tutor';
  const tutorDisplayEmail = tutor?.email || tuition.tutorEmail;
  const tutorDisplayPhone = tutor?.phone;
  const tutorDisplayBio = tutor?.bio;
  const tutorDisplayImage = tutor?.image || tuition.bannerImage;

  const postedDate = tuition.createdAt
    ? new Date(tuition.createdAt).toLocaleDateString('en-BD', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  // Format requirements if available
  const parsedRequirements: string[] = Array.isArray(tuition.requirements)
    ? tuition.requirements
    : typeof tuition.requirements === 'string' && tuition.requirements.trim()
    ? tuition.requirements.split('\n').filter(Boolean)
    : [];

  return (
    <section className="min-h-screen bg-background py-10 sm:py-14">
      <PageContainer>
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/tuitions"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Back to Browse Tuitions
          </Link>
        </div>

        {/* Main Grid: Content + Action Sidebar */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Details (2 Cols) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Header / Title */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary font-semibold">
                  {tuition.subject}
                </Badge>
                <Badge variant="secondary">{tuition.classLevel}</Badge>
                <Badge variant="outline" className="capitalize">
                  <ModeIcon className="mr-1 size-3 text-primary" />
                  {modeLower}
                </Badge>
                {tuition.daysPerWeek && (
                  <Badge variant="ghost" className="text-muted-foreground">
                    {tuition.daysPerWeek} Days / Week
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                {tuition.title}
              </h1>

              {postedDate && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="size-3.5" />
                  Posted on {postedDate}
                </p>
              )}
            </div>

            {/* Key Information Highlight Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* Monthly Salary / Fee */}
              <div className="rounded-xl border border-border bg-card p-4">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <DollarSign className="size-4" />
                </span>
                <p className="mt-2 text-xs font-medium text-muted-foreground">Monthly Fee</p>
                <p className="mt-0.5 text-base font-bold text-foreground">
                  ৳{monthlySalary.toLocaleString()}
                </p>
              </div>

              {/* Class Level */}
              <div className="rounded-xl border border-border bg-card p-4">
                <span className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <GraduationCap className="size-4" />
                </span>
                <p className="mt-2 text-xs font-medium text-muted-foreground">Class Level</p>
                <p className="mt-0.5 text-base font-bold text-foreground truncate">{tuition.classLevel}</p>
              </div>

              {/* Mode & Location */}
              <div className="rounded-xl border border-border bg-card p-4">
                <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <ModeIcon className="size-4" />
                </span>
                <p className="mt-2 text-xs font-medium text-muted-foreground">Tuition Mode</p>
                <p className="mt-0.5 text-base font-bold text-foreground capitalize truncate">
                  {tuition.location ? `${modeLower} (${tuition.location})` : modeLower}
                </p>
              </div>

              {/* Preferred Schedule / Days */}
              <div className="rounded-xl border border-border bg-card p-4">
                <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <Clock className="size-4" />
                </span>
                <p className="mt-2 text-xs font-medium text-muted-foreground">Schedule</p>
                <p className="mt-0.5 text-base font-bold text-foreground truncate">
                  {tuition.preferredSchedule || `${tuition.daysPerWeek || 3} days/week`}
                </p>
              </div>
            </div>

            {/* Description Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Tuition Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {tuition.description}
                </div>
              </CardContent>
            </Card>

            {/* Requirements Section (if available) */}
            {parsedRequirements.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Student Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {parsedRequirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Tutor Details Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Tutor Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <Avatar size="lg">
                    {tutorDisplayImage && <AvatarImage src={tutorDisplayImage} alt={tutorDisplayName} />}
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {tutorDisplayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground text-base">{tutorDisplayName}</h3>
                    <p className="text-xs text-muted-foreground">Verified Tutor on MentorLagbe</p>
                    {tutorDisplayBio && (
                      <p className="pt-1 text-sm text-muted-foreground leading-relaxed">
                        {tutorDisplayBio}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-2 border-t sm:grid-cols-2 text-xs text-muted-foreground">
                  {tutorDisplayEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="size-4 text-primary shrink-0" />
                      <span className="truncate">{tutorDisplayEmail}</span>
                    </div>
                  )}
                  {tutorDisplayPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="size-4 text-primary shrink-0" />
                      <span>{tutorDisplayPhone}</span>
                    </div>
                  )}
                  {tuition.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-primary shrink-0" />
                      <span className="truncate">{tuition.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-4 text-primary shrink-0" />
                    <span>Specializes in {tuition.subject}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Sidebar / Application Status (1 Col) */}
          <div className="space-y-6 lg:col-span-1">
            <Card className="sticky top-20 border-primary/20 shadow-md">
              <CardHeader>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Monthly Tuition Fee</span>
                  <span className="text-2xl font-black text-primary">
                    ৳{monthlySalary.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">BDT per month • {tuition.daysPerWeek || 3} days weekly</p>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <div className="rounded-lg bg-muted/50 p-3 space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Subject:</span>
                    <span className="font-medium text-foreground">{tuition.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Class Level:</span>
                    <span className="font-medium text-foreground">{tuition.classLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mode:</span>
                    <span className="font-medium text-foreground capitalize">{modeLower}</span>
                  </div>
                  {tuition.location && (
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="font-medium text-foreground truncate max-w-[150px]">{tuition.location}</span>
                    </div>
                  )}
                </div>

                {/* Authentication & Role Handlers */}
                {isAuthLoading || checkingApp ? (
                  <Skeleton className="h-10 w-full rounded-lg" />
                ) : !user ? (
                  /* Case 1: Unauthenticated User */
                  <div className="space-y-3">
                    <Button asChild className="w-full" size="default">
                      <Link href={`/sign-in?next=/tuitions/${id}`}>
                        Sign In to Apply
                        <ArrowRight className="ml-1.5 size-4" />
                      </Link>
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      Don&apos;t have an account?{' '}
                      <Link href="/sign-up" className="text-primary underline">
                        Register as Student
                      </Link>
                    </p>
                  </div>
                ) : user.role === 'tutor' ? (
                  /* Case 2: Logged-in Tutor */
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <ShieldAlert className="size-4" />
                      Tutor Account
                    </div>
                    <p className="mt-1">
                      You are logged in as a Tutor. Tutors cannot apply to tuition postings.
                    </p>
                  </div>
                ) : user.role === 'admin' ? (
                  /* Case 3: Logged-in Admin */
                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-700 dark:text-blue-400">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Info className="size-4" />
                      Admin Account
                    </div>
                    <p className="mt-1">
                      Administrative accounts cannot submit tuition applications.
                    </p>
                  </div>
                ) : existingApplication ? (
                  /* Case 4: Student has already applied */
                  <div className="space-y-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                    <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Application Submitted</h4>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Status:{' '}
                        <span className="font-semibold capitalize text-primary">
                          {existingApplication.status || 'Pending'}
                        </span>
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href="/dashboard/student/my-applications">
                        View in My Applications
                      </Link>
                    </Button>
                  </div>
                ) : (
                  /* Case 5: Authenticated Student who has not applied yet */
                  <div className="space-y-2">
                    <Button
                      onClick={() => setIsApplyOpen(true)}
                      className="w-full"
                      size="default"
                    >
                      <Send className="mr-2 size-4" />
                      Apply for Tuition
                    </Button>
                    <p className="text-center text-[11px] text-muted-foreground">
                      Free application • Direct contact with tutor
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Application Modal Dialog */}
        <ApplyTuitionDialog
          open={isApplyOpen}
          onOpenChange={setIsApplyOpen}
          tuitionId={tuition._id}
          tuitionTitle={tuition.title}
          onSuccess={handleApplicationSuccess}
        />
      </PageContainer>
    </section>
  );
}
