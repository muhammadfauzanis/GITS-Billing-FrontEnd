'use client';

import { useEffect, useState } from 'react';
import ChatbotPage from '@/components/chatbot';
import { BillingOverview } from '@/components/billing-overview';
import { ClientSelector } from '@/components/ClientSelector';
import { useAuth } from '@/lib/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, X } from 'lucide-react';
import { ProjectsList } from '@/components/projects-list';
import { BillingProjectBreakdown } from '@/components/billing-project-breakdown';
import { BillingServiceBreakdown } from '@/components/billing-service-breakdown';
import { useDashboardStore } from '@/lib/store';
import { getClients } from '@/lib/api/index';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BillingYearlyChart } from '@/components/billing-yearly-chart';
import { BillingDailyServiceBreakdown } from '@/components/billing-daily-service-breakdown';
import { BillingDailyProjectBreakdown } from '@/components/billing-daily-project-breakdown';
import { BillingDailySkuBreakdown } from '@/components/billing-daily-sku-breakdown';

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const {
    initializeDashboard,
    fetchDashboardData,
    handleClientChange,
    setClients,
    fetchYearlyUsageData,
    fetchDailyData,
    fetchDailyProjectTrend,
    fetchDailySkuTrend,
    fetchDailySkuBreakdown,
    selectedClientId,
    dashboardData,
    yearlyUsageData,
    dailyData,
    dailyProjectTrendData,
    dailySkuTrendData,
    dailySkuBreakdownData,
    loading,
    clientName,
    error,
  } = useDashboardStore();

  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [currentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear] = useState(new Date().getFullYear());
  const currentMonthLabel = new Date(
    currentYear,
    currentMonth - 1
  ).toLocaleString('id-ID', { month: 'long' });

  const { summaryData, serviceBreakdown, projectBreakdownData, projects } =
    dashboardData || {};
  const isLoadingDashboard = loading.dashboard;
  const isLoadingDailySku = loading.dailySkuTrend;

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
      fetchDailyData({ month: currentMonth, year: currentYear });
      fetchDailyProjectTrend({ month: currentMonth, year: currentYear });
      fetchDailySkuTrend({ month: currentMonth, year: currentYear });
      fetchDailySkuBreakdown({ month: currentMonth, year: currentYear });
    }
  }, [
    selectedClientId,
    fetchDashboardData,
    fetchYearlyUsageData,
    fetchDailyData,
    fetchDailyProjectTrend,
    fetchDailySkuTrend,
    fetchDailySkuBreakdown,
    currentMonth,
    currentYear,
  ]);

  if (isAuthLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
        <span className="ml-2">Memverifikasi sesi...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative min-h-screen pb-20">
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
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
                  <TabsTrigger value="daily-service">
                    Harian (Layanan)
                  </TabsTrigger>
                  <TabsTrigger value="daily-project">
                    Harian (Proyek)
                  </TabsTrigger>
                  <TabsTrigger value="daily-sku">Harian (SKU)</TabsTrigger>
                  <TabsTrigger value="monthly">Bulanan</TabsTrigger>
                  <TabsTrigger value="yearly">Tahunan</TabsTrigger>
                </TabsList>

                <TabsContent value="daily-service">
                  {loading.daily || isLoadingDashboard ? (
                    <div className="flex h-[450px] items-center justify-center text-muted-foreground">
                      <Loader2 className="animate-spin h-8 w-8" />
                    </div>
                  ) : dailyData && serviceBreakdown ? (
                    <BillingDailyServiceBreakdown
                      dailyData={dailyData}
                      monthlyData={serviceBreakdown}
                    />
                  ) : (
                    <div className="flex h-full min-h-[450px] items-center justify-center text-muted-foreground">
                      Tidak ada data harian untuk ditampilkan.
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="daily-project">
                  {loading.dailyProjectTrend || isLoadingDashboard ? (
                    <div className="flex h-[450px] items-center justify-center text-muted-foreground">
                      <Loader2 className="animate-spin h-8 w-8" />
                    </div>
                  ) : dailyProjectTrendData && projectBreakdownData ? (
                    <BillingDailyProjectBreakdown
                      dailyData={dailyProjectTrendData}
                      monthlyData={projectBreakdownData}
                    />
                  ) : (
                    <div className="flex h-full min-h-[450px] items-center justify-center text-muted-foreground">
                      Tidak ada data tren proyek harian untuk ditampilkan.
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="daily-sku">
                  {loading.dailySkuTrend || loading.dailySkuBreakdown ? (
                    <div className="flex h-[450px] items-center justify-center text-muted-foreground">
                      <Loader2 className="animate-spin h-8 w-8" />
                    </div>
                  ) : dailySkuTrendData && dailySkuBreakdownData ? (
                    <BillingDailySkuBreakdown
                      trendData={dailySkuTrendData}
                      breakdownData={dailySkuBreakdownData}
                    />
                  ) : (
                    <div className="flex h-full min-h-[450px] items-center justify-center text-muted-foreground">
                      Tidak ada data penggunaan SKU harian untuk ditampilkan.
                    </div>
                  )}
                </TabsContent>

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

      {/* Floating Chatbot Button & Modal */}
      <button
        onClick={() => setChatbotOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition"
        aria-label="Open Chatbot"
      >
        💬
      </button>

      {chatbotOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 backdrop-blur-sm flex items-end md:items-center justify-center">
          <div className="relative w-full md:max-w-3xl h-[80vh] md:h-[600px] bg-white rounded-t-2xl md:rounded-2xl shadow-lg overflow-hidden flex flex-col">
            <button
              onClick={() => setChatbotOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex-1 overflow-y-auto p-4">
              <ChatbotPage />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
