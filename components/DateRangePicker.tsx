'use client';

import * as React from 'react';
import { format, subMonths, subDays } from 'date-fns';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Preset = 'current_month' | 'last_month' | 'last_30_days' | 'custom';

export interface TimeRangeFilterParams {
  month?: number;
  year?: number;
  start_date?: string;
  end_date?: string;
}

interface TimeRangeFilterProps {
  onFilterChange: (params: TimeRangeFilterParams) => void;
}

export function TimeRangeFilter({ onFilterChange }: TimeRangeFilterProps) {
  const [activePreset, setActivePreset] =
    React.useState<Preset>('current_month');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  const presets: { key: Preset; label: string }[] = [
    { key: 'current_month', label: 'Bulan Ini' },
    { key: 'last_month', label: 'Bulan Lalu' },
    { key: 'last_30_days', label: '30 Hari Terakhir' },
    { key: 'custom', label: 'Custom Range...' },
  ];

  React.useEffect(() => {
    const now = new Date();
    let params: TimeRangeFilterParams = {};

    // Jangan panggil onFilterChange jika presetnya custom
    if (activePreset === 'custom') return;

    switch (activePreset) {
      case 'current_month':
        params = { month: now.getMonth() + 1, year: now.getFullYear() };
        break;
      case 'last_month':
        const lastMonth = subMonths(now, 1);
        params = {
          month: lastMonth.getMonth() + 1,
          year: lastMonth.getFullYear(),
        };
        break;
      case 'last_30_days':
        params = {
          start_date: format(subDays(now, 29), 'yyyy-MM-dd'),
          end_date: format(now, 'yyyy-MM-dd'),
        };
        break;
      default:
        return;
    }
    onFilterChange(params);
  }, [activePreset, onFilterChange]);

  React.useEffect(() => {
    if (activePreset === 'custom' && dateRange?.from && dateRange?.to) {
      onFilterChange({
        start_date: format(dateRange.from, 'yyyy-MM-dd'),
        end_date: format(dateRange.to, 'yyyy-MM-dd'),
      });
      setIsCalendarOpen(false);
    }
  }, [dateRange, activePreset, onFilterChange]);

  const handlePresetSelect = (key: Preset) => {
    setActivePreset(key);
    if (key === 'custom') {
      setTimeout(() => setIsCalendarOpen(true), 100);
    } else {
      setDateRange(undefined);
    }
  };

  const getButtonLabel = () => {
    if (activePreset === 'custom' && dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, 'd LLL, y')} - ${format(
        dateRange.to,
        'd LLL, y'
      )}`;
    }
    return (
      presets.find((p) => p.key === activePreset)?.label || 'Pilih Rentang'
    );
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[220px] justify-between">
            {getButtonLabel()}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {presets.map((p) => (
            <DropdownMenuItem
              key={p.key}
              onSelect={() => handlePresetSelect(p.key)}
            >
              {p.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <button className="sr-only">Buka Kalender</button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
            locale={id}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
