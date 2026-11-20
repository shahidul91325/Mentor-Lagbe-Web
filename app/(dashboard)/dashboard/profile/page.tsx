'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  UserRound,
  Mail,
  Phone,
  FileText,
  Camera,
  Save,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/providers/auth-provider';
import { apiFetch } from '@/lib/api';
import { PageContainer } from '@/components/shared/page-container';

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function ProfilePage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    image: '',
    phone: '',
    bio: '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/sign-in');
      return;
    }

    const timer = setTimeout(() => {
      setForm({
        name: (user?.name ?? '') as string,
        email: (user?.email ?? '') as string,
        image: (user?.image ?? '') as string,
        phone: (user?.phone ?? '') as string,
        bio: (user?.bio ?? '') as string,
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [user, isLoading, router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (submitting) return;

    setSubmitting(true);

    try {
      await apiFetch('/api/users/me', {
        method: 'PATCH',
        body: {
          name: form.name,
          image: form.image,
          phone: form.phone,
          bio: form.bio,
        },
      });

      toast.success('Your profile has been updated successfully!');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const initials = form.name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  if (isLoading || !user) {
    return (
      <PageContainer>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="relative mx-auto max-w-5xl space-y-8 pb-12"
      >
        {/* Background decoration */}
        <div className="pointer-events-none absolute -top-10 right-0 -z-10 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
        <div className="pointer-events-none absolute left-0 top-96 -z-10 h-64 w-64 rounded-full bg-primary/5 blur-[100px]" />

        {/* Page Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <UserRound size={24} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">My Profile</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage your personal information and profile settings.
                </p>
              </div>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
            <ShieldCheck size={16} />
            Account Settings
          </div>
        </motion.div>

        {/* Profile Overview */}
        <motion.section
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
        >
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent" />

          <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: 'spring', stiffness: 250 }}
              className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-card bg-primary/10 text-3xl font-bold text-primary shadow-lg"
            >
              {form.image ? (
                <img
                  src={form.image}
                  alt="Profile avatar"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                initials || <UserRound size={36} />
              )}

              <div className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground">
                <Camera size={13} />
              </div>
            </motion.div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-foreground sm:text-2xl">{form.name || 'Your Name'}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={13} />
                  Active Account
                </span>
              </div>

              <p className="mt-1 break-all text-sm text-muted-foreground">{form.email}</p>

              <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles size={14} className="text-primary" />
                Keep your profile updated to build trust with the community.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Main Form */}
        <motion.section
          variants={itemVariants}
          className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
        >
          <div className="border-b border-border bg-muted/30 px-6 py-5 sm:px-8">
            <h2 className="text-lg font-bold text-foreground">Personal Information</h2>
            <p className="mt-1 text-sm text-muted-foreground">Update the information associated with your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7 p-6 sm:p-8">
            {/* Name & Email */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold">
                  Full Name <span className="text-primary">*</span>
                </Label>

                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="h-12 rounded-xl border-border bg-background pl-10 transition-all focus-visible:ring-primary/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold">
                  Email Address
                </Label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    value={form.email}
                    disabled
                    className="h-12 rounded-xl border-border bg-muted/60 pl-10 text-muted-foreground"
                  />
                </div>

                <p className="text-xs text-muted-foreground">Your email address cannot be changed here.</p>
              </div>
            </div>

            {/* Avatar */}
            <div className="space-y-2">
              <Label htmlFor="image" className="font-semibold">
                Profile Image URL
              </Label>

              <div className="relative">
                <Camera className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="image"
                  name="image"
                  type="url"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                  className="h-12 rounded-xl border-border bg-background pl-10 transition-all focus-visible:ring-primary/30"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Paste a publicly accessible image URL to update your avatar.
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="font-semibold">
                Phone Number
              </Label>

              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="h-12 rounded-xl border-border bg-background pl-10 transition-all focus-visible:ring-primary/30"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bio" className="font-semibold">
                  About You
                </Label>
                <span className="text-xs text-muted-foreground">{form.bio.length}/500</span>
              </div>

              <div className="relative">
                <FileText className="pointer-events-none absolute left-3.5 top-4 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="bio"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={5}
                  maxLength={500}
                  placeholder="Write a short introduction about yourself..."
                  className="min-h-32 resize-y rounded-xl border-border bg-background pl-10 pt-3 transition-all focus-visible:ring-primary/30"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Tell others a little about yourself. A good introduction makes your profile more trustworthy.
              </p>
            </div>

            {/* Submit */}
            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Your information is securely associated with your account.
              </p>

              <Button
                type="submit"
                disabled={submitting}
                className="h-12 w-full rounded-xl px-7 font-semibold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 sm:w-auto"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.section>

        {/* Security Notice */}
        <motion.div
          variants={itemVariants}
          className="flex gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4"
        >
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

          <div>
            <h3 className="text-sm font-semibold text-foreground">Your account, your information</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Keep your profile information accurate and up to date. Your email address is protected and cannot be
              edited from this page.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
