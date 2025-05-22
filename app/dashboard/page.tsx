'use client';

import { useEffect, useState } from 'react';
import { BillingOverview } from '@/components/billing-overview';
import { BillingUsageChart } from '@/components/billing-usage-chart';
import { BillingServiceBreakdown } from '@/components/billing-service-breakdown';
import { ProjectsList } from '@/components/projects-list';
import { BillingProjectBreakdown } from '@/components/billing-project-breakdown'; // pastikan ini sudah ada
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  getAllProjectBreakdown,
  getBillingSummary,
  getClientProjects,
  getMonthlyUsage,
  getOverallServiceBreakdown,
  getProjectBreakdown,
} from '@/lib/api';

export default function DashboardPage() {
  const [summaryData, setSummaryData] = useState<any>(null);
  const [serviceBreakdown, setServiceBreakdown] = useState<any[]>([]);
  const [projectBreakdown, setProjectBreakdown] = useState<any>(null);
  const [monthlyUsage, setMonthlyUsage] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [
          summaryResponse,
          breakdownResponse,
          usageResponse,
          projectsResponse,
          projectsUsageBreakdown,
        ] = await Promise.all([
          getBillingSummary(),
          getOverallServiceBreakdown(currentMonth, currentYear),
          getMonthlyUsage('service', 6),
          getClientProjects(),
          getAllProjectBreakdown(currentMonth, currentYear),
        ]);

        setSummaryData(summaryResponse);
        setServiceBreakdown(breakdownResponse);
        setMonthlyUsage(usageResponse);
        setProjects(projectsResponse.projects || []);
        setProjectBreakdown(projectsUsageBreakdown);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Gagal memuat data dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentMonth, currentYear]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Billing</h1>
        <p className="text-muted-foreground">
          Ringkasan penggunaan dan biaya GCP Anda
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {summaryData && <BillingOverview data={summaryData} />}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle>Top 5 Project</CardTitle>
            <CardDescription>Biaya 5 project teratas bulan ini</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[450px]">
            {projectBreakdown?.breakdown &&
            projectBreakdown.breakdown.length > 0 ? (
              <BillingProjectBreakdown
                data={projectBreakdown}
                showControls={false}
                showSearch={false}
                showAll={false}
              />
            ) : (
              <div className="flex h-[300px] items-center justify-center">
                Tidak ada data tersedia
              </div>
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
              <div className="flex h-[300px] items-center justify-center">
                Tidak ada data tersedia
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Proyek GCP</CardTitle>
          <CardDescription>
            Daftar proyek GCP yang terhubung dengan akun Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projects && projects.length > 0 ? (
            <ProjectsList projects={projects} />
          ) : (
            <div className="flex h-[100px] items-center justify-center">
              Tidak ada proyek tersedia
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
