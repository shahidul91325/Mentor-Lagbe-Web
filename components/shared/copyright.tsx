"use client";

import { useEffect, useState } from "react";

/**
 * Copyright line with the current year.
 * The year is read only in the browser: Next.js statically prerenders pages,
 * and `new Date()` is not allowed during that prerender pass.
 * Gating it behind mount also avoids hydration mismatches.
 */
export function Copyright() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <p className="text-center text-sm text-muted-foreground">
      ©{year ? ` ${year}` : ""} MentorLagbe. All rights reserved.
    </p>
  );
}
