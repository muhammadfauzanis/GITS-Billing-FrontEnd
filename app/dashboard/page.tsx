// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { BillingOverview } from '@/components/billing-overview';
import { ClientSelector } from '@/components/ClientSelector';
import { useAuth } from '@/lib/auth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
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

  // Ambil state dan actions dari Zustand
  const {
    // Actions
    initializeDashboard,
    fetchDashboardData,
    handleClientChange,
    setClients,
    fetchYearlySummaryData,
    // State
    selectedClientId,
    dashboardData,
    yearlySummaryData,
    yearlyUsageData,
    loading,
    clientName,
    error,
  } = useDashboardStore();

  const { summaryData, serviceBreakdown, projectBreakdownData, projects } =
    dashboardData || {};
  const isLoadingDashboard = loading.dashboard;
  const isLoadingYearly = loading.yearlySummary;

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
      fetchYearlySummaryData({ year: new Date().getFullYear() });
    }
  }, [selectedClientId, fetchDashboardData, fetchYearlySummaryData]);

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
                    <Card className="overflow-hidden border shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle>Top 5 Project</CardTitle>
                        <CardDescription>
                          Biaya 5 project teratas bulan ini
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="min-h-[450px]">
                        {projectBreakdownData?.breakdown &&
                        projectBreakdownData.breakdown.length > 0 ? (
                          <BillingProjectBreakdown
                            data={projectBreakdownData}
                            showSearch={false}
                            showAll={false}
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground pt-4">
                            Tidak ada data breakdown project.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                    <Card className="border shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle>Breakdown Layanan</CardTitle>
                        <CardDescription>Biaya per layanan GCP</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {serviceBreakdown && serviceBreakdown.length > 0 ? (
                          <BillingServiceBreakdown data={serviceBreakdown} />
                        ) : (
                          <p className="text-sm text-muted-foreground pt-4">
                            Tidak ada data breakdown layanan.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="yearly">
                  <Card>
                    <CardHeader>
                      <CardTitle>Grafik Billing Tahunan</CardTitle>
                      <CardDescription>
                        Total biaya per bulan untuk tahun{' '}
                        {new Date().getFullYear()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingYearly ? (
                        <div className="flex h-[350px] items-center justify-center">
                          <Loader2 className="animate-spin h-6 w-6" />
                        </div>
                      ) : yearlySummaryData ? (
                        <BillingYearlyChart data={yearlySummaryData} />
                      ) : (
                        <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                          Tidak ada data ringkasan tahunan untuk ditampilkan.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>Proyek GCP</CardTitle>
                  <CardDescription>
                    Daftar proyek GCP yang terhubung
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {projects && projects.length > 0 ? (
                    <ProjectsList projects={projects} />
                  ) : (
                    <p className="text-sm text-muted-foreground pt-4">
                      Tidak ada proyek yang terhubung dengan client ini.
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
