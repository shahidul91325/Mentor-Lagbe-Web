import { Skeleton } from '@/components/ui/skeleton';

/**
 * LoadingSkeleton – thin wrapper around the generic Skeleton component.
 * Allows existing imports (`LoadingSkeleton`) to continue working without
 * changing existing page code.
 */
export function LoadingSkeleton(props: React.ComponentProps<'div'>) {
  return <Skeleton {...props} />;
}
