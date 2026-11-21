// components/tuitions/FilterContent.tsx
'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Filter } from 'lucide-react';

/** Props for the filter panel. */
export type Filters = {
  search: string;
  subject: string;
  classLevel: string;
  mode: string;
  location: string;
  feeRange: [number, number];
};

interface Props {
  onApply: (filters: Filters) => void;
}

/**
 * FilterContent – used on the Browse Tuitions page.
 * Renders a sticky sidebar on desktop and a sheet (drawer) on mobile.
 */
export default function FilterContent({ onApply }: Props) {
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [mode, setMode] = useState('');
  const [location, setLocation] = useState('');
  const [feeRange, setFeeRange] = useState<[number, number]>([0, 20000]);

  const apply = () => {
    onApply({ search, subject, classLevel, mode, location, feeRange });
  };

  const panelContent = (
    <div className="flex flex-col gap-6 p-6">
      <Input placeholder="Search tuition..." value={search} onChange={(e) => setSearch(e.target.value)} />

      <Select value={subject} onValueChange={setSubject}>
        <SelectTrigger>
          <SelectValue placeholder="Subject" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="math">Math</SelectItem>
          <SelectItem value="physics">Physics</SelectItem>
          <SelectItem value="programming">Programming</SelectItem>
          <SelectItem value="ielts">IELTS</SelectItem>
        </SelectContent>
      </Select>

      <Select value={classLevel} onValueChange={setClassLevel}>
        <SelectTrigger>
          <SelectValue placeholder="Class level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="primary">Primary</SelectItem>
          <SelectItem value="secondary">Secondary</SelectItem>
          <SelectItem value="higher">Higher Secondary</SelectItem>
          <SelectItem value="college">College</SelectItem>
        </SelectContent>
      </Select>

      <Select value={mode} onValueChange={setMode}>
        <SelectTrigger>
          <SelectValue placeholder="Mode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="online">Online</SelectItem>
          <SelectItem value="offline">Offline</SelectItem>
          <SelectItem value="hybrid">Hybrid</SelectItem>
        </SelectContent>
      </Select>

      <Input placeholder="Location (city/district)" value={location} onChange={(e) => setLocation(e.target.value)} />

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Monthly fee (BDT)</label>
        <Slider
          min={0}
          max={20000}
          step={500}
          value={feeRange}
          onValueChange={(v: number[]) => setFeeRange(v as [number, number])}
        />
        <div className="text-sm text-muted-foreground">
          {feeRange[0].toLocaleString()} – {feeRange[1].toLocaleString()} BDT
        </div>
      </div>

      <Button onClick={apply} className="w-full" variant="primary">
        Apply Filters
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 lg:block" aria-label="Tuition filters">
        {panelContent}
      </aside>

      {/* Mobile sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 lg:hidden" aria-label="Open filters">
            <Filter className="size-4" aria-hidden />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <SheetTitle className="sr-only">Filters</SheetTitle>
          {panelContent}
        </SheetContent>
      </Sheet>
    </>
  );
}
