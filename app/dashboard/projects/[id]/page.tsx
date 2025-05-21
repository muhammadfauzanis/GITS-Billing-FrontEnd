'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { BillingServiceBreakdown } from '@/components/billing-service-breakdown';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getProjectBreakdown } from '@/lib/api';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [projectData, setProjectData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const breakdownData = await getProjectBreakdown(
          id as string,
          selectedMonth,
          selectedYear
        );
        setProjectData(breakdownData);
      } catch (err: any) {
        console.error('Error fetching project data:', err);
        setError(err.message || 'Gagal memuat data proyek');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProjectData();
    }
  }, [id, selectedMonth, selectedYear]);

  const handleMonthChange = (value: string) => {
    setSelectedMonth(Number.parseInt(value));
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(Number.parseInt(value));
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
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Detail Proyek: {id}
          </h1>
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

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="details">Detail Biaya</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Biaya</CardTitle>
              <CardDescription>
                Total biaya untuk bulan{' '}
                {
                  months.find((m) => m.value === selectedMonth.toString())
                    ?.label
                }{' '}
                {selectedYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                {projectData?.total?.value || 'Rp 0'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Breakdown Layanan</CardTitle>
              <CardDescription>Biaya per layanan GCP</CardDescription>
            </CardHeader>
            <CardContent>
              {projectData?.breakdown && projectData.breakdown.length > 0 ? (
                <BillingServiceBreakdown data={projectData.breakdown} />
              ) : (
                <div className="flex h-[300px] items-center justify-center">
                  Tidak ada data tersedia
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Detail Biaya</CardTitle>
              <CardDescription>Detail biaya per layanan</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Detail biaya akan ditampilkan di sini.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
