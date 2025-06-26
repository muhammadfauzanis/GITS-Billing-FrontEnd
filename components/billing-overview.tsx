'use client';

import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react';

interface BillingOverviewProps {
  data: {
    currentMonth: {
      value: string;
      rawValue: number;
      percentageChange: string;
    };
    lastMonth: {
      value: string;
      rawValue: number;
      label: string;
    };
    yearToDateTotal: {
      value: string;
      rawValue: number;
      label: string;
    };
    budget: {
      value: string;
      rawValue: number;
      percentage: number;
      label: string;
    };
  };
}

export function BillingOverview({ data }: BillingOverviewProps) {
  const isIncrease = Number.parseFloat(data.currentMonth.percentageChange) > 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Current Month */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">Bulan Ini</p>
        </div>
        <div className="mt-2">
          <p className="text-xl xl:text-2xl font-bold">
            {data.currentMonth.value}
          </p>
          <p className="mt-1 flex items-center text-xs text-gray-500">
            <span
              className={cn(
                'mr-1 flex items-center font-medium',
                isIncrease ? 'text-red-500' : 'text-green-500'
              )}
            >
              {isIncrease ? (
                <ArrowUpRight className="mr-1 h-3 w-3" />
              ) : (
                <ArrowDownRight className="mr-1 h-3 w-3" />
              )}
              {Math.abs(Number(data.currentMonth.percentageChange)).toFixed(1)}%
            </span>
            dari bulan lalu
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">Bulan Lalu</p>
        </div>
        <div className="mt-2">
          <p className="text-xl xl:text-2xl font-bold">
            {data.lastMonth.value}
          </p>
          <p className="mt-1 text-xs text-gray-500">{data.lastMonth.label}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">Budget Bulan Ini</p>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </div>
        <div className="mt-2">
          <p className="text-xl xl:text-2xl font-bold">{data.budget.value}</p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-red-500"
              style={{ width: `${Math.min(data.budget.percentage, 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">{data.budget.label}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">
            Tahun ini (Year to Date)
          </p>
        </div>
        <div className="mt-2">
          <p className="text-xl xl:text-2xl font-bold">
            {data.yearToDateTotal.value}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {data.yearToDateTotal.label}
          </p>
        </div>
      </div>
    </div>
  );
}
