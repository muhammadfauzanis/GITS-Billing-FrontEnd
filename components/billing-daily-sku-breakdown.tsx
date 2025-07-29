'use client';

import { useState, useMemo } from 'react';
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
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SkuTrend {
  sku: string;
  daily_costs: { [date: string]: number };
}

interface TrendData {
  skuCostTrend: SkuTrend[];
  days: string[];
}

interface BreakdownRow {
  sku: string;
  service: string;
  skuId: string;
  usage: string;
  cost: string;
  // discounts: string;
  // promotions: string;
  // subtotal: string;
  rawSubtotal: number;
}

interface BreakdownData {
  data: BreakdownRow[];
}

interface DailySkuChartProps {
  trendData: TrendData;
  breakdownData: BreakdownData;
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

const parseCurrency = (value: string): number => {
  return Number(value.replace(/[^0-9,-]+/g, '').replace(',', '.'));
};

const formatYAxis = (value: number): string => {
  if (Math.abs(value) >= 1_000_000)
    return `Rp${(value / 1_000_000).toFixed(0)}M`;
  if (Math.abs(value) >= 1_000) return `Rp${(value / 1_000).toFixed(0)}K`;
  return `Rp${value.toFixed(0)}`;
};

const formatCurrency = (value: number): string =>
  `Rp ${value.toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDateForTooltip = (dateStr: string): string => {
  const date = new Date(dateStr);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  return date.toLocaleDateString('id-ID', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const CustomTooltip = ({
  active,
  payload,
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
              <div className="flex items-center gap-2 max-w-[200px]">
                <div
                  className="h-2.5 w-2.5 rounded-sm shrink-0"
                  style={{
                    backgroundColor:
                      skuColorMap.get(pld.name as string) || '#ccc',
                  }}
                />
                <span
                  className="text-sm text-muted-foreground truncate"
                  title={pld.name as string}
                >
                  {pld.name}
                </span>
              </div>
              <span className="text-sm font-medium whitespace-nowrap">
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
              <span className="text-sm font-medium whitespace-nowrap">
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
  trendData,
  breakdownData,
  showAll = false,
}: DailySkuChartProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { transformedData, renderingSkus, skuColorMap } = useMemo(() => {
    if (!trendData?.skuCostTrend || !trendData?.days) {
      return {
        transformedData: [],
        renderingSkus: [],
        skuColorMap: new Map(),
      };
    }

    const monthlyTotals = trendData.skuCostTrend
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

    const finalChartData = trendData.days.map((day) => {
      const hasData = trendData.skuCostTrend.some(
        (s) => (s.daily_costs[day] || 0) > 0
      );
      const entry: { [key: string]: any } = {
        name: day.substring(8, 10),
        fullDate: day,
        isPlaceholder: !hasData,
        placeholder: !hasData ? 1 : 0,
      };
      trendData.skuCostTrend.forEach((skuItem) => {
        entry[skuItem.sku] = skuItem.daily_costs[day] || 0;
      });
      return entry;
    });

    return {
      transformedData: finalChartData,
      renderingSkus: skusToRender,
      skuColorMap: colorMap,
    };
  }, [trendData]);

  const tableData = useMemo(() => {
    if (!breakdownData?.data) return [];

    const sorted = [...breakdownData.data].sort(
      (a, b) => parseCurrency(b.cost) - parseCurrency(a.cost)
    );

    let filtered = sorted;
    if (showAll) {
      filtered = sorted.filter(
        (item) =>
          item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.skuId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return showAll ? filtered : sorted.slice(0, 5);
  }, [breakdownData, searchTerm, showAll]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Biaya Harian per SKU</CardTitle>
        <CardDescription>
          Visualisasi dan rincian biaya harian untuk setiap SKU bulan ini.
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

        <div className="space-y-4">
          {showAll && (
            <div className="relative max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Cari SKU, Service, atau SKU ID..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          <ScrollArea
            className={`${showAll ? 'h-[500px]' : ''} w-full rounded-md border`}
          >
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[350px]">SKU</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>SKU ID</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  {/* <TableHead className="text-right">Discounts</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.length > 0 ? (
                  tableData.map((item, index) => (
                    <TableRow key={`${item.skuId}-${index}`}>
                      <TableCell className="font-medium max-w-[350px] truncate">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 rounded-sm shrink-0"
                            style={{
                              backgroundColor:
                                skuColorMap.get(item.sku) || '#D1D5DB',
                            }}
                          />
                          <span title={item.sku}>{item.sku}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.service}</TableCell>
                      <TableCell>{item.skuId}</TableCell>
                      <TableCell>{item.usage}</TableCell>
                      <TableCell className="text-right">{item.cost}</TableCell>
                      {/* <TableCell className="text-right">
                        {item.discounts}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {item.subtotal}
                      </TableCell> */}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Tidak ada data untuk ditampilkan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
