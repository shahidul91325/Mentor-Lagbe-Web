'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, BookOpen, MapPin, RotateCcw, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
import type { Tuition } from '@/types';

type TuitionListResponse = {
  tuitions?: Tuition[];
  total?: number;
};

const FEATURED_LIMIT = 6;

function TuitionCover({ src, title }: { src?: string; title: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-transparent">
        <BookOpen className="size-10 text-primary/60" aria-hidden />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={title}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      onError={() => setFailed(true)}
    />
  );
}

function FeaturedTuitionCard({ tuition }: { tuition: Tuition }) {
  const fee = tuition.monthlyFee ?? tuition.price ?? 0;
  const mode = String(tuition.mode ?? '').toLowerCase();

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
      <Link
        href={`/tuitions/${tuition._id}`}
        className="relative block aspect-[16/10] w-full overflow-hidden bg-muted"
        aria-label={`View ${tuition.title}`}
      >
        <TuitionCover src={tuition.bannerImage} title={tuition.title} />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {tuition.subject && (
            <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur">
              {tuition.subject}
            </span>
          )}
          {mode && (
            <span className="rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold capitalize text-primary-foreground backdrop-blur">
              {mode}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 min-h-12 text-base font-bold leading-6 text-foreground sm:text-lg">
          {tuition.title}
        </h3>

        {tuition.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{tuition.description}</p>
        )}

        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 shrink-0 text-primary" aria-hidden />
            <span className="truncate">{tuition.classLevel || 'All levels'}</span>
          </div>

          {(tuition.location || tuition.area) && (
            <div className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
              <span className="truncate">{tuition.location || tuition.area}</span>
            </div>
          )}

          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Wallet className="size-4 shrink-0 text-primary" aria-hidden />
            {fee > 0 ? `৳${fee.toLocaleString('en-BD')} / month` : 'Fee not specified'}
          </div>
        </div>

        <Button asChild variant="outline" className="mt-5 w-full gap-2 rounded-xl">
          <Link href={`/tuitions/${tuition._id}`}>
            View Details
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </article>
  );
}

export function FeaturedTuitions() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTuitions = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch<TuitionListResponse>(
        `/api/tuitions?page=1&limit=${FEATURED_LIMIT}&sortBy=createdAt&sortOrder=desc`,
        { signal },
      );

      setTuitions(Array.isArray(data?.tuitions) ? data.tuitions.slice(0, FEATURED_LIMIT) : []);
    } catch (err) {
      if (signal?.aborted) return;
      setError(err instanceof Error ? err.message : 'Unable to load tuition listings.');
      setTuitions([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => void loadTuitions(controller.signal), 0);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadTuitions]);

  return (
    <section className="border-y border-border bg-muted/30 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Featured Tuitions</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Latest tuition opportunities</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              The newest approved and active tuitions posted by tutors on MentorLagbe.
            </p>
          </div>

          <Button asChild variant="outline" className="w-fit shrink-0 gap-2 rounded-xl">
            <Link href="/tuitions">
              Browse all tuitions
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: FEATURED_LIMIT }).map((_, index) => (
              <div
                key={index}
                className="h-96 animate-pulse rounded-2xl border border-border/70 bg-card"
                aria-hidden
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center">
            <p className="font-semibold text-foreground">Unable to load featured tuitions</p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">{error}</p>
            <Button type="button" variant="outline" className="mt-5 gap-2 rounded-xl" onClick={() => void loadTuitions()}>
              <RotateCcw className="size-4" aria-hidden />
              Try Again
            </Button>
          </div>
        ) : tuitions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-12 text-center">
            <BookOpen className="size-10 text-primary/60" aria-hidden />
            <p className="mt-4 font-semibold text-foreground">No tuition listings yet</p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Approved tuitions will appear here as soon as tutors publish them.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tuitions.map((tuition) => (
              <FeaturedTuitionCard key={tuition._id} tuition={tuition} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}