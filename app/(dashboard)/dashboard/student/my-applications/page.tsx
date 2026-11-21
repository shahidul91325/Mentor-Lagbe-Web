'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  CalendarDays,
  Wallet,
  GraduationCap,
  ArrowUpRight,
  RefreshCw,
  BookOpen,
  Filter,
  AlertCircle,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Use the same API configuration as your other dashboard pages.
const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Application = {
  _id: string;
  status: string;
  createdAt?: string;
  tuition?: {
    _id?: string;
    title?: string;
    subject?: string;
    className?: string;
    location?: string;
    salary?: number | string;
  };
  tuitionId?: string;
  tuitionTitle?: string;
  subject?: string;
  className?: string;
  location?: string;
  salary?: number | string;
};

const normalizeStatus = (status: string) => status?.toLowerCase().trim() || 'pending';

const getStatusStyle = (status: string) => {
  switch (normalizeStatus(status)) {
    case 'approved':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400';

    case 'rejected':
      return 'border-red-200 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400';

    default:
      return 'border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400';
  }
};

const formatDate = (date?: string) => {
  if (!date) return 'Date unavailable';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return 'Date unavailable';

  return parsed.toLocaleDateString('en-BD', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchApplications = useCallback(async (isRefresh = false) => {
    try {
      setError('');

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (!API_URL) {
        throw new Error('API URL is not configured.');
      }

      // Shared API client — attaches the stored JWT automatically.
      const result = await apiFetch<Application[] | { applications?: Application[] }>(
        '/api/applications/my',
        { cache: 'no-store' },
      );

      const data = Array.isArray(result) ? result : result.applications || [];

      if (!Array.isArray(data)) {
        throw new Error('Invalid applications response.');
      }

      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleWithdraw = async (applicationId: string) => {
    if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return;
    }
    try {
      setWithdrawingId(applicationId);
      await apiFetch(`/api/applications/${applicationId}`, {
        method: 'DELETE',
      });
      toast.success('Application withdrawn successfully');
      await fetchApplications(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to withdraw application';
      toast.error(message);
    } finally {
      setWithdrawingId(null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplications();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchApplications]);

  // Dynamic Statistics
  const stats = useMemo(
    () => [
      {
        title: 'Total Applications',
        value: applications.length,
        icon: FileText,
        color: 'text-blue-600',
        bg: 'bg-blue-100 dark:bg-blue-950/40',
      },
      {
        title: 'Pending',
        value: applications.filter((item) => normalizeStatus(item.status) === 'pending').length,
        icon: Clock,
        color: 'text-amber-600',
        bg: 'bg-amber-100 dark:bg-amber-950/40',
      },
      {
        title: 'Approved',
        value: applications.filter((item) => normalizeStatus(item.status) === 'approved').length,
        icon: CheckCircle2,
        color: 'text-emerald-600',
        bg: 'bg-emerald-100 dark:bg-emerald-950/40',
      },
      {
        title: 'Rejected',
        value: applications.filter((item) => normalizeStatus(item.status) === 'rejected').length,
        icon: XCircle,
        color: 'text-red-600',
        bg: 'bg-red-100 dark:bg-red-950/40',
      },
    ],
    [applications]
  );

  // Dynamic Search and Filter
  const filteredApplications = useMemo(() => {
    return applications.filter((item) => {
      const tuition = item.tuition || {};

      const title = tuition.title || item.tuitionTitle || '';

      const subject = tuition.subject || item.subject || '';

      const matchesSearch = [title, subject, item._id].some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(search.toLowerCase())
      );

      const matchesStatus = statusFilter === 'all' || normalizeStatus(item.status) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            Student Dashboard
            <span>/</span>
            My Applications
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Applications</h1>

          <p className="mt-2 text-sm text-muted-foreground">Track and manage all your tuition applications.</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchApplications(true)} disabled={loading || refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button asChild>
            <Link href="/tuitions">
              <BookOpen className="mr-2 h-4 w-4" />
              Find Tuitions
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.title}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>

                  <h2 className="mt-2 text-3xl font-bold">{loading ? '—' : stat.value}</h2>

                  <p className="mt-1 text-xs text-muted-foreground">Live application data</p>
                </div>

                <div className={`rounded-xl p-3 ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Applications */}
      <Card>
        <CardHeader className="space-y-4">
          <div>
            <CardTitle>Application History</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">View the latest status of your applications.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Search applications..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="relative sm:w-48">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Loading */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-36 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center py-12 text-center">
              <AlertCircle className="mb-3 h-10 w-10 text-destructive" />

              <h3 className="font-semibold">Unable to Load Applications</h3>

              <p className="mt-2 text-sm text-muted-foreground">{error}</p>

              <Button onClick={() => fetchApplications()} variant="outline" className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          )}

          {/* Application List */}
          {!loading && !error && filteredApplications.length > 0 && (
            <div className="space-y-4">
              {filteredApplications.map((application) => {
                const tuition = application.tuition || {};

                const title = tuition.title || application.tuitionTitle || 'Untitled Tuition';

                const subject = tuition.subject || application.subject || 'Not specified';

                const tuitionId = tuition._id || application.tuitionId;

                const status = normalizeStatus(application.status);

                return (
                  <div
                    key={application._id}
                    className="rounded-xl border p-4 transition-all hover:border-primary/40 hover:shadow-sm sm:p-5"
                  >
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">#{application._id.slice(-8)}</Badge>

                          <Badge variant="outline" className={getStatusStyle(status)}>
                            {status === 'approved' && <CheckCircle2 className="mr-1 h-3 w-3" />}

                            {status === 'rejected' && <XCircle className="mr-1 h-3 w-3" />}

                            {status === 'pending' && <Clock className="mr-1 h-3 w-3" />}

                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                        </div>

                        <div>
                          <h3 className="font-semibold">{title}</h3>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {subject}
                            {' · '}
                            {tuition.className || application.className || 'Class not specified'}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            {tuition.location || application.location || 'Location unavailable'}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Wallet className="h-4 w-4" />
                            {tuition.salary || application.salary
                              ? `৳${tuition.salary || application.salary}`
                              : 'Salary unavailable'}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4" />
                            {formatDate(application.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 border-t pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                        {tuitionId && (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/tuitions/${tuitionId}`}>
                              View Tuition
                              <ArrowUpRight className="ml-1 h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        {status === 'pending' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={withdrawingId === application._id}
                            onClick={() => handleWithdraw(application._id)}
                          >
                            {withdrawingId === application._id ? (
                              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <XCircle className="mr-1 h-3.5 w-3.5" />
                            )}
                            Withdraw
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredApplications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-full bg-muted p-5">
                <FileText className="h-9 w-9 text-muted-foreground" />
              </div>

              <h3 className="text-lg font-semibold">
                {applications.length === 0 ? 'No Applications Yet' : 'No Matching Applications'}
              </h3>

              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {applications.length === 0
                  ? 'You have not applied for any tuition yet. Explore available tuition opportunities.'
                  : 'Try changing your search keyword or status filter.'}
              </p>

              {applications.length === 0 && (
                <Button asChild className="mt-5">
                  <Link href="/tuitions">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Explore Tuitions
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="flex items-start gap-3 rounded-xl border bg-muted/30 p-4">
        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

        <div>
          <p className="text-sm font-semibold">Application Updates</p>

          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Your application status is loaded from the server. Refresh this page to check the latest updates.
          </p>
        </div>
      </div>
    </div>
  );
}
