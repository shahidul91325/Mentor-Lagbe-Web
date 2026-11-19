'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

export default function Contact() {
  return (
    <main className="bg-background text-foreground min-h-screen py-12">
      <section className="mx-auto max-w-2xl px-4">
        <Reveal className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-primary">Contact Us</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Have a question or need assistance? Fill out the form below and we’ll get back to you soon.
          </p>
        </Reveal>

        <Card className="border-muted bg-card/60 p-6">
          <CardHeader>
            <CardTitle>Send a Message</CardTitle>
            <CardDescription>All fields are required.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <Input type="text" placeholder="Your Name" required />
              </div>
              <div>
                <Input type="email" placeholder="you@example.com" required />
              </div>
              <div>
                <Input type="text" placeholder="Subject" required />
              </div>
              <div>
                <Textarea placeholder="Your message..." rows={5} required />
              </div>
              <div className="flex justify-center pt-4">
                <Button type="submit" disabled className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  Submit (Demo – Not functional)
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-muted-foreground">
          <p>Alternatively, reach us at <a href="mailto:contact@mentorlagbe.com" className="text-primary underline">contact@mentorlagbe.com</a></p>
        </div>
      </section>
    </main>
  );
}
