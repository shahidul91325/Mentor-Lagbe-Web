'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  MapPin,
  Wallet,
  Clock,
  Users,
  AlertCircle,
  RefreshCw,
  Trash2,
  Loader2,
  ImagePlus,
  X,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiFetch } from '@/lib/api';
import { updateTuition, deleteTuition, toggleTuitionActive } from '@/lib/tuition-api';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';
import type { Tuition } from '@/types';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

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

const modeOptions = [
  { label: 'Online', value: 'online' },
  { label: 'Offline', value: 'offline' },
  { label: 'Hybrid', value: 'hybrid' },
];

interface MyTuition {
  _id: string;
  title: string;
  description: string;
  subject: string;
  classLevel: string;
  mode: string;
  location?: string;
  area?: string;
  monthlyFee: number;
  daysPerWeek?: number;
  preferredDays?: string[];
  preferredTime?: string;
  bannerImage?: string;
  approvalStatus?: string;
  isActive?: boolean;
  createdAt?: string;
  tutorName?: string;
}

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tuition: MyTuition;
  onSuccess: () => void;
}

function EditTuitionDialog({ open, onOpenChange, tuition, onSuccess }: EditDialogProps) {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: tuition.title,
    description: tuition.description,
    subject: tuition.subject,
    classLevel: tuition.classLevel,
    mode: tuition.mode,
    location: tuition.location || '',
    area: tuition.area || '',
    monthlyFee: String(tuition.monthlyFee || 0),
    daysPerWeek: String(tuition.daysPerWeek || 3),
    preferredDays: tuition.preferredDays ?? [],
    preferredTime: tuition.preferredTime || '',
    bannerImage: tuition.bannerImage || '',
  });
  const [selectedDays, setSelectedDays] = useState<string[]>(tuition.preferredDays ?? []);
  const [bannerUrl, setBannerUrl] = useState(tuition.bannerImage || '');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const uploadImage = async (dataUrl: string, fileName: string) => {
    setUploadingImage(true);
    try {
      const result = await apiFetch<{ url?: string }>('/api/upload/image', {
        method: 'POST',
        body: { image: dataUrl, name: fileName },
      });
      const url = result.url;
      if (!url) throw new Error('The server did not return a hosted image URL.');
      setBannerUrl(url);
      setForm((prev) => ({ ...prev, bannerImage: url }));
      toast.success('Cover image updated.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Image upload failed.');
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
      if (typeof reader.result === 'string') void uploadImage(reader.result, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      toast.error('Please sign in to edit tuitions.');
      return;
    }
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description are required.');
      return;
    }
    if (!form.subject || !form.classLevel || !form.mode) {
      toast.error('Subject, class level and mode are required.');
      return;
    }
    const monthlyFee = Number(form.monthlyFee);
    const daysPerWeek = Number(form.daysPerWeek);
    if (!Number.isFinite(monthlyFee) || monthlyFee < 0) {
      toast.error('Please enter a valid monthly fee.');
      return;
    }
    if (!Number.isInteger(daysPerWeek) || daysPerWeek < 1 || daysPerWeek > 7) {
      toast.error('Days per week must be between 1 and 7.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        subject: form.subject,
        classLevel: form.classLevel,
        mode: form.mode as Tuition['mode'],
        location: form.location.trim() || undefined,
        area: form.area.trim() || undefined,
        monthlyFee,
        price: monthlyFee,
        daysPerWeek,
        preferredDays: selectedDays,
        preferredTime: form.preferredTime || undefined,
        bannerImage: form.bannerImage || bannerUrl || undefined,
      } as Partial<Omit<Tuition, '_id'>>;

      await updateTuition(token, tuition._id, payload);
      toast.success('Tuition updated.');
      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to update tuition.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose />
        <DialogHeader>
          <DialogTitle>Edit Tuition</DialogTitle>
          <DialogDescription>
            Update the listing details for <strong>{tuition.title}</strong>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6 max-w-md w-full">
          <div>
            <Label htmlFor="edit-title">Tuition Title</Label>
            <Input id="edit-title" name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea id="edit-description" name="description" value={form.description} onChange={handleChange} className="min-h-24" required />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="edit-subject">Subject</Label>
              <Select value={form.subject} onValueChange={(v) => handleSelectChange('subject', v)}>
                <SelectTrigger id="edit-subject" className="h-11">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Bangla">Bangla</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-class">Class / Level</Label>
              <Select value={form.classLevel} onValueChange={(v) => handleSelectChange('classLevel', v)}>
                <SelectTrigger id="edit-class" className="h-11">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classLevels.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="edit-mode">Mode</Label>
              <Select value={form.mode} onValueChange={(v) => handleSelectChange('mode', v)}>
                <SelectTrigger id="edit-mode" className="h-11">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  {modeOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-fee">Monthly Fee (BDT)</Label>
              <Input id="edit-fee" name="monthlyFee" type="number" min="0" value={form.monthlyFee} onChange={handleChange} required />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="edit-location">Location / City</Label>
              <Input id="edit-location" name="location" value={form.location} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="edit-days">Days per Week</Label>
              <Input id="edit-days" name="daysPerWeek" type="number" min="1" max="7" value={form.daysPerWeek} onChange={handleChange} />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-preferred-days">Preferred Teaching Days</Label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {weekDays.map((day) => {
                const active = selectedDays.includes(day);
                return (
                  <label key={day} className="flex cursor-pointer items-center gap-2 rounded-xl border p-2 text-sm transition">
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
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex items-center">
              {bannerUrl ? (
                <Image
                  src={bannerUrl}
                  alt="Current cover"
                  fill
                  className="h-24 w-32 object-cover rounded-lg border border-border"
                  unoptimized
                />
              ) : (
                <div className="h-24 w-32 flex items-center justify-center rounded-lg border border-border bg-muted">
                  <BookOpen className="size-8 text-muted-foreground" aria-hidden />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white text-xs transition hover:bg-red-600 disabled:opacity-60"
                aria-label="Change image"
              >
                <ImagePlus className="h-3 w-3" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(',')}
                onChange={handleImageSelect}
                disabled={uploadingImage}
                className="hidden"
              />
            </div>
            {uploadingImage && <Loader2 className="size-4 animate-spin text-primary" aria-hidden />}
          </div>
          <p className="text-xs text-muted-foreground">
            Changing important listing information will submit the tuition for admin re-approval.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading || uploadingImage}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploadingImage} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ConfirmDeleteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tuition: MyTuition;
  onConfirm: () => void;
}

function ConfirmDelete({ open, onOpenChange, tuition, onConfirm }: ConfirmDeleteProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!token) {
      toast.error('Please sign in to delete tuitions.');
      return;
    }
    setLoading(true);
    try {
      await deleteTuition(token, tuition._id);
      toast.success('Tuition deleted.');
      onConfirm();
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete tuition.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose />
        <DialogHeader>
          <DialogTitle>Delete Tuition?</DialogTitle>
          <DialogDescription>
            This will permanently remove <strong>{tuition.title}</strong> and all applications linked to it. This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Tuition
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function MyTuitions() {
  const { user, token } = useAuth();

  const [tuitions, setTuitions] = useState<MyTuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editOpen, setEditOpen] = useState(false);
  const [editTuition, setEditTuition] = useState<MyTuition | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTuitionItem, setDeleteTuitionItem] = useState<MyTuition | null>(null);

  const fetchMyTuitions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiFetch<MyTuition[] | { tuitions?: MyTuition[] }>('/api/tuitions/my', {
        cache: 'no-store',
      });
      const records = Array.isArray(data) ? data : (data.tuitions ?? []);
      setTuitions(records);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMyTuitions();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchMyTuitions]);

  const handleRefresh = useCallback(() => {
    void fetchMyTuitions();
  }, [fetchMyTuitions]);

  const stats = {
    total: tuitions.length,
    active: tuitions.filter((t) => t.isActive).length,
    closed: tuitions.filter((t) => !t.isActive).length,
    approved: tuitions.filter((t) => t.approvalStatus === 'approved').length,
    pending: tuitions.filter((t) => t.approvalStatus === 'pending').length,
    rejected: tuitions.filter((t) => t.approvalStatus === 'rejected').length,
  };

  const handleToggleActive = async (tuition: MyTuition) => {
    if (!token) {
      toast.error('Please sign in to change tuition status.');
      return;
    }
    const next = !tuition.isActive;
    try {
      await toggleTuitionActive(token, tuition._id, next);
      toast.success(next ? 'Tuition activated.' : 'Tuition closed.');
      void fetchMyTuitions();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status.');
    }
  };

  const modeLabel = (mode: string) => (mode === 'online' ? 'Online' : mode === 'offline' ? 'Offline' : 'Hybrid');

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Tuitions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage the tuition listings you have posted.</p>
        </div>

        <Button asChild>
          <Link href="/dashboard/tutor/post-tuition">+ Post New Tuition</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Tuition Listings ({tuitions.length})</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-20 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="py-10 text-center">
              <p className="mb-4 text-sm text-destructive">{error}</p>
              <Button variant="outline" onClick={handleRefresh}>
                Try Again
              </Button>
            </div>
          ) : tuitions.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="text-lg font-semibold">No Tuitions Posted Yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">Create your first tuition listing to get started.</p>
              <Button asChild className="mt-5">
                <Link href="/dashboard/tutor/post-tuition">Post Your First Tuition</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4 grid gap-4 text-xs sm:grid-cols-4">
                <div className="p-3 rounded-xl bg-blue-50 text-blue-700 font-medium">
                  {stats.total} Total
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 font-medium">
                  {stats.active} Active
                </div>
                <div className="p-3 rounded-xl bg-amber-50 text-amber-700 font-medium">
                  {stats.closed} Closed
                </div>
                <div className="p-3 rounded-xl bg-purple-50 text-purple-700 font-medium">
                  {stats.approved} Approved
                </div>
              </div>

              <div className="divide-y divide-border">
                {tuitions.map((tuition) => {
                  const tuitionId = tuition._id;
                  const isActive = tuition.isActive === true;
                  const fee = tuition.monthlyFee ?? 0;
                  const tutorName = tuition.tutorName || 'You';
                  return (
                    <div
                      key={tuitionId}
                      className="rounded-xl border p-4 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start sm:gap-3">
                        <div className="space-y-2">
                          <h3 className="font-semibold line-clamp-1">{tuition.title}</h3>
                          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                            <span>{tuition.subject}</span>
                            <span>•</span>
                            <span>{tuition.classLevel}</span>
                            <span>•</span>
                            <span>{modeLabel(tuition.mode)}</span>
                          </div>
                          {tuition.location && <p className="text-sm text-muted-foreground">{tuition.location}</p>}
                          <p className="text-sm font-semibold">
                            {formatFee(fee)} <span className="text-xs font-normal text-muted-foreground">/ month</span>
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">
                            {tuition.approvalStatus ?? 'Pending'}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {isActive ? 'Active' : 'Closed'}
                          </span>

                          <div className="flex items-center gap-2 ml-auto">
                            <Button
                              onClick={() => handleToggleActive(tuition)}
                              size="sm"
                              variant="outline"
                              className="rounded-lg"
                              aria-label={isActive ? 'Close tuition' : 'Activate tuition'}
                            >
                              {isActive ? 'Close' : 'Activate'}
                            </Button>
                            <Button
                              onClick={() => {
                                setEditTuition(tuition);
                                setEditOpen(true);
                              }}
                              size="sm"
                              variant="outline"
                              className="rounded-lg"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => {
                                setDeleteTuitionItem(tuition);
                                setDeleteOpen(true);
                              }}
                              size="sm"
                              variant="destructive"
                              className="rounded-lg"
                              aria-label={`Delete ${tuition.title}`}
                            >
                              <Trash2 className="mr-1 size-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {editTuition && (
        <EditTuitionDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          tuition={editTuition}
          onSuccess={handleRefresh}
        />
      )}
      {deleteTuitionItem && (
        <ConfirmDelete
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          tuition={deleteTuitionItem}
          onConfirm={handleRefresh}
        />
      )}
    </div>
  );
}

function formatFee(fee?: number) {
  return fee != null && fee > 0 ? `৳${fee.toLocaleString('en-BD')}` : '0';
}
