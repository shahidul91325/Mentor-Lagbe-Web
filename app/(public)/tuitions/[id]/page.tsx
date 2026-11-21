import { Suspense } from 'react';
import { Metadata } from 'next';
import { TuitionDetailsView } from '@/components/tuitions/tuition-details-view';
import { PageContainer } from '@/components/shared/page-container';
import { Skeleton } from '@/components/ui/skeleton';

interface PageProps {
  params: Promise<{ id: string }>;
}

function TuitionDetailsSkeleton() {
  return (
    <section className="min-h-screen bg-background py-10 sm:py-14">
      <PageContainer>
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-8 w-3/4" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-72 rounded-xl" />
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

async function TuitionDetailsLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TuitionDetailsView id={id} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const res = await fetch(`${baseUrl}/api/tuitions/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const tuition = data.tuition || data;
      return {
        title: `${tuition.title || 'Tuition Details'} | MentorLagbe`,
        description: tuition.description
          ? tuition.description.slice(0, 160)
          : `Learn ${tuition.subject || 'Tuition'} with verified tutors on MentorLagbe.`,
      };
    }
  } catch {
    // Fallback if backend is unreachable
  }

  return {
    title: 'Tuition Details | MentorLagbe',
    description: 'View tuition listing details, schedule, requirements, and tutor profile on MentorLagbe.',
  };
}

export default function TuitionDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<TuitionDetailsSkeleton />}>
      <TuitionDetailsLoader params={params} />
    </Suspense>
  );
}
