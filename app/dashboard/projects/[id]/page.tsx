'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { BillingServiceBreakdown } from '@/components/billing-service-breakdown';
import { BillingDailyServiceBreakdown } from '@/components/billing-daily-service-breakdown';
import { BillingDailySkuBreakdown } from '@/components/billing-daily-sku-breakdown';
import {
  TimeRangeFilter,
  TimeRangeFilterParams,
} from '@/components/DateRangePicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDashboardStore } from '@/lib/store';

export default function ProjectDetailPage() {
  const { id: projectId } = useParams<{ id: string }>();

  const { projectDetailData, loading, error, fetchProjectDetailData } =
    useDashboardStore();

  const {
    monthly: monthlyData,
    dailyService: dailyServiceData,
    dailySkuTrend,
    dailySkuBreakdown,
  } = projectDetailData;

  const [mainTab, setMainTab] = useState<'monthly' | 'daily'>('monthly');
  const [subTab, setSubTab] = useState<'service' | 'sku'>('service');

  const [monthlyFilters, setMonthlyFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [dailyFilters, setDailyFilters] = useState<TimeRangeFilterParams>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    if (!projectId) return;

    const filtersToUse = mainTab === 'monthly' ? monthlyFilters : dailyFilters;
    const dataType = mainTab;

    fetchProjectDetailData(projectId, filtersToUse, dataType);
  }, [
    projectId,
    mainTab,
    monthlyFilters,
    dailyFilters,
    fetchProjectDetailData,
  ]);

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: (i + 1).toString(),
        label: new Date(0, i).toLocaleString('id-ID', { month: 'long' }),
      })),
    []
  );

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 2 }, (_, i) => ({
      value: String(currentYear - i),
      label: String(currentYear - i),
    })).reverse();
  }, []);

  const currentMonthLabel = months.find(
    (m) => m.value === monthlyFilters.month.toString()
  )?.label;

  const renderContent = () => {
    if (loading.projectDetail) {
      return (
        <div className="flex h-[300px] items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      );
    }
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (mainTab === 'monthly') {
      return monthlyData?.breakdown?.length > 0 ? (
        <BillingServiceBreakdown
          data={monthlyData}
          showAll={true}
          currentMonthLabel={currentMonthLabel}
          selectedYear={monthlyFilters.year}
        />
      ) : (
        <p className="text-center text-muted-foreground py-10">
          Data bulanan tidak tersedia untuk periode ini.
        </p>
      );
    }

    if (mainTab === 'daily') {
      if (subTab === 'service') {
        return dailyServiceData && monthlyData ? (
          <BillingDailyServiceBreakdown
            dailyData={{
              dailyBreakdown: dailyServiceData.daily_breakdown.map(
                (d: { date: any; services: any[] }) => ({
                  date: d.date,
                  services: d.services.map(
                    (s: { service: any; rawValue: any }) => ({
                      service: s.service,
                      cost: s.rawValue,
                    })
                  ),
                })
              ),
              services: monthlyData.breakdown.map((s: any) => s.service),
            }}
            monthlyData={monthlyData}
            showAll
          />
        ) : (
          <p className="text-center text-muted-foreground py-10">
            Data harian layanan tidak tersedia untuk periode ini.
          </p>
        );
      }
      if (subTab === 'sku') {
        return dailySkuTrend && dailySkuBreakdown ? (
          <BillingDailySkuBreakdown
            trendData={dailySkuTrend}
            breakdownData={dailySkuBreakdown}
            showAll
          />
        ) : (
          <p className="text-center text-muted-foreground py-10">
            Data harian SKU tidak tersedia untuk periode ini.
          </p>
        );
      }
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <Button variant="ghost" size="icon" className="shrink-0 mt-1" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Kembali</span>
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl md:text-3xl font-bold tracking-tight truncate">
              Detail Proyek
            </h1>
            <p className="lg:text-lg text-muted-foreground truncate">
              {projectId}
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {mainTab === 'monthly' ? (
            <>
              <Select
                value={String(monthlyFilters.month)}
                onValueChange={(v) =>
                  setMonthlyFilters((f) => ({ ...f, month: Number(v) }))
                }
              >
                <SelectTrigger className="w-full md:w-[140px]">
                  <SelectValue placeholder="Pilih bulan" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={String(monthlyFilters.year)}
                onValueChange={(v) =>
                  setMonthlyFilters((f) => ({ ...f, year: Number(v) }))
                }
              >
                <SelectTrigger className="w-full md:w-[100px]">
                  <SelectValue placeholder="Pilih tahun" />
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
            <TimeRangeFilter
              initialFilters={dailyFilters}
              onFilterChange={setDailyFilters}
            />
          )}
        </div>
      </div>

      <Tabs
        value={mainTab}
        onValueChange={(v) => setMainTab(v as 'monthly' | 'daily')}
        className="w-full"
      >
        <TabsList className="">
          <TabsTrigger value="monthly">Monthly Overview</TabsTrigger>
          <TabsTrigger value="daily">Daily Overview</TabsTrigger>
        </TabsList>
        <TabsContent value="monthly" className="mt-4">
          {renderContent()}
        </TabsContent>
        <TabsContent value="daily" className="mt-4 space-y-4">
          <Tabs
            value={subTab}
            onValueChange={(v) => setSubTab(v as 'service' | 'sku')}
          >
            <TabsList className="">
              <TabsTrigger value="service">Services</TabsTrigger>
              <TabsTrigger value="sku">SKU</TabsTrigger>
            </TabsList>
          </Tabs>
          {renderContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
