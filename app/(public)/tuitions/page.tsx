// "use client" directive added to ensure client-side interactivity
'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { TuitionCard, Tuition } from '@/components/tuitions/TuitionCard';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ArrowUpDown,
  AlertCircle,
} from 'lucide-react';
import FilterContent from '@/components/tuitions/FilterContent';

// Extend the Filters type to match the FilterContent component expectations
type Filters = {
  search: string;
  subject: string;
  classLevel: string;
  mode: string;
  location?: string;
  feeRange?: [number, number];
};

type ApiTuition = {
  _id?: string;
  id?: string;
  title: string;
  subject: string;
  classLevel: string;
  mode: string;
  location?: string;
  monthlyFee?: number;
  fee?: number;
  tutorName?: string;
};

type ApiResponse = {
  tuitions: ApiTuition[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};

const ITEMS_PER_PAGE = 9;

const initialFilters: Filters = {
  search: '',
  subject: '',
  classLevel: '',
  mode: '',
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45 },
  },
};

function normalizeTuition(item: ApiTuition): Tuition {
  return {
    id: item.id || item._id || '',
    title: item.title,
    subject: item.subject,
    classLevel: item.classLevel,
    mode: item.mode.toLowerCase() as 'online' | 'offline',
    location: item.location,
    fee: item.monthlyFee ?? item.fee ?? 0,
    tutorName: item.tutorName || 'Tutor',
  };
}

interface BrowseTuitionsContentProps {
  initialSearch: string;
  initialSubject: string;
}

