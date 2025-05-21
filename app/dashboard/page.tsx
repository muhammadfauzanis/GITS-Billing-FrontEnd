'use client';

import { useEffect, useState } from 'react';
import { BillingOverview } from '@/components/billing-overview';
import { BillingUsageChart } from '@/components/billing-usage-chart';
import { BillingServiceBreakdown } from '@/components/billing-service-breakdown';
import { ProjectsList } from '@/components/projects-list';
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
  getBillingSummary,
  getClientProjects,
  getMonthlyUsage,
  getOverallServiceBreakdown,
} from '@/lib/api';

export default function DashboardPage() {
  const [summaryData, setSummaryData] = useState<any>(null);
  const [serviceBreakdown, setServiceBreakdown] = useState<any[]>([]);
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
        ] = await Promise.all([
          getBillingSummary(),
          getOverallServiceBreakdown(currentMonth, currentYear),
          getMonthlyUsage('service', 6),
          getClientProjects(),
        ]);

        setSummaryData(summaryResponse);
        setServiceBreakdown(breakdownResponse);
        setMonthlyUsage(usageResponse);
        setProjects(projectsResponse.projects);
        console.log(usageResponse);
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
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>Tren Penggunaan</CardTitle>
            <CardDescription>
              Penggunaan GCP selama 6 bulan terakhir
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyUsage ? (
              <BillingUsageChart data={monthlyUsage} />
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
