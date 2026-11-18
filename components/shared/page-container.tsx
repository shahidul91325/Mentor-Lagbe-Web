import * as React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps extends React.ComponentProps<"div"> {
  /** Maximum container width constraint. Defaults to 7xl. */
  size?: "default" | "sm" | "lg" | "full";
}

/**
 * Responsive page container maintaining consistent horizontal padding,
 * auto margins, and max width across public and dashboard screens.
 */
export function PageContainer({
  className,
  size = "default",
  ...props
}: PageContainerProps) {
  const sizeClasses = {
    sm: "max-w-4xl",
    default: "max-w-7xl",
    lg: "max-w-[1400px]",
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}