function BrowseTuitionsContent({ initialSearch, initialSubject }: BrowseTuitionsContentProps) {
  const shouldReduceMotion = useReducedMotion();

  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [filters, setFilters] = useState<Filters>({
    ...initialFilters,
    search: initialSearch,
    subject: initialSubject,
  });
  const [searchInput, setSearchInput] = useState(initialSearch);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Core data loader – extracted to a callback so it can be reused (e.g., retry button)
  const loadTuitions = useCallback(
    async (abortSignal?: AbortSignal) => {
      try {
        setLoading(true);
        setError('');
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!baseUrl) throw new Error('API URL is not configured.');

        const params = new URLSearchParams({
          page: String(page),
          limit: String(ITEMS_PER_PAGE),
          sortBy,
          sortOrder,
        });
        if (filters.search) params.set('search', filters.search);
        if (filters.subject) params.set('subject', filters.subject);
        if (filters.classLevel) params.set('classLevel', filters.classLevel);
        if (filters.mode) params.set('mode', filters.mode);
        if (filters.location) params.set('location', filters.location);
        if (filters.feeRange) {
          params.set('minFee', String(filters.feeRange[0]));
          params.set('maxFee', String(filters.feeRange[1]));
        }

        const response = await fetch(`${baseUrl}/api/tuitions?${params.toString()}`, {
          method: 'GET',
          signal: abortSignal,
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });
        if (!response.ok) throw new Error('Unable to load tuition listings.');
        const result: ApiResponse = await response.json();
        const records = Array.isArray(result.tuitions) ? result.tuitions : [];
        setTuitions(records.map(normalizeTuition));
        setTotal(result.total ?? records.length);
        setTotalPages(result.totalPages ?? 1);
      } catch (err) {
        if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        setTuitions([]);
      } finally {
        if (!abortSignal?.aborted) setLoading(false);
      }
    },
    [filters, page, sortBy, sortOrder]
  );

  // Initial load & re‑load on dependency changes
  useEffect(() => {
    const controller = new AbortController();
    setTimeout(() => loadTuitions(controller.signal), 0);
    return () => controller.abort();
  }, [loadTuitions]);

  const clearFilters = () => {
    setFilters(initialFilters);
    setSearchInput('');
    setPage(1);
  };

  const applyFilters = (newFilters: Filters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
    setMobileFiltersOpen(false);
  };

  const activeFilters = useMemo(
    () => Object.entries(filters).filter(([, v]) => Boolean(v)) as [keyof Filters, string][],
    [filters]
  );

  const filterLabels: Record<keyof Filters, string> = {
    search: 'Search',
    subject: 'Subject',
    classLevel: 'Class Level',
    mode: 'Mode',
    location: 'Location',
    feeRange: 'Fee Range',
  };

  const removeFilter = (key: keyof Filters) => {
    setFilters((prev) => ({ ...prev, [key]: '' }));
    if (key === 'search') setSearchInput('');
    setPage(1);
  };

  return (
    <section className="min-h-screen bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          variants={fadeUp}
          initial={shouldReduceMotion ? false : 'hidden'}
          animate="visible"
          className="mb-9"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            <BookOpen size={14} />
            Find Your Learning Opportunity
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Browse <span className="text-primary">Tuitions</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Discover the right tutor, explore available tuition opportunities, and find a learning experience that fits
            your goals.
          </p>
        </motion.div>

        {/* Search and sorting */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />

            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by tuition title or subject..."
              className="h-13 w-full rounded-xl border border-border bg-card pl-11 pr-11 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />

            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex h-13 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground lg:hidden"
            >
              <SlidersHorizontal size={17} />
              Filters
              {activeFilters.length > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {activeFilters.length}
                </span>
              )}
            </button>

            <div className="relative flex flex-1 items-center sm:flex-none">
              <ArrowUpDown size={16} className="absolute left-3 text-muted-foreground" />
              <select
                value={`${sortBy}:${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split(':');
                  setSortBy(field);
                  setSortOrder(order);
                  setPage(1);
                }}
                className="h-13 w-full appearance-none rounded-xl border border-border bg-card pl-9 pr-9 text-sm font-medium text-foreground outline-none focus:border-primary sm:w-52"
              >
                <option value="createdAt:desc">Newest First</option>
                <option value="createdAt:asc">Oldest First</option>
                <option value="monthlyFee:asc">Fee: Low to High</option>
                <option value="monthlyFee:desc">Fee: High to Low</option>
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Selected filters */}
        {activeFilters.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
            {activeFilters.map(([key, value]) => (
              <button
                key={key}
                onClick={() => removeFilter(key)}
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20"
              >
                {filterLabels[key]}: {value}
                <X size={13} />
              </button>
            ))}
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-muted-foreground hover:text-destructive"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Main content */}
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[260px_1fr]">
          {/* Desktop filter sidebar */}
          <aside className="hidden h-fit rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-24 lg:block">
            <FilterContent onApply={applyFilters} />
          </aside>

          {/* Results */}
          <div className="min-w-0">
            {/* Result heading */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">Available Tuitions</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {loading ? 'Finding tuition opportunities...' : `${total} tuition${total === 1 ? '' : 's'} found`}
                </p>
              </div>

              <div className="hidden items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground sm:flex">
                <BookOpen size={15} />
                Updated listings
              </div>
            </div>

            {/* Loading / Error / Empty / Results */}
            {loading ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <LoadingSkeleton key={idx} className="h-72 rounded-2xl" />
                ))}
              </div>
            ) : error ? (
              <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
                <AlertCircle size={36} className="mb-4 text-destructive" />
                <h3 className="text-lg font-bold text-foreground">Unable to load tuitions</h3>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">{error}</p>
                <button
                  onClick={() => loadTuitions()}
                  className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  Try Again
                </button>
              </div>
            ) : tuitions.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-6">
                <EmptyState
                  title="No tuitions found"
                  description="Try changing your search or removing some filters to discover available tuition opportunities."
                />
                <div className="mt-4 text-center">
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                  >
                    <RotateCcw size={15} />
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              <motion.div
                initial={shouldReduceMotion ? false : 'hidden'}
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.06 } },
                }}
                className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
              >
                {tuitions.map((tuition) => (
                  <motion.div key={tuition.id} variants={fadeUp} className="h-full">
                    <TuitionCard tuition={tuition} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((c) => c - 1)}
                    className="flex h-10 items-center gap-1 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((c) => c + 1)}
                    className="flex h-10 items-center gap-1 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile filter drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              aria-label="Close filters"
              onClick={() => setMobileFiltersOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            <div className="absolute right-0 top-0 h-full w-[min(88%,380px)] overflow-y-auto bg-background p-5 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Filter Tuitions</h2>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close filter panel"
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                >
                  <X size={20} />
                </button>
              </div>

              <FilterContent onApply={applyFilters} />

              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="mt-8 w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground"
              >
                Show Results
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Reads the `search` / `subject` query parameters (used by the homepage
 * "Popular Subjects" links) and remounts the listing when they change.
 */
function BrowseTuitionsWrapper() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') ?? '';
  const initialSubject = searchParams.get('subject') ?? '';

  return (
    <BrowseTuitionsContent
      key={`${initialSearch}|${initialSubject}`}
      initialSearch={initialSearch}
      initialSubject={initialSubject}
    />
  );
}

export default function BrowseTuitionsPage() {
  return (
    <Suspense
      fallback={
        <section className="min-h-screen bg-background py-10 sm:py-14" aria-busy="true">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="h-40 animate-pulse rounded-2xl bg-muted/60" aria-hidden />
          </div>
        </section>
      }
    >
      <BrowseTuitionsWrapper />
    </Suspense>
  );
}
