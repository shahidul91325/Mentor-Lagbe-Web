'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Loader2,
  Send,
  CalendarDays,
  Clock,
  GraduationCap,
  BookOpen,
  MessageSquare,
  MapPin,
  Wallet,
  Monitor,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  UserRound,
  Info,
  RefreshCw,
  Phone,
} from 'lucide-react';
import { apiFetch, type ApiError } from '@/lib/api';
import { toast } from 'sonner';

export interface ApplyTuitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tuitionId: string;
  tuitionTitle: string;
  onSuccess?: (createdApplication?: unknown) => void;
}

interface TutorInfo {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  image?: string;
}

interface TuitionData {
  _id: string;
  title: string;
  description?: string;
  subject?: string;
  classLevel?: string;
  mode?: 'online' | 'offline' | 'hybrid' | string;
  location?: string;
  monthlyFee?: number;
  price?: number;
  daysPerWeek?: number;
  tutorName?: string;
  tutorEmail?: string;
  tutor?: TutorInfo;
  requirements?: string;
  preferredDays?: string[];
  preferredTime?: string;
  area?: string;
  bannerImage?: string;
  createdAt?: string;
}

interface TuitionApiResponse {
  tuition: TuitionData;
}

interface FormErrors {
  phone?: string;
  education?: string;
  preferredSchedule?: string;
  studentNote?: string;
  message?: string;
}

const WEEK_DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const TIME_SLOTS = [
  'Early Morning (6 AM - 8 AM)',
  'Morning (8 AM - 11 AM)',
  'Noon (11 AM - 2 PM)',
  'Afternoon (2 PM - 5 PM)',
  'Evening (5 PM - 8 PM)',
  'Night (8 PM - 10 PM)',
  'Flexible',
];

const MEDIUMS = ['Bangla Medium', 'English Version', 'English Medium', 'Madrasa', 'National Curriculum', 'Other'];

