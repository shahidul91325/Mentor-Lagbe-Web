'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  MapPin,
  Wallet,
  CalendarDays,
  GraduationCap,
  Loader2,
  Send,
  RotateCcw,
  ImagePlus,
  X,
  Upload,
  Phone,
  CheckCircle2,
  Users,
  FileText,
  Crown,
  AlertCircle,
  ArrowRight,
  CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { apiFetch } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';

const FREE_TUITION_LIMIT = 2;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

const subjects = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Bangla',
  'ICT',
  'Accounting',
  'Finance',
  'Economics',
  'Science',
  'All Subjects',
  'Other',
];

const classLevels = [
  'Play',
  'Nursery',
  'KG',
  ...Array.from({ length: 10 }, (_, i) => `Class ${i + 1}`),
  'SSC',
  'HSC',
  'Admission',
  'University',
];

const weekDays = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const initialForm = {
  title: '',
  description: '',
  subject: '',
  classLevel: '',
  category: '',
  tuitionType: 'Offline',
  salary: '',
  location: '',
  area: '',
  studentGender: 'Any',
  tutorGender: 'Any',
  studentsCount: '1',
  preferredTime: '',
  requirements: '',
  contactNumber: '',
};

const modeMap: Record<string, 'offline' | 'online' | 'hybrid'> = {
  Offline: 'offline',
  Online: 'online',
  Both: 'hybrid',
};

type SelectFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: string[];
  required?: boolean;
};

function SelectField({ id, label, value, onChange, placeholder, options, required = false }: SelectFieldProps) {
  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="h-12 w-full rounded-xl border-border bg-background px-4">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent position="popper" side="bottom" sideOffset={6} className="max-h-64">
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <CardHeader className="border-b border-border/60 px-5 py-5 sm:px-7">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <CardTitle className="text-base sm:text-lg">{title}</CardTitle>

          <CardDescription className="mt-1 text-xs sm:text-sm">{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
  );
}

