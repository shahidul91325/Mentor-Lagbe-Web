"use client";

import { useSyncExternalStore } from "react";

/**
 * Copyright line with the current year.
 *
 * The year is read with useSyncExternalStore, the React-sanctioned way to
 * show browser-only values during SSR:
 * - the server snapshot is a fixed build-time year (prerender stays stable,
 *   Next.js does not allow `new Date()` while prerendering)
 * - the browser recomputes the real year after hydration
 */
const subscribe = () => () => void 0;
const SERVER_SNAPSHOT_YEAR = 2026; // build-time fallback year

export function Copyright() {
  const year = useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => SERVER_SNAPSHOT_YEAR,
  );

  return (
    <p className="text-center text-sm text-muted-foreground">
      © {year} MentorLagbe. All rights reserved.
    </p>
  );
}
