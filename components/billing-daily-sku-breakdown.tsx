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
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

interface SkuTrend {
  sku: string;
  daily_costs: { [date: string]: number };
}

interface DailySkuData {
  skuCostTrend: SkuTrend[];
  days: string[];
  skus: string[];
}

interface DailySkuChartProps {
  data: DailySkuData;
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
const PLACEHOLDER_COLOR = '#f3f4f6';

const formatYAxis = (value: number): string => {
  if (value >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `Rp${(value / 1_000).toFixed(0)}K`;
  return `Rp${value}`;
};

const formatCurrency = (value: number): string => {
  return `Rp ${value.toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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

const CustomTooltip = ({
  active,
  payload,
  label,
  skuColorMap,
}: TooltipProps<ValueType, NameType> & {
  skuColorMap: Map<string, string>;
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

    const top5Skus = payload
      .filter((p) => typeof p.value === 'number' && p.value > 0)
      .sort((a, b) => (b.value as number) - (a.value as number))
      .slice(0, 5);

    const otherSkus = payload.slice(5).filter((p) => (p.value as number) > 0);
    const othersTotal = otherSkus.reduce(
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
          {top5Skus.map((pld, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-sm shrink-0"
                  style={{
                    backgroundColor:
                      skuColorMap.get(pld.name as string) || '#ccc',
                  }}
                />
                <span
                  className="text-sm text-muted-foreground truncate max-w-[150px]"
                  title={pld.name as string}
                >
                  {pld.name}
                </span>
              </div>
              <span className="text-sm font-medium">
                {formatCurrency(pld.value as number)}
              </span>
            </div>
          ))}
          {otherSkus.length > 0 && (
            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-sm shrink-0 bg-gray-400" />
                <span className="text-sm text-muted-foreground">
                  {otherSkus.length} lainnya
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

export function BillingDailySkuBreakdown({
  data,
  showAll = false,
}: DailySkuChartProps) {
  const { transformedData, renderingSkus, skuColorMap, tableData } =
    useMemo(() => {
      if (!data?.skuCostTrend || !data?.days) {
        return {
          transformedData: [],
          renderingSkus: [],
          skuColorMap: new Map(),
          tableData: [],
        };
      }

      const monthlyTotals = data.skuCostTrend
        .map((item) => ({
          sku: item.sku,
          totalCost: Object.values(item.daily_costs).reduce(
            (sum, current) => sum + current,
            0
          ),
        }))
        .sort((a, b) => b.totalCost - a.totalCost);

      const colorMap = new Map<string, string>();
      monthlyTotals.forEach((item, index) => {
        colorMap.set(item.sku, COLORS[index % COLORS.length]);
      });

      const skusToRender = [...monthlyTotals].map((s) => s.sku).reverse();

      const finalChartData = data.days.map((day) => {
        const hasData = data.skuCostTrend.some((s) => s.daily_costs[day] > 0);
        const entry: { [key: string]: any } = {
          name: day.substring(8, 10),
          fullDate: day,
          isPlaceholder: !hasData,
          placeholder: !hasData ? 1 : 0,
        };
        data.skuCostTrend.forEach((skuItem) => {
          entry[skuItem.sku] = skuItem.daily_costs[day] || 0;
        });
        return entry;
      });

      const finalTableData = (
        showAll ? monthlyTotals : monthlyTotals.slice(0, 5)
      ).map((item) => ({
        ...item,
        color: colorMap.get(item.sku) || '#ccc',
      }));

      return {
        transformedData: finalChartData,
        renderingSkus: skusToRender,
        skuColorMap: colorMap,
        tableData: finalTableData,
      };
    }, [data, showAll]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Biaya Harian per SKU</CardTitle>
        <CardDescription>
          Visualisasi biaya harian untuk setiap SKU bulan ini.
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
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fontSize: 12 }}
                width={80}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip skuColorMap={skuColorMap} />}
                cursor={{ fill: 'hsl(var(--muted))' }}
              />
              {renderingSkus.map((skuName, index) => (
                <Bar
                  key={skuName}
                  dataKey={skuName}
                  stackId="a"
                  fill={skuColorMap.get(skuName) || '#ccc'}
                  radius={
                    index === renderingSkus.length - 1
                      ? [4, 4, 0, 0]
                      : [0, 0, 0, 0]
                  }
                />
              ))}
              <Bar
                dataKey="placeholder"
                stackId="a"
                fill={PLACEHOLDER_COLOR}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">
                  Total Biaya Bulan Ini
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((item) => (
                <TableRow key={item.sku}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate" title={item.sku}>
                      {item.sku}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.totalCost)}
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
