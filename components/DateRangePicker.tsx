'use client';

import * as React from 'react';
import { format, isValid, differenceInDays, addDays } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar as CalendarIcon, ArrowRight, XIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

export interface TimeRangeFilterParams {
  month?: number;
  year?: number;
  start_date?: string;
  end_date?: string;
}

interface TimeRangeFilterProps {
  initialFilters: TimeRangeFilterParams;
  onFilterChange: (params: TimeRangeFilterParams) => void;
}

export function TimeRangeFilter({
  initialFilters,
  onFilterChange,
}: TimeRangeFilterProps) {
  const isInitialRange = !!initialFilters.start_date;
  const [filterMode, setFilterMode] = React.useState<'month' | 'range'>(
    isInitialRange ? 'range' : 'month'
  );
  const [isCalendarOpen, setCalendarOpen] = React.useState(false);

  const [appliedDate, setAppliedDate] = React.useState<DateRange | undefined>(
    initialFilters.start_date && initialFilters.end_date
      ? {
          from: new Date(initialFilters.start_date),
          to: new Date(initialFilters.end_date),
        }
      : undefined
  );

  const [draftDate, setDraftDate] = React.useState<DateRange | undefined>(
    appliedDate
  );

  const [monthlyDate, setMonthlyDate] = React.useState({
    month: initialFilters.month || new Date().getMonth() + 1,
    year: initialFilters.year || new Date().getFullYear(),
  });

  React.useEffect(() => {
    if (filterMode === 'month') {
      onFilterChange({ month: monthlyDate.month, year: monthlyDate.year });
    }
  }, [monthlyDate, filterMode, onFilterChange]);

  const handleApply = () => {
    if (draftDate?.from && draftDate?.to) {
      if (differenceInDays(draftDate.to, draftDate.from) >= 31) {
        toast({
          title: 'Rentang Waktu Terlalu Lebar',
          description: 'Silakan pilih rentang waktu maksimal 31 hari.',
          variant: 'destructive',
        });
        return;
      }
      setAppliedDate(draftDate);
      onFilterChange({
        start_date: format(draftDate.from, 'yyyy-MM-dd'),
        end_date: format(draftDate.to, 'yyyy-MM-dd'),
      });
      setCalendarOpen(false);
    } else {
      toast({
        title: 'Rentang Tidak Lengkap',
        description: 'Silakan pilih tanggal awal dan akhir.',
        variant: 'destructive',
      });
    }
  };

  const handleReset = () => {
    setAppliedDate(undefined);
    setDraftDate(undefined);
    const now = new Date();
    const defaultFilters = {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    };
    setMonthlyDate(defaultFilters);
    onFilterChange(defaultFilters);
    setFilterMode('month');
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    if (range?.from && !range.to) {
      // Jika hanya start date yang dipilih, reset end date agar user bisa memilih ulang
      setDraftDate({ from: range.from, to: undefined });
    } else {
      setDraftDate(range);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: new Date(0, i).toLocaleString('id-ID', { month: 'long' }),
  }));

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => ({
    value: String(currentYear - 5 + i + 1),
    label: String(currentYear - 5 + i + 1),
  })).reverse();

  return (
    <div className="flex items-center gap-2">
      {filterMode === 'month' ? (
        <>
          <Select
            value={String(monthlyDate.month)}
            onValueChange={(v) => {
              if (v === 'custom') setFilterMode('range');
              else setMonthlyDate((d) => ({ ...d, month: Number(v) }));
            }}
          >
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom" className="cursor-pointer">
                Custom Range...
              </SelectItem>
              <hr className="my-1" />
              {months.map((m) => (
                <SelectItem
                  key={m.value}
                  value={m.value}
                  className="cursor-pointer"
                >
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={String(monthlyDate.year)}
            onValueChange={(v) =>
              setMonthlyDate((d) => ({ ...d, year: Number(v) }))
            }
          >
            <SelectTrigger className="w-full md:w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y.value} value={y.value}>
                  {y.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      ) : (
        <Popover open={isCalendarOpen} onOpenChange={setCalendarOpen}>
          <div className="flex items-center gap-0.5 rounded-md border">
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'w-[130px] justify-start text-left font-normal',
                  !appliedDate?.from && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {appliedDate?.from ? (
                  format(appliedDate.from, 'd LLL, y')
                ) : (
                  <span>Start date</span>
                )}
              </Button>
            </PopoverTrigger>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'w-[130px] justify-start text-left font-normal',
                  !appliedDate?.to && 'text-muted-foreground'
                )}
              >
                {appliedDate?.to ? (
                  format(appliedDate.to, 'd LLL, y')
                ) : (
                  <span>End date</span>
                )}
              </Button>
            </PopoverTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleReset}
              aria-label="Reset filter"
            >
              <XIcon className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="p-2 border-b">
              <Button
                variant="link"
                size="sm"
                onClick={() => setFilterMode('month')}
              >
                ← Kembali ke pilihan bulan
              </Button>
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={draftDate?.from}
              selected={draftDate}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              locale={id}
              disabled={(date) => {
                if (draftDate?.from && !draftDate.to) {
                  // Batasi pemilihan tanggal akhir hingga 30 hari dari tanggal mulai
                  const maxDate = addDays(draftDate.from, 30);
                  return date > maxDate || date < draftDate.from;
                }
                return false;
              }}
            />
            <div className="flex justify-end gap-2 p-2 border-t bg-slate-50">
              <Button variant="ghost" onClick={() => setCalendarOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleApply}>Terapkan</Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
