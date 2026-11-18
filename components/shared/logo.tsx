"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";

/**
 * MentorLagbe brand logo — used in navbar, footer and dashboard sidebar.
 * The heading style stays identical everywhere (assignment requirement).
 */
export function Logo({ className = "", href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={`flex items-center gap-2.5 ${className}`} aria-label="MentorLagbe home">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm shadow-primary/30">
        <GraduationCap className="size-5" aria-hidden />
      </span>
      <span className="text-xl font-bold tracking-tight text-foreground">
        Mentor<span className="text-primary">Lagbe</span>
      </span>
    </Link>
  );
}
