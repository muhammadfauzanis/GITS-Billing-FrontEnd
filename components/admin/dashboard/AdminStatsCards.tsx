'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, AlertTriangle, Clock } from 'lucide-react';
import { useAdminStore } from '@/lib/store/admin';
import { Skeleton } from '@/components/ui/skeleton';

const StatCard = ({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export function AdminStatsCards() {
  const { dashboardStats, loading } = useAdminStore();

  if (loading.dashboard || !dashboardStats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Clients"
        value={dashboardStats.totalClients}
        icon={Users}
      />
      <StatCard
        title="Active Contracts"
        value={dashboardStats.totalActiveContracts}
        icon={FileText}
      />
      <StatCard
        title="Expiring Soon (30d)"
        value={dashboardStats.expiringSoonContracts}
        icon={AlertTriangle}
      />
      <StatCard
        title="Pending & Overdue"
        value={
          dashboardStats.pendingInvoicesCount +
          dashboardStats.overdueInvoicesCount
        }
        icon={Clock}
      />
    </div>
  );
}
