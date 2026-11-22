"use client";
import Link from 'next/link';
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-muted-foreground">{error.message || "An unexpected error occurred."}</p>
      <div className="flex gap-2">
        <button onClick={reset} className="underline">Retry</button>
        <Link href="/" className="underline">Go home</Link>
      </div>
    </div>
  );
}