export function ApplyTuitionDialog({
  open,
  onOpenChange,
  tuitionId,
  tuitionTitle,
  onSuccess,
}: ApplyTuitionDialogProps) {
  const [step, setStep] = useState<'details' | 'application'>('details');

  // Tuition data
  const [tuition, setTuition] = useState<TuitionData | null>(null);
  const [tuitionError, setTuitionError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  // Application form state
  const [phone, setPhone] = useState('');
  const [education, setEducation] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [daysPerWeek, setDaysPerWeek] = useState('3');
  const [preferredTime, setPreferredTime] = useState('');
  const [medium, setMedium] = useState('');
  const [studentNote, setStudentNote] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load the tuition details whenever the dialog is opened for a tuition.
  // Every state update happens inside the request callbacks (never synchronously
  // in the effect body), so opening the dialog does not schedule cascading
  // renders. `reloadKey` re-runs the request when the user presses "Try Again".
  useEffect(() => {
    if (!open || !tuitionId) return;

    let cancelled = false;
    const controller = new AbortController();

    void apiFetch<TuitionApiResponse>(`/api/tuitions/${encodeURIComponent(tuitionId)}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (cancelled) return;

        if (!response?.tuition) {
          throw new Error('Tuition information was not found.');
        }

        setTuition(response.tuition);
        setTuitionError('');

        if (response.tuition.daysPerWeek) {
          setDaysPerWeek(String(response.tuition.daysPerWeek));
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;

        const apiError = error as ApiError;

        setTuition(null);
        setTuitionError(apiError.message || 'Unable to load tuition details. Please try again.');
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [open, tuitionId, reloadKey]);

  const isLoadingTuition = !tuition && !tuitionError;

  const retryTuitionDetails = () => {
    setTuition(null);
    setTuitionError('');
    setReloadKey((key) => key + 1);
  };

  const fee = tuition?.monthlyFee ?? tuition?.price ?? 0;

  const tutorName = tuition?.tutor?.name || tuition?.tutorName || 'Tutor';

  const location = [tuition?.area, tuition?.location].filter(Boolean).join(', ');

  const toggleDay = (day: string) => {
    setSelectedDays((previous) =>
      previous.includes(day) ? previous.filter((item) => item !== day) : [...previous, day]
    );

    setErrors((previous) => ({
      ...previous,
      preferredSchedule: undefined,
    }));
  };

  // Form validation
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    const cleanPhone = phone.replace(/[\s()-]/g, '');

    if (!phone.trim()) {
      newErrors.phone = 'Please enter your phone number.';
    } else if (!/^\+?\d{10,15}$/.test(cleanPhone)) {
      newErrors.phone = 'Please enter a valid phone number.';
    }

    if (!education.trim()) {
      newErrors.education = 'Please enter your current education.';
    } else if (education.trim().length < 2) {
      newErrors.education = 'Education must contain at least 2 characters.';
    } else if (education.trim().length > 100) {
      newErrors.education = 'Education cannot exceed 100 characters.';
    }

    if (selectedDays.length === 0) {
      newErrors.preferredSchedule = 'Please select at least one preferred day.';
    }

    if (!studentNote.trim()) {
      newErrors.studentNote = 'Please provide your academic background.';
    } else if (studentNote.trim().length > 1000) {
      newErrors.studentNote = 'Academic background cannot exceed 1000 characters.';
    }

    if (!message.trim()) {
      newErrors.message = 'Please write an application message.';
    } else if (message.trim().length > 1000) {
      newErrors.message = 'Message cannot exceed 1000 characters.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setStep('details');
    setPhone('');
    setEducation('');
    setSelectedDays([]);
    setDaysPerWeek('3');
    setPreferredTime('');
    setMedium('');
    setStudentNote('');
    setMessage('');
    setErrors({});
  };

  const resetDialogState = () => {
    resetForm();
    setTuition(null);
    setTuitionError('');
  };

  // Handle dialog open and close.
  // Closing clears the form and the loaded tuition so the next open starts
  // from a clean state and shows the loading indicator while refetching.
  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return;

    if (nextOpen) {
      setStep('details');
    } else {
      resetDialogState();
    }

    onOpenChange(nextOpen);
  };

  // Submit application
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting || !validate()) return;

    setIsSubmitting(true);

    const preferredSchedule = [
      `Days: ${selectedDays.join(', ')}`,
      `Days per week: ${daysPerWeek}`,
      `Preferred time: ${preferredTime || 'Flexible'}`,
    ].join(' | ');

    const completeStudentNote = [medium ? `Curriculum: ${medium}` : '', studentNote.trim()].filter(Boolean).join('\n');

    try {
      const response = await apiFetch<{
        application?: unknown;
      }>('/api/applications', {
        method: 'POST',
        body: {
          tuitionId,
          phone: phone.trim(),
          education: education.trim(),
          preferredSchedule,
          studentNote: completeStudentNote,
          message: message.trim(),
        },
      });

      toast.success('Application submitted successfully!', {
        description: 'Your application has been received and forwarded to the tutor.',
      });

      resetDialogState();
      onOpenChange(false);
      onSuccess?.(response?.application ?? response);
    } catch (err: unknown) {
      const apiError = err as ApiError;

      if (apiError.status === 409) {
        toast.error('Application already exists', {
          description: 'You have already applied for this tuition.',
        });

        resetDialogState();
        onOpenChange(false);
        onSuccess?.();
      } else if (apiError.status === 403) {
        toast.error('Only students can apply to tuition postings.');
      } else if (apiError.status === 401) {
        toast.error('Please sign in as a student to apply.');
      } else if (apiError.status === 400) {
        toast.error(apiError.message || 'Invalid application data. Please verify your fields.');
      } else {
        toast.error(apiError.message || 'Failed to submit application. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFee = () => {
    if (fee <= 0) return 'Not specified';
    return `৳${fee.toLocaleString('en-BD')}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto rounded-2xl border-border/70 p-0">
        {/* Header */}
        <div className="border-b bg-muted/30 px-6 py-5">
          <DialogHeader>
            <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {step === 'details' ? <BookOpen className="size-6" /> : <GraduationCap className="size-6" />}
            </div>

            <DialogTitle className="text-xl font-bold sm:text-2xl">
              {step === 'details' ? 'Tuition Details' : 'Apply for Tuition'}
            </DialogTitle>

            <DialogDescription className="mt-1">
              {step === 'details'
                ? 'Review the actual tuition information posted by the tutor.'
                : 'Complete your information to send an application to the tutor.'}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-primary" />
            <div
              className={`h-1.5 flex-1 rounded-full ${
                step === 'application' ? 'bg-primary' : 'bg-muted-foreground/20'
              }`}
            />
          </div>

          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>1. Review Details</span>
            <span>2. Application</span>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingTuition && (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-6 py-12">
            <Loader2 className="size-9 animate-spin text-primary" />
            <p className="font-medium">Loading tuition details...</p>
            <p className="text-sm text-muted-foreground">Fetching the information posted by the tutor.</p>
          </div>
        )}

        {/* Error State */}
        {!isLoadingTuition && tuitionError && (
          <div className="flex min-h-64 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Info className="size-6" />
            </div>

            <div>
              <h3 className="font-semibold">Unable to Load Tuition</h3>
              <p className="mt-1 text-sm text-muted-foreground">{tuitionError}</p>
            </div>

            <Button
              type="button"
              onClick={retryTuitionDetails}
              disabled={isLoadingTuition}
              className="gap-2"
            >
              <RefreshCw className="size-4" />
              Try Again
            </Button>
          </div>
        )}

        {/* Details Step */}
        {!isLoadingTuition && !tuitionError && tuition && step === 'details' && (
          <div className="space-y-5 px-6 py-5">
            <div>
              <h3 className="text-lg font-bold">{tuition.title || tuitionTitle}</h3>

              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                {tuition.description || 'No description provided by the tutor.'}
              </p>
            </div>

            {/* Fee */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wallet className="size-4 text-primary" />
                Monthly Tuition Fee
              </div>

              <div className="mt-2 text-2xl font-bold text-primary">
                {formatFee()}
                {fee > 0 && <span className="ml-1 text-sm font-normal text-muted-foreground">/ month</span>}
              </div>
            </div>

            {/* Main Information */}
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem
                icon={<BookOpen className="size-4" />}
                label="Subject"
                value={tuition.subject || 'Not specified'}
              />

              <DetailItem
                icon={<GraduationCap className="size-4" />}
                label="Class / Level"
                value={tuition.classLevel || 'Not specified'}
              />

              <DetailItem
                icon={<Monitor className="size-4" />}
                label="Tuition Mode"
                value={tuition.mode || 'Not specified'}
              />

              <DetailItem icon={<MapPin className="size-4" />} label="Location" value={location || 'Not specified'} />

              <DetailItem
                icon={<CalendarDays className="size-4" />}
                label="Classes Per Week"
                value={
                  tuition.daysPerWeek
                    ? `${tuition.daysPerWeek} ${tuition.daysPerWeek === 1 ? 'day' : 'days'} per week`
                    : 'Not specified'
                }
              />

              <DetailItem icon={<UserRound className="size-4" />} label="Tutor" value={tutorName} />
            </div>

            {/* Class Schedule */}
            <section className="space-y-4 rounded-xl border p-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-5 text-primary" />
                <h3 className="font-semibold">Class Schedule</h3>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Classes Per Week</p>

                <p className="text-sm font-semibold">
                  {tuition.daysPerWeek ? `${tuition.daysPerWeek} days per week` : 'Not specified in tuition post'}
                </p>
              </div>

              <div className="flex items-start gap-3 border-t pt-3">
                <CalendarDays className="mt-0.5 size-4 text-primary" />

                <div>
                  <p className="text-xs text-muted-foreground">Specific Class Days</p>

                  <div className="mt-1">
                    {tuition.preferredDays?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {tuition.preferredDays.map((day) => (
                          <span
                            key={day}
                            className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary"
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm font-medium">To be discussed with tutor</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t pt-3">
                <Clock className="mt-0.5 size-4 text-primary" />

                <div>
                  <p className="text-xs text-muted-foreground">Class Time</p>
                  <p className="mt-1 text-sm font-medium">{tuition.preferredTime || 'To be discussed with tutor'}</p>
                </div>
              </div>
            </section>

            {/* Requirements */}
            <section className="space-y-2 rounded-xl border p-4">
              <div className="flex items-center gap-2">
                <Info className="size-5 text-primary" />
                <h3 className="font-semibold">Requirements & Information</h3>
              </div>

              <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
                {tuition.requirements || 'No additional requirements provided by the tutor.'}
              </p>
            </section>

            {/* Confirmation Note */}
            <div className="rounded-xl bg-muted/40 p-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />

                <p className="text-sm text-muted-foreground">
                  Review the actual tuition fee, subject, class, location and schedule. If the opportunity suits you,
                  continue with your application.
                </p>
              </div>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Close
              </Button>

              <Button type="button" onClick={() => setStep('application')} className="w-full gap-2 sm:w-auto">
                I&apos;m Interested
                <ArrowRight className="size-4" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Application Form */}
        {!isLoadingTuition && !tuitionError && tuition && step === 'application' && (
          <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5">
            {/* Selected Tuition Summary */}
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Applying for</p>

              <p className="mt-1 font-semibold">{tuition.title}</p>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>{tuition.subject || 'Subject not specified'}</span>
                <span>{tuition.classLevel || 'Class not specified'}</span>
              </div>

              <p className="mt-2 font-semibold text-primary">
                {formatFee()}
                {fee > 0 ? ' / month' : ''}
              </p>
            </div>

            {/* Contact Information */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <UserRound className="size-5 text-primary" />
                <h3 className="font-semibold">Your Information</h3>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="applicantPhone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>

                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="applicantPhone"
                    type="tel"
                    placeholder="e.g. 01XXXXXXXXX"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setErrors((previous) => ({
                        ...previous,
                        phone: undefined,
                      }));
                    }}
                    disabled={isSubmitting}
                    aria-invalid={!!errors.phone}
                    maxLength={20}
                    className="h-11 pl-10"
                  />
                </div>

                {errors.phone ? (
                  <p className="text-xs text-destructive">{errors.phone}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Enter a valid contact number so the tutor can reach you.
                  </p>
                )}
              </div>

              {/* Education */}
              <div className="space-y-2">
                <Label htmlFor="applicantEducation">
                  Current Education <span className="text-destructive">*</span>
                </Label>

                <Input
                  id="applicantEducation"
                  type="text"
                  placeholder="e.g. HSC - Science, BSc in CSE"
                  value={education}
                  onChange={(e) => {
                    setEducation(e.target.value);
                    setErrors((previous) => ({
                      ...previous,
                      education: undefined,
                    }));
                  }}
                  disabled={isSubmitting}
                  aria-invalid={!!errors.education}
                  maxLength={100}
                  className="h-11"
                />

                {errors.education ? (
                  <p className="text-xs text-destructive">{errors.education}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Mention your current or highest education level.</p>
                )}
              </div>
            </section>

            {/* Preferred Days */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-5 text-primary" />
                <h3 className="font-semibold">Your Preferred Study Days</h3>
                <span className="text-destructive">*</span>
              </div>

              <p className="text-sm text-muted-foreground">Select the days when you are available.</p>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {WEEK_DAYS.map((day) => {
                  const checked = selectedDays.includes(day);

                  return (
                    <label
                      key={day}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition-colors ${
                        checked ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleDay(day)}
                        disabled={isSubmitting}
                        className="size-4 shrink-0 cursor-pointer accent-primary"
                      />

                      <span className="font-medium">{day}</span>
                    </label>
                  );
                })}
              </div>

              {errors.preferredSchedule && <p className="text-xs text-destructive">{errors.preferredSchedule}</p>}
            </section>

            {/* Schedule */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <BookOpen className="size-4 text-primary" />
                  Days Per Week
                </Label>

                <Select value={daysPerWeek} onValueChange={setDaysPerWeek} disabled={isSubmitting}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select days" />
                  </SelectTrigger>

                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <SelectItem key={day} value={String(day)}>
                        {day} {day === 1 ? 'Day' : 'Days'} per week
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  Preferred Time
                </Label>

                <Select value={preferredTime} onValueChange={setPreferredTime} disabled={isSubmitting}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>

                  <SelectContent>
                    {TIME_SLOTS.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Academic Background */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="size-5 text-primary" />
                <h3 className="font-semibold">Academic Background</h3>
                <span className="text-destructive">*</span>
              </div>

              <div className="space-y-2">
                <Label>Education Medium / Curriculum</Label>

                <Select value={medium} onValueChange={setMedium} disabled={isSubmitting}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select your curriculum" />
                  </SelectTrigger>

                  <SelectContent>
                    {MEDIUMS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentNote">
                  School / College and Learning Requirements
                  <span className="ml-1 text-destructive">*</span>
                </Label>

                <Textarea
                  id="studentNote"
                  placeholder="Mention your current class, institution, and the topics you need help with..."
                  rows={4}
                  maxLength={1000}
                  value={studentNote}
                  onChange={(e) => {
                    setStudentNote(e.target.value);
                    setErrors((previous) => ({
                      ...previous,
                      studentNote: undefined,
                    }));
                  }}
                  disabled={isSubmitting}
                  aria-invalid={!!errors.studentNote}
                  className="resize-none"
                />

                <div className="flex justify-between text-xs text-muted-foreground">
                  {errors.studentNote ? (
                    <span className="text-destructive">{errors.studentNote}</span>
                  ) : (
                    <span>Provide your academic details.</span>
                  )}

                  <span>{studentNote.length}/1000</span>
                </div>
              </div>
            </section>

            {/* Application Message */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-5 text-primary" />
                <h3 className="font-semibold">Message to Tutor</h3>
                <span className="text-destructive">*</span>
              </div>

              <Textarea
                id="message"
                placeholder="Introduce yourself and explain why you are interested in this tuition..."
                rows={4}
                maxLength={1000}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setErrors((previous) => ({
                    ...previous,
                    message: undefined,
                  }));
                }}
                disabled={isSubmitting}
                aria-invalid={!!errors.message}
                className="resize-none"
              />

              <div className="flex justify-between text-xs text-muted-foreground">
                {errors.message ? (
                  <span className="text-destructive">{errors.message}</span>
                ) : (
                  <span>Write a short and professional introduction.</span>
                )}

                <span>{message.length}/1000</span>
              </div>
            </section>

            {/* Footer */}
            <DialogFooter className="flex-col gap-2 border-t pt-5 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('details')}
                disabled={isSubmitting}
                className="w-full gap-2 sm:w-auto"
              >
                <ArrowLeft className="size-4" />
                Back to Details
              </Button>

              <Button type="submit" disabled={isSubmitting} className="w-full gap-2 sm:w-auto">
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Submit Application
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border p-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
