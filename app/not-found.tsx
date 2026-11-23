'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, GraduationCap, Home } from 'lucide-react';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

const floatVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8 },
  },
  animate: {
    y: [0, -12, 0],
    transition: { duration: 6, repeat: Infinity },
  },
};

const fadeUpVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6 },
  },
};

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 sm:px-8 lg:px-12">
      <motion.div
        initial="hidden"
        animate="visible"
        className="max-w-xl w-full text-center space-y-10"
      >
        {/* Illustration */}
        <motion.div
          variants={floatVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto mb-2"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 flex items-center justify-center opacity-20 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]">
              <BookOpen className="h-24 w-24 text-primary" aria-hidden />
            </div>

            <svg
              viewBox="0 0 64 64"
              className="h-20 w-20 mx-auto text-primary/70 drop-shadow-sm"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="grad" x1="0" x2="1" y1="0" y2="1">
                  <stop stopColor="currentColor" stopOpacity="0.9" offset="0%" />
                  <stop stopColor="currentColor" stopOpacity="0.5" offset="100%" />
                </linearGradient>
              </defs>

              {/* Tassel */}
              <line
                x1="32"
                y1="28"
                x2="32"
                y2="44"
                stroke="url(#grad)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              {/* Cap board */}
              <path
                d="M22 28 L32 20 L42 28 L32 36 Z"
                fill="url(#grad)"
              />

              {/* Cap base */}
              <rect
                x="29"
                y="36"
                width="6"
                height="4"
                fill="url(#grad)"
                rx="1"
              />

              {/* Book cover */}
              <rect
                x="15"
                y="42"
                width="34"
                height="14"
                fill="currentColor"
                fillOpacity="0.10"
                rx="4"
              />

              {/* Book pages */}
              <path
                d="M19 48 Q32 44 45 48 L45 56 Q32 60 19 56 Z"
                fill="currentColor"
                fillOpacity="0.50"
              />

              {/* Page divider */}
              <path
                d="M32 48 Q32 46 32 56"
                stroke="currentColor"
                strokeWidth="1"
                strokeOpacity="0.35"
              />

              {/* Page curves */}
              <path d="M19 48 Q25 46 32 48" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
              <path d="M19 56 Q25 58 32 56" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />

              {/* Sparkle */}
              <path
                d="M50 18 L52 22 L56 22 L53 25 L54 29 L50 27 L46 29 L47 25 L44 22 L48 22 Z"
                fill="currentColor"
                fillOpacity="0.65"
              />
            </svg>
          </div>
        </motion.div>

        {/* Big 404 typography */}
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="relative inline-block"
        >
          <span className="text-[8rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary drop-shadow-[0_8px_24px_rgba(234,88,12,0.18)] sm:text-[10rem] lg:text-[12rem]">
            404
          </span>
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-bold uppercase tracking-widest text-primary">
            <GraduationCap className="h-3.5 w-3.5" />
            Not Found
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Oops! Page Not Found
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base leading-relaxed">
            The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved. Let&rsquo;s get you back on
            track.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row gap-3 justify-center w-full"
        >
          <Button
            asChild
            className="w-full sm:w-auto px-8 font-semibold shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={handleGoBack}
            className="w-full sm:w-auto px-8 font-semibold hover:bg-primary hover:text-primary-foreground hover:border-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
