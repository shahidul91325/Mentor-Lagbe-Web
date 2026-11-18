// app/(dashboard)/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/providers/auth-provider';
import { apiFetch } from '@/lib/api';
import { PageContainer } from '@/components/shared/page-container';
import { SectionHeading } from '@/components/shared/section-heading';

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

  // Load current profile
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      // Not authenticated – redirect to sign‑in
      router.replace('/sign-in');
      return;
    }
    // Populate form with user data
    setForm({
      name: user.name ?? '',
      email: user.email ?? '',
      image: user.image ?? '',
      phone: user.phone ?? '',
      bio: user.bio ?? '',
    });
  }, [user, isLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await apiFetch('/api/users/me', {
        method: 'PATCH',
        token,
        body: {
          name: form.name,
          image: form.image,
          phone: form.phone,
          bio: form.bio,
        },
      });
      toast.success('Profile updated');
      // reload session to get fresh user data
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex h-64 items-center justify-center">Loading…</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SectionHeading title="Your Profile" description="Edit your personal information" />
      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="email">Email (cannot change)</Label>
          <Input id="email" name="email" value={form.email} disabled className="bg-muted" />
        </div>
        <div>
          <Label htmlFor="image">Avatar URL</Label>
          <Input id="image" name="image" value={form.image} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" value={form.phone} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" name="bio" value={form.bio} onChange={handleChange} rows={4} />
        </div>
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Saving…' : 'Save Changes'}
        </Button>
      </form>
    </PageContainer>
  );
}
