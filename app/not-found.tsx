import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-muted-foreground">Page not found.</p>
      <div className="flex gap-2">
        <Link href="/" className="underline">Go home</Link>
        <Link href="/tuitions" className="underline">Browse tuitions</Link>
      </div>
    </div>
  );
}
