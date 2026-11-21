import Link from 'next/link';
import { ArrowRight, BookOpen, Check, Crown, GraduationCap, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';

const freeFeatures = [
  'Browse all approved tuition listings',
  'Apply to tuitions and manage applications',
  'Students: dashboard and application tracking',
  'Tutors: post up to 2 tuitions',
];

const proFeatures = [
  'Everything in Free',
  'Tutors: unlimited tuition posts',
  'Priority visibility for your listings',
  'Subscription and payment history',
];

export function PricingSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Simple Pricing</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Start free. Upgrade when you need more.</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Students and tutors can use MentorLagbe for free, or upgrade to Pro for more opportunities.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {/* Free plan */}
          <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-8">
            <div className="flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-foreground">
                <Sparkles className="size-6" aria-hidden />
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Free
              </span>
            </div>

            <h3 className="mt-6 text-xl font-bold">Free Plan</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              For students and tutors who are getting started.
            </p>

            <div className="mt-6 flex items-end gap-2">
              <span className="text-4xl font-extrabold tracking-tight">$0</span>
              <span className="pb-1 text-sm text-muted-foreground">/ month</span>
            </div>

            <ul className="mt-7 flex-1 space-y-3">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <span className="leading-6 text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Button asChild variant="outline" className="mt-8 h-12 w-full gap-2 rounded-xl">
              <Link href="/sign-up">
                Create Free Account
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>

          {/* Pro plan */}
          <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-b from-primary/[0.07] to-card p-7 shadow-sm sm:p-8">
            <div className="absolute right-0 top-0 rounded-bl-2xl bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-foreground">
              Pro
            </div>

            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Crown className="size-6" aria-hidden />
            </div>

            <h3 className="mt-6 text-xl font-bold">Pro Membership</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              More freedom for tutors and extra support for students.
            </p>

            <div className="mt-6 space-y-2">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-extrabold tracking-tight">$10</span>
                <span className="pb-1 text-sm text-muted-foreground">/ month for students</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-extrabold tracking-tight">$15</span>
                <span className="pb-1 text-sm text-muted-foreground">/ month for tutors</span>
              </div>
            </div>

            <ul className="mt-7 flex-1 space-y-3">
              {proFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <span className="leading-6 text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 grid gap-2 sm:grid-cols-2">
              <Button asChild className="h-12 w-full gap-2 rounded-xl">
                <Link href="/sign-up">
                  <GraduationCap className="size-4" aria-hidden />
                  Student Pro
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 w-full gap-2 rounded-xl">
                <Link href="/sign-up">
                  <BookOpen className="size-4" aria-hidden />
                  Tutor Pro
                </Link>
              </Button>
            </div>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              Secure checkout powered by Stripe.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button asChild variant="ghost" className="gap-2 rounded-xl text-primary">
            <Link href="/pricing">
              Compare plans and subscribe
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}