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
import { AlertCircle } from 'lucide-react';
import { BillingUsageChart } from '@/components/billing-usage-chart';
import { BillingServiceBreakdown } from '@/components/billing-service-breakdown';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getAllProjectBreakdown,
  getMonthlyUsage,
  getOverallServiceBreakdown,
} from '@/lib/api';
import { BillingProjectBreakdown } from '@/components/billing-project-breakdown';

export default function UsagePage() {
  const [monthlyUsage, setMonthlyUsage] = useState<any>(null);
  const [serviceBreakdown, setServiceBreakdown] = useState<any[]>([]);
  const [projectBreakdown, setProjectBreakdown] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects'>(
    'overview'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [groupBy, setGroupBy] = useState<'service' | 'project'>('service');
  const [timeRange, setTimeRange] = useState<string>('6');

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const commonRequests = [
          getMonthlyUsage(groupBy, Number.parseInt(timeRange)),
          getOverallServiceBreakdown(selectedMonth, selectedYear),
        ];

        const [usageResponse, breakdownResponse, projectsUsageBreakdown] =
          await Promise.all([
            ...commonRequests,
            activeTab === 'projects'
              ? getAllProjectBreakdown(selectedMonth, selectedYear)
              : Promise.resolve(null),
          ]);

        setMonthlyUsage(usageResponse);
        setServiceBreakdown(breakdownResponse);
        if (activeTab === 'projects' && projectsUsageBreakdown) {
          setProjectBreakdown(projectsUsageBreakdown);
        }
      } catch (err: any) {
        console.error('Error fetching usage data:', err);
        setError(err.message || 'Gagal memuat data penggunaan');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsageData();
  }, [selectedMonth, selectedYear, groupBy, timeRange, activeTab]);

  const handleMonthChange = (value: string) => {
    setSelectedMonth(Number.parseInt(value));
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(Number.parseInt(value));
  };

  const handleGroupByChange = (value: string) => {
    setGroupBy(value as 'service' | 'project');
  };

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
  };

  const months = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];

  const years = [
    { value: '2023', label: '2023' },
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' },
  ];

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        Loading...
      </div>
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
            onValueChange={handleMonthChange}
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
            onValueChange={handleYearChange}
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
        onValueChange={(val) => setActiveTab(val as 'overview' | 'projects')}
      >
        <TabsList>
          <TabsTrigger value="overview">Service Overview</TabsTrigger>
          <TabsTrigger value="projects">Project Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 pt-4">
          {/* <div className="flex justify-between">
            <div className="flex gap-2">
              <Select value={groupBy} onValueChange={handleGroupByChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Kelompokkan berdasarkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Layanan</SelectItem>
                  <SelectItem value="project">Proyek</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Rentang waktu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 bulan</SelectItem>
                  <SelectItem value="6">6 bulan</SelectItem>
                  <SelectItem value="12">12 bulan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div> */}

          {/* <Card>
            <CardHeader>
              <CardTitle>Tren Penggunaan</CardTitle>
              <CardDescription>
                Penggunaan GCP selama {timeRange} bulan terakhir berdasarkan{' '}
                {groupBy === 'service' ? 'layanan' : 'proyek'}
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
          </Card> */}

          <Card>
            <CardHeader>
              <CardTitle>Breakdown Layanan</CardTitle>
              <CardDescription>
                Biaya per layanan GCP untuk bulan{' '}
                {
                  months.find((m) => m.value === selectedMonth.toString())
                    ?.label
                }{' '}
                {selectedYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {serviceBreakdown && serviceBreakdown.length > 0 ? (
                <BillingServiceBreakdown data={serviceBreakdown} showAll />
              ) : (
                <div className="flex h-[300px] items-center justify-center">
                  Tidak ada data tersedia
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Penggunaan Project</CardTitle>
              <CardDescription>Biaya per project untuk bulan</CardDescription>
            </CardHeader>
            <CardContent>
              {projectBreakdown ? (
                <BillingProjectBreakdown data={projectBreakdown} showAll />
              ) : (
                <div className="flex h-[300px] items-center justify-center">
                  Tidak ada data tersedia
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
