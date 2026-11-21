'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';

interface Tuition {
  _id: string;
  title: string;
  subject: string;
  classLevel: string;
  mode: string;
  location?: string;
  monthlyFee: number;
  approvalStatus?: string;
  isActive?: boolean;
  createdAt?: string;
}

export default function MyTuitions() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyTuitions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Tutor-owned listings (including pending/rejected) — the shared API
      // client attaches the stored JWT automatically.
      const data = await apiFetch<Tuition[] | { tuitions?: Tuition[] }>('/api/tuitions/my', {
        cache: 'no-store',
      });

      // Adapt this mapping to the actual backend response.
      const records = Array.isArray(data) ? data : (data.tuitions ?? []);

      setTuitions(records);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMyTuitions();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchMyTuitions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Tuitions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage the tuition listings you have posted.</p>
        </div>

        <Button asChild>
          <Link href="/dashboard/tutor/post-tuition">+ Post New Tuition</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Tuition Listings ({tuitions.length})</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-20 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="py-10 text-center">
              <p className="mb-4 text-sm text-destructive">{error}</p>
              <Button variant="outline" onClick={fetchMyTuitions}>
                Try Again
              </Button>
            </div>
          ) : tuitions.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="text-lg font-semibold">No Tuitions Posted Yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">Create your first tuition listing to get started.</p>
              <Button asChild className="mt-5">
                <Link href="/dashboard/tutor/post-tuition">Post Your First Tuition</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tuitions.map((tuition) => (
                <div key={tuition._id} className="rounded-xl border p-4 transition-colors hover:bg-muted/30">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{tuition.title}</h3>

                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span>{tuition.subject}</span>
                        <span>•</span>
                        <span>{tuition.classLevel}</span>
                        <span>•</span>
                        <span>{tuition.mode}</span>
                      </div>

                      {tuition.location && <p className="text-sm text-muted-foreground">{tuition.location}</p>}

                      <p className="font-semibold">
                        ৳{tuition.monthlyFee?.toLocaleString('en-BD')}
                        <span className="text-sm font-normal text-muted-foreground"> / month</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">
                        {tuition.approvalStatus ?? 'Pending'}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          tuition.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {tuition.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
