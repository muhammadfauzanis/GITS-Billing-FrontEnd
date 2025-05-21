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
import { getBillingSummary } from '@/lib/api';

// Mock data for development without API
// const mockSummaryData = {
//   currentMonth: {
//     value: 'Rp 40.666.136,55',
//     rawValue: 40666136.551674,
//     percentageChange: '-55.3',
//   },
//   lastMonth: {
//     value: 'Rp 90.903.396,75',
//     rawValue: 90903396.74675003,
//     label: 'Periode sebelumnya',
//   },
//   projection: {
//     value: 'Rp 66.350.012,27',
//     rawValue: 66350012.26852074,
//     label: 'Estimasi akhir bulan',
//   },
//   budget: {
//     value: 'Rp 1.500.000',
//     rawValue: 1500000,
//     percentage: 2711,
//     label: '2711% dari budget',
//   },
// };

const mockServiceBreakdown = [
  {
    service: 'Compute Engine',
    value: 'Rp 31.456.864,25',
    rawValue: 31456864.254132006,
  },
  {
    service: 'Cloud SQL',
    value: 'Rp 2.604.090,87',
    rawValue: 2604090.8672660002,
  },
  {
    service: 'Cloud Data Fusion',
    value: 'Rp 1.904.835,84',
    rawValue: 1904835.8358900005,
  },
  { service: 'Networking', value: 'Rp 1.538.248,43', rawValue: 1538248.430035 },
  {
    service: 'Cloud Filestore',
    value: 'Rp 1.428.366,1',
    rawValue: 1428366.0970089994,
  },
  {
    service: 'Cloud Monitoring',
    value: 'Rp 593.707,03',
    rawValue: 593707.0340140002,
  },
];

const mockMonthlyUsage = {
  data: [
    {
      id: 'Compute Engine',
      name: 'Compute Engine',
      months: {
        'Mei 2025': 31456864.254132006,
        'April 2025': 66790559.38494999,
        'Maret 2025': 66231992.57080698,
        'Februari 2025': 58142873.741754,
        'Januari 2025': 0,
        'Desember 2024': 0,
      },
    },
    {
      id: 'Cloud SQL',
      name: 'Cloud SQL',
      months: {
        'Mei 2025': 2604090.8672660002,
        'April 2025': 8971159.992072005,
        'Maret 2025': 10086580.828782003,
        'Februari 2025': 9180253.950640006,
        'Januari 2025': 0,
        'Desember 2024': 0,
      },
    },
    {
      id: 'Cloud Data Fusion',
      name: 'Cloud Data Fusion',
      months: {
        'Mei 2025': 1904835.8358900005,
        'April 2025': 4195399.745933,
        'Maret 2025': 4253855.710645,
        'Februari 2025': 3807094.2515530013,
        'Januari 2025': 0,
        'Desember 2024': 0,
      },
    },
  ],
  months: [
    'Mei 2025',
    'April 2025',
    'Maret 2025',
    'Februari 2025',
    'Januari 2025',
    'Desember 2024',
  ],
};

const mockProjects = [
  {
    id: 145,
    project_id: 'lakehouse-btcw',
  },
  {
    id: 168,
    project_id: 'bahanalink',
  },
  {
    id: 81,
    project_id: 'btcwadmin',
  },
  {
    id: 131,
    project_id: 'btcw-api',
  },
  {
    id: 22,
    project_id: 'btcw-bo',
  },
];

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

        const summaryResponse = await getBillingSummary();
        setSummaryData(summaryResponse);

        // ⛔ Mock data for other parts (belum aktif API-nya)
        // setServiceBreakdown(mockServiceBreakdown);
        // setMonthlyUsage(mockMonthlyUsage);
        // setProjects(mockProjects);

        // Simulate API delay (optional)
        await new Promise((resolve) => setTimeout(resolve, 500));

        // 📝 Uncomment below if you're ready to use real data for all
        /*
        const [summaryResponse, breakdownResponse, usageResponse, projectsResponse] = await Promise.all([
          getBillingSummary(),
          getOverallServiceBreakdown(currentMonth, currentYear),
          getMonthlyUsage("service", 6),
          getClientProjects(),
        ]);
    
        setSummaryData(summaryResponse);
        setServiceBreakdown(breakdownResponse);
        setMonthlyUsage(usageResponse);
        setProjects(projectsResponse.projects);
        */
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
