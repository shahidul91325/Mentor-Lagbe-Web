"use client";
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p>{error.message || "An unexpected error occurred."}</p>
        <button onClick={reset}>Retry</button>
      </body>
    </html>
  );
}
