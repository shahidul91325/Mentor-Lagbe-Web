'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, Variants, useReducedMotion } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.25, 0.1, 0.25, 1] } },
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

export default function About() {
  return (
    <main className="bg-background text-foreground min-h-screen py-12">
      <section className="mx-auto max-w-4xl px-4">
        <Reveal className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-primary">About MentorLagbe</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            MentorLagbe is a professional EdTech marketplace connecting students with qualified mentors and tutors.
          </p>
        </Reveal>

        <Card className="border-muted bg-card/60 mb-8">
          <CardHeader>
            <CardTitle>Mission & Vision</CardTitle>
            <CardDescription>
              Our mission is to empower learners by providing personalized, accessible, and secure mentorship experiences.
              We envision a world where quality education is always within reach.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-muted bg-card/60 mb-8">
          <CardHeader>
            <CardTitle>Why Choose MentorLagbe</CardTitle>
            <CardDescription>
              <ul className="list-disc pl-5 space-y-2">
                <li>Trusted mentors vetted for expertise and professionalism.</li>
                <li>Flexible learning modes – online, offline, and hybrid.</li>
                <li>Secure payments and transparent pricing.</li>
                <li>Easy application and management of tuition opportunities.</li>
              </ul>
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="text-center mt-8">
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <Link href="/tuitions">Explore Tuitions</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
