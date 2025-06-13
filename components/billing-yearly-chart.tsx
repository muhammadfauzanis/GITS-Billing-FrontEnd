'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMemo } from 'react';

// Tipe data untuk props, mencakup seluruh response dari endpoint
interface YearlySummaryData {
  year: number;
  monthlyCosts: Array<{ month: string; total: number }>;
  serviceCosts: Array<{
    service: string;
    total: { value: string; rawValue: number };
  }>;
  grandTotal: { value: string; rawValue: number };
}

interface BillingYearlyChartProps {
  data: YearlySummaryData;
  showAll?: boolean;
}

const COLORS = [
  '#0ea5e9',
  '#8b5cf6',
  '#f59e0b',
  '#10b981',
  '#ec4899',
  '#6b7280',
  '#ef4444',
  '#84cc16',
  '#06b6d4',
  '#a855f7',
];

const formatYAxis = (value: number) => {
  if (value >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `Rp${(value / 1_000).toFixed(0)}K`;
  return `Rp${value}`;
};

export function BillingYearlyChart({
  data,
  showAll = false,
}: BillingYearlyChartProps) {
  // Memoize data chart untuk efisiensi
  const chartData = useMemo(() => {
    return Array.isArray(data?.monthlyCosts)
      ? data.monthlyCosts.filter((item) => item.total > 0)
      : [];
  }, [data?.monthlyCosts]);

  // Siapkan data untuk tabel berdasarkan prop showAll
  const tableData = useMemo(() => {
    const sortedServices = [...data.serviceCosts].sort(
      (a, b) => b.total.rawValue - a.total.rawValue
    );
    return showAll ? sortedServices : sortedServices.slice(0, 5);
  }, [data.serviceCosts, showAll]);

  // Buat pemetaan warna agar konsisten antara chart (jika ada) dan tabel
  const serviceColorMap = useMemo(() => {
    const map = new Map<string, string>();
    const sortedServicesForColor = [...data.serviceCosts].sort(
      (a, b) => b.total.rawValue - a.total.rawValue
    );
    sortedServicesForColor.forEach((item, index) => {
      map.set(item.service, COLORS[index % COLORS.length]);
    });
    return map;
  }, [data.serviceCosts]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Grand Total Biaya</CardTitle>
          <CardDescription>
            Total keseluruhan biaya untuk tahun {data.year}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            {data.grandTotal?.value || 'Rp 0'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grafik Biaya Bulanan</CardTitle>
          <CardDescription>
            Total biaya yang dikeluarkan setiap bulan pada tahun {data.year}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    angle={-30}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    tickFormatter={formatYAxis}
                    tick={{ fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 0,
                      }).format(value),
                      'Total',
                    ]}
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Bar dataKey="total" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[300px] w-full items-center justify-center text-muted-foreground">
              Tidak ada data biaya untuk ditampilkan.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Biaya per Layanan (Setahun)</CardTitle>
          <CardDescription>
            {showAll
              ? `Total biaya untuk setiap layanan sepanjang tahun ${data.year}.`
              : `5 layanan teratas berdasarkan biaya sepanjang tahun ${data.year}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Layanan</TableHead>
                <TableHead className="text-right">Total Biaya</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((item) => (
                <TableRow key={item.service}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          serviceColorMap.get(item.service) ?? '#6b7280',
                      }}
                    />
                    {item.service}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.total.value}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
