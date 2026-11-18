"use client";

/**
 * Copyright line with the current year.
 * The year is read only in the browser: Next.js statically prerenders pages
 * and `new Date()` is not allowed during that prerender pass.
 * `suppressHydrationWarning` covers the text difference between the
 * prerendered output (no year) and the client render (with year).
 */
export function Copyright() {
  const year = typeof window !== "undefined" ? new Date().getFullYear() : null;

  return (
    <p suppressHydrationWarning className="text-center text-sm text-muted-foreground">
      ©{year ? ` ${year}` : ""} MentorLagbe. All rights reserved.
    </p>
  );
}