export default function PostTuitionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(initialForm);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [bannerName, setBannerName] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [usageCount, setUsageCount] = useState<number | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const [usageError, setUsageError] = useState('');

  const isPro = user?.plan === 'pro';
  const limitReached = !isPro && usageCount !== null && usageCount >= FREE_TUITION_LIMIT;

  const inputClass = 'h-12 rounded-xl mt-2';

  const refreshUsage = useCallback(async () => {
    setUsageLoading(true);

    try {
      const data = await apiFetch<{ tuitions?: unknown[] }>('/api/tuitions/my');
      setUsageCount(Array.isArray(data?.tuitions) ? data.tuitions.length : 0);
      setUsageError('');
    } catch (error) {
      setUsageError(error instanceof Error ? error.message : 'Unable to load your tuition count.');
    } finally {
      setUsageLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void refreshUsage();
    }, 0);

    return () => clearTimeout(timer);
  }, [refreshUsage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]));
  };

  const uploadImage = async (dataUrl: string, fileName: string) => {
    setUploadingImage(true);

    try {
      const result = await apiFetch<{ url?: string }>('/api/upload/image', {
        method: 'POST',
        body: { image: dataUrl, name: fileName },
      });

      if (!result?.url) {
        throw new Error('The server did not return a hosted image URL.');
      }

      setBannerImageUrl(result.url);
      setBannerName(fileName);

      toast.success('Cover image uploaded.', {
        description: 'The permanent ImgBB URL will be saved with your tuition.',
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Image upload failed. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        void uploadImage(reader.result, file.name);
      } else {
        toast.error('Unable to read the selected image.');
      }
    };

    reader.onerror = () => toast.error('Unable to read the selected image.');
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    if (uploadingImage) return;

    setBannerImageUrl('');
    setBannerName('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setForm({ ...initialForm });
    setSelectedDays([]);
    removeImage();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (uploadingImage) {
      toast.error('Please wait for the cover image upload to finish.');
      return;
    }

    if (limitReached) {
      toast.error('You have reached the Free plan limit of 2 tuition posts.');
      return;
    }

    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Please complete the tuition details.');
      return;
    }

    if (!form.subject || !form.classLevel) {
      toast.error('Please select subject and class level.');
      return;
    }

    const monthlyFee = Number(form.salary);
    const studentsCount = Number(form.studentsCount);

    if (!Number.isFinite(monthlyFee) || monthlyFee <= 0) {
      toast.error('Please enter a valid monthly salary.');
      return;
    }

    if (!Number.isInteger(studentsCount) || studentsCount < 1) {
      toast.error('Please enter a valid number of students.');
      return;
    }

    if (!form.location.trim() || !form.area.trim()) {
      toast.error('Please enter your tuition location and area.');
      return;
    }

    if (!form.preferredTime || selectedDays.length === 0) {
      toast.error('Please select teaching days and preferred time.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        subject: form.subject,
        classLevel: form.classLevel,
        category: form.category,
        mode: modeMap[form.tuitionType],
        location: form.location.trim(),
        area: form.area.trim(),
        monthlyFee,
        price: monthlyFee,
        daysPerWeek: selectedDays.length,
        preferredDays: selectedDays,
        preferredTime: form.preferredTime,
        studentsCount,
        studentGender: form.studentGender,
        tutorGender: form.tutorGender,
        requirements: form.requirements.trim(),
        contactNumber: form.contactNumber.trim(),
        bannerImage: bannerImageUrl,
      };

      await apiFetch('/api/tuitions', {
        method: 'POST',
        body: payload,
      });

      toast.success('Tuition posted successfully!');

      resetForm();

      void refreshUsage();

      router.push('/dashboard/tutor/my-tuitions');
      router.refresh();
    } catch (error) {
      console.error('Tuition submission error:', error);

      toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-12">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8">
        <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            <BookOpen className="h-3.5 w-3.5" />
            Tutor Dashboard
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Post a Tuition</h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Share your tuition requirements and connect with qualified tutors and students through MentorLagbe.
          </p>
        </div>
      </div>

      {/* Plan and usage */}
      <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
        <CardContent className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                isPro ? 'bg-primary/15 text-primary' : 'bg-muted text-foreground'
              }`}
            >
              {isPro ? <Crown className="h-6 w-6" /> : <BookOpen className="h-6 w-6" />}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Current plan</span>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {isPro ? 'Tutor Pro' : 'Tutor Free'}
                </span>
              </div>

              <p className="mt-2 text-base font-bold sm:text-lg">
                {usageLoading
                  ? 'Checking your tuition usage…'
                  : isPro
                    ? `${usageCount ?? 0} tuition post(s) · Unlimited posting`
                    : `${usageCount ?? 0} of ${FREE_TUITION_LIMIT} tuition posts used`}
              </p>

              {!isPro && (
                <div className="mt-3 h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, ((usageCount ?? 0) / FREE_TUITION_LIMIT) * 100)}%` }}
                  />
                </div>
              )}

              {usageError && (
                <p className="mt-2 text-xs text-destructive">
                  {usageError}{' '}
                  <button
                    type="button"
                    onClick={() => void refreshUsage()}
                    className="font-semibold underline underline-offset-2"
                  >
                    Retry
                  </button>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            <Button asChild variant={isPro ? 'outline' : 'default'} className="gap-2 rounded-xl">
              <Link href="/pricing">
                {isPro ? <CreditCard className="h-4 w-4" /> : <Crown className="h-4 w-4" />}
                {isPro ? 'Manage plan' : 'Upgrade to Pro'}
              </Link>
            </Button>

            <Button asChild variant="outline" className="gap-2 rounded-xl">
              <Link href="/dashboard/tutor/my-tuitions">
                Manage my tuitions
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {limitReached && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />

            <div>
              <p className="font-semibold">Free plan limit reached</p>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                You have used {usageCount} of {FREE_TUITION_LIMIT} tuition posts. Upgrade to Pro for unlimited posts, or
                delete an existing post before creating another one.
              </p>
            </div>
          </div>

          <Button asChild className="shrink-0 gap-2 rounded-xl">
            <Link href="/pricing">
              View plans
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="overflow-visible rounded-2xl border-border/70 shadow-sm">
          <SectionHeading
            icon={BookOpen}
            title="Basic Information"
            description="Tell us about the tuition opportunity."
          />

          <CardContent className="space-y-5 p-5 sm:p-7">
            <div>
              <Label htmlFor="title">Tuition Title *</Label>

              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Need a Mathematics tutor for Class 10"
                className={inputClass}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Tuition Description *</Label>

              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the tuition, teaching expectations and other details..."
                className="mt-2 min-h-32 rounded-xl"
                required
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                id="subject"
                label="Subject"
                value={form.subject}
                onChange={(value) => handleSelectChange('subject', value)}
                placeholder="Select Subject"
                options={subjects}
                required
              />

              <SelectField
                id="classLevel"
                label="Class / Level"
                value={form.classLevel}
                onChange={(value) => handleSelectChange('classLevel', value)}
                placeholder="Select Class"
                options={classLevels}
                required
              />

              <SelectField
                id="category"
                label="Tuition Category"
                value={form.category}
                onChange={(value) => handleSelectChange('category', value)}
                placeholder="Select Category"
                options={['School', 'College', 'Admission', 'University', 'Other']}
              />

              <SelectField
                id="tuitionType"
                label="Tuition Type"
                value={form.tuitionType}
                onChange={(value) => handleSelectChange('tuitionType', value)}
                placeholder="Select Type"
                options={['Offline', 'Online', 'Both']}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Image Selection */}
        <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
          <SectionHeading
            icon={ImagePlus}
            title="Tuition Cover Image"
            description="Choose an image for your tuition post."
          />

          <CardContent className="p-5 sm:p-7">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-muted">
              <div className="relative aspect-[16/9] w-full">
                {bannerImageUrl ? (
                  <Image
                    src={bannerImageUrl}
                    alt="Tuition cover preview"
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="flex h-full w-full flex-col items-center justify-center px-5 text-center transition hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Upload className="h-6 w-6" />
                    </div>

                    <span className="font-semibold">Choose a cover image</span>

                    <span className="mt-1 text-xs text-muted-foreground">
                      PNG, JPG, WEBP or GIF · Maximum 5MB
                    </span>
                  </button>
                )}
              </div>

              {uploadingImage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80 backdrop-blur-sm">
                  <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
                  <p className="text-sm font-medium">Uploading image…</p>
                  <p className="text-xs text-muted-foreground">Sending to secure ImgBB storage</p>
                </div>
              )}

              {bannerImageUrl && !uploadingImage && (
                <>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-600"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-black/65 px-3 py-1.5 text-xs text-white">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                    Uploaded to ImgBB
                  </div>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(',')}
              onChange={handleImageSelect}
              disabled={uploadingImage}
              className="hidden"
            />

            <div className="mt-3 flex flex-wrap items-center gap-3">
              {bannerImageUrl && !uploadingImage && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Change image
                </Button>
              )}

              {bannerImageUrl && bannerName && (
                <p className="min-w-0 truncate text-xs text-muted-foreground">{bannerName}</p>
              )}
            </div>

            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Images are uploaded securely to ImgBB through the server. The permanent hosted URL is saved as the tuition
              banner.
            </p>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="overflow-visible rounded-2xl border-border/70 shadow-sm">
          <SectionHeading
            icon={MapPin}
            title="Location Details"
            description="Specify where the tuition will take place."
          />

          <CardContent className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
            <div>
              <Label htmlFor="location">City / District *</Label>

              <Input
                id="location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Dhaka"
                className={inputClass}
                required
              />
            </div>

            <div>
              <Label htmlFor="area">Area / Address *</Label>

              <Input
                id="area"
                name="area"
                value={form.area}
                onChange={handleChange}
                placeholder="e.g. Uttara, Sector 10"
                className={inputClass}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Student Requirements */}
        <Card className="overflow-visible rounded-2xl border-border/70 shadow-sm">
          <SectionHeading
            icon={GraduationCap}
            title="Student Requirements"
            description="Set your student and tutor preferences."
          />

          <CardContent className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
            <SelectField
              id="studentGender"
              label="Student Gender"
              value={form.studentGender}
              onChange={(value) => handleSelectChange('studentGender', value)}
              placeholder="Select Gender"
              options={['Any', 'Male', 'Female']}
            />

            <SelectField
              id="tutorGender"
              label="Preferred Tutor Gender"
              value={form.tutorGender}
              onChange={(value) => handleSelectChange('tutorGender', value)}
              placeholder="Select Preference"
              options={['Any', 'Male', 'Female']}
            />

            <div>
              <Label htmlFor="studentsCount">
                <Users className="mr-1 inline h-4 w-4" />
                Number of Students
              </Label>

              <Input
                id="studentsCount"
                name="studentsCount"
                type="number"
                min="1"
                value={form.studentsCount}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <Label htmlFor="requirements">
                <FileText className="mr-1 inline h-4 w-4" />
                Additional Requirements
              </Label>

              <Textarea
                id="requirements"
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                placeholder="e.g. Previous teaching experience..."
                className="mt-2 min-h-24 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card className="overflow-visible rounded-2xl border-border/70 shadow-sm">
          <SectionHeading
            icon={CalendarDays}
            title="Schedule & Availability"
            description="Choose your preferred teaching schedule."
          />

          <CardContent className="space-y-6 p-5 sm:p-7">
            <div>
              <Label>Preferred Teaching Days *</Label>

              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {weekDays.map((day) => {
                  const active = selectedDays.includes(day);

                  return (
                    <label
                      key={day}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition ${
                        active
                          ? 'border-primary bg-primary/10 font-semibold text-primary'
                          : 'border-border bg-background hover:border-primary/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleDay(day)}
                        className="h-4 w-4 accent-primary"
                      />

                      {day}
                    </label>
                  );
                })}
              </div>

              <p className="mt-3 text-xs text-muted-foreground">{selectedDays.length} day(s) selected</p>
            </div>

            <div className="max-w-md">
              <SelectField
                id="preferredTime"
                label="Preferred Time"
                value={form.preferredTime}
                onChange={(value) => handleSelectChange('preferredTime', value)}
                placeholder="Select Preferred Time"
                options={['Morning', 'Afternoon', 'Evening', 'Flexible']}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Salary and Contact */}
        <Card className="overflow-visible rounded-2xl border-border/70 shadow-sm">
          <SectionHeading
            icon={Wallet}
            title="Salary & Contact"
            description="Set your monthly budget and contact information."
          />

          <CardContent className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
            <div>
              <Label htmlFor="salary">Monthly Salary (BDT) *</Label>

              <Input
                id="salary"
                name="salary"
                type="number"
                min="1"
                value={form.salary}
                onChange={handleChange}
                placeholder="e.g. 5000"
                className={inputClass}
                required
              />
            </div>

            <div>
              <Label htmlFor="contactNumber">
                <Phone className="mr-1 inline h-4 w-4" />
                Contact Number
              </Label>

              <Input
                id="contactNumber"
                name="contactNumber"
                type="tel"
                value={form.contactNumber}
                onChange={handleChange}
                placeholder="01XXXXXXXXX"
                className={inputClass}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardContent className="flex flex-col-reverse gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <Button type="button" variant="outline" onClick={resetForm} disabled={loading || uploadingImage} className="h-11 rounded-xl">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Form
            </Button>

            <div className="flex flex-col items-stretch gap-2 sm:items-end">
              {limitReached && (
                <p className="text-xs text-muted-foreground sm:text-right">
                  Free plan limit reached. Upgrade to Pro to post more.
                </p>
              )}

              <Button type="submit" disabled={loading || uploadingImage || limitReached} className="h-11 rounded-xl px-7 sm:min-w-48">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : limitReached ? (
                  <>
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to post
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Publish Tuition
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
