import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MapPin, DollarSign, Laptop, Home } from 'lucide-react';

export interface Tuition {
  id?: string;
  _id?: string;
  title: string;
  subject: string;
  classLevel: string;
  mode: 'online' | 'offline' | 'hybrid';
  location?: string;
  fee: number; // monthly fee in BDT
  tutorName: string;
}

/**
 * TuitionCard – displays a summary of a tuition listing.
 * Used on the Browse Tuitions page and in various dashboard listings.
 */
export function TuitionCard({ tuition }: { tuition: Tuition }) {
  const ModeIcon = tuition.mode === 'online' ? Laptop : Home;
  const tuitionId = tuition.id || tuition._id || '';

  return (
    <Card className="flex h-full flex-col justify-between transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          {tuition.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="font-medium">Subject:</span> {tuition.subject}
        </div>
        <div className="flex items-center gap-1">
          <span className="font-medium">Class:</span> {tuition.classLevel}
        </div>
        <div className="flex items-center gap-1">
          <ModeIcon className="size-4 text-primary" aria-hidden />
          <span className="capitalize">{tuition.mode}</span>
          {tuition.location && (
            <>
              <MapPin className="size-4 ml-2" aria-hidden />
              <span>{tuition.location}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="size-4" aria-hidden />
          <span>{tuition.fee.toLocaleString()} BDT / month</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="size-4" aria-hidden />
          <span>{tuition.tutorName}</span>
        </div>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button asChild className="w-full" variant="primary">
          <Link href={`/tuitions/${tuitionId}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
