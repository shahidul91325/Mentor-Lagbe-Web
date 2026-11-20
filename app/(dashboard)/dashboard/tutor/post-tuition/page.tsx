'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  MapPin,
  Wallet,
  CalendarDays,
  Clock,
  GraduationCap,
  Loader2,
  Send,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
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

const selectClass =
  'mt-2 flex h-11 w-full appearance-none items-center rounded-lg border border-input bg-background px-3 pr-10 text-sm text-foreground shadow-sm outline-none transition-all hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-background [&>option]:text-foreground';

const SelectField = ({
  id,
  name,
  value,
  onChange,
  placeholder,
  options,
  required = false,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder: string;
  options: string[];
  required?: boolean;
}) => (
  <div className="relative">
    <select id={id} name={name} value={value} onChange={onChange} required={required} className={selectClass}>
      <option value="" disabled>
        {placeholder}
      </option>

      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>

    <ChevronDown className="pointer-events-none absolute right-3 top-[calc(50%+4px)] h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  </div>
);

export default function PostTuitionPage() {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]));
  };

  const resetForm = () => {
    setForm(initialForm);
    setSelectedDays([]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Please complete the tuition details');
      return;
    }

    if (!form.subject || !form.classLevel) {
      toast.error('Please select subject and class level');
      return;
    }

    if (!form.salary || Number(form.salary) <= 0) {
      toast.error('Please enter a valid monthly salary');
      return;
    }

    if (!form.location.trim() || !form.area.trim()) {
      toast.error('Please enter your tuition location and area');
      return;
    }

    if (!form.preferredTime || selectedDays.length === 0) {
      toast.error('Please select teaching days and preferred time');
      return;
    }

    if (!API_URL) {
      toast.error('API URL is not configured');
      return;
    }

    const payload = {
      ...form,
      salary: Number(form.salary),
      studentsCount: Number(form.studentsCount),
      daysPerWeek: selectedDays.length,
      preferredDays: selectedDays,
    };

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/tuitions`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create tuition');
      }

      toast.success('Tuition posted successfully!');

      resetForm();

      router.push('/dashboard/tutor/my-tuitions');
      router.refresh();
    } catch (error) {
      console.error('Tuition submission error:', error);

      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'mt-2 h-11 w-full rounded-lg';

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      {/* Header */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-primary">
          <BookOpen className="h-5 w-5" />
          <span className="text-sm font-medium">Tutor Dashboard</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Post a Tuition</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Create a tuition post and connect with students looking for qualified tutors.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Basic Information
            </CardTitle>
            <CardDescription>Provide the basic details about your tuition.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
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
                className="mt-2 min-h-32"
                required
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <SelectField
                  id="subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Select Subject"
                  options={subjects}
                  required
                />
              </div>

              <div>
                <Label htmlFor="classLevel">Class / Level *</Label>
                <SelectField
                  id="classLevel"
                  name="classLevel"
                  value={form.classLevel}
                  onChange={handleChange}
                  placeholder="Select Class"
                  options={classLevels}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Tuition Category</Label>
                <SelectField
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Select Category"
                  options={['School', 'College', 'Admission', 'University', 'Other']}
                />
              </div>

              <div>
                <Label htmlFor="tuitionType">Tuition Type *</Label>
                <SelectField
                  id="tuitionType"
                  name="tuitionType"
                  value={form.tuitionType}
                  onChange={handleChange}
                  placeholder="Select Type"
                  options={['Offline', 'Online', 'Both']}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Location Details
            </CardTitle>
            <CardDescription>Specify where the tuition will take place.</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-5 sm:grid-cols-2">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Student Requirements
            </CardTitle>
            <CardDescription>Specify your student and tutor preferences.</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="studentGender">Student Gender</Label>
              <SelectField
                id="studentGender"
                name="studentGender"
                value={form.studentGender}
                onChange={handleChange}
                placeholder="Select Gender"
                options={['Any', 'Male', 'Female']}
              />
            </div>

            <div>
              <Label htmlFor="tutorGender">Preferred Tutor Gender</Label>
              <SelectField
                id="tutorGender"
                name="tutorGender"
                value={form.tutorGender}
                onChange={handleChange}
                placeholder="Select Preference"
                options={['Any', 'Male', 'Female']}
              />
            </div>

            <div>
              <Label htmlFor="studentsCount">Number of Students</Label>
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
              <Label htmlFor="requirements">Additional Requirements</Label>
              <Textarea
                id="requirements"
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                placeholder="e.g. Previous teaching experience..."
                className="mt-2 min-h-24"
              />
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Schedule & Availability
            </CardTitle>
            <CardDescription>Select your preferred teaching schedule.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div>
              <Label>Preferred Teaching Days *</Label>

              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {weekDays.map((day) => (
                  <label
                    key={day}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm transition-all ${
                      selectedDays.includes(day)
                        ? 'border-primary bg-primary/10 font-medium text-primary ring-1 ring-primary/20'
                        : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDays.includes(day)}
                      onChange={() => toggleDay(day)}
                      className="h-4 w-4 accent-primary"
                    />
                    {day}
                  </label>
                ))}
              </div>

              <p className="mt-2 text-xs text-muted-foreground">{selectedDays.length} day(s) selected</p>
            </div>

            <div>
              <Label htmlFor="preferredTime">
                <Clock className="mr-2 inline h-4 w-4" />
                Preferred Time *
              </Label>

              <SelectField
                id="preferredTime"
                name="preferredTime"
                value={form.preferredTime}
                onChange={handleChange}
                placeholder="Select Preferred Time"
                options={['Morning', 'Afternoon', 'Evening', 'Flexible']}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Salary and Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Salary & Contact
            </CardTitle>
            <CardDescription>Set the monthly tuition budget and contact number.</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-5 sm:grid-cols-2">
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
              <Label htmlFor="contactNumber">Contact Number</Label>
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

        {/* Submit */}
        <Card>
          <CardContent className="flex flex-col-reverse gap-3 p-5 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" onClick={resetForm} disabled={loading}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Form
            </Button>

            <Button type="submit" disabled={loading} className="sm:min-w-48">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Publish Tuition
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
