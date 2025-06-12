// app/dashboard/usage/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { useDashboardStore } from '@/lib/store';

export default function UsagePage() {
  // State lokal hanya untuk filter, bukan untuk data
  const [activeTab, setActiveTab] = useState<'overview' | 'projects'>(
    'overview'
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  // Ambil state dan actions dari store Zustand
  const { fetchUsageData, usageData, loading, error, selectedClientId } =
    useDashboardStore();

  // useEffect sekarang hanya bergantung pada filter dan selectedClientId
  useEffect(() => {
    // Hanya fetch data jika client sudah dipilih
    if (selectedClientId) {
      fetchUsageData({ month: selectedMonth, year: selectedYear });
    }
  }, [selectedMonth, selectedYear, selectedClientId, fetchUsageData]);

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(0, i).toLocaleString('id-ID', { month: 'long' }),
  }));
  const years = [
    { value: '2023', label: '2023' },
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' },
  ];

  const currentMonthLabel = months.find(
    (m) => m.value === selectedMonth.toString()
  )?.label;

  // Tampilkan pesan jika belum ada client yang dipilih (untuk admin)
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

      {loading.usage ? (
        <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8" />
          <span className="ml-2">Memuat data penggunaan...</span>
        </div>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as 'overview' | 'projects')}
        >
          <TabsList>
            <TabsTrigger value="overview">Service Overview</TabsTrigger>
            <TabsTrigger value="projects">Project Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Breakdown Layanan</CardTitle>
                <CardDescription>
                  Biaya per layanan GCP untuk bulan {currentMonthLabel}{' '}
                  {selectedYear}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usageData?.serviceBreakdown &&
                usageData.serviceBreakdown.length > 0 ? (
                  <BillingServiceBreakdown
                    data={usageData.serviceBreakdown}
                    showAll
                  />
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    Tidak ada data tersedia.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Penggunaan Project</CardTitle>
                <CardDescription>
                  Biaya per project untuk bulan {currentMonthLabel}{' '}
                  {selectedYear}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usageData?.projectBreakdown ? (
                  <BillingProjectBreakdown
                    data={usageData.projectBreakdown}
                    showAll
                  />
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    Tidak ada data tersedia.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
