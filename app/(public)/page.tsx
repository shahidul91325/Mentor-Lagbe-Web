'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Users,
  ShieldCheck,
  Clock3,
  GraduationCap,
  Search,
  MessageCircle,
  CalendarCheck,
  CheckCircle2,
  Sparkles,
  Star,
  Zap,
  Target,
  HeartHandshake,
  BookMarked,
  MoveUpRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FeaturedTuitions } from '@/components/home/FeaturedTuitions';
import { PopularSubjects } from '@/components/home/PopularSubjects';
import { PlatformStats } from '@/components/home/PlatformStats';
import { PricingSection } from '@/components/home/PricingSection';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={fadeUp}
      initial={shouldReduceMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const features = [
  {
    icon: Users,
    title: 'Trusted Mentors',
    description: 'Discover tutors and mentors who can guide you toward your learning goals.',
  },
  {
    icon: Target,
    title: 'Personalized Learning',
    description: 'Find learning support that matches your subject, level, and individual needs.',
  },
  {
    icon: Clock3,
    title: 'Flexible Learning',
    description: 'Explore tuition opportunities and find schedules that work for you.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Experience',
    description: 'Manage your learning journey through one organized platform.',
  },
];

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Explore Opportunities',
    description: 'Browse available tuitions and discover mentors based on your learning needs.',
  },
  {
    number: '02',
    icon: MessageCircle,
    title: 'Connect & Apply',
    description: 'Connect with the right people and take the next step toward your goals.',
  },
  {
    number: '03',
    icon: GraduationCap,
    title: 'Start Learning',
    description: 'Build your learning journey with guidance, consistency, and confidence.',
  },
];

const studentBenefits = [
  'Discover suitable tutors',
  'Explore tuition opportunities',
  'Connect with mentors',
  'Manage your applications',
];

const tutorBenefits = [
  'Create your tutor profile',
  'Explore student requirements',
  'Manage tuition opportunities',
  'Connect with potential students',
];

