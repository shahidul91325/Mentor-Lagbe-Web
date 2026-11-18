import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps extends React.ComponentProps<"div"> {
  badge?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

/**
 * Standard section header with optional eyebrow badge,
 * title, and subtitle description for landing & dashboard sections.
 */
export function SectionHeading({
  badge,
  title,
  description,
  align = "left",
  className,
  ...props
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div
      className={cn(
        "space-y-2",
        isCenter ? "text-center mx-auto max-w-2xl" : "text-left",
        className
      )}
      {...props}
    >
      {badge && (
        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
          {badge}
        </span>
      )}
      <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
