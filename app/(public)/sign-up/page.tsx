'use client';

/**
 * MentorLagbe - Premium Sign Up Page
 * Graphite Orange Theme
 */

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/providers/auth-provider';

type RoleChoice = 'student' | 'tutor';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_OPTIONS: Array<{
  value: RoleChoice;
  title: string;
  description: string;
  icon: typeof GraduationCap;
  features: string;
}> = [
  {
    value: 'student',
    title: 'Student',
    description: 'Find your perfect tutor',
    icon: GraduationCap,
    features: 'Explore and apply for tuitions',
  },
  {
    value: 'tutor',
    title: 'Tutor',
    description: 'Share your knowledge',
    icon: BookOpen,
    features: 'Post tuitions and find students',
  },
];

export default function SignUpPage() {
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<RoleChoice>('student');

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const next: FormErrors = {};

    if (!name.trim()) {
      next.name = 'Please enter your full name.';
    } else if (name.trim().length < 2) {
      next.name = 'Name must be at least 2 characters.';
    }

    if (!email.trim()) {
      next.email = 'Please enter your email address.';
    } else if (!EMAIL_RE.test(email.trim())) {
      next.email = 'Please enter a valid email address.';
    }

    if (!password) {
      next.password = 'Please create a password.';
    } else if (password.length < 8) {
      next.password = 'Password must be at least 8 characters.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;
    if (!validate()) return;

    setSubmitting(true);

    try {
      await signUp({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      toast.success('Account created successfully!', {
        description: 'Welcome to MentorLagbe.',
      });

      // Full page reload so the dashboard initializes with the newly
      // authenticated session and freshly minted JWT.
      window.location.assign(role === 'student' ? '/dashboard/student' : '/dashboard/tutor');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign up failed. Please try again.';

      toast.error(message);
      setSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-orange-500/5 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-orange-500/5 blur-[120px]" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-[1440px] grid-cols-1 lg:grid-cols-2">
        {/* LEFT BRANDING SECTION */}
        <section className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-card px-10 py-10 lg:flex xl:px-16">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-32 top-32 h-96 w-96 rounded-full border border-orange-500/10" />
          <div className="pointer-events-none absolute -right-20 top-44 h-72 w-72 rounded-full border border-orange-500/10" />
          <div className="pointer-events-none absolute -right-8 top-56 h-48 w-48 rounded-full border border-orange-500/10" />

          {/* Brand */}
          <Link href="/" className="relative z-10 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
              <GraduationCap className="size-7" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Mentor<span className="text-orange-500">Lagbe</span>
              </h1>
              <p className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground">LEARN • GROW • SUCCEED</p>
            </div>
          </Link>

          {/* Main content */}
          <div className="relative z-10 my-auto max-w-xl py-16">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-500">
              <Sparkles className="size-4" />
              Your learning journey starts here
            </div>

            <h2 className="text-4xl font-bold leading-[1.2] tracking-tight xl:text-5xl">
              Discover the power of <span className="text-orange-500">learning together.</span>
            </h2>

            <p className="mt-6 max-w-md text-base leading-8 text-muted-foreground">
              Whether you want to find the right tutor or share your knowledge with students, MentorLagbe brings the
              right people together.
            </p>

            {/* Feature cards */}
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background/70 p-5 transition-colors hover:border-orange-500/30">
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                  <GraduationCap className="size-6" />
                </div>

                <h3 className="font-semibold">Learn with confidence</h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Connect with tutors who understand your learning goals.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-background/70 p-5 transition-colors hover:border-orange-500/30">
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                  <Users className="size-6" />
                </div>

                <h3 className="font-semibold">Grow your community</h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Build meaningful connections between students and tutors.
                </p>
              </div>
            </div>

            {/* Highlight */}
            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
                <BookOpen className="size-6" />
              </div>

              <div>
                <p className="font-semibold">One platform. Endless opportunities.</p>
                <p className="mt-1 text-sm text-muted-foreground">Start your journey with MentorLagbe today.</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 flex items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© 2026 MentorLagbe. All rights reserved.</p>

            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-orange-500" />
              <span>Secure registration</span>
            </div>
          </div>
        </section>

        {/* RIGHT SIGNUP SECTION */}
        <section className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-10 xl:px-16">
          <div className="w-full max-w-md">
            {/* Mobile brand */}
            <Link href="/" className="mb-9 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex size-11 items-center justify-center rounded-xl bg-orange-500 text-white">
                <GraduationCap className="size-6" />
              </div>

              <span className="text-xl font-bold">
                Mentor<span className="text-orange-500">Lagbe</span>
              </span>
            </Link>

            {/* Form heading */}
            <div className="mb-8">
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
                <Sparkles className="size-6" />
              </div>

              <h2 className="text-3xl font-bold tracking-tight">Create your account</h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Join MentorLagbe and take the next step in your journey.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* ROLE SELECTION */}
              <fieldset className="space-y-3">
                <div className="flex items-center justify-between">
                  <legend className="text-sm font-semibold">I want to join as</legend>

                  <span className="text-xs text-muted-foreground">Choose your role</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {ROLE_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const selected = role === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRole(option.value)}
                        aria-pressed={selected}
                        className={`group relative flex min-h-[132px] flex-col items-start rounded-2xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                          selected
                            ? 'border-orange-500 bg-orange-500/10 shadow-md shadow-orange-500/5'
                            : 'border-border bg-card hover:border-orange-500/40 hover:bg-accent/50'
                        }`}
                      >
                        <div className="flex w-full items-center justify-between">
                          <div
                            className={`flex size-11 items-center justify-center rounded-xl transition-colors ${
                              selected
                                ? 'bg-orange-500 text-white'
                                : 'bg-muted text-muted-foreground group-hover:text-orange-500'
                            }`}
                          >
                            <Icon className="size-6" />
                          </div>

                          {selected && <CheckCircle2 className="size-5 text-orange-500" />}
                        </div>

                        <span className="mt-4 text-sm font-bold">{option.title}</span>

                        <span className="mt-1 text-xs leading-5 text-muted-foreground">{option.description}</span>
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs text-muted-foreground">
                  {role === 'student'
                    ? 'Find expert tutors and apply for your preferred tuition.'
                    : 'Share your expertise and connect with students.'}
                </p>
              </fieldset>

              {/* FULL NAME */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full name
                </Label>

                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) {
                      setErrors((prev) => ({
                        ...prev,
                        name: undefined,
                      }));
                    }
                  }}
                  aria-invalid={Boolean(errors.name)}
                  className="h-12 rounded-xl border-border bg-card px-4 transition-all focus-visible:border-orange-500 focus-visible:ring-orange-500/20"
                />

                {errors.name && <p className="text-xs font-medium text-destructive">{errors.name}</p>}
              </div>

              {/* EMAIL */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>

                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors((prev) => ({
                        ...prev,
                        email: undefined,
                      }));
                    }
                  }}
                  aria-invalid={Boolean(errors.email)}
                  className="h-12 rounded-xl border-border bg-card px-4 transition-all focus-visible:border-orange-500 focus-visible:ring-orange-500/20"
                />

                {errors.email && <p className="text-xs font-medium text-destructive">{errors.email}</p>}
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>

                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors((prev) => ({
                          ...prev,
                          password: undefined,
                        }));
                      }
                    }}
                    aria-invalid={Boolean(errors.password)}
                    className="h-12 rounded-xl border-border bg-card px-4 pr-12 transition-all focus-visible:border-orange-500 focus-visible:ring-orange-500/20"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground transition-colors hover:text-orange-500"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                {errors.password && <p className="text-xs font-medium text-destructive">{errors.password}</p>}

                <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>
              </div>

              {/* SUBMIT */}
              <Button
                type="submit"
                disabled={submitting}
                className="group h-12 w-full rounded-xl bg-orange-500 text-sm font-semibold text-white shadow-lg shadow-orange-500/15 transition-all hover:bg-orange-600 hover:shadow-orange-500/25"
              >
                {submitting ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Creating your account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>

              {/* SIGN IN */}
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link
                  href="/sign-in"
                  className="font-semibold text-orange-500 underline-offset-4 transition-colors hover:text-orange-600 hover:underline"
                >
                  Sign in
                </Link>
              </p>

              {/* SECURITY NOTE */}
              <div className="flex items-center justify-center gap-2 border-t border-border pt-5 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-orange-500" />
                Your information is protected and secure.
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
