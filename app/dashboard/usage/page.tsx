'use client';

import { useEffect, useState, useMemo, useRef, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useDashboardStore } from '@/lib/store';
import { TimeRangeFilter } from '@/components/DateRangePicker';
import { BillingServiceBreakdown } from '@/components/billing-service-breakdown';
import { BillingProjectBreakdown } from '@/components/billing-project-breakdown';
import { BillingDailyServiceBreakdown } from '@/components/billing-daily-service-breakdown';
import { BillingDailyProjectBreakdown } from '@/components/billing-daily-project-breakdown';
import { BillingDailySkuBreakdown } from '@/components/billing-daily-sku-breakdown';
import { BillingYearlyChart } from '@/components/billing-yearly-chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function areFiltersEqual(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b);
}

const PageTitle = () => {
  const { clientName } = useDashboardStore();
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Penggunaan GCP</h1>
      <p className="text-muted-foreground">
        Detail penggunaan untuk {clientName || 'memuat...'}
      </p>
    </div>
  );
};

function UsagePageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    selectedClientId,
    loading,
    dailyFilters,
    monthlyFilters,
    setDailyFilters,
    setMonthlyFilters,
    usageData,
    yearlyUsageData,
    dailyData,
    dailyProjectTrendData,
    dailySkuTrendData,
    dailySkuBreakdownData,
    fetchUsageData,
    fetchYearlyUsageData,
    fetchDailyData,
    fetchDailyProjectTrend,
    fetchDailySkuTrend,
    fetchDailySkuBreakdown,
  } = useDashboardStore();

  const mainTab = searchParams.get('main_tab') || 'daily';
  const subTab = searchParams.get('sub_tab') || 'service';
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const fetchedTabsRef = useRef({
    daily: { service: false, project: false, sku: false },
    monthly: false,
    yearly: false,
  });

  const prevDailyFiltersRef = useRef(dailyFilters);
  const prevMonthlyFiltersRef = useRef(monthlyFilters);
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (!selectedClientId || fetchingRef.current) return;

    const fetchData = async () => {
      fetchingRef.current = true;
      setIsFetching(true);

      const dailyFiltersChanged = !areFiltersEqual(
        prevDailyFiltersRef.current,
        dailyFilters
      );
      const monthlyFiltersChanged = !areFiltersEqual(
        prevMonthlyFiltersRef.current,
        monthlyFilters
      );

      if (mainTab === 'daily') {
        const fetched =
          fetchedTabsRef.current.daily[subTab as 'service' | 'project' | 'sku'];

        if (!fetched || dailyFiltersChanged) {
          if (subTab === 'service') {
            await fetchDailyData(dailyFilters);
            await fetchUsageData({
              month: dailyFilters.month!,
              year: dailyFilters.year!,
            });
          } else if (subTab === 'project') {
            await fetchDailyProjectTrend(dailyFilters);
            await fetchUsageData({
              month: dailyFilters.month!,
              year: dailyFilters.year!,
            });
          } else if (subTab === 'sku') {
            await fetchDailySkuTrend(dailyFilters);
            await fetchDailySkuBreakdown(dailyFilters);
          }

          fetchedTabsRef.current.daily[
            subTab as 'service' | 'project' | 'sku'
          ] = true;
          prevDailyFiltersRef.current = dailyFilters;
        }
      }

      if (mainTab === 'monthly') {
        if (!fetchedTabsRef.current.monthly || monthlyFiltersChanged) {
          await fetchUsageData(monthlyFilters);
          fetchedTabsRef.current.monthly = true;
          prevMonthlyFiltersRef.current = monthlyFilters;
        }
      }

      if (mainTab === 'yearly' && !fetchedTabsRef.current.yearly) {
        await fetchYearlyUsageData({ months: 12 });
        fetchedTabsRef.current.yearly = true;
      }

      setHasFetchedOnce(true);
      setIsFetching(false);
      fetchingRef.current = false;
    };

    fetchData();
  }, [mainTab, subTab, selectedClientId, dailyFilters, monthlyFilters]);

  const handleMainTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('main_tab', tab);
    params.set('sub_tab', 'service');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSubTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sub_tab', tab);
    router.push(`${pathname}?${params.toString()}`);
  };

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: String(i + 1),
        label: new Date(0, i).toLocaleString('id-ID', { month: 'long' }),
      })),
    []
  );

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => ({
      value: String(currentYear - 5 + i + 1),
      label: String(currentYear - 5 + i + 1),
    })).reverse();
  }, []);

  if (!selectedClientId) {
    return (
      <div className="space-y-6">
        <PageTitle />
        <Alert
          variant="default"
          className="border-blue-200 bg-blue-50 text-blue-700"
        >
          <AlertCircle className="h-4 w-4 !text-blue-700" />
          <AlertTitle>Pilih Client</AlertTitle>
          <AlertDescription>
            Silakan pilih client di halaman Dashboard utama untuk melihat data
            penggunaan.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!hasFetchedOnce || isFetching) {
    return (
      <div className="space-y-6">
        <PageTitle />
        <div className="flex h-[calc(100vh-12rem)] w-full items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <PageTitle />
        <div className="flex items-center gap-2">
          {mainTab === 'daily' && (
            <TimeRangeFilter
              initialFilters={dailyFilters}
              onFilterChange={setDailyFilters}
            />
          )}
          {mainTab === 'monthly' && (
            <div className="flex gap-2">
              <Select
                value={String(monthlyFilters.month)}
                onValueChange={(v) =>
                  setMonthlyFilters({ ...monthlyFilters, month: Number(v) })
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
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
                  setMonthlyFilters({ ...monthlyFilters, year: Number(v) })
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
            </div>
          )}
        </div>
      </div>

      <Tabs value={mainTab} onValueChange={handleMainTabChange}>
        <TabsList className="grid w-full grid-cols-3 md:w-auto">
          <TabsTrigger value="daily">Daily Overview</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Overview</TabsTrigger>
          <TabsTrigger value="yearly">Year To Date Overview</TabsTrigger>
        </TabsList>

        <div className="pt-4 min-h-[450px]">
          <TabsContent value="daily" className="mt-2">
            <Tabs value={subTab} onValueChange={handleSubTabChange}>
              <TabsList>
                <TabsTrigger value="service">Services</TabsTrigger>
                <TabsTrigger value="project">Projects</TabsTrigger>
                <TabsTrigger value="sku">SKU</TabsTrigger>
              </TabsList>
              <div className="pt-4">
                <TabsContent value="service">
                  {dailyData && usageData?.serviceBreakdown ? (
                    <BillingDailyServiceBreakdown
                      dailyData={dailyData}
                      monthlyData={usageData.serviceBreakdown}
                      showAll
                    />
                  ) : (
                    <p className="text-center text-muted-foreground py-10">
                      Data tidak tersedia.
                    </p>
                  )}
                </TabsContent>
                <TabsContent value="project">
                  {dailyProjectTrendData && usageData?.projectBreakdown ? (
                    <BillingDailyProjectBreakdown
                      dailyData={dailyProjectTrendData}
                      monthlyData={usageData.projectBreakdown}
                      showAll
                    />
                  ) : (
                    <p className="text-center text-muted-foreground py-10">
                      Data tidak tersedia.
                    </p>
                  )}
                </TabsContent>
                <TabsContent value="sku">
                  {dailySkuTrendData && dailySkuBreakdownData ? (
                    <BillingDailySkuBreakdown
                      trendData={dailySkuTrendData}
                      breakdownData={dailySkuBreakdownData}
                      showAll
                    />
                  ) : (
                    <p className="text-center text-muted-foreground py-10">
                      Data tidak tersedia.
                    </p>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </TabsContent>

          <TabsContent value="monthly" className="mt-6">
            <Tabs value={subTab} onValueChange={handleSubTabChange}>
              <TabsList>
                <TabsTrigger value="service">Services</TabsTrigger>
                <TabsTrigger value="project">Projects</TabsTrigger>
              </TabsList>
              <div className="pt-4">
                <TabsContent value="service">
                  {usageData?.serviceBreakdown?.breakdown?.length > 0 ? (
                    <BillingServiceBreakdown
                      data={usageData.serviceBreakdown}
                      showAll
                      currentMonthLabel={
                        months.find(
                          (m) => m.value === `${monthlyFilters.month}`
                        )?.label
                      }
                      selectedYear={monthlyFilters.year}
                    />
                  ) : (
                    <p className="text-center text-muted-foreground py-10">
                      Data tidak tersedia.
                    </p>
                  )}
                </TabsContent>
                <TabsContent value="project">
                  {usageData?.projectBreakdown?.breakdown?.length > 0 ? (
                    <BillingProjectBreakdown
                      data={usageData.projectBreakdown}
                      showAll
                      currentMonthLabel={
                        months.find(
                          (m) => m.value === `${monthlyFilters.month}`
                        )?.label
                      }
                      selectedYear={monthlyFilters.year}
                    />
                  ) : (
                    <p className="text-center text-muted-foreground py-10">
                      Data tidak tersedia.
                    </p>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </TabsContent>

          <TabsContent value="yearly" className="mt-6">
            {yearlyUsageData ? (
              <BillingYearlyChart data={yearlyUsageData} showAll />
            ) : (
              <p className="text-center text-muted-foreground py-10">
                Data tidak tersedia.
              </p>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default function UsagePageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <UsagePageContent />
    </Suspense>
  );
}
