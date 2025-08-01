'use client';

import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  TooltipProps,
} from 'recharts';
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
import { formatCurrency } from '@/lib/utils';

interface YearlyUsageData {
  data: Array<{
    id: string;
    name: string;
    months: Record<string, number>;
  }>;
  months: string[];
}

interface YearlyBillingChartProps {
  data: YearlyUsageData;
  showAll?: boolean;
}

const COLORS = [
  '#4285F4',
  '#DB4437',
  '#F4B400',
  '#0F9D58',
  '#AB47BC',
  '#00ACC1',
  '#FF7043',
  '#9E9D24',
  '#5C6BC0',
  '#8D6E63',
  '#6b7280',
  '#ec4899',
];

const formatYAxis = (value: number) => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (absValue >= 1_000_000)
    return `${sign}Rp${(absValue / 1_000_000).toFixed(0)}M`;
  if (absValue >= 1_000) return `${sign}Rp${(absValue / 1_000).toFixed(0)}K`;
  return `${sign}Rp${absValue}`;
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = data.total;

    const sortedPayload = payload
      .filter((p) => p.value !== 0)
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

    const top5Services = sortedPayload.slice(0, 5);
    const otherServices = sortedPayload.slice(5);
    const othersTotal = otherServices.reduce((acc, p) => acc + p.value, 0);

    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg min-w-[300px]">
        <p className="font-bold text-base mb-2">{label}</p>
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-xl font-bold">{formatCurrency(total)}</span>
        </div>
        <div className="w-full h-px bg-border my-2" />
        <div className="space-y-1">
          {top5Services.map((p, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: p.fill }}
                />
                <span className="text-sm text-muted-foreground">{p.name}</span>
              </div>
              <span className="text-sm font-medium">
                {`Rp ${p.value.toLocaleString('id-ID')}`}
              </span>
            </div>
          ))}
          {otherServices.length > 0 && (
            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-sm shrink-0 bg-gray-400" />
                <span className="text-sm text-muted-foreground">
                  {otherServices.length} layanan lainnya
                </span>
              </div>
              <span className="text-sm font-medium">
                {`Rp ${othersTotal.toLocaleString('id-ID')}`}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function BillingYearlyChart({
  data,
  showAll = false,
}: YearlyBillingChartProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!data || !Array.isArray(data.data)) {
    return (
      <div className="flex h-[350px] items-center justify-center text-muted-foreground">
        Data tidak valid atau sedang dimuat...
      </div>
    );
  }

  const {
    transformedData,
    renderingServices,
    serviceColorMap,
    tableData,
    grandTotal,
  } = useMemo(() => {
    const sortedServices = [...data.data].sort((a, b) => {
      const totalA = Object.values(a.months).reduce((sum, val) => sum + val, 0);
      const totalB = Object.values(b.months).reduce((sum, val) => sum + val, 0);
      return totalB - totalA;
    });

    const colorMap = new Map<string, string>();
    sortedServices.forEach((service, index) => {
      colorMap.set(service.name, COLORS[index % COLORS.length]);
    });

    const servicesForRendering = [...sortedServices].reverse();

    const finalTransformedData = data.months
      .map((month) => {
        const monthData: { [key: string]: string | number } = {
          month_name: month.split(' ')[0],
          month,
        };

        let visibleTotal = 0;
        let trueTotal = 0;

        sortedServices.forEach((service) => {
          const cost = service.months[month] || 0;
          monthData[service.name] = cost > 0 ? cost : 0;
          trueTotal += cost;
          if (cost > 0) visibleTotal += cost;
        });

        monthData['total'] = trueTotal;
        monthData['visibleTotal'] = visibleTotal;

        return monthData;
      })
      .filter(
        (item) =>
          typeof item.visibleTotal === 'number' && item.visibleTotal !== 0
      );

    const sortedServicesWithTotals = sortedServices
      .map((service) => {
        const total = Object.values(service.months).reduce(
          (acc, val) => acc + val,
          0
        );
        return {
          name: service.name,
          total,
          color: colorMap.get(service.name) || '#6b7280',
        };
      })
      .filter((s) => s.total !== 0);

    const totalCost = sortedServicesWithTotals.reduce(
      (acc, item) => acc + item.total,
      0
    );

    let finalTableData = showAll
      ? sortedServicesWithTotals
      : sortedServicesWithTotals.slice(0, 5);

    if (showAll) {
      finalTableData = finalTableData.filter((service) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return {
      transformedData: finalTransformedData,
      renderingServices: servicesForRendering,
      serviceColorMap: colorMap,
      tableData: finalTableData,
      grandTotal: totalCost,
    };
  }, [data, showAll, searchTerm]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grafik Billing Tahunan</CardTitle>
        <CardDescription>
          Total biaya per bulan untuk tahun {new Date().getFullYear()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {showAll && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle> Total Biaya Satu Tahun (Year to Date)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {`Rp ${grandTotal.toLocaleString('id-ID', {
                  maximumFractionDigits: 2,
                })}`}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={transformedData}
              stackOffset="sign"
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month_name"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'hsl(var(--muted))' }}
                isAnimationActive={false}
              />
              {renderingServices.map((service, index) => (
                <Bar
                  key={service.name}
                  dataKey={service.name}
                  stackId="a"
                  fill={serviceColorMap.get(service.name)}
                  radius={
                    index === renderingServices.length - 1
                      ? [4, 4, 0, 0]
                      : [0, 0, 0, 0]
                  }
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
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
                <TableHead className="text-right">Total Biaya</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}
                  </TableCell>
                  <TableCell className="text-right">
                    {`Rp ${item.total.toLocaleString('id-ID', {
                      maximumFractionDigits: 2,
                    })}`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
