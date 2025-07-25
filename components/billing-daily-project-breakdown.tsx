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
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

interface ProjectTrend {
  project: string;
  daily_costs: { [date: string]: number };
}

interface MonthlyProject {
  service: string;
  value: string;
  rawValue: number;
}

interface DailyProjectData {
  projectTrend: ProjectTrend[];
  days: string[];
}

interface MonthlyProjectData {
  breakdown: MonthlyProject[];
}

interface DailyProjectChartProps {
  dailyData: DailyProjectData;
  monthlyData: MonthlyProjectData;
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
];
const PLACEHOLDER_COLOR = '#f3f4f6';

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

const CustomTooltip = ({
  active,
  payload,
  projectColorMap,
}: TooltipProps<ValueType, NameType> & {
  projectColorMap: Map<string, string>;
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
    const top5Projects = payload
      .filter((p) => typeof p.value === 'number' && p.value > 0)
      .sort((a, b) => (b.value as number) - (a.value as number))
      .slice(0, 5);
    const otherProjects = payload
      .slice(5)
      .filter((p) => (p.value as number) > 0);
    const othersTotal = otherProjects.reduce(
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
          {top5Projects.map((pld, index: number) => (
            <div
              key={`${pld.name}-${index}`}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-sm shrink-0"
                  style={{
                    backgroundColor:
                      projectColorMap.get(pld.name as string) || '#ccc',
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
          {otherProjects.length > 0 && (
            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-sm shrink-0 bg-gray-400" />
                <span className="text-sm text-muted-foreground">
                  {otherProjects.length} lainnya
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

export function BillingDailyProjectBreakdown({
  dailyData,
  monthlyData,
  showAll = false,
}: DailyProjectChartProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { transformedData, renderingProjects, projectColorMap, tableData } =
    useMemo(() => {
      if (!dailyData?.projectTrend || !monthlyData?.breakdown) {
        return {
          transformedData: [],
          renderingProjects: [],
          projectColorMap: new Map(),
          tableData: [],
        };
      }

      const sortedMonthlyProjects = [...monthlyData.breakdown].sort(
        (a, b) => b.rawValue - a.rawValue
      );

      const colorMap = new Map<string, string>();
      sortedMonthlyProjects.forEach((project, index) => {
        colorMap.set(project.service, COLORS[index % COLORS.length]);
      });

      const projectsToRender = [...sortedMonthlyProjects]
        .map((p) => p.service)
        .reverse();

      const finalChartData = dailyData.days.map((day) => {
        const dailyCostsForDay = dailyData.projectTrend.reduce(
          (acc, project) => acc + (project.daily_costs[day] || 0),
          0
        );
        const isPlaceholder = dailyCostsForDay === 0;

        const chartEntry: { [key: string]: any } = {
          name: day.substring(8, 10),
          fullDate: day,
          isPlaceholder: isPlaceholder,
          placeholder: isPlaceholder ? 1 : 0,
        };

        projectsToRender.forEach((projectName) => {
          const projectData = dailyData.projectTrend.find(
            (p) => p.project === projectName
          );
          chartEntry[projectName] = projectData?.daily_costs[day] || 0;
        });
        return chartEntry;
      });

      const totalCostsPerProject = new Map<string, number>();
      dailyData.projectTrend.forEach((project) => {
        Object.values(project.daily_costs).forEach((cost) => {
          totalCostsPerProject.set(
            project.project,
            (totalCostsPerProject.get(project.project) || 0) + cost
          );
        });
      });

      let finalTableData = Array.from(totalCostsPerProject.entries())
        .map(([project, total]) => ({
          service: project,
          value: formatCurrency(total),
          color: colorMap.get(project) || '#ccc',
        }))
        .sort(
          (a, b) =>
            totalCostsPerProject.get(b.service)! -
            totalCostsPerProject.get(a.service)!
        );

      if (showAll) {
        finalTableData = finalTableData.filter((item) =>
          item.service.toLowerCase().includes(searchTerm.toLowerCase())
        );
      } else {
        finalTableData = finalTableData.slice(0, 5);
      }

      return {
        transformedData: finalChartData,
        renderingProjects: projectsToRender,
        projectColorMap: colorMap,
        tableData: finalTableData,
      };
    }, [dailyData, monthlyData, showAll, searchTerm]);

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
        <CardTitle>Laporan Billing Harian (Proyek)</CardTitle>
        <CardDescription>
          Biaya harian berdasarkan proyek untuk bulan ini
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
                content={<CustomTooltip projectColorMap={projectColorMap} />}
                cursor={{ fill: 'hsl(var(--muted))' }}
              />
              {renderingProjects.map((projectName, index) => (
                <Bar
                  key={`${projectName}-${index}`}
                  dataKey={projectName}
                  stackId="a"
                  fill={projectColorMap.get(projectName) || '#ccc'}
                  radius={
                    index === renderingProjects.length - 1
                      ? [4, 4, 0, 0]
                      : [0, 0, 0, 0]
                  }
                  isAnimationActive={false}
                />
              ))}
              <Bar
                key="placeholder-bar-project"
                dataKey="placeholder"
                stackId="a"
                fill={PLACEHOLDER_COLOR}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {showAll && (
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Cari proyek..."
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
                <TableHead>Proyek</TableHead>
                <TableHead className="text-right">
                  Total Biaya Bulan Ini
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((item, index) => (
                <TableRow key={`${item.service}-${index}`}>
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
