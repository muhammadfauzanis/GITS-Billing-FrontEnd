'use client';

import { useEffect, Suspense, useState, useMemo } from 'react';
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
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Komponen untuk judul dinamis
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
    error,
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (!selectedClientId) return;

    const fetchData = async () => {
      if (mainTab === 'daily') {
        await Promise.all([
          fetchDailyData(),
          fetchDailyProjectTrend(),
          fetchDailySkuBreakdown(),
          fetchDailySkuTrend(),
          fetchUsageData({
            month: dailyFilters.month!,
            year: dailyFilters.year!,
          }),
        ]);
      } else if (mainTab === 'monthly') {
        await fetchUsageData();
      } else if (mainTab === 'yearly') {
        await fetchYearlyUsageData({ months: 12 });
      }
      if (isInitialLoad) setIsInitialLoad(false);
    };

    fetchData();
  }, [selectedClientId, mainTab, dailyFilters, monthlyFilters]);

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

  if (isInitialLoad && Object.values(loading).some((v) => v)) {
    return (
      <div className="space-y-6">
        <PageTitle />
        <div className="flex h-[calc(100vh-12rem)] w-full items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      </div>
    );
  }

  const isLoadingData =
    loading.daily ||
    loading.usage ||
    loading.yearlyUsage ||
    loading.dailyProjectTrend ||
    loading.dailySkuBreakdown ||
    loading.dailySkuTrend;

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
          {isLoadingData ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              {/* FIX: Tambahkan mt-6 (margin-top) untuk memberi jarak */}
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
                          showAll={true}
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
                          showAll={true}
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
                          showAll={true}
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

              {/* FIX: Tambahkan mt-6 (margin-top) untuk memberi jarak */}
              <TabsContent value="monthly" className="mt-6">
                <Tabs value={subTab} onValueChange={handleSubTabChange}>
                  <TabsList>
                    <TabsTrigger value="service">Layanan</TabsTrigger>
                    <TabsTrigger value="project">Proyek</TabsTrigger>
                  </TabsList>
                  <div className="pt-4">
                    <TabsContent value="service">
                      {usageData?.serviceBreakdown?.breakdown?.length > 0 ? (
                        <BillingServiceBreakdown
                          data={usageData.serviceBreakdown}
                          showAll={true}
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
                          showAll={true}
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

              {/* FIX: Tambahkan mt-6 (margin-top) untuk memberi jarak */}
              <TabsContent value="yearly" className="mt-6">
                {yearlyUsageData ? (
                  <BillingYearlyChart data={yearlyUsageData} showAll={true} />
                ) : (
                  <p className="text-center text-muted-foreground py-10">
                    Data tidak tersedia.
                  </p>
                )}
              </TabsContent>
            </>
          )}
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
