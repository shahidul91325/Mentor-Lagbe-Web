'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  Crown,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Sparkles,
  Loader2,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { apiFetch } from '@/lib/api';

type Role = 'student' | 'tutor' | 'admin';

type User = {
  _id: string;
  name?: string;
  role: Role;
  plan?: string;
  email?: string;
};

type SubscriptionView = {
  id?: string;
  status?: string;
  plan?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
};

const plans = [
  {
    role: 'student',
    name: 'Student Pro',
    price: 10,
    icon: GraduationCap,
    description: 'Upgrade your student account to Pro.',
    features: [
      'Student Pro subscription',
      'Secure Stripe payment',
      'Pro membership status',
      'Subscription status tracking',
    ],
  },
  {
    role: 'tutor',
    name: 'Tutor Pro',
    price: 15,
    icon: BookOpen,
    description: 'Unlock unlimited tuition posting.',
    features: [
      'Unlimited tuition posts',
      'Manage your tuition listings',
      'Access your tutor dashboard',
      'Subscription status tracking',
    ],
  },
];

const formatDate = (date?: string) => {
  if (!date) return 'Not set';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Not set';
  return parsed.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function PricingPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionView | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const result = await apiFetch<{ user?: User } & User>('/api/users/me', {
        method: 'GET',
      });
      const currentUser = result?.user ?? result;
      if (!currentUser?.role) {
        throw new Error('Invalid user information received');
      }
      setUser(currentUser);
    } catch (error) {
      console.error('Pricing user error:', error);
      toast.error(error instanceof Error ? error.message : 'Unable to load account information');
    }
  }, []);

  const fetchSubscription = useCallback(async () => {
    if (!user) return;
    try {
      const result = await apiFetch<{
        plan: string;
        isPro: boolean;
        subscription: SubscriptionView | null;
      }>('/api/payments/my-subscription', {
        method: 'GET',
      });
      setSubscription(result?.subscription ?? null);
      if (result?.plan) {
        setUser((prev) => (prev ? { ...prev, plan: result.plan } : prev));
      }
    } catch (error) {
      console.error('Pricing subscription error:', error);
    }
  }, [user]);

  const loadAccount = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchUser(), fetchSubscription()]);
    setLoading(false);
  }, [fetchUser, fetchSubscription]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAccount();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadAccount]);

  const currentPlan = user?.plan || 'free';
  const isPro = currentPlan.toLowerCase() === 'pro';
  const sub = subscription;
  const subActive = sub && (sub.status === 'active' || sub.status === 'trialing');

  const handleSubscribe = async () => {
    if (!user || user.role === 'admin') return;
    if (isPro) return;

    try {
      setCheckoutLoading(true);

      const result = await apiFetch<{ url?: string; message?: string }>('/api/payments/create-checkout-session', {
        method: 'POST',
        body: {
          plan: 'pro',
          role: user.role,
        },
      });

      if (!result?.url) {
        throw new Error(result?.message || 'Checkout URL was not returned');
      }

      window.location.assign(result.url);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Payment initialization failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="mx-auto mt-10 max-w-lg">
        <CardContent className="space-y-4 p-8 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-primary" />

          <h2 className="text-xl font-semibold">Account Information Unavailable</h2>

          <p className="text-sm text-muted-foreground">
            Your authenticated account could not be loaded. Please try again.
          </p>

          <Button onClick={loadAccount} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isAdmin = user.role === 'admin';

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <div className="space-y-3 text-center">
        <Badge variant="secondary" className="px-3 py-1">
          <Sparkles className="mr-2 h-3.5 w-3.5" />
          MentorLagbe Subscription
        </Badge>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple & Transparent Pricing</h1>

        <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
          Choose the subscription plan that matches your account and get more from MentorLagbe.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-3">
              <Crown className="h-6 w-6 text-primary" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Your Current Subscription</p>

              <h2 className="text-xl font-bold capitalize">{currentPlan} Plan</h2>

              <p className="text-xs text-muted-foreground">
                Account role: {user.role} &bull; {subActive ? 'Active subscription' : 'No active subscription'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={isPro ? 'default' : 'secondary'}>
              {isPro ? 'Pro Member' : 'Free Member'}
            </Badge>
            {sub && !isPro && (
              <Badge variant="outline" className="text-xs">
                {sub.status}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {sub && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{sub.status || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Plan</p>
              <p className="font-medium">{sub.plan || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Starts</p>
              <p className="font-medium">{formatDate(sub.currentPeriodStart)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Renews / Ends</p>
              <p className="font-medium">{formatDate(sub.currentPeriodEnd)}</p>
            </div>
            {sub.cancelAtPeriodEnd !== undefined && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Cancel at period end</p>
                <p className="font-medium">{sub.cancelAtPeriodEnd ? 'Yes' : 'No'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isAdmin ? (
        <div className="space-y-5">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Available Subscription Plans</h2>

            <p className="mt-2 text-sm text-muted-foreground">Review plans available to students and tutors.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {plans.map((plan) => {
              const Icon = plan.icon;

              return (
                <Card key={plan.role}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-primary/10 p-3">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>

                      <div>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>For {plan.role}s</CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="text-4xl font-bold">
                      ${plan.price}
                      <span className="ml-2 text-sm font-normal text-muted-foreground">USD</span>
                    </div>

                    <Separator className="my-5" />

                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-semibold">Subscription Management</h3>

                <p className="text-sm text-muted-foreground">Monitor payments and transactions.</p>
              </div>

              <Button onClick={() => router.push('/dashboard/admin/transactions')}>
                <CreditCard className="mr-2 h-4 w-4" />
                View Transactions
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {plans
              .filter((plan) => plan.role === user.role)
              .map((plan) => {
                const Icon = plan.icon;

                return (
                  <Card key={plan.role} className="relative overflow-hidden border-primary/30">
                    <div className="absolute right-0 top-0 rounded-bl-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                      PRO PLAN
                    </div>

                    <CardHeader className="pt-10">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>

                      <CardTitle className="text-2xl">{plan.name}</CardTitle>

                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="text-5xl font-bold">${plan.price}</div>

                      <p className="mt-2 text-xs text-muted-foreground">USD subscription price</p>

                      <Separator className="my-6" />

                      <h3 className="mb-4 font-semibold">Plan Features</h3>

                      <ul className="space-y-4">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex gap-3 text-sm">
                            <Check className="h-4 w-4 shrink-0 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Button
                        className="mt-8 h-12 w-full"
                        disabled={isPro || checkoutLoading}
                        onClick={handleSubscribe}
                      >
                        {checkoutLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : isPro ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Already Subscribed
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Upgrade to Pro
                          </>
                        )}
                      </Button>

                      <p className="mt-3 text-center text-xs text-muted-foreground">
                        Secure payment powered by Stripe.
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
          </div>

          <Card>
            <CardHeader>
              <Badge variant="secondary" className="w-fit">
                BASIC PLAN
              </Badge>

              <CardTitle className="mt-3 text-2xl">
                {user.role === 'tutor' ? 'Tutor Free' : 'Student Free'}
              </CardTitle>

              <CardDescription>Your basic membership.</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="text-5xl font-bold">$0</div>

              <Separator className="my-6" />

              <ul className="space-y-4 text-sm">
                {(user.role === 'tutor'
                  ? ['Create up to 2 tuition posts', 'Manage your tuition posts', 'Access tutor dashboard']
                  : ['Access student dashboard', 'Browse available tuition listings']
                ).map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <Check className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button variant="outline" className="mt-8 h-12 w-full" disabled>
                Current Free Plan
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      <div className="rounded-xl border bg-muted/30 p-5 text-center">
        <ShieldCheck className="mx-auto mb-2 h-7 w-7 text-primary" />

        <h3 className="font-semibold">Secure & Reliable Payments</h3>

        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Subscription payments are securely processed through Stripe. Pro membership activates only after successful
          payment verification.
        </p>
      </div>
    </div>
  );
}
