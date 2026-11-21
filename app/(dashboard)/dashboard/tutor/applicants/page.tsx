'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Search,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Loader2,
  GraduationCap,
  MapPin,
  CalendarDays,
  BookOpen,
  Phone,
  Mail,
  MessageSquare,
  Clock3,
  User,
  Wallet,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

import { apiFetch } from '@/lib/api';

// ============================================================
// Types
// ============================================================

type Applicant = {
  _id: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;

  // Application document fields
  studentPhone?: string;
  education?: string;
  studentEducation?: string;
  preferredSchedule?: string;
  studentNote?: string;
  message?: string;

  // Populated student information
  student: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };

  // Populated tuition information
  tuition: {
    _id: string;
    title: string;
    subject: string;
    classLevel?: string;
    salary?: number;
    location?: string;
  };
};

type ApplicationResponse =
  | Applicant[]
  | {
      applications?: Applicant[];
    };

// ============================================================
// Status styles
// ============================================================

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

// ============================================================
// Reusable detail item
// ============================================================

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <div className="mt-0.5 rounded-md bg-primary/10 p-2">
        <Icon className="h-4 w-4 text-primary" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>

        <p className="mt-1 break-words text-sm font-medium">
          {value !== undefined && value !== null && String(value).trim() !== '' ? value : 'Not provided'}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function TutorApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const [selected, setSelected] = useState<Applicant | null>(null);

  // ==========================================================
  // Fetch applicants from database
  // ==========================================================

  const fetchApplicants = useCallback(async () => {
    try {
      setLoading(true);

      const result = await apiFetch<ApplicationResponse>('/api/applications/tutor', {
        cache: 'no-store',
      });

      const data = Array.isArray(result) ? result : (result.applications ?? []);

      setApplicants(data);
    } catch (error) {
      console.error('Fetch applicants error:', error);
      toast.error('Unable to load applicants');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplicants();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchApplicants]);

  // ==========================================================
  // Update application status
  // ==========================================================

  const updateStatus = async (applicantId: string, newStatus: 'accepted' | 'rejected') => {
    try {
      setUpdating(applicantId);

      await apiFetch(`/api/applications/${applicantId}/status`, {
        method: 'PATCH',
        body: {
          status: newStatus,
        },
      });

      toast.success(`Application ${newStatus} successfully`);

      setSelected((previous) => (previous?._id === applicantId ? { ...previous, status: newStatus } : previous));

      await fetchApplicants();
    } catch (error) {
      console.error('Update application status error:', error);
      toast.error('Failed to update application');
    } finally {
      setUpdating(null);
    }
  };

  // ==========================================================
  // Search and filter
  // ==========================================================

  const filteredApplicants = applicants.filter((applicant) => {
    const searchableData = [
      applicant.student?.name,
      applicant.student?.email,
      applicant.studentPhone,
      applicant.message,
      applicant.studentNote,
      applicant.tuition?.title,
      applicant.tuition?.subject,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchesSearch = searchableData.includes(search.toLowerCase());

    const matchesStatus = status === 'all' || applicant.status === status;

    return matchesSearch && matchesStatus;
  });

  // ==========================================================
  // Statistics
  // ==========================================================

  const stats = {
    total: applicants.length,
    pending: applicants.filter((applicant) => applicant.status === 'pending').length,
    accepted: applicants.filter((applicant) => applicant.status === 'accepted').length,
    rejected: applicants.filter((applicant) => applicant.status === 'rejected').length,
  };

  const statCards = [
    {
      label: 'Total Applicants',
      value: stats.total,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
    {
      label: 'Accepted',
      value: stats.accepted,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      label: 'Rejected',
      value: stats.rejected,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
  ];

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Applicants</h1>

          <p className="mt-1 text-sm text-muted-foreground">Manage students who applied to your tuition posts.</p>
        </div>

        <Button variant="outline" onClick={fetchApplicants} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics */}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 p-4 sm:p-5">
                <div className={`rounded-xl p-3 ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>

                <div className="min-w-0">
                  <p className="text-xl font-bold sm:text-2xl">{loading ? '—' : stat.value}</p>

                  <p className="text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filter */}

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search student or tuition..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Applicants</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Applicants List */}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Applicant List</h2>

          <span className="text-sm text-muted-foreground">{filteredApplicants.length} results</span>
        </div>

        {loading ? (
          <div className="flex justify-center rounded-xl border py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredApplicants.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="mb-4 h-12 w-12 text-muted-foreground" />

              <h3 className="text-lg font-semibold">No Applicants Found</h3>

              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {search || status !== 'all'
                  ? 'Try changing your search or filter.'
                  : 'Students who apply to your tuition posts will appear here.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredApplicants.map((applicant) => (
              <Card key={applicant._id} className="overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4">
                    {/* Student Information */}

                    <div className="flex items-start gap-3">
                      {applicant.student?.avatar ? (
                        <Image
                          src={applicant.student.avatar}
                          alt={applicant.student.name}
                          width={48}
                          height={48}
                          unoptimized
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                          {applicant.student?.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold">{applicant.student?.name || 'Unknown Student'}</h3>

                        <p className="break-all text-sm text-muted-foreground">{applicant.student?.email}</p>

                        <Badge className={`mt-2 capitalize ${statusStyles[applicant.status]}`} variant="secondary">
                          {applicant.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Tuition Information */}

                    <div className="grid gap-2 rounded-lg bg-muted/50 p-3 sm:grid-cols-2">
                      <p className="flex items-center gap-2 text-sm">
                        <BookOpen className="h-4 w-4 text-primary" />
                        {applicant.tuition?.title || 'Tuition'}
                      </p>

                      <p className="flex items-center gap-2 text-sm">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        {applicant.tuition?.subject || 'Subject'}
                      </p>

                      <p className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        {applicant.tuition?.location || 'Location not specified'}
                      </p>

                      <p className="flex items-center gap-2 text-sm">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        {applicant.createdAt ? new Date(applicant.createdAt).toLocaleDateString() : 'Date unavailable'}
                      </p>
                    </div>

                    {/* Actions */}

                    <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                      <Button variant="outline" size="sm" onClick={() => setSelected(applicant)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>

                      {applicant.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateStatus(applicant._id, 'accepted')}
                            disabled={updating === applicant._id}
                          >
                            {updating === applicant._id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                            )}
                            Accept
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => updateStatus(applicant._id, 'rejected')}
                            disabled={updating === applicant._id}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* =====================================================
          Applicant Details Dialog
      ====================================================== */}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Applicant Details</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-6">
              {/* Student Profile */}

              <div className="flex items-center gap-4 rounded-xl bg-muted/40 p-4">
                {selected.student?.avatar ? (
                  <Image
                    src={selected.student.avatar}
                    alt={selected.student.name}
                    width={64}
                    height={64}
                    unoptimized
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                    {selected.student?.name?.charAt(0) || 'S'}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold">{selected.student?.name || 'Unknown Student'}</h3>

                  <p className="break-all text-sm text-muted-foreground">{selected.student?.email}</p>

                  <Badge className={`mt-2 capitalize ${statusStyles[selected.status]}`} variant="secondary">
                    {selected.status}
                  </Badge>
                </div>
              </div>

              {/* Applicant Submitted Information */}

              <section className="space-y-3">
                <div>
                  <h3 className="font-semibold">Applicant Information</h3>

                  <p className="text-xs text-muted-foreground">Information submitted with the application</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailItem icon={User} label="Full Name" value={selected.student?.name} />

                  <DetailItem icon={Mail} label="Email Address" value={selected.student?.email} />

                  <DetailItem icon={Phone} label="Phone Number" value={selected.studentPhone} />

                  <DetailItem
                    icon={GraduationCap}
                    label="Education / Academic Background"
                    value={selected.education || selected.studentEducation}
                  />

                  <DetailItem icon={Clock3} label="Preferred Schedule" value={selected.preferredSchedule} />

                  <DetailItem
                    icon={CalendarDays}
                    label="Application Date"
                    value={
                      selected.createdAt
                        ? new Date(selected.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Date unavailable'
                    }
                  />
                </div>
              </section>

              {/* Application Message */}

              <section className="space-y-3">
                <div>
                  <h3 className="font-semibold">Application Message</h3>

                  <p className="text-xs text-muted-foreground">Message provided by the applicant</p>
                </div>

                <div className="rounded-xl border p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />

                    <span className="text-sm font-semibold">Message</span>
                  </div>

                  <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                    {selected.message || 'No message provided.'}
                  </p>
                </div>

                {selected.studentNote && (
                  <div className="rounded-xl border p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />

                      <span className="text-sm font-semibold">Additional Note</span>
                    </div>

                    <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                      {selected.studentNote}
                    </p>
                  </div>
                )}
              </section>

              {/* Tuition Information */}

              <section className="space-y-3">
                <div>
                  <h3 className="font-semibold">Tuition Information</h3>

                  <p className="text-xs text-muted-foreground">Details of the tuition post</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailItem icon={BookOpen} label="Tuition Title" value={selected.tuition?.title} />

                  <DetailItem icon={GraduationCap} label="Subject" value={selected.tuition?.subject} />

                  <DetailItem icon={GraduationCap} label="Class / Level" value={selected.tuition?.classLevel} />

                  <DetailItem
                    icon={Wallet}
                    label="Tuition Salary"
                    value={
                      selected.tuition?.salary !== undefined && selected.tuition?.salary !== null
                        ? `৳${selected.tuition.salary}`
                        : undefined
                    }
                  />

                  <div className="sm:col-span-2">
                    <DetailItem icon={MapPin} label="Tuition Location" value={selected.tuition?.location} />
                  </div>
                </div>
              </section>

              {/* Application Status */}

              <div className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">Application Status</p>

                  <Badge className={`mt-2 capitalize ${statusStyles[selected.status]}`} variant="secondary">
                    {selected.status}
                  </Badge>
                </div>

                {selected.status === 'pending' && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateStatus(selected._id, 'accepted')}
                      disabled={updating === selected._id}
                    >
                      {updating === selected._id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Accept
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => updateStatus(selected._id, 'rejected')}
                      disabled={updating === selected._id}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