export default function Home() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="overflow-hidden bg-background text-foreground">
      {/* ================= HERO ================= */}
      <section className="relative isolate">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(var(--tw-gradient-stops))] from-primary/[0.04] via-transparent to-transparent" />
        </div>

        <div className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-12 lg:py-28">
          {/* Hero content */}
          <motion.div
            variants={stagger}
            initial={shouldReduceMotion ? false : 'hidden'}
            animate="visible"
            className="relative z-10 space-y-8"
          >
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
                <Sparkles size={15} />
                Your learning journey starts here
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-5">
              <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                Find the right
                <span className="relative mx-2 inline-block text-primary">
                  mentor.
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none" aria-hidden="true">
                    <path d="M2 9C48 2 135 1 198 7" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span>
                <br />
                Unlock your potential.
              </h1>

              <p className="max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                Great learning starts with the right guidance. Discover tuition opportunities, connect with experienced
                mentors, and move closer to your goals with MentorLagbe.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="group h-13 rounded-xl px-7 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30"
              >
                <Link href="/tuitions">
                  Explore Tuitions
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-13 rounded-xl border-border bg-card/60 px-7 text-base font-semibold backdrop-blur transition-all hover:-translate-y-1 hover:border-primary hover:text-primary"
              >
                <Link href="/become-tutor">
                  Become a Tutor
                  <MoveUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-7"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Flexible opportunities
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Personalized guidance
              </div>
            </motion.div>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
            className="relative mx-auto w-full max-w-xl"
          >
            <div className="absolute -inset-5 rounded-[3rem] bg-primary/10 blur-3xl" />

            <motion.div
              animate={shouldReduceMotion ? undefined : { y: [0, -12, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card p-3 shadow-2xl shadow-primary/10"
            >
              <div className="relative aspect-[5/4] overflow-hidden rounded-[1.5rem] bg-muted">
                <Image
                  src="/hero.png"
                  alt="Students and mentors learning together"
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 50vw"
                  className="object-contain p-5"
                />

                <div className="absolute inset-0 -z-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
              </div>

              {/* Floating learning card */}
              <motion.div
                animate={shouldReduceMotion ? undefined : { y: [0, 8, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute left-0 top-12 flex items-center gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur-md sm:-left-8"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BookOpen size={22} />
                </div>
                <div>
                  <p className="text-sm font-bold">Learn with purpose</p>
                  <p className="text-xs text-muted-foreground">Your goals matter</p>
                </div>
              </motion.div>

              <motion.div
                animate={shouldReduceMotion ? undefined : { y: [0, -8, 0] }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute bottom-12 right-0 flex items-center gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur-md sm:-right-8"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <GraduationCap size={23} />
                </div>
                <div>
                  <p className="text-sm font-bold">Grow every day</p>
                  <p className="text-xs text-muted-foreground">One step at a time</p>
                </div>
              </motion.div>
            </motion.div>

            <div className="absolute -bottom-7 -left-4 -z-10 h-28 w-28 rounded-full border border-primary/20 sm:-left-12" />
            <div className="absolute -right-5 -top-8 -z-10 h-20 w-20 rounded-2xl border border-primary/20 rotate-12" />
          </motion.div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="border-y border-border bg-muted/30 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Why MentorLagbe</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">A better way to learn and teach</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Everything you need to make meaningful learning connections in one place.
            </p>
          </Reveal>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  whileHover={shouldReduceMotion ? undefined : { y: -8, transition: { duration: 0.25 } }}
                  className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon size={26} />
                  </div>

                  <h3 className="text-lg font-bold">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ================= FEATURED TUITIONS ================= */}
      <FeaturedTuitions />

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <Reveal className="mx-auto mb-16 max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Simple Process</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">How MentorLagbe works</h2>
            <p className="mt-4 leading-7 text-muted-foreground">Start your journey in three simple steps.</p>
          </Reveal>

          <div className="relative grid gap-8 md:grid-cols-3">
            <div className="absolute left-[16%] right-[16%] top-10 hidden border-t-2 border-dashed border-primary/20 md:block" />

            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <Reveal key={step.number}>
                  <motion.div
                    whileHover={shouldReduceMotion ? undefined : { y: -7 }}
                    className="relative flex h-full flex-col items-center rounded-3xl border border-border bg-card px-7 py-9 text-center shadow-sm transition-shadow hover:shadow-xl hover:shadow-primary/5"
                  >
                    <div className="relative z-10 mb-7 flex h-20 w-20 items-center justify-center rounded-3xl border border-primary/20 bg-background text-primary shadow-lg shadow-primary/5">
                      <Icon size={31} />
                      <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground ring-4 ring-background">
                        {step.number}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="mt-3 max-w-xs text-sm leading-7 text-muted-foreground">{step.description}</p>

                    {index !== 2 && (
                      <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-primary md:hidden">
                        NEXT STEP <ArrowRight size={14} />
                      </div>
                    )}
                  </motion.div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= POPULAR SUBJECTS ================= */}
      <PopularSubjects />

      {/* ================= LEARNING EXPERIENCE ================= */}
      <section className="overflow-hidden bg-muted/30 py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:px-12">
          <Reveal className="relative mx-auto w-full max-w-lg">
            <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <div className="overflow-hidden rounded-3xl border border-border bg-card p-2 shadow-lg">
                  <Image
                    src="/person1.png"
                    alt="Student learning"
                    width={300}
                    height={350}
                    className="h-64 w-full rounded-2xl object-cover"
                  />
                </div>

                <div className="rounded-2xl bg-primary p-5 text-primary-foreground shadow-lg shadow-primary/20">
                  <BookMarked className="mb-3 h-7 w-7" />
                  <p className="text-lg font-bold">Keep learning.</p>
                  <p className="mt-1 text-xs opacity-80">Keep growing.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-card p-5 shadow-lg">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Star size={22} />
                  </div>
                  <p className="font-bold">Find your guide</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Connect with mentors who understand your goals.
                  </p>
                </div>

                <div className="overflow-hidden rounded-3xl border border-border bg-card p-2 shadow-lg">
                  <Image
                    src="/avatar1.png"
                    alt="Mentor portrait illustration"
                    width={300}
                    height={350}
                    className="h-64 w-full rounded-2xl object-cover"
                  />
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className="space-y-7">
            <div>
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Learning Experience</span>
              <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Learning becomes better when you have the right guidance.
              </h2>
              <p className="mt-5 leading-8 text-muted-foreground">
                Every learner has different goals. MentorLagbe helps students discover learning opportunities and gives
                tutors a place to connect with students who need their guidance.
              </p>
            </div>

            <div className="space-y-4">
              {[
                'Discover opportunities that match your goals',
                'Connect with people who share your learning interests',
                'Keep your learning journey organized',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle2 size={15} />
                  </div>
                  <p className="text-sm font-medium leading-6">{item}</p>
                </div>
              ))}
            </div>

            <Button asChild size="lg" className="group h-12 rounded-xl px-7">
              <Link href="/tuitions">
                Start Exploring
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* ================= BENEFITS ================= */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <Reveal className="mx-auto mb-14 max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Made for Everyone</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">One platform. Two learning journeys.</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Whether you want to learn or teach, MentorLagbe helps you take the next step.
            </p>
          </Reveal>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Student card */}
            <Reveal>
              <motion.div
                whileHover={shouldReduceMotion ? undefined : { y: -6 }}
                className="relative h-full overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-10"
              >
                <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />

                <div className="relative">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <GraduationCap size={29} />
                  </div>

                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">For Students</span>

                  <h3 className="mt-3 text-2xl font-bold sm:text-3xl">Learn with confidence.</h3>

                  <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
                    Discover tutors, explore available tuition opportunities, and find the guidance you need to reach
                    your goals.
                  </p>

                  <div className="mt-8 space-y-4">
                    {studentBenefits.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                        <span className="text-sm font-medium">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <Button asChild className="mt-9 h-12 rounded-xl px-6">
                    <Link href="/tuitions">
                      Explore Tuitions
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </Reveal>

            {/* Tutor card */}
            <Reveal>
              <motion.div
                whileHover={shouldReduceMotion ? undefined : { y: -6 }}
                className="relative h-full overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-10"
              >
                <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />

                <div className="relative">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <HeartHandshake size={29} />
                  </div>

                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                    For Tutors
                  </span>

                  <h3 className="mt-3 text-2xl font-bold sm:text-3xl">Share what you know.</h3>

                  <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
                    Showcase your teaching profile, explore student requirements, and connect with learners.
                  </p>

                  <div className="mt-8 space-y-4">
                    {tutorBenefits.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-medium">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    asChild
                    variant="outline"
                    className="mt-9 h-12 rounded-xl border-emerald-500/30 px-6 hover:bg-emerald-500/10 hover:text-emerald-600"
                  >
                    <Link href="/become-tutor">
                      Become a Tutor
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= PLATFORM HIGHLIGHTS ================= */}
      <section className="border-y border-border bg-muted/30 py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:grid-cols-3 sm:px-8 lg:px-12">
          {[
            {
              icon: Zap,
              title: 'Easy to Explore',
              description: 'Find learning opportunities with a simple experience.',
            },
            {
              icon: CalendarCheck,
              title: 'Organized Journey',
              description: 'Keep your learning and teaching activities organized.',
            },
            {
              icon: ShieldCheck,
              title: 'Built for Connection',
              description: 'Bring students and tutors together in one platform.',
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <Reveal key={item.title}>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon size={23} />
                  </div>

                  <div>
                    <h3 className="font-bold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ================= PLATFORM STATISTICS ================= */}
      <PlatformStats />

      {/* ================= PRICING ================= */}
      <PricingSection />

      {/* ================= FINAL CTA ================= */}
      <section className="px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <Reveal className="mx-auto max-w-7xl">
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-primary px-7 py-16 text-center text-primary-foreground shadow-2xl shadow-primary/20 sm:px-14 sm:py-20">
            {/* Decorative elements */}
            <div className="pointer-events-none absolute -left-20 -top-32 -z-10 h-80 w-80 rounded-full border border-white/15" />
            <div className="pointer-events-none absolute -bottom-40 -right-20 -z-10 h-96 w-96 rounded-full border border-white/15" />
            <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />

            <motion.div
              animate={shouldReduceMotion ? undefined : { rotate: [0, 8, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10"
            >
              <Sparkles size={30} />
            </motion.div>

            <h2 className="mx-auto max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Your next learning opportunity is waiting.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-primary-foreground/80 sm:text-base">
              Take the first step today. Discover opportunities, connect with mentors, and make your learning journey
              meaningful.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-13 rounded-xl bg-white px-8 font-bold text-primary shadow-lg hover:bg-white/90"
              >
                <Link href="/sign-up">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-13 rounded-xl border-white/40 bg-transparent px-8 font-semibold text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/tuitions">Explore Tuitions</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
