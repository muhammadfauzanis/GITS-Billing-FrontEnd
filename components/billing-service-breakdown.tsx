'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ServiceBreakdownProps {
  data: Array<{
    service: string;
    value: string;
    rawValue: number;
  }>;
}

// Predefined colors for services
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

export function BillingServiceBreakdown({ data }: ServiceBreakdownProps) {
  // Sort data by rawValue in descending order
  const sortedData = [...data].sort((a, b) => b.rawValue - a.rawValue);

  // Take top 10 services for the chart
  const topServices = sortedData.slice(0, 10);

  // Calculate total
  const total = sortedData.reduce((sum, item) => sum + item.rawValue, 0);

  // Assign colors to each service
  const dataWithColors = topServices.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length],
    percent: (item.rawValue / total) * 100,
  }));

  // Custom rendering for pie chart labels
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    name,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 10;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show labels for segments with percent > 3%
    if (percent < 0.03) return null;

    return (
      <text
        x={x}
        y={y}
        fill={COLORS[index % COLORS.length]}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-4">
      <div className="h-[220px] flex justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataWithColors}
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
              {dataWithColors.map((entry, index) => (
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
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              iconSize={8}
              formatter={(value, entry, index) => (
                <span style={{ color: '#374151', fontSize: '12px' }}>
                  {value}
                </span>
              )}
              wrapperStyle={{ paddingLeft: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Layanan</TableHead>
                <TableHead className="text-right">Biaya</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.slice(0, 5).map((service) => (
                <TableRow key={service.service}>
                  <TableCell className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          dataWithColors.find(
                            (s) => s.service === service.service
                          )?.color || '#6b7280',
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
      </div>
    </div>
  );
}
