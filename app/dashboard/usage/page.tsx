'use client';

import { useEffect, useState, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { BillingServiceBreakdown } from '@/components/billing-service-breakdown';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BillingProjectBreakdown } from '@/components/billing-project-breakdown';
import { BillingYearlyChart } from '@/components/billing-yearly-chart';
import { useDashboardStore } from '@/lib/store';

function UsagePageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get('tab') || 'overview';

  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  const {
    fetchUsageData,
    fetchYearlyUsageData,
    usageData,
    yearlyUsageData,
    loading,
    error,
    selectedClientId,
  } = useDashboardStore();

  useEffect(() => {
    if (selectedClientId) {
      if (activeTab === 'yearly-summary') {
        fetchYearlyUsageData({ months: 12 });
      } else {
        fetchUsageData({ month: selectedMonth, year: selectedYear });
      }
    }
  }, [
    selectedMonth,
    selectedYear,
    selectedClientId,
    fetchUsageData,
    fetchYearlyUsageData,
    activeTab,
  ]);

  const handleTabChange = (tabValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabValue);
    router.push(`${pathname}?${params.toString()}`);
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(0, i).toLocaleString('id-ID', { month: 'long' }),
  }));
  const years = [{ value: '2025', label: '2025' }];

  const currentMonthLabel = months.find(
    (m) => m.value === selectedMonth.toString()
  )?.label;

  if (!selectedClientId) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Penggunaan GCP</h1>
          <p className="text-muted-foreground">
            Detail penggunaan layanan Google Cloud Platform
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab !== 'yearly-summary' && (
            <Select
              value={selectedMonth.toString()}
              onValueChange={(v) => setSelectedMonth(Number(v))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Pilih bulan" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select
            value={selectedYear.toString()}
            onValueChange={(v) => setSelectedYear(Number(v))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Pilih tahun" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Service Overview</TabsTrigger>
          <TabsTrigger value="projects">Project Overview</TabsTrigger>
          <TabsTrigger value="yearly-summary">
            Year to Date Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 pt-4">
          {loading.usage ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
          ) : usageData?.serviceBreakdown?.breakdown?.length > 0 ? (
            <BillingServiceBreakdown
              data={usageData.serviceBreakdown}
              showAll={true}
              currentMonthLabel={currentMonthLabel}
              selectedYear={selectedYear}
            />
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              Tidak ada data tersedia.
            </div>
          )}
        </TabsContent>

        <TabsContent value="projects" className="space-y-6 pt-4">
          {loading.usage ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
          ) : usageData?.projectBreakdown?.breakdown?.length > 0 ? (
            <BillingProjectBreakdown
              data={usageData.projectBreakdown}
              showAll={true}
              currentMonthLabel={currentMonthLabel}
              selectedYear={selectedYear}
            />
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              Tidak ada data tersedia.
            </div>
          )}
        </TabsContent>

        <TabsContent value="yearly-summary" className="space-y-6 pt-4">
          {loading.yearlyUsage ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
          ) : yearlyUsageData ? (
            <BillingYearlyChart data={yearlyUsageData} showAll={true} />
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              Tidak ada data ringkasan tahunan untuk ditampilkan.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function UsagePageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UsagePageContent />
    </Suspense>
  );
}
