import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  BookOpen,
  Users,
  User,
  CheckCircle,
  Zap,
  MessageCircle,
  Clock,
  Star,
} from 'lucide-react';

export default function Home() {
  return (
    /* Main container with max width and background for light/dark themes */
    <main className="flex flex-col gap-20 max-w-7xl mx-auto bg-[#F8F5EE] dark:bg-[#24202B] py-12 md:py-20 lg:py-32 px-4 md:px-8 lg:px-16">
      {/* Hero Section with gradient background and layered shapes */}
      <section className="relative grid grid-cols-1 lg:grid-cols-2 items-center gap-12 p-8 rounded-3xl bg-gradient-to-r from-[#F07828] via-[#EAF0FF] to-[#4569DB] animate-fade-in-up overflow-hidden">
        {/* Decorative floating shapes */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-[#FCE8EF] rounded-full opacity-30 animate-bounce" />
        <div className="absolute -bottom-20 right-0 w-64 h-64 bg-[#8957E5] rounded-full opacity-20 animate-pulse" />
        <div className="space-y-6 z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">
            Find the <span className="text-[#EAF0FF]">Right Tutor.</span> Achieve Your Learning Goals.
          </h1>
          <p className="text-lg text-white max-w-prose">
            Connect with qualified mentors, schedule flexible sessions, and get personalized support to master any subject.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/tutors">Find a Tutor</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/become-tutor">Explore Tuitions</Link>
            </Button>
          </div>
        </div>
        <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden z-10">
          <Image
            src="/hero.png"
            alt="MentorLagbe hero illustration"
            fill
            className="object-contain object-center"
            style={{ mixBlendMode: "multiply" }}
            priority
          />
        </div>
      </section>

      {/* Trust Highlights – colorful cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12 animate-fade-in-up">
        {[
          { icon: <Users className="w-8 h-8 mx-auto mb-2" />, title: 'Verified Tutors', bg: 'bg-[#FCE8EF]' },
          { icon: <BookOpen className="w-8 h-8 mx-auto mb-2" />, title: 'Personalized Learning', bg: 'bg-[#EAF0FF]' },
          { icon: <Zap className="w-8 h-8 mx-auto mb-2" />, title: 'Flexible Scheduling', bg: 'bg-[#F8F5EE]' },
          { icon: <CheckCircle className="w-8 h-8 mx-auto mb-2" />, title: 'Secure Platform', bg: 'bg-[#E5E7EB]' },
        ].map((item, i) => (
          <div key={i} className={`p-6 rounded-xl shadow-sm hover:shadow-xl transition-shadow ${item.bg}`}>
            {item.icon}
            <h3 className="text-lg font-medium text-center mt-2">{item.title}</h3>
          </div>
        ))}
      </section>

      {/* How It Works – timeline with colored badges */}
      <section className="space-y-12 mt-16 animate-fade-in-up">
        <h2 className="text-2xl font-semibold text-center text-[#24202B] dark:text-white">How It Works</h2>
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Connecting vertical line for desktop */}
          
          {[
            { icon: <User className="w-6 h-6 text-[#F07828]" />, step: '1', title: 'Discover Tutors', description: 'Browse our marketplace, filter by subject, price, and rating.', bg: '#FCE8EF' },
            { icon: <ArrowRight className="w-6 h-6 text-[#8957E5]" />, step: '2', title: 'Connect with a Mentor', description: 'Message, schedule a session, and start a personalized learning plan.', bg: '#EAF0FF' },
            { icon: <Clock className="w-6 h-6 text-[#4569DB]" />, step: '3', title: 'Start Learning', description: 'Attend live sessions, track progress, and achieve your goals.', bg: '#F8F5EE' },
          ].map((step, i) => (
            <Card key={i} className="p-6 text-center hover:shadow-lg transition-shadow" style={{ backgroundColor: step.bg }}>
              <CardHeader className="flex flex-col items-center gap-3">
                <Badge variant="secondary" className="rounded-full w-12 h-12 flex items-center justify-center text-lg" style={{ backgroundColor: step.bg }}>
                  {step.step}
                </Badge>
                {step.icon}
                <CardTitle className="text-xl">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>{step.description}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Learning Experience – storytelling with existing person/avatar images */}
      <section className="mt-16 space-y-8 animate-fade-in-up">
        <h2 className="text-2xl font-semibold text-center text-[#24202B] dark:text-white">Learning Experience</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Left person image */}
          <Image src="/person1.png" alt="Student illustration" width={300} height={300} className="rounded-xl shadow-md" />
          {/* Central text block */}
          <div className="text-center px-4">
            <p className="text-lg text-[#24202B] dark:text-white max-w-md mx-auto">Students connect with trusted mentors, receive personalized lessons, and track their progress in a supportive environment.</p>
          </div>
          {/* Right avatar collage */}
          <div className="grid grid-cols-2 gap-2">
            <Image src="/avatar1.png" alt="Tutor avatar" width={150} height={150} className="rounded-full shadow-sm" />
            <Image src="/avatar2.png" alt="Tutor avatar" width={150} height={150} className="rounded-full shadow-sm" />
          </div>
        </div>
      </section>

      {/* Benefits – split panels for Students and Tutors */}
      <section className="mt-16 space-y-12 animate-fade-in-up">
        <h2 className="text-2xl font-semibold text-center text-[#24202B] dark:text-white">Benefits</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Student Benefits Panel */}
          <div className="bg-[#FCE8EF] rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-medium mb-4 text-[#F07828]">For Students</h3>
            <ul className="space-y-2 text-[#24202B] dark:text-white">
              <li className="flex items-center"><MessageCircle className="w-5 h-5 mr-2" /> Easy Tutor Discovery</li>
              <li className="flex items-center"><User className="w-5 h-5 mr-2" /> Personalized Learning Paths</li>
              <li className="flex items-center"><Clock className="w-5 h-5 mr-2" /> Flexible Scheduling</li>
            </ul>
          </div>
          {/* Tutor Benefits Panel */}
          <div className="bg-[#EAF0FF] rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-medium mb-4 text-[#4569DB]">For Tutors</h3>
            <ul className="space-y-2 text-[#24202B] dark:text-white">
              <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Direct Communication</li>
              <li className="flex items-center"><Star className="w-5 h-5 mr-2" /> Convenient Tuition Management</li>
              <li className="flex items-center"><Zap className="w-5 h-5 mr-2" /> Flexible Scheduling</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Featured Tuitions – using generic avatars as thumbnails */}
      <section className="mt-16 space-y-8 animate-fade-in-up">
        <h2 className="text-2xl font-semibold text-center text-[#24202B] dark:text-white">Featured Tuitions</h2>
        <p className="text-center text-[#24202B] dark:text-white max-w-xl mx-auto mb-6">
          Explore curated subjects with top‑rated mentors.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-shadow bg-white dark:bg-[#24202B]">
              <Image
                src={i === 1 ? '/person1.png' : i === 2 ? '/avatar1.png' : '/avatar2.png'}
                alt={`Featured tuition ${i}`}
                width={400}
                height={300}
                className="object-cover w-full h-48"
              />
              <CardHeader className="p-4">
                <CardTitle>Subject {i}</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Top tutor information will appear here.</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-6">
          <Button asChild variant="link">
            <Link href="/tuitions">View All Tuitions →</Link>
          </Button>
        </div>
      </section>

      {/* Platform Highlights – qualitative statements */}
      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center animate-fade-in-up">
        {[
          { label: 'Trusted Community', value: 'Thousands of learners & mentors' },
          { label: 'Secure Payments', value: 'PCI‑DSS compliant' },
          { label: '24/7 Support', value: 'Live chat & email help' },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-[#F8F5EE] dark:bg-[#24202B] rounded-xl shadow-sm hover:shadow-xl transition-shadow">
            <p className="text-lg font-medium text-[#24202B] dark:text-white mb-2">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Final CTA – gradient background with decorative floating shape */}
      <section className="mt-16 bg-gradient-to-r from-[#F07828] to-[#8957E5] rounded-xl p-12 text-center text-white animate-fade-in-up relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FCE8EF] rounded-full opacity-20 animate-pulse" />
        <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
        <p className="mb-6 max-w-md mx-auto">
          Join thousands of students and tutors making education accessible and personalized.
        </p>
        <Button size="lg" asChild>
          <Link href="/sign-up">Get Started</Link>
        </Button>
      </section>
    </main>
  );
}
