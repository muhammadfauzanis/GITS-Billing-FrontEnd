'use client';

import { useEffect, useState } from 'react';
import { BillingOverview } from '@/components/billing-overview';
import { ClientSelector } from '@/components/ClientSelector';
import { useAuth } from '@/lib/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { ProjectsList } from '@/components/projects-list';
import { BillingProjectBreakdown } from '@/components/billing-project-breakdown';
import { BillingServiceBreakdown } from '@/components/billing-service-breakdown';
import { useDashboardStore } from '@/lib/store';
import { getClients } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BillingYearlyChart } from '@/components/billing-yearly-chart';

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const {
    initializeDashboard,
    fetchDashboardData,
    handleClientChange,
    setClients,
    fetchYearlyUsageData,
    selectedClientId,
    dashboardData,
    yearlyUsageData,
    loading,
    clientName,
    error,
  } = useDashboardStore();

  // Definisikan bulan dan tahun untuk halaman dashboard
  const [currentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear] = useState(new Date().getFullYear());
  const currentMonthLabel = new Date(
    currentYear,
    currentMonth - 1
  ).toLocaleString('id-ID', { month: 'long' });

  const { summaryData, serviceBreakdown, projectBreakdownData, projects } =
    dashboardData || {};
  const isLoadingDashboard = loading.dashboard;
  const isLoadingYearly = loading.yearlyUsage;

  useEffect(() => {
    if (user) {
      initializeDashboard(user);
      if (user.role === 'admin') {
        getClients().then((res) => {
          setClients(res.clients || []);
        });
      }
    }
  }, [user, initializeDashboard, setClients]);

  useEffect(() => {
    if (selectedClientId) {
      fetchDashboardData();
      fetchYearlyUsageData({ months: 12 });
    }
  }, [selectedClientId, fetchDashboardData, fetchYearlyUsageData]);

  if (isAuthLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
        <span className="ml-2">Memverifikasi sesi...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Billing
          </h1>
          {clientName && (
            <h3 className="text-lg font-semibold">{clientName}</h3>
          )}
          <p className="text-muted-foreground">
            Ringkasan penggunaan dan biaya GCP Anda
          </p>
        </div>
        {user?.role === 'admin' && (
          <div className="w-full min-w-[250px] md:w-auto">
            <ClientSelector
              selectedClientId={selectedClientId}
              onClientChange={handleClientChange}
            />
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {user?.role === 'admin' && !selectedClientId && !isLoadingDashboard && (
        <Alert
          variant="default"
          className="border-blue-200 bg-blue-50 text-blue-700"
        >
          <AlertCircle className="h-4 w-4 !text-blue-700" />
          <AlertTitle>Pilih Client</AlertTitle>
          <AlertDescription>
            Silakan pilih client dari dropdown di atas untuk melihat data
            billing.
          </AlertDescription>
        </Alert>
      )}

      {selectedClientId && (
        <>
          {isLoadingDashboard ? (
            <div className="text-center p-10">
              <Loader2 className="animate-spin h-8 w-8 mx-auto" />
              <p className="mt-2 text-muted-foreground">
                Memuat data client...
              </p>
            </div>
          ) : (
            <>
              {summaryData && <BillingOverview data={summaryData} />}

              <Tabs defaultValue="monthly" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="monthly">Laporan Bulan Ini</TabsTrigger>
                  <TabsTrigger value="yearly">Laporan Year-to-Date</TabsTrigger>
                </TabsList>
                <TabsContent value="monthly" className="space-y-6">
                  <div className="grid gap-6 xl:grid-cols-2">
                    {projectBreakdownData?.breakdown?.length > 0 ? (
                      <BillingProjectBreakdown
                        data={projectBreakdownData}
                        currentMonthLabel={currentMonthLabel}
                        selectedYear={currentYear}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground pt-4">
                        Tidak ada data breakdown project.
                      </p>
                    )}
                    {serviceBreakdown?.breakdown?.length > 0 ? (
                      <BillingServiceBreakdown
                        data={serviceBreakdown}
                        currentMonthLabel={currentMonthLabel}
                        selectedYear={currentYear}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground pt-4">
                        Tidak ada data breakdown layanan.
                      </p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="yearly">
                  {yearlyUsageData ? (
                    <BillingYearlyChart data={yearlyUsageData} />
                  ) : (
                    <div className="flex h-full min-h-[450px] items-center justify-center text-muted-foreground">
                      Memuat data...
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              {projects && projects.length > 0 && (
                <ProjectsList projects={projects} />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
