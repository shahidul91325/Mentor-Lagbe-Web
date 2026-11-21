'use client';

import React, { useState } from 'react';
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
import { Loader2, Send } from 'lucide-react';
import { apiFetch, type ApiError } from '@/lib/api';
import { toast } from 'sonner';

export interface ApplyTuitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tuitionId: string;
  tuitionTitle: string;
  onSuccess?: (createdApplication?: unknown) => void;
}

interface FormErrors {
  preferredSchedule?: string;
  studentNote?: string;
  message?: string;
}

export function ApplyTuitionDialog({
  open,
  onOpenChange,
  tuitionId,
  tuitionTitle,
  onSuccess,
}: ApplyTuitionDialogProps) {
  const [preferredSchedule, setPreferredSchedule] = useState('');
  const [studentNote, setStudentNote] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!preferredSchedule.trim()) {
      newErrors.preferredSchedule = 'Preferred schedule is required.';
    } else if (preferredSchedule.length > 200) {
      newErrors.preferredSchedule = 'Schedule cannot exceed 200 characters.';
    }

    if (!studentNote.trim()) {
      newErrors.studentNote = 'Student note / background is required.';
    } else if (studentNote.length > 1000) {
      newErrors.studentNote = 'Student note cannot exceed 1000 characters.';
    }

    if (!message.trim()) {
      newErrors.message = 'Application message is required.';
    } else if (message.length > 1000) {
      newErrors.message = 'Message cannot exceed 1000 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isSubmitting) {
      if (!nextOpen) {
        setErrors({});
      }
      onOpenChange(nextOpen);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await apiFetch<{ application?: unknown }>('/api/applications', {
        method: 'POST',
        body: {
          tuitionId,
          preferredSchedule: preferredSchedule.trim(),
          studentNote: studentNote.trim(),
          message: message.trim(),
        },
      });

      toast.success('Application submitted successfully!', {
        description: 'Your application has been received and forwarded to the tutor.',
      });

      // Reset form fields
      setPreferredSchedule('');
      setStudentNote('');
      setMessage('');
      setErrors({});

      onOpenChange(false);
      onSuccess?.(response?.application ?? response);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      if (apiError.status === 409) {
        toast.error('Application already exists', {
          description: 'You have already applied for this tuition.',
        });
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply for Tuition</DialogTitle>
          <DialogDescription className="line-clamp-2">
            Submit your application for <span className="font-semibold text-foreground">{tuitionTitle}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Preferred Schedule */}
          <div className="space-y-1.5">
            <Label htmlFor="preferredSchedule">
              Preferred Schedule <span className="text-destructive">*</span>
            </Label>
            <Input
              id="preferredSchedule"
              placeholder="e.g. 3 days/week, Sunday/Tuesday/Thursday (5 PM - 7 PM)"
              value={preferredSchedule}
              onChange={(e) => {
                setPreferredSchedule(e.target.value);
                if (errors.preferredSchedule) {
                  setErrors((prev) => ({ ...prev, preferredSchedule: undefined }));
                }
              }}
              disabled={isSubmitting}
              aria-invalid={!!errors.preferredSchedule}
            />
            {errors.preferredSchedule && (
              <p className="text-xs text-destructive">{errors.preferredSchedule}</p>
            )}
            <p className="text-[11px] text-muted-foreground">
              Mention the days of the week and time slots that work best for you.
            </p>
          </div>

          {/* Student Note */}
          <div className="space-y-1.5">
            <Label htmlFor="studentNote">
              Student Note / Academic Background <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="studentNote"
              placeholder="Describe your current school/college, curriculum (e.g. Bangla Medium, English Medium, Cambridge), and specific chapters or topics you need help with..."
              rows={3}
              value={studentNote}
              onChange={(e) => {
                setStudentNote(e.target.value);
                if (errors.studentNote) {
                  setErrors((prev) => ({ ...prev, studentNote: undefined }));
                }
              }}
              disabled={isSubmitting}
              aria-invalid={!!errors.studentNote}
            />
            {errors.studentNote && (
              <p className="text-xs text-destructive">{errors.studentNote}</p>
            )}
          </div>

          {/* Application Message */}
          <div className="space-y-1.5">
            <Label htmlFor="message">
              Application Message to Tutor <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Write a brief introduction to the tutor explaining why you would like to learn from them..."
              rows={3}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (errors.message) {
                  setErrors((prev) => ({ ...prev, message: undefined }));
                }
              }}
              disabled={isSubmitting}
              aria-invalid={!!errors.message}
            />
            {errors.message && (
              <p className="text-xs text-destructive">{errors.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                <>
                  <Send className="mr-2 size-4" />
                  Submit Application
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
