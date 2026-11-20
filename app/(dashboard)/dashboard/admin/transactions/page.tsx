'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import {
  ArrowDownToLine,
  CreditCard,
  RefreshCw,
  Search,
  // TrendingUp, // removed unused import
  Wallet,
  CalendarDays,
  Receipt,
  AlertCircle,
} from 'lucide-react';

type Payment = {
  _id?: string;
  id?: string;
  userName?: string;
  userEmail?: string;
  amount?: number;
  transactionId?: string;
  stripeSessionId?: string;
  paidAt?: string;
  paymentStatus?: string;
  planName?: string;
  currency?: string;
};

type PaymentSummary = {
  totalPaid?: number;
  totalRevenue?: number;
  recent?: Payment[];
};

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (date?: string) => {
  if (!date) return 'N/A';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return 'N/A';

  return parsedDate.toLocaleDateString('en-BD', {
    day: '2-digit',
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
      return 'bg-red-500/10 text-red-600 border-red-500/20';

    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

export default function AdminTransactionsPage() {
  const [payments, setPayments] = useState<PaymentSummary>({
    totalPaid: 0,
    totalRevenue: 0,
    recent: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');


interface PaymentDashboardResponse {
  payments?: {
    totalPaid?: number;
    totalRevenue?: number;
    recent?: Payment[];
  };
  data?: {
    payments?: {
      totalPaid?: number;
      totalRevenue?: number;
      recent?: Payment[];
    };
  };
}

const fetchTransactions = useCallback(async () => {
  try {
    setLoading(true);
    setError('');
    const result = await apiFetch<PaymentDashboardResponse>('/api/dashboard/admin', { method: 'GET' });
    const paymentData = result?.payments ?? result?.data?.payments;
    if (!paymentData) {
      throw new Error('Payment information was not found.');
    }
    setPayments({
      totalPaid: Number(paymentData.totalPaid ?? 0),
      totalRevenue: Number(paymentData.totalRevenue ?? 0),
      recent: Array.isArray(paymentData.recent) ? paymentData.recent : [],
    });
  } catch (err) {
    console.error('Admin transactions error:', err);
    setError(err instanceof Error ? err.message : 'Failed to load transaction information.');
  } finally {
    setLoading(false);
  }
}, []);

useEffect(() => {
  const timer = setTimeout(() => {
    fetchTransactions();
  }, 0);
  return () => clearTimeout(timer);
}, [fetchTransactions]);




  const memoizedTransactions = useMemo(() => payments.recent ?? [], [payments.recent]);
const transactions = memoizedTransactions;

  const filteredTransactions = useMemo(() => {
    return transactions.filter((payment) => {
      const searchText = search.toLowerCase();

      const matchesSearch = [
        payment.userName,
        payment.userEmail,
        payment.transactionId,
        payment.stripeSessionId,
        payment.planName,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchText));

      const status = payment.paymentStatus?.toLowerCase() ?? '';

      const matchesStatus = statusFilter === 'all' || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [transactions, search, statusFilter]);

  const exportCSV = () => {
    if (!filteredTransactions.length) return;

    const headers = ['Customer', 'Email', 'Plan', 'Amount', 'Transaction ID', 'Status', 'Payment Date'];

    const rows = filteredTransactions.map((payment) => [
      payment.userName ?? '',
      payment.userEmail ?? '',
      payment.planName ?? '',
      payment.amount ?? 0,
      payment.transactionId ?? payment.stripeSessionId ?? '',
      payment.paymentStatus ?? '',
      payment.paidAt ?? '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

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
      value: formatCurrency(payments.totalRevenue),
      icon: Wallet,
      description: 'Total recorded revenue',
    },
    {
      label: 'Successful Payments',
      value: payments.totalPaid ?? 0,
      icon: CreditCard,
      description: 'Total paid transactions',
    },
    {
      label: 'Recent Records',
      value: transactions.length,
      icon: Receipt,
      description: 'Available payment records',
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

          <p className="mt-1 text-sm text-muted-foreground">Monitor payment activity and platform revenue.</p>
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
            disabled={!filteredTransactions.length}
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

          <button
            onClick={fetchTransactions}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Try again
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

      {/* Transaction List */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Payment History</h2>
            <p className="mt-1 text-sm text-muted-foreground">Recent payment records received from the backend.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transactions..."
                className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary [&>option]:bg-background [&>option]:text-foreground"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="completed">Completed</option>
              <option value="succeeded">Succeeded</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4 p-5">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-16 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Receipt size={28} className="text-muted-foreground" />
            </div>

            <h3 className="font-semibold">
              {transactions.length === 0 ? 'No payment records available' : 'No matching transactions'}
            </h3>

            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {transactions.length === 0
                ? 'Payment records will appear here when available from the backend.'
                : 'Try changing your search keyword or payment status filter.'}
            </p>

            {(search || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                }}
                className="mt-4 text-sm font-medium text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
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
                  {filteredTransactions.map((payment, index) => (
                    <tr
                      key={payment._id ?? payment.id ?? payment.transactionId ?? payment.stripeSessionId ?? index}
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

                      <td className="px-5 py-4 font-semibold">{formatCurrency(payment.amount)}</td>

                      <td className="max-w-44 truncate px-5 py-4 font-mono text-xs text-muted-foreground">
                        {payment.transactionId || payment.stripeSessionId || 'N/A'}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                        {formatDate(payment.paidAt)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getStatusStyle(
                            payment.paymentStatus
                          )}`}
                        >
                          {payment.paymentStatus || 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid gap-3 p-4 md:hidden">
              {filteredTransactions.map((payment, index) => (
                <div
                  key={payment._id ?? payment.id ?? payment.transactionId ?? payment.stripeSessionId ?? index}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{payment.userName || 'Unknown customer'}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {payment.userEmail || 'Email unavailable'}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2 py-1 text-xs font-medium capitalize ${getStatusStyle(
                        payment.paymentStatus
                      )}`}
                    >
                      {payment.paymentStatus || 'Unknown'}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="mt-1 font-bold">{formatCurrency(payment.amount)}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Plan</p>
                      <p className="mt-1 text-sm font-medium">{payment.planName || 'N/A'}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="mt-1 text-sm">{formatDate(payment.paidAt)}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Transaction ID</p>
                      <p className="mt-1 truncate font-mono text-xs">
                        {payment.transactionId || payment.stripeSessionId || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex flex-col gap-2 border-t border-border px-5 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {filteredTransactions.length} of {transactions.length} available records
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={14} />
            Data provided by the payment backend
          </span>
        </div>
      </div>
    </div>
  );
}
