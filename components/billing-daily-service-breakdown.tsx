'use client';

import { useMemo } from 'react';
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
import { formatCurrency } from '@/lib/utils';
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

// --- TYPE DEFINITIONS ---
interface DailyService {
  service: string;
  cost: number;
  isForecast: boolean;
}

interface DailyBreakdown {
  date: string;
  services: DailyService[];
  total: number;
}

interface MonthlyService {
  service: string;
  value: string;
  rawValue: number;
}

interface DailyChartData {
  dailyBreakdown: DailyBreakdown[];
  services: string[];
}

interface MonthlyBreakdownData {
  breakdown: MonthlyService[];
  total: {
    value: string;
    rawValue: number;
  };
}

interface DailyBillingChartProps {
  dailyData: DailyChartData;
  monthlyData: MonthlyBreakdownData;
  showAll?: boolean;
}

// --- STYLING & FORMATTING ---
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
  '#d946ef',
  '#f97316',
  '#14b8a6',
  '#f43f5e',
];
const PLACEHOLDER_COLOR = '#f3f4f6'; // Light gray for future dates

const formatYAxis = (value: number): string => {
  if (value >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `Rp${(value / 1_000).toFixed(0)}K`;
  return `Rp${value}`;
};

const formatDateForTooltip = (dateStr: string): string => {
  const date = new Date(dateStr);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

// --- CUSTOM TOOLTIP COMPONENT ---
const CustomTooltip = ({
  active,
  payload,
  label,
  serviceColorMap,
}: TooltipProps<ValueType, NameType> & {
  serviceColorMap: Map<string, string>;
}) => {
  if (
    active &&
    payload &&
    payload.length &&
    !payload[0].payload.isPlaceholder
  ) {
    const total = payload.reduce(
      (sum, item) => sum + ((item.value as number) || 0),
      0
    );
    const fullDate = payload[0].payload.fullDate;

    const top5Services = payload
      .filter((p) => typeof p.value === 'number' && p.value > 0)
      .sort((a, b) => (b.value as number) - (a.value as number))
      .slice(0, 5);

    const otherServices = payload
      .slice(5)
      .filter((p) => (p.value as number) > 0);
    const othersTotal = otherServices.reduce(
      (acc, p) => acc + ((p.value as number) || 0),
      0
    );

    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg min-w-[300px]">
        <p className="font-bold text-base mb-2">
          {formatDateForTooltip(fullDate)}
        </p>
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-xl font-bold">{formatCurrency(total)}</span>
        </div>
        <div className="w-full h-px bg-border my-2" />
        <div className="space-y-1">
          {top5Services.map((pld, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-sm shrink-0"
                  style={{
                    backgroundColor:
                      serviceColorMap.get(pld.name as string) || '#ccc',
                  }}
                />
                <span className="text-sm text-muted-foreground">
                  {pld.name}
                </span>
              </div>
              <span className="text-sm font-medium">
                {formatCurrency(pld.value as number)}
              </span>
            </div>
          ))}
          {otherServices.length > 0 && (
            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-sm shrink-0 bg-gray-400" />
                <span className="text-sm text-muted-foreground">
                  {otherServices.length} lainnya
                </span>
              </div>
              <span className="text-sm font-medium">
                {formatCurrency(othersTotal)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function BillingDailyServiceBreakdown({
  dailyData,
  monthlyData,
  showAll = false,
}: DailyBillingChartProps) {
  const { transformedData, renderingServices, serviceColorMap, tableData } =
    useMemo(() => {
      if (!dailyData?.dailyBreakdown || !monthlyData?.breakdown) {
        return {
          transformedData: [],
          renderingServices: [],
          serviceColorMap: new Map(),
          tableData: [],
        };
      }

      const sortedMonthlyServices = [...monthlyData.breakdown].sort(
        (a, b) => b.rawValue - a.rawValue
      );

      const colorMap = new Map<string, string>();
      sortedMonthlyServices.forEach((service, index) => {
        colorMap.set(service.service, COLORS[index % COLORS.length]);
      });

      const servicesToRender = [...sortedMonthlyServices]
        .map((s) => s.service)
        .reverse();

      const finalChartData = dailyData.dailyBreakdown.map((day) => {
        const isPlaceholder = day.services.length === 0;

        const chartEntry: { [key: string]: any } = {
          name: day.date.substring(8, 10),
          fullDate: day.date,
          isPlaceholder: isPlaceholder,
          placeholder: isPlaceholder ? 1 : 0,
        };

        monthlyData.breakdown.forEach((monthlyService) => {
          const serviceName = monthlyService.service;
          const serviceData = day.services.find(
            (s) => s.service === serviceName
          );
          chartEntry[serviceName] = serviceData ? serviceData.cost : 0;
        });
        return chartEntry;
      });

      const finalTableData = (
        showAll ? sortedMonthlyServices : sortedMonthlyServices.slice(0, 5)
      ).map((service) => ({
        ...service,
        color: colorMap.get(service.service) || '#ccc',
      }));

      return {
        transformedData: finalChartData,
        renderingServices: servicesToRender,
        serviceColorMap: colorMap,
        tableData: finalTableData,
      };
    }, [dailyData, monthlyData, showAll]);

  if (!dailyData || !monthlyData) {
    return (
      <div className="flex h-[450px] items-center justify-center text-muted-foreground">
        Data tidak valid atau sedang dimuat...
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Laporan Billing Harian</CardTitle>
        <CardDescription>
          Biaya harian berdasarkan layanan untuk bulan ini
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={transformedData}
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
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
                content={<CustomTooltip serviceColorMap={serviceColorMap} />}
                cursor={{ fill: 'hsl(var(--muted))' }}
              />
              {renderingServices.map((serviceName, index) => (
                <Bar
                  key={serviceName}
                  dataKey={serviceName}
                  stackId="a"
                  fill={serviceColorMap.get(serviceName) || '#ccc'}
                  radius={
                    index === renderingServices.length - 1
                      ? [4, 4, 0, 0]
                      : [0, 0, 0, 0]
                  }
                  isAnimationActive={false}
                />
              ))}
              <Bar
                dataKey="placeholder"
                stackId="a"
                fill={PLACEHOLDER_COLOR}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Layanan</TableHead>
                <TableHead className="text-right">
                  Total Biaya Bulan Ini
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((item) => (
                <TableRow key={item.service}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.service}
                  </TableCell>
                  <TableCell className="text-right">{item.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
