'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ProjectBreakdownProps {
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
];

const formatValue = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toFixed(0);
};

export function BillingProjectBreakdown({
  data,
  showAll = false,
  currentMonthLabel,
  selectedYear,
}: ProjectBreakdownProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const breakdownData = data?.breakdown || [];
  const sortedData = [...breakdownData].sort((a, b) => b.rawValue - a.rawValue);

  // Menentukan data untuk grafik dan tabel berdasarkan prop showAll
  const chartData = showAll ? sortedData : sortedData.slice(0, 5);
  // --- PERBAIKAN DI SINI ---
  const tableData = showAll ? sortedData : sortedData.slice(0, 5);

  const filteredProjects = tableData.filter((project) =>
    project.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topProjects = chartData.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length],
    displayName:
      item.service.length > 12
        ? `${item.service.slice(0, 10)}...`
        : item.service,
  }));

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>
          {showAll ? 'Penggunaan Project' : 'Top 5 Project'}
        </CardTitle>
        <CardDescription>
          Biaya per project untuk bulan {currentMonthLabel} {selectedYear}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topProjects}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="displayName"
                tick={{ fontSize: 12 }}
                interval={0}
                height={60}
                angle={-20}
                textAnchor="end"
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                tickFormatter={formatValue}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip
                formatter={(val, name, props: any) => [
                  props.payload.value,
                  'Project: ' + props.payload.service,
                ]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '8px',
                }}
              />
              <Bar dataKey="rawValue" radius={[4, 4, 0, 0]}>
                {topProjects.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {showAll && (
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Cari project..."
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
                <TableHead>Project</TableHead>
                <TableHead className="text-right">Biaya</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project, idx) => (
                <TableRow key={project.service}>
                  <TableCell className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          COLORS[idx % COLORS.length] ?? '#6b7280',
                      }}
                    />
                    {project.service}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {project.value}
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
