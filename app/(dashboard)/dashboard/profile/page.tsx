'use client';

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  UserRound,
  Mail,
  Phone,
  FileText,
  Camera,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
  X,
  Upload,
  ShieldCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/providers/auth-provider';
import { apiFetch } from '@/lib/api';
import { PageContainer } from '@/components/shared/page-container';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

interface ProfileFormValues {
  name: string;
  email: string;
  image: string;
  phone: string;
  bio: string;
}

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

function initialsOf(name: string): string {
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<ProfileFormValues>({
    name: '',
    email: '',
    image: '',
    phone: '',
    bio: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // Photo upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const originalImage = form.image;

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

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Please select a PNG, JPG, WEBP or GIF image.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image size must be less than 5MB.');
      e.target.value = '';
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreviewSrc(localUrl);
    setSelectedFile(file);

    void uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setUploadingImage(true);
    setUploadProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress = Math.min(progress + Math.random() * 14, 92);
      setUploadProgress(progress);
    }, 180);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) {
        clearInterval(interval);
        setUploadingImage(false);
        setUploadProgress(0);
        toast.error('Unable to read the selected image.');
        return;
      }

      try {
        const result = await apiFetch<{ url?: string; displayUrl?: string }>('/api/upload/image', {
          method: 'POST',
          body: { image: dataUrl, name: file.name },
        });

        clearInterval(interval);
        setUploadProgress(100);

        const imageUrl = result.url;
        if (!imageUrl) {
          throw new Error('The server did not return a hosted image URL.');
        }

        setForm((prev) => ({ ...prev, image: imageUrl }));
        setPreviewSrc(result.displayUrl ?? imageUrl);
        setUploadingImage(false);
        toast.success('Profile photo uploaded.');
      } catch (err) {
        clearInterval(interval);
        setUploadProgress(0);
        setUploadingImage(false);
        const message = err instanceof Error ? err.message : 'Image upload failed. Please try again.';
        toast.error(message);
        // Revert preview to the existing profile photo on failure.
        setPreviewSrc(originalImage || null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      clearInterval(interval);
      setUploadingImage(false);
      setUploadProgress(0);
      toast.error('Unable to read the selected image.');
      setPreviewSrc(originalImage || null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsDataURL(file);
  };

  const removeImage = useCallback(() => {
    if (uploadingImage) return;

    setPreviewSrc(originalImage || null);
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadingImage(false);
    setForm((prev) => ({ ...prev, image: originalImage }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [uploadingImage, originalImage]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (submitting || uploadingImage) return;

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
      await router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const initials = initialsOf(form.name || (user?.name ?? ''));

  const displayImage = previewSrc || form.image || undefined;
  const hasCustomImage = Boolean(displayImage);

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
        className="relative mx-auto max-w-3xl space-y-8 pb-16"
      >
        {/* Background decoration */}
        <div className="pointer-events-none absolute -top-12 right-0 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
        <div className="pointer-events-none absolute left-0 top-96 -z-10 h-64 w-64 rounded-full bg-primary/5 blur-[120px]" />

        {/* Page Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-3"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <div className="flex items-center gap-3">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 text-primary shadow-sm">
                {hasCustomImage ? (
                  <Image
                    src={displayImage!}
                    alt="Profile avatar"
                    fill
                    sizes="56px"
                    unoptimized
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <>
                    <div className="h-full w-full flex items-center justify-center bg-primary/10 text-3xl font-bold text-primary">
                      {initials || <UserRound size={32} />}
                    </div>
                    {user.image && <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-card bg-success" aria-hidden />}
                  </>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border border-card bg-primary text-primary-foreground shadow-lg transition-all hover:bg-primary/80 disabled:opacity-60 disabled:cursor-not-allowed"
                  aria-label="Change profile photo"
                >
                  <Camera size={15} />
                </button>
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {form.name || user.name || 'Your Profile'}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground truncate">{form.email || user.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                  <ShieldCheck size={13} />
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Account
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            <Button
              type="button"
              disabled={submitting || uploadingImage}
              onClick={() => fileInputRef.current?.click()}
              className="h-10 rounded-xl px-4 font-semibold shadow-sm hover:-translate-y-0.5"
            >
              {uploadingImage ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-3.5 w-3.5" />
                  Change Photo
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Main Form */}
        <motion.section
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
        >
          <div className="border-b border-border/60 bg-muted/30 px-6 py-5 sm:px-8">
            <h2 className="text-lg font-bold text-foreground">Personal Information</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Update the information associated with your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7 p-6 sm:p-8">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold">
                Full Name <span className="text-primary">*</span>
              </Label>

              <div className="relative">
                <UserRound
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  className="h-11 rounded-xl border-border bg-background pl-10 transition-all focus-visible:ring-primary/30"
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold">
                Email Address
              </Label>

              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="email"
                  name="email"
                  value={form.email}
                  disabled
                  readOnly
                  className="h-11 rounded-xl border-border bg-muted/50 pl-10 text-muted-foreground"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Your email address cannot be changed here.
              </p>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="font-semibold">
                Phone Number
              </Label>

              <div className="relative">
                <Phone
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="h-11 rounded-xl border-border bg-background pl-10 transition-all focus-visible:ring-primary/30"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Used for important account notifications.
              </p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bio" className="font-semibold">
                  About You
                </Label>
                <span className="text-xs font-medium text-muted-foreground">
                  {form.bio.length}/500
                </span>
              </div>

              <div className="relative">
                <FileText
                  className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-muted-foreground"
                />
                <Textarea
                  id="bio"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={5}
                  maxLength={500}
                  placeholder="Write a short introduction about yourself..."
                  className="min-h-[120px] resize-y rounded-xl border-border bg-background pl-10 pt-3 transition-all focus-visible:ring-primary/30"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Tell others a little about yourself. A good introduction makes your profile more trustworthy.
              </p>
            </div>

            {/* Profile Picture */}
            <div className="space-y-3">
              <Label htmlFor="profile-photo" className="font-semibold">
                Profile Picture
              </Label>

              <div className="relative overflow-hidden rounded-2xl border border-border bg-muted aspect-[1]">
                <div className="relative h-full w-full">
                  {displayImage ? (
                    <Image
                      src={displayImage}
                      alt="Profile photo preview"
                      fill
                      sizes="240px"
                      unoptimized
                      className="h-full w-full object-cover transition-opacity duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center gap-2 bg-muted/50">
                      <Upload className="h-10 w-10 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">No photo selected</span>
                    </div>
                  )}

                  {uploadingImage && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/85 backdrop-blur-sm z-20">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
                      <p className="text-sm font-medium text-foreground">Uploading photo…</p>
                    </div>
                  )}

                  {hasCustomImage && !uploadingImage && (
                    <>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-600"
                        aria-label="Remove photo"
                      >
                        <X className="h-4 w-4" />
                      </button>

                      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-black/65 px-3 py-1.5 text-xs text-white">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                        {selectedFile ? 'Ready to save' : 'Photo uploaded'}
                      </div>
                    </>
                  )}

                  <div className="absolute inset-0 flex items-end justify-end p-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition-all hover:bg-primary hover:text-primary-foreground disabled:opacity-60 disabled:cursor-not-allowed"
                      aria-label="Select a different photo"
                    >
                      <ImageIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <input
                  ref={fileInputRef}
                  id="profile-photo"
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(',')}
                  onChange={handleImageSelect}
                  disabled={uploadingImage}
                  className="hidden"
                />

                {selectedFile && !uploadingImage && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl px-3"
                  >
                    <ImageIcon className="mr-2 h-3.5 w-3.5" />
                    Change image
                  </Button>
                )}

                <p className="min-w-0 truncate text-xs text-muted-foreground">
                  {selectedFile?.name || ''} {((selectedFile?.size ?? 0) / 1024 / 1024).toFixed(2)} MB
                </p>

                {selectedFile && !uploadingImage && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                    className="rounded-xl px-3"
                  >
                    <X className="mr-2 h-3.5 w-3.5" />
                    Remove
                  </Button>
                )}
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-muted-foreground">Uploading to secure storage</span>
                    <span className="text-primary">{uploadProgress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full border border-border bg-muted/60 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                PNG, JPG, WEBP or GIF &middot; Maximum 5MB &middot; Uploaded securely via ImgBB
              </p>
            </div>

            {/* Submit */}
            <div className="flex flex-col-reverse gap-4 border-t border-border/60 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Your information is securely associated with your account.
              </p>

              <Button
                type="submit"
                disabled={submitting || uploadingImage}
                className="h-11 rounded-xl px-7 font-semibold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 sm:w-auto"
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
          className="flex gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 sm:p-5"
        >
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

          <div>
            <h3 className="text-sm font-semibold text-foreground">Your account, your information</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Keep your profile information accurate and up to date. Your photo is hosted securely and your email
              address is protected and cannot be edited from this page.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
