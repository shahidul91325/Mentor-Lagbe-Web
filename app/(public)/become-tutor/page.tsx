'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Suspense } from 'react';

function BecomeTutorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard/tutor/post-tuition';

  useEffect(() => {
    router.replace(`/sign-up?role=tutor&next=${encodeURIComponent(callbackUrl)}`);
  }, [router, callbackUrl]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 mx-auto">
          <BookOpen className="size-8" />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Become a Tutor</h1>
          <p className="text-muted-foreground">
            Redirecting to tutor registration…
          </p>
        </div>
        <Button
          asChild
          className="group h-12 w-full rounded-xl bg-emerald-500 text-sm font-semibold text-white shadow-lg hover:bg-emerald-600"
        >
          <Link href={`/sign-up?role=tutor&next=${encodeURIComponent(callbackUrl)}`}>
            Continue to Sign Up
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground">
          If you are not redirected, click the button above.
        </p>
      </div>
    </main>
  );
}

export default function BecomeTutorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <BecomeTutorContent />
    </Suspense>
  );
}