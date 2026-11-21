import Link from 'next/link';
import { ArrowUpRight, Atom, Calculator, Code2, Languages } from 'lucide-react';

const subjects = [
  {
    name: 'Math',
    query: 'Math',
    icon: Calculator,
    description: 'Algebra, geometry, calculus and exam preparation.',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    name: 'Physics',
    query: 'Physics',
    icon: Atom,
    description: 'Mechanics, electricity, optics and practical concepts.',
    color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },
  {
    name: 'Programming',
    query: 'Programming',
    icon: Code2,
    description: 'Programming fundamentals, problem solving and projects.',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  {
    name: 'IELTS',
    query: 'IELTS',
    icon: Languages,
    description: 'Listening, reading, writing and speaking preparation.',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
];

export function PopularSubjects() {
  return (
    <section className="border-y border-border bg-muted/30 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Popular Subjects</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Find help in the subjects that matter</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Explore tuition opportunities in the subjects students search for most.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {subjects.map((subject) => {
            const Icon = subject.icon;

            return (
              <Link
                key={subject.name}
                href={`/tuitions?search=${encodeURIComponent(subject.query)}`}
                className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className={`flex size-12 items-center justify-center rounded-2xl ${subject.color}`}>
                  <Icon className="size-6" aria-hidden />
                </div>

                <div className="mt-5 flex items-center justify-between gap-2">
                  <h3 className="text-lg font-bold">{subject.name}</h3>
                  <ArrowUpRight className="size-4 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden />
                </div>

                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{subject.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}