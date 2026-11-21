'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  RefreshCw,
  Search,
  Wallet,
  Receipt,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { fetchAdminPaymentDetail, fetchAdminPayments, approveAdminPayment } from '@/lib/admin';
import type { AdminPayment } from '@/lib/admin';
import type { Subscription } from '@/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

type Payment = AdminPayment;

type Detail = {
  payment: Payment | null;
  subscription: Subscription | null;
};

const formatCurrency = (amount = 0, currency = 'usd') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: (currency || 'usd').toUpperCase(),
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (date?: string) => {
  if (!date) return 'N/A';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'N/A';
  return parsed.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusStyle = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'paid':
    case 'completed':
    case 'succeeded':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'pending':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'failed':
    case 'cancelled':
    case 'canceled':
      return 'bg-red-500/10 text-red-600 border-red-500/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

export default function AdminTransactionsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const result = await fetchAdminPayments({
        page,
        limit,
        search: search || undefined,
        status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined,
        plan: planFilter && planFilter !== 'all' ? planFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setPayments(result.payments ?? []);
      setTotal(Number(result.total ?? 0));
      setPage(result.page ?? 1);
      setTotalPages(result.totalPages ?? 1);
    } catch (err) {
      console.error('Admin transactions error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load transaction information.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, planFilter, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchTransactions]);

  const fetchDetail = useCallback(async (id: string) => {
    try {
      setDetailOpen(true);
      const result = await fetchAdminPaymentDetail(id);
      setDetail(result ?? { payment: null, subscription: null });
    } catch (err) {
      console.error('Admin payment detail error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load payment details.');
      setDetailOpen(true);
      setDetail({ payment: null, subscription: null });
    }
  }, []);

  const handleApprove = useCallback(async (paymentId: string) => {
    try {
      setApprovingId(paymentId);
      const result = await approveAdminPayment(paymentId);
      if (result?.payment) {
        toast.success('Payment approved and user upgraded to Pro');
        await fetchTransactions();
        if (detail?.payment?._id === paymentId) {
          setDetailOpen(false);
        }
      }
    } catch (err) {
      console.error('Approve payment error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to approve payment');
    } finally {
      setApprovingId(null);
    }
  }, [fetchTransactions, detail]);

  const filtered = useMemo(() => {
    return payments.filter((payment) => {
      const text = search.toLowerCase();
      const haystack = [
        payment.userName,
        payment.userEmail,
        payment.transactionId,
        payment.stripeCheckoutSessionId,
        payment.stripePaymentIntentId,
        payment.stripeSubscriptionId,
        payment.planName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesSearch = haystack.includes(text);

      const status = (payment.paymentStatus ?? payment.status ?? '').toLowerCase();
      const matchesStatus = statusFilter === 'all' || status === statusFilter;

      const plan = (payment.planName ?? '').toLowerCase();
      const matchesPlan = planFilter === 'all' || plan === planFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [payments, search, statusFilter, planFilter]);

  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = ['Customer', 'Email', 'Role', 'Plan', 'Amount', 'Transaction ID', 'Status', 'Payment Date'];
    const rows = filtered.map((payment) => [
      payment.userName ?? '',
      payment.userEmail ?? '',
      payment.userRole ?? '',
      payment.planName ?? '',
      payment.amount ?? 0,
      payment.transactionId || payment.stripeCheckoutSessionId || payment.stripeSessionId || '',
      payment.paymentStatus ?? payment.status ?? '',
      payment.paidAt ?? payment.createdAt ?? '',
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mentorlagbe-transactions.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    {
      label: 'Total Revenue',
      value: formatCurrency(
        payments.reduce((sum, p) => sum + ((p.paymentStatus === 'paid' || p.status === 'paid') ? (p.amount ?? 0) : 0), 0),
        payments[0]?.currency ?? 'usd'
      ),
      icon: Wallet,
      description: 'Total collected revenue (paid only)',
    },
    {
      label: 'Successful Payments',
      value: payments.filter((p) => p.paymentStatus === 'paid' || p.status === 'paid').length,
      icon: CreditCard,
      description: 'Paid transactions',
    },
    {
      label: 'Pending Payments',
      value: payments.filter((p) => p.paymentStatus === 'pending' || p.status === 'pending').length,
      icon: Clock,
      description: 'Awaiting confirmation',
    },
    {
      label: 'Failed Payments',
      value: payments.filter((p) => p.paymentStatus === 'failed' || p.status === 'failed').length,
      icon: AlertCircle,
      description: 'Failed transactions',
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard size={16} />
            Admin / Transactions
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Real payment records from MongoDB, verified via Stripe webhooks.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchTransactions}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={exportCSV}
            disabled={!filtered.length}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowDownToLine size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="shrink-0 text-red-500" size={20} />
            <div>
              <p className="font-medium text-red-600">Unable to load transactions</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
          <button onClick={fetchTransactions} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
            Try again
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                  <Icon size={20} />
                </div>
              </div>
              <p className="mt-4 text-2xl font-bold tracking-tight">{loading ? '...' : stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer, email, plan or transaction ID…"
              className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="canceled">Canceled</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="all">All Plans</option>
            <option value="student-pro">Student Pro</option>
            <option value="tutor-pro">Tutor Pro</option>
          </select>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end gap-3">
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm font-medium hover:bg-muted"
            >
              Clear dates
            </button>
          </div>
        </div>
      </div>
      <Separator />

      {/* Transaction List */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">All Transactions</h2>
            <p className="mt-1 text-sm text-muted-foreground">{filtered.length} of {total} total records</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Receipt size={28} className="text-muted-foreground" />
            </div>
            <h3 className="font-semibold">{payments.length === 0 ? 'No transactions yet' : 'No matching transactions'}</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {payments.length === 0
                ? 'Verified Stripe payments will appear here once processed by the webhook.'
                : 'Try changing your search keyword or filters.'}
            </p>
            {(search || statusFilter !== 'all' || planFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setPlanFilter('all');
                  setStartDate('');
                  setEndDate('');
                }}
                className="mt-4 text-sm font-medium text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Customer</th>
                    <th className="px-5 py-4 font-semibold">Plan</th>
                    <th className="px-5 py-4 font-semibold">Amount</th>
                    <th className="px-5 py-4 font-semibold">Transaction ID</th>
                    <th className="px-5 py-4 font-semibold">Date</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((payment) => (
                    <tr
                      key={payment._id ?? payment.transactionId}
                      className="transition hover:bg-muted/30"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium">{payment.userName || 'Unknown customer'}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{payment.userEmail || 'Email unavailable'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          {payment.planName || 'N/A'}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold">{formatCurrency(payment.amount ?? 0, payment.currency)}</td>
                      <td className="max-w-44 truncate px-5 py-4 font-mono text-xs text-muted-foreground">
                        {payment.transactionId || payment.stripeCheckoutSessionId || payment.stripeSessionId || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                        {formatDate(payment.paidAt ?? payment.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getStatusStyle(
                            payment.paymentStatus ?? payment.status
                          )}`}
                        >
                          { (payment.paymentStatus ?? payment.status) || 'Unknown' }
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fetchDetail(String(payment._id))}
                            className="gap-1 px-3"
                          >
                            <Eye size={14} />
                            Details
                          </Button>
                          {(payment.paymentStatus === 'pending' || payment.status === 'pending') && (
                            <Button
                              size="sm"
                              onClick={() => handleApprove(String(payment._id))}
                              disabled={approvingId === payment._id}
                              className="gap-1 px-3"
                            >
                              {approvingId === payment._id ? (
                                <>
                                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                  Approving...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 size={14} />
                                  Approve
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-2 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  variant="outline"
                  className="px-3"
                >
                  <ChevronLeft size={14} />
                </Button>
                <Button
                  size="sm"
                  disabled={page >= totalPages || totalPages === 0}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  variant="outline"
                  className="px-3"
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>Inspect the payment and its linked subscription.</DialogDescription>
          </DialogHeader>
          {loading || !detail ? (
            <div className="p-4">Loading…</div>
          ) : detail.payment ? (
            <div className="space-y-4 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="font-medium">{detail.payment.userName || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{detail.payment.userEmail || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="font-medium capitalize">{detail.payment.userRole || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Plan</p>
                  <p className="font-medium">{detail.payment.planName || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="font-semibold">{formatCurrency(detail.payment.amount ?? 0, detail.payment.currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Currency</p>
                  <p className="font-medium">{detail.payment.currency || 'usd'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getStatusStyle(
                    detail.payment.paymentStatus ?? detail.payment.status
                  )}`}>
                    { (detail.payment.paymentStatus ?? detail.payment.status) || 'Unknown' }
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payment Date</p>
                  <p className="font-medium">{formatDate(detail.payment.paidAt ?? detail.payment.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Transaction ID</p>
                  <p className="font-mono text-xs text-muted-foreground truncate">
                    {detail.payment.transactionId || detail.payment.stripeCheckoutSessionId || detail.payment.stripeSessionId || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Stripe Customer ID</p>
                  <p className="font-mono text-xs text-muted-foreground truncate">{detail.payment.stripeCustomerId || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payment Intent</p>
                  <p className="font-mono text-xs text-muted-foreground truncate">{detail.payment.stripePaymentIntentId || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Subscription ID</p>
                  <p className="font-mono text-xs text-muted-foreground truncate">
                    {detail.payment.stripeSubscriptionId || '—'}
                  </p>
                </div>
              </div>

              {detail.subscription && (
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-semibold mb-2">Linked Subscription</h3>
                  <div className="grid gap-2 sm:grid-cols-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{detail.subscription.status || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Plan</p>
                      <p className="font-medium">{detail.subscription.plan || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Starts</p>
                      <p className="font-medium">{formatDate(detail.subscription.currentPeriodStart)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ends</p>
                      <p className="font-medium">{formatDate(detail.subscription.currentPeriodEnd)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">No payment found.</div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
