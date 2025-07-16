'use client';

import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ServiceBreakdownProps {
  data: {
    breakdown: Array<{
      service: string;
      value: string;
      rawValue: number;
    }>;
    total: {
      value: string;
      rawValue: number;
    };
  };
  showAll?: boolean;
  currentMonthLabel?: string;
  selectedYear?: number;
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
  '#d946ef',
  '#f97316',
  '#14b8a6',
  '#8b5cf6',
  '#f43f5e',
];

export function BillingServiceBreakdown({
  data,
  showAll = false,
  currentMonthLabel,
  selectedYear,
}: ServiceBreakdownProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const breakdown = data?.breakdown || [];
  const sortedData = useMemo(
    () => [...breakdown].sort((a, b) => b.rawValue - a.rawValue),
    [breakdown]
  );
  const total = data?.total?.rawValue || 0;

  const chartData = useMemo(() => {
    const chartServices = showAll ? sortedData : sortedData.slice(0, 10);
    return chartServices
      .filter((item) => item.rawValue > 0)
      .map((item, index) => ({
        ...item,
        color: COLORS[index % COLORS.length],
        percent: total > 0 ? (item.rawValue / total) * 100 : 0,
      }));
  }, [sortedData, showAll, total]);

  const tableData = useMemo(() => {
    const services = showAll ? sortedData : sortedData.slice(0, 5);
    if (showAll) {
      return services.filter((service) =>
        service.service.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return services;
  }, [sortedData, showAll, searchTerm]);

  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, outerRadius, index } = props;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 10;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const entry = chartData[index];
    const percent = entry.percent;

    if (percent < 3) return null;

    return (
      <text
        x={x}
        y={y}
        fill={entry.color}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
      >
        {`${percent.toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>{showAll ? 'Breakdown Layanan' : 'Top 5 Layanan'}</CardTitle>
        <CardDescription>
          Biaya per layanan GCP untuk bulan {currentMonthLabel} {selectedYear}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {showAll && data?.total && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Biaya Layanan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{data.total.value}</p>
            </CardContent>
          </Card>
        )}
        <div className="h-[300px] w-full flex justify-center items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="rawValue"
                nameKey="service"
                label={renderCustomizedLabel}
                labelLine={false}
                isAnimationActive={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `Rp ${value.toLocaleString('id-ID', {
                    maximumFractionDigits: 0,
                  })}`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  padding: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {showAll && (
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Cari layanan..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        <div
          className={`rounded-md border ${
            showAll ? 'max-h-[400px] overflow-y-auto' : ''
          }`}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Layanan</TableHead>
                <TableHead className="text-right">Biaya</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((service, idx) => (
                <TableRow key={service.service}>
                  <TableCell className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          chartData.find((s) => s.service === service.service)
                            ?.color || COLORS[idx % COLORS.length],
                      }}
                    />
                    <span>{service.service}</span>
                  </TableCell>
                  <TableCell className="text-right">{service.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
