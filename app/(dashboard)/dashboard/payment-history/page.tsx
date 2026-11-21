'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { RefreshCw, Search, CreditCard, AlertCircle, Receipt, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Payment = {
  _id?: string;
  id?: string;
  userName?: string;
  userEmail?: string;
  planName?: string;
  amount?: number;
  currency?: string;
  transactionId?: string;
  stripeSessionId?: string;
  stripeCheckoutSessionId?: string;
  paymentStatus?: string;
  status?: string;
  paidAt?: string;
  createdAt?: string;
};

const formatCurrency = (amount = 0, currency = 'usd') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
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

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const result = await apiFetch<{ payments: Payment[] }>('/api/payments/history', { method: 'GET' });
      setPayments(Array.isArray(result?.payments) ? result.payments : []);
    } catch (err) {
      console.error('Payment history error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load payment history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHistory();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchHistory]);

  const filtered = useMemo(() => {
    const text = search.toLowerCase();
    return payments.filter((p) => {
      const haystack = [
        p.userName,
        p.userEmail,
        p.transactionId,
        p.stripeCheckoutSessionId,
        p.stripeSessionId,
        p.planName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(text);
    });
  }, [payments, search]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <CreditCard className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your payment history…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mx-auto mt-10 max-w-lg">
        <CardContent className="space-y-4 p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
          <h2 className="text-xl font-semibold">Unable to Load Payment History</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={fetchHistory} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Payment History</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your subscription payments and transactions.</p>
        </div>
        <button
          onClick={fetchHistory}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="shrink-0 text-red-500" size={20} />
            <div>
              <p className="font-medium text-red-600">Unable to load transactions</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
          <button onClick={fetchHistory} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
            Try again
          </button>
        </div>
      )}

      <div className="relative">
        <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, plan or transaction ID…"
          className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Receipt size={28} className="text-muted-foreground" />
            </div>
            <h3 className="font-semibold">{payments.length === 0 ? 'No payments yet' : 'No matching payments'}</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {payments.length === 0
                ? 'Your subscription payments will appear here after a successful Stripe payment.'
                : 'Try changing your search keyword.'}
            </p>
            {(search) && (
              <button onClick={() => setSearch('')} className="mt-4 text-sm font-medium text-primary hover:underline">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((payment) => (
                    <tr
                      key={payment._id ?? payment.id ?? payment.transactionId ?? payment.stripeSessionId}
                      className="transition hover:bg-muted/30"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium">{payment.userName || 'Unknown customer'}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {payment.userEmail || 'Email unavailable'}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          {payment.planName || 'N/A'}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold">
                        {formatCurrency(payment.amount ?? 0, payment.currency)}
                      </td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-border px-5 py-4 text-xs text-muted-foreground flex justify-between">
              <span>Showing {filtered.length} of {payments.length} records</span>
              <span className="inline-flex items-center gap-1">
                <Clock size={14} />
                Data from your payment history
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
