'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { Bookmark, MapPin, Clock, BookOpen } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { addBookmark, removeBookmark } from '@/lib/tuition-api';
import type { Tuition } from '@/types';

interface TuitionCardProps {
  tuition: Tuition;
  /** Whether the current student has bookmarked this tuition. */
  isBookmarked?: boolean;
  /** Fired when the bookmark state changes (new boolean state). */
  onBookmarkChange?: (bookmarked: boolean) => void;
  /** JWT for authenticated bookmark actions. */
  token?: string | null;
  /** Set to true while a bookmark request is in flight. */
  busy?: boolean;
}

/**
 * TuitionCard – modern recruiter-style listing card used on Browse Tuitions.
 * Consistent dimensions, image fallback, bookmark toggle for students, and
 * View Details action.
 */
export function TuitionCard({
  tuition,
  isBookmarked = false,
  onBookmarkChange,
  token,
  busy = false,
}: TuitionCardProps) {
  const tuitionId = tuition._id || '';
  const fee = tuition.monthlyFee ?? tuition.price ?? 0;
  const mode = String(tuition.mode ?? 'online').toLowerCase();
  const tutor = tuition.tutor;
  const tutorName = tutor?.name || tuition.tutorName || 'Tutor';
  const tutorImage = tutor?.image;
  const daysPerWeek = tuition.daysPerWeek;
  const location = tuition.location || tuition.area;

  const [isBookmarkedLocal, setIsBookmarkedLocal] = useState(isBookmarked);
  const [toggleBusy, setToggleBusy] = useState(false);

  const isSaved = isBookmarkedLocal;

  const handleToggleBookmark = useCallback(async () => {
    if (!token) {
      toast.error('Please sign in to save tuitions.');
      return;
    }
    const nextState = !isSaved;
    setToggleBusy(true);
    setIsBookmarkedLocal(nextState);
    try {
      if (nextState) {
        const result = await addBookmark(token, tuitionId);
        if (!result.saved && result.limitReached) {
          // Free plan limit hit: roll back and show upgrade prompt.
          setIsBookmarkedLocal(false);
          toast.error(result.message || 'Save limit reached.', {
            description: 'Upgrade to Pro for unlimited bookmarks.',
            action: {
              label: 'Go to Pricing',
              onClick: () => {
                window.location.href = '/pricing';
              },
            },
          });
          onBookmarkChange?.(false);
          return;
        }
        toast.success('Tuition saved');
        onBookmarkChange?.(true);
      } else {
        await removeBookmark(token, tuitionId);
        toast.success('Bookmark removed');
        onBookmarkChange?.(false);
      }
    } catch (err: unknown) {
      setIsBookmarkedLocal(isSaved);
      const message = err instanceof Error ? err.message : 'Failed to update bookmark.';
      toast.error(message);
      onBookmarkChange?.(isSaved);
    } finally {
      setToggleBusy(false);
    }
  }, [token, tuitionId, isSaved, onBookmarkChange]);

  const ModeBadge = (
    <Badge variant="outline" className="text-xs font-medium capitalize">
      {mode === 'online' ? 'Online' : mode === 'offline' ? 'Offline' : 'Hybrid'}
    </Badge>
  );

  const imageUrl = tuition.bannerImage || undefined;

  return (
    <Card
      className="h-full flex flex-col border border-border hover:border-primary/30 transition-all duration-200 hover:shadow-lg hover:shadow-primary/10"
    >
      <div className="relative h-52 w-full overflow-hidden bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={tuition.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
            <BookOpen className="size-12 text-primary/40" aria-hidden />
          </div>
        )}

        {/* Bookmark control – eligible students only. */}
        {token ? (
          <button
            onClick={handleToggleBookmark}
            disabled={toggleBusy}
            aria-label={isSaved ? 'Remove bookmark' : 'Save tuition'}
            className="absolute top-3 right-3 z-20 p-2 rounded-lg bg-white/90 backdrop-blur-sm border border-border/60 text-foreground transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Bookmark
              className={`size-5 ${isSaved ? 'text-primary fill-primary' : 'text-muted-foreground'}`}
              aria-hidden
            />
            <span className="sr-only">{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        ) : null}

        {/* Mode badge. */}
        <span className="absolute top-3 left-3 z-20">{ModeBadge}</span>

        {/* Subject badge. */}
        {tuition.subject && (
          <span className="absolute bottom-3 left-3 z-20">
            <Badge variant="outline" className="text-xs font-semibold">
              {tuition.subject}
            </Badge>
          </span>
        )}
      </div>

      <CardContent className="p-4 flex-1 flex flex-col gap-2">
        <CardHeader className="pb-0 flex flex-col gap-1">
          <h3 className="font-semibold text-foreground line-clamp-2">{tuition.title}</h3>
        </CardHeader>

        <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="size-3.5 shrink-0" aria-hidden />
            {tuition.classLevel}
          </span>
          {daysPerWeek && (
            <span className="flex items-center gap-1">
              <Clock className="size-3.5 shrink-0" aria-hidden />
              {daysPerWeek} days/week
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              {location}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Avatar className="size-7">
              {tutorImage ? <AvatarImage src={tutorImage} alt={tutorName} /> : null}
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {tutorName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground truncate">{tutorName}</span>
          </div>
          <span className="font-bold text-foreground">
            ৳{fee > 0 ? fee.toLocaleString('en-BD') : '0'}
          </span>
          <span className="text-xs text-muted-foreground">/mo</span>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button asChild className="w-full" variant="primary">
          <Link href={`/tuitions/${tuitionId}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
