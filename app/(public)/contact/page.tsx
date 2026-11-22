'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { motion, Variants, useReducedMotion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';

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
        <Reveal className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-primary">Contact Us</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Have a question or need assistance? Reach us through any channel below.
          </p>
        </Reveal>

        <Card className="border-muted bg-card/60 p-6">
          <CardHeader className="text-center">
            <CardTitle>Get in Touch</CardTitle>
            <CardDescription>We’re here to help you find the right tutor or manage your tuitions.</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Mail size={20} aria-hidden />
              </div>
              <p className="font-medium text-foreground">Email</p>
              <a href="mailto:contact@mentorlagbe.com" className="text-sm text-primary underline">
                contact@mentorlagbe.com
              </a>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Phone size={20} aria-hidden />
              </div>
              <p className="font-medium text-foreground">Phone</p>
              <a href="tel:+8801700000000" className="text-sm text-primary underline">
                +880 1700 000000
              </a>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <MapPin size={20} aria-hidden />
              </div>
              <p className="font-medium text-foreground">Address</p>
              <p className="text-sm text-muted-foreground text-center">
                MentorLagbe HQ, Dhaka, Bangladesh
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
