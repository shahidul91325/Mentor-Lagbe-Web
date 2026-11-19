'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, Variants, useReducedMotion } from 'framer-motion';
import { Search, MessageCircle, GraduationCap, Users, BookOpen, Sparkles } from 'lucide-react';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.25, 0.1, 0.25, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
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

const studentSteps = [
  { number: '01', icon: Search, title: 'Explore Opportunities', description: 'Browse the tuition listings that match your subjects, level and preferred learning mode.' },
  { number: '02', icon: MessageCircle, title: 'Connect & Apply', description: 'Reach out to mentors, ask questions and submit your application directly.' },
  { number: '03', icon: GraduationCap, title: 'Start Learning', description: 'Begin your personalized learning journey with scheduled sessions and progress tracking.' },
];

const tutorSteps = [
  { number: '01', icon: Users, title: 'Create Profile', description: 'Set up a detailed tutor profile showcasing your expertise and teaching style.' },
  { number: '02', icon: BookOpen, title: 'Find Students', description: 'Browse student requests, filter by subject and level, and send proposals.' },
  { number: '03', icon: Sparkles, title: 'Teach & Earn', description: 'Conduct sessions, receive feedback and get paid securely through the platform.' },
];

export default function HowItWorks() {
  const shouldReduceMotion = useReducedMotion();
  return (
    <main className="bg-background text-foreground min-h-screen py-12">
      <section className="mx-auto max-w-5xl px-4">
        <Reveal className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-primary">How MentorLagbe Works</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A seamless flow for both students and tutors to connect, learn, and grow together.
          </p>
        </Reveal>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Student workflow */}
          <Reveal className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">For Students</h2>
            <div className="space-y-4">
              {studentSteps.map((step) => (
                <Card key={step.number} className="border-muted bg-card/60">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </Reveal>

          {/* Tutor workflow */}
          <Reveal className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">For Tutors</h2>
            <div className="space-y-4">
              {tutorSteps.map((step) => (
                <Card key={step.number} className="border-muted bg-card/60">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <Link href="/tuitions">Explore Tuitions</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
