'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, MapPin, Wallet, Users, Bookmark, ArrowRight, RefreshCw, Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { PageContainer } from '@/components/shared/page-container';
import { toast } from 'sonner';
import { removeBookmark, fetchSavedTuitions, type SavedTuitionsResponse } from '@/lib/tuition-api';
import { useAuth } from '@/providers/auth-provider';
import type { Tuition } from '@/types';

const formatFee = (fee?: number) => (fee != null && fee > 0 ? `৳${fee.toLocaleString('en-BD')}` : 'Fee not specified');

interface SavedTuitionCardProps {
  tuition: Tuition;
  onRemove: (tuitionId: string) => void;
  busy: boolean;
}

function SavedTuitionCard({ tuition, onRemove, busy }: SavedTuitionCardProps) {
  const tuitionId = tuition._id || '';
  const fee = tuition.monthlyFee ?? tuition.price ?? 0;
  const mode = String(tuition.mode ?? 'online').toLowerCase();
  const tutor = tuition.tutor;
  const tutorName = tutor?.name || tuition.tutorName || 'Tutor';
  const location = tuition.location || tuition.area;

  const handleRemove = async () => {
    await onRemove(tuitionId);
  };

  return (
    <Card className="rounded-2xl border border-border hover:border-primary/30 transition-all duration-200">
      <div className="relative h-48 overflow-hidden rounded-t-xl bg-muted">
        {tuition.bannerImage ? (
          <img
            src={tuition.bannerImage}
            alt={tuition.title}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
            <BookOpen className="size-12 text-primary/40" aria-hidden />
          </div>
        )}
        <span className="absolute top-3 left-3 z-20">
          <Badge variant="outline" className="text-xs font-medium capitalize">
            {mode === 'online' ? 'Online' : mode === 'offline' ? 'Offline' : 'Hybrid'}
          </Badge>
        </span>
      </div>

      <CardContent className="p-4 flex-1 flex flex-col gap-2">
        <CardHeader className="pb-0 flex flex-col gap-1">
          <h3 className="font-semibold text-foreground line-clamp-2">{tuition.title}</h3>
          {tuition.subject && (
            <Badge variant="outline" className="text-xs font-semibold">
              {tuition.subject}
            </Badge>
          )}
        </CardHeader>

        <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3 shrink-0" aria-hidden />
            {tuition.classLevel}
          </span>
          {tuition.daysPerWeek && (
            <span className="flex items-center gap-1">
              {tuition.daysPerWeek} days/week
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="size-3 shrink-0" aria-hidden />
              {location}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="size-8 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
              {tutorName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground truncate">{tutorName}</p>
              <p className="text-xs text-muted-foreground">Tutor</p>
            </div>
          </div>
          <span className="font-bold text-foreground">{formatFee(fee)}</span>
          <span className="text-xs text-muted-foreground">/mo</span>
        </div>
      </CardContent>

      <CardFooter className="border-t pt-3 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <Button asChild className="flex-1" variant="outline">
            <Link href={`/tuitions/${tuitionId}`}>
              <ArrowRight className="mr-2 size-4" />
              View Details
            </Link>
          </Button>
          <Button
            onClick={handleRemove}
            disabled={busy}
            variant="destructive"
            size="sm"
            className="shrink-0"
            aria-label={`Remove bookmark for ${tuition.title}`}
          >
            {busy ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function SavedTuitionsPage() {
  const { user, token } = useAuth();

  const [saved, setSaved] = useState<SavedTuitionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const loadSaved = useCallback(async () => {
    if (!user || user.role !== 'student') {
      setError('Only students can view saved tuitions.');
      setLoading(false);
      return;
    }
    if (!token) {
      setError('Please sign in to view your saved tuitions.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchSavedTuitions(token);
      setSaved(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load saved tuitions.');
      setSaved(null);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSaved();
  }, [loadSaved]);

  const handleRemoveBookmark = useCallback(
    async (tuitionId: string) => {
      setRemoving(tuitionId);
      try {
        const result = await removeBookmark(token!, tuitionId);
        if (!result.saved) {
          setSaved((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              savedTuitions: prev.savedTuitions.filter((t) => t._id !== tuitionId),
              total: prev.total - 1,
            };
          });
          toast.success('Bookmark removed');
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to remove bookmark.');
      } finally {
        setRemoving(null);
      }
    },
    [token]
  );

  // Only students may access this page; the backend enforces ownership too.
  if (user?.role !== 'student') {
    return (
      <main className="min-h-screen bg-background py-20 sm:py-24">
        <PageContainer size="sm">
          <EmptyState
            icon={Bookmark}
            title="Saved Tuitions"
            description="Saved tuitions are available to students. Sign in as a student to view your saved listings."
            action={
              <Button asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
            }
          />
        </PageContainer>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-10 sm:py-14">
      <PageContainer>
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Saved Tuitions
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your bookmarked tuition listings. Remove any you no longer need.
            </p>
          </div>
          {saved && (
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="hidden sm:inline-flex items-center gap-2">
                <Bookmark className="size-4" />
                {saved.plan === 'pro' ? 'Unlimited' : `${saved.savedTuitionIds.length}/${saved.limit} saved`}
              </Badge>
              {saved.plan !== 'pro' && saved.total >= saved.limit && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/pricing">
                    Upgrade to Pro
                    <ArrowRight className="ml-1 size-3.5" />
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SavedTuitionCard
                key={idx}
                tuition={
                  {
                    _id: '',
                    title: '',
                    subject: '',
                    classLevel: '',
                    mode: 'online',
                    location: '',
                    monthlyFee: 0,
                    daysPerWeek: 3,
                    description: '',
                    tutorName: '',
                    tutorEmail: '',
                    approvalStatus: 'approved',
                    isActive: true,
                    createdAt: new Date().toISOString(),
                  } as unknown as Tuition
                }
                onRemove={() => {}}
                busy
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <Bookmark className="mb-4 size-12 text-destructive" aria-hidden />
            <h3 className="text-lg font-bold text-foreground">Unable to load saved tuitions</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">{error}</p>
            <Button onClick={loadSaved} className="mt-5">
              <RefreshCw className="mr-2 size-4" />
              Try Again
            </Button>
          </div>
        ) : !saved || saved.savedTuitions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-12 text-center">
            <Bookmark className="mb-4 size-16 text-muted-foreground" aria-hidden />
            <h3 className="text-base font-semibold text-foreground">No saved tuitions yet</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Bookmark tuitions you are interested in and they will appear here.
            </p>
            <div className="mt-6 flex justify-center">
              <Button asChild variant="outline">
                <Link href="/tuitions">
                  <ArrowRight className="mr-2 size-4" />
                  Browse Tuitions
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {saved.savedTuitions.map((tuition) => (
              <SavedTuitionCard
                key={tuition._id}
                tuition={tuition}
                onRemove={handleRemoveBookmark}
                busy={removing === tuition._id}
              />
            ))}
          </div>
        )}
      </PageContainer>
    </main>
  );
}
