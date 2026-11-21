'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader2, AlertCircle, CreditCard, ArrowLeft, Crown } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

type VerifyResult = {
  success: boolean;
  paymentStatus: string;
  plan: string;
};

type PaymentInfo = {
  planName?: string;
  amount?: number;
  currency?: string;
  paidAt?: string;
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
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get('session_id');
  const payment = searchParams.get('payment');

  const [verifying, setVerifying] = useState(true);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);

  useEffect(() => {
    const handleReturn = async () => {
      if (payment === 'success' && sessionId) {
        setVerifying(true);
        try {
          const verifyResult = await apiFetch<VerifyResult>(
            `/api/payments/verify-session/${sessionId}`,
            { method: 'GET' }
          );
          setResult(verifyResult);

          if (verifyResult.success) {
            // Fetch payment details for display
            try {
              const historyResult = await apiFetch<{ payments: PaymentInfo[] }>('/api/payments/history', {
                method: 'GET',
              });
              const latestPayment = historyResult?.payments?.[0];
              if (latestPayment) {
                setPaymentInfo(latestPayment);
              }
            } catch {
              // Ignore history fetch errors
            }
          }
        } catch (err) {
          console.error('Verify session error:', err);
          setError(err instanceof Error ? err.message : 'Payment verification failed.');
        } finally {
          setVerifying(false);
        }
      } else if (payment === 'cancelled') {
        setError('Checkout was canceled. Your membership is unchanged.');
        setVerifying(false);
      } else {
        setError('Invalid payment return URL.');
        setVerifying(false);
      }
    };

    void handleReturn();
  }, [payment, sessionId]);

  if (verifying) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="max-w-md w-full border-amber-200 bg-amber-50">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
            <div>
              <h2 className="text-xl font-semibold text-amber-800">Verifying your payment…</h2>
              <p className="mt-2 text-sm text-amber-700">
                Please wait while we confirm your subscription with Stripe.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !result?.success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="max-w-md w-full border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <div>
              <h2 className="text-xl font-semibold text-red-800">Payment Not Confirmed</h2>
              <p className="mt-2 text-sm text-red-700">{error}</p>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => router.push('/pricing')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Pricing
              </Button>
              <Button onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSuccess = result?.success === true;

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className={`max-w-md w-full ${isSuccess ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          {isSuccess ? (
            <>
              <div className="rounded-full bg-emerald-100 p-3">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-800">Payment Successful!</h2>
                <p className="mt-2 text-sm text-emerald-700">
                  Your Pro membership is now active.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-full bg-amber-100 p-3">
                <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-amber-800">Payment Processing</h2>
                <p className="mt-2 text-sm text-amber-700">
                  Your payment is being processed. Please check back in a moment.
                </p>
              </div>
            </>
          )}

          {(paymentInfo || isSuccess) && (
            <div className="w-full rounded-lg bg-white p-4 border border-border text-left">
              <h3 className="font-semibold text-center mb-3">Payment Details</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Plan</dt>
                  <dd className="font-medium">
                    {paymentInfo?.planName || result?.plan || 'Pro'}
                    {isSuccess && <Crown className="ml-1 h-4 w-4 text-amber-500 inline" />}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Amount</dt>
                  <dd className="font-medium">
                    {paymentInfo?.amount
                      ? formatCurrency(paymentInfo.amount, paymentInfo.currency)
                      : '—'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <Badge variant={isSuccess ? 'default' : 'secondary'}>
                      {isSuccess ? 'Paid' : 'Processing'}
                    </Badge>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Date</dt>
                  <dd className="font-medium">{formatDate(paymentInfo?.paidAt)}</dd>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <dt className="text-muted-foreground">Session ID</dt>
                  <dd className="font-mono text-xs truncate max-w-[150px]">{sessionId || '—'}</dd>
                </div>
              </dl>
            </div>
          )}

          <div className="flex flex-col gap-2 w-full mt-2">
            <Link href="/dashboard" className="text-center">
              <Button size="lg" className="w-full">
                <Crown className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/pricing" className="text-center">
              <Button size="lg" variant="outline" className="w-full">
                <CreditCard className="mr-2 h-4 w-4" />
                View Subscription
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            If your plan doesn&apos;t show as Pro immediately, please refresh the page or wait a few moments for
            the webhook confirmation to complete.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}