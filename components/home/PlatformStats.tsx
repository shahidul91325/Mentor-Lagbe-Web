'use client';

import { useEffect, useState } from 'react';
import { BookOpen, GraduationCap, Users, MessagesSquare } from 'lucide-react';

import { apiFetch } from '@/lib/api';

type PlatformStats = {
  tuitions: number;
  tutors: number;
  students: number;
  applications: number;
  acceptedApplications: number;
};

type StatsResponse = {
  stats?: PlatformStats;
};

const EMPTY_STATS: PlatformStats = {
  tuitions: 0,
  tutors: 0,
  students: 0,
  applications: 0,
  acceptedApplications: 0,
};

export function PlatformStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    void apiFetch<StatsResponse>('/api/stats', { signal: controller.signal })
      .then((data) => {
        setStats(data?.stats ?? EMPTY_STATS);
      })
      .catch(() => {
        if (!controller.signal.aborted) setStats(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const items = [
    {
      icon: BookOpen,
      label: 'Active Tuitions',
      value: stats?.tuitions,
    },
    {
      icon: GraduationCap,
      label: 'Registered Tutors',
      value: stats?.tutors,
    },
    {
      icon: Users,
      label: 'Registered Students',
      value: stats?.students,
    },
    {
      icon: MessagesSquare,
      label: 'Applications Sent',
      value: stats?.applications,
    },
  ];

  return (
    <section className="border-y border-border bg-muted/30 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="mb-9 text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Platform at a glance</span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Real numbers from MentorLagbe</h2>
        </div>

        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon;
            const value = item.value;

            return (
              <div
                key={item.label}
                className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center shadow-sm"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-6" aria-hidden />
                </div>

                {loading ? (
                  <div className="mt-4 h-9 w-20 animate-pulse rounded-lg bg-muted" aria-hidden />
                ) : (
                  <p className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                    {typeof value === 'number' ? value.toLocaleString() : '—'}
                  </p>
                )}

                <p className="mt-2 text-sm font-medium text-muted-foreground">{item.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}