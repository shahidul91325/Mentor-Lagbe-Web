'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { apiFetch } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';

type SubscriptionView = {
  id?: string;
  status?: string;
  plan?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
};

type SubscriptionResponse = {
  plan: string;
  isPro: boolean;
  subscription: SubscriptionView | null;
};

type SubscriptionLoadState = 'idle' | 'ready' | 'error';

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

const guestFreeFeatures = [
  'Browse available tuition listings',
  'Apply to tuition posts',
  'Access your dashboard',
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

  // Session state comes from the shared auth provider, so the pricing page
  // never needs a protected request just to find out who is visiting.
  const { user, isLoading: isAuthLoading } = useAuth();

  const [subscription, setSubscription] = useState<SubscriptionView | null>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
  const [subscriptionError, setSubscriptionError] = useState('');
  const [subscriptionLoadState, setSubscriptionLoadState] = useState<SubscriptionLoadState>('idle');
  const [reloadKey, setReloadKey] = useState(0);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const userId = user?._id ?? null;
  const isSubscriptionLoading = userId !== null && subscriptionLoadState === 'idle';

  // Subscription details are the only data this page has to fetch, and only
  // for signed-in users. State is updated from the request callbacks (never
  // synchronously in the effect body) so the request cannot loop: the effect
  // depends on the user id string, not on the user object identity.
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    void apiFetch<SubscriptionResponse>('/api/payments/my-subscription')
      .then((result) => {
        if (cancelled) return;

        setSubscription(result?.subscription ?? null);
        setSubscriptionPlan(result?.plan ?? null);
        setSubscriptionError('');
        setSubscriptionLoadState('ready');
      })
      .catch((error: unknown) => {
        if (cancelled) return;

        setSubscription(null);
        setSubscriptionError(
          error instanceof Error ? error.message : 'Unable to load subscription details.'
        );
        setSubscriptionLoadState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [userId, reloadKey]);

  const retrySubscription = () => {
    setSubscriptionError('');
    setSubscriptionLoadState('idle');
    setReloadKey((key) => key + 1);
  };

  const currentPlan = subscriptionPlan ?? (user?.plan === 'pro' ? 'pro' : 'free');
  const isPro = currentPlan === 'pro';
  const subActive = !!subscription && (subscription.status === 'active' || subscription.status === 'trialing');
  const isAdmin = user?.role === 'admin';

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

  // Only the session lookup is a genuine full-page wait. Pricing plans are
  // static, so they render as soon as the session state is known and the
  // subscription card handles its own loading/error state.
  if (isAuthLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 pb-12 pt-8 sm:px-6">
      <div className="space-y-3 text-center">
        <Badge variant="secondary" className="px-3 py-1">
          <Sparkles className="mr-2 h-3.5 w-3.5" />
          MentorLagbe Subscription
        </Badge>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple &amp; Transparent Pricing</h1>

        <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
          Choose the subscription plan that matches your account and get more from MentorLagbe.
        </p>
      </div>

      {/* Current subscription (signed-in users only) */}
      {user && (
        <Card className="border-primary/20 bg-primary/[0.03]">
          <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-3">
                <Crown className="h-6 w-6 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Your Current Subscription</p>

                {isSubscriptionLoading ? (
                  <h2 className="flex items-center gap-2 text-xl font-bold">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    Checking plan…
                  </h2>
                ) : (
                  <h2 className="text-xl font-bold capitalize">{currentPlan} Plan</h2>
                )}

                <p className="text-xs text-muted-foreground">
                  Account role: {user.role} &bull; {subActive ? 'Active subscription' : 'No active subscription'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={isPro ? 'default' : 'secondary'}>
                {isPro ? 'Pro Member' : 'Free Member'}
              </Badge>
              {subscription && !isPro && (
                <Badge variant="outline" className="text-xs">
                  {subscription.status}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription request failed — explain and offer a retry */}
      {subscriptionError && (
        <Card className="border-destructive/30 bg-destructive/[0.03]">
          <CardContent className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-destructive/10 p-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-semibold">Subscription details unavailable</h3>
                <p className="text-sm text-muted-foreground">{subscriptionError}</p>
              </div>
            </div>

            <Button type="button" variant="outline" onClick={retrySubscription} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{subscription.status || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Plan</p>
              <p className="font-medium">{subscription.plan || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Starts</p>
              <p className="font-medium">{formatDate(subscription.currentPeriodStart)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Renews / Ends</p>
              <p className="font-medium">{formatDate(subscription.currentPeriodEnd)}</p>
            </div>
            {subscription.cancelAtPeriodEnd !== undefined && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Cancel at period end</p>
                <p className="font-medium">{subscription.cancelAtPeriodEnd ? 'Yes' : 'No'}</p>
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
      ) : !user ? (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Plans for Students &amp; Tutors</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to subscribe and manage your membership.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan) => {
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

                    <Button asChild className="mt-8 h-12 w-full">
                      <Link href="/sign-in?next=/pricing">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Sign in to Upgrade
                      </Link>
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

              <CardTitle className="mt-3 text-2xl">Free</CardTitle>

              <CardDescription>Your basic membership, free forever.</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="text-5xl font-bold">$0</div>

              <Separator className="my-6" />

              <ul className="space-y-4 text-sm">
                {guestFreeFeatures.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <Check className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button asChild variant="outline" className="mt-8 h-12 w-full">
                <Link href="/sign-up">Create Free Account</Link>
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

        <h3 className="font-semibold">Secure &amp; Reliable Payments</h3>

        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Subscription payments are securely processed through Stripe. Pro membership activates only after successful
          payment verification.
        </p>
      </div>
    </div>
  );
}