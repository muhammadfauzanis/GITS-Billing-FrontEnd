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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

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
  onMonthChange?: (month: string, year: string) => void;
  selectedMonth?: string;
  selectedYear?: string;
  showControls?: boolean;
  showSearch?: boolean;
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

const formatValue = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toFixed(0);
};

export function BillingProjectBreakdown({
  data,
  onMonthChange,
  selectedMonth,
  selectedYear,
  showControls = true,
  showSearch = true,
  showAll = false,
}: ProjectBreakdownProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const breakdownData = Array.isArray(data?.breakdown) ? data.breakdown : [];

  const sortedData = [...breakdownData].sort((a, b) => b.rawValue - a.rawValue);
  const chartData = showAll ? sortedData : sortedData.slice(0, 5);
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

  const years = ['2023', '2024', '2025'];

  return (
    <div className="space-y-4">
      {showControls && onMonthChange && (
        <div className="flex gap-2">
          <Select
            value={selectedMonth}
            onValueChange={(val) => onMonthChange(val, selectedYear!)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Pilih bulan" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedYear}
            onValueChange={(val) => onMonthChange!(selectedMonth!, val)}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Pilih tahun" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topProjects}
            margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
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

      {showSearch && (
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
                      backgroundColor: COLORS[idx % COLORS.length] ?? '#6b7280',
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
    </div>
  );
}
