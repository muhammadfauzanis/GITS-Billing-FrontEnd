'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
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

export interface DailyFilterParams {
  month?: number;
  year?: number;
  start_date?: string;
  end_date?: string;
}

interface DailyFilterProps {
  onFilterChange: (params: DailyFilterParams) => void;
}

export function DailyFilter({ onFilterChange }: DailyFilterProps) {
  const [filterMode, setFilterMode] = React.useState<'month' | 'range'>(
    'month'
  );
  const [date, setDate] = React.useState<DateRange | undefined>();
  const [monthlyDate, setMonthlyDate] = React.useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  // Trigger filter change when monthly date is updated
  React.useEffect(() => {
    if (filterMode === 'month') {
      onFilterChange({ month: monthlyDate.month, year: monthlyDate.year });
    }
  }, [monthlyDate, filterMode, onFilterChange]);

  // Trigger filter change when custom date range is updated
  React.useEffect(() => {
    if (filterMode === 'range' && date?.from && date?.to) {
      onFilterChange({
        start_date: format(date.from, 'yyyy-MM-dd'),
        end_date: format(date.to, 'yyyy-MM-dd'),
      });
    }
  }, [date, filterMode, onFilterChange]);

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: new Date(0, i).toLocaleString('id-ID', { month: 'long' }),
  }));
  const years = [{ value: '2025', label: '2025' }];

  return (
    <div className="flex items-center gap-2">
      {filterMode === 'month' ? (
        <>
          <Select
            value={String(monthlyDate.month)}
            onValueChange={(v) =>
              setMonthlyDate((d) => ({ ...d, month: Number(v) }))
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
              <hr className="my-1" />
              <div
                className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                onSelect={() => setFilterMode('range')}
              >
                Custom Range...
              </div>
            </SelectContent>
          </Select>
          <Select
            value={String(monthlyDate.year)}
            onValueChange={(v) =>
              setMonthlyDate((d) => ({ ...d, year: Number(v) }))
            }
          >
            <SelectTrigger className="w-[100px]">
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
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={'outline'}
              className={cn(
                'w-[260px] justify-start text-left font-normal',
                !date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, 'd LLL, y', { locale: id })} -{' '}
                    {format(date.to, 'd LLL, y', { locale: id })}
                  </>
                ) : (
                  format(date.from, 'd LLL, y', { locale: id })
                )
              ) : (
                <span>Pilih tanggal</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="p-2">
              <Button variant="link" onClick={() => setFilterMode('month')}>
                Kembali ke pilihan bulan
              </Button>
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              locale={id}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
