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
];

const formatYAxis = (value: number) => {
  if (value >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `Rp${(value / 1_000).toFixed(0)}K`;
  return `Rp${value}`;
};

interface TooltipPayloadItem {
  name: string;
  value: number;
  fill: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const total = payload.reduce(
      (sum: number, item: TooltipPayloadItem) => sum + item.value,
      0
    );

    const sortedPayload = payload
      .filter((p: TooltipPayloadItem) => p.value > 0)
      .sort(
        (a: TooltipPayloadItem, b: TooltipPayloadItem) => b.value - a.value
      );

    const top5Services = sortedPayload.slice(0, 5);
    const otherServices = sortedPayload.slice(5);
    const othersTotal = otherServices.reduce(
      (acc: number, service: TooltipPayloadItem) => acc + service.value,
      0
    );

    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg min-w-[300px]">
        <p className="font-bold text-base mb-2">{label}</p>
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-xl font-bold">{`Rp ${total.toLocaleString(
            'id-ID',
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
          )}`}</span>
        </div>
        <div className="w-full h-px bg-border my-2" />
        <div className="space-y-1">
          {top5Services.map((pld: TooltipPayloadItem, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: pld.fill }}
                />
                <span className="text-sm text-muted-foreground">
                  {pld.name}
                </span>
              </div>
              <span className="text-sm font-medium">{`Rp ${pld.value.toLocaleString(
                'id-ID',
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }
              )}`}</span>
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
              <span className="text-sm font-medium">{`Rp ${othersTotal.toLocaleString(
                'id-ID',
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }
              )}`}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function BillingYearlyChart({ data }: YearlyBillingChartProps) {
  if (!data || !Array.isArray(data.data)) {
    return (
      <div className="flex h-[350px] items-center justify-center text-muted-foreground">
        Data tidak valid atau sedang dimuat...
      </div>
    );
  }

  const sortedServices = [...data.data].sort((a, b) => {
    const totalA = Object.values(a.months).reduce(
      (sum: number, val: number) => sum + val,
      0
    );
    const totalB = Object.values(b.months).reduce(
      (sum: number, val: number) => sum + val,
      0
    );
    return totalB - totalA;
  });

  const serviceNames = sortedServices.map((s) => s.name);

  const transformedData = data.months
    .map((month) => {
      const monthData: { [key: string]: string | number } = {
        month_name: month.split(' ')[0],
        month,
      };
      let total = 0;
      sortedServices.forEach((service) => {
        const cost = service.months[month] || 0;
        monthData[service.name] = cost;
        total += cost;
      });
      monthData.total = total;
      return monthData;
    })
    .filter((item) => typeof item.total === 'number' && item.total > 0);

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={transformedData}
          margin={{
            top: 10,
            right: 30,
            left: 20,
            bottom: 5,
          }}
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
          {serviceNames.map((name, index) => (
            <Bar
              key={name}
              dataKey={name}
              stackId="a"
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
