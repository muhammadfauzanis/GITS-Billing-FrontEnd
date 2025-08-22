'use client';

import { useEffect } from 'react';
import { useAdminStore } from '@/lib/store/admin';
import { AdminStatsCards } from '@/components/admin/dashboard/AdminStatsCards';
import { UpcomingRenewals } from '@/components/admin/dashboard/UpcomingRenewals';
import { RecentInvoices } from '@/components/admin/dashboard/RecentInvoices';

export default function AdminDashboardPage() {
  const { fetchAdminDashboardData } = useAdminStore();

  useEffect(() => {
    fetchAdminDashboardData();
  }, [fetchAdminDashboardData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          An overview of your reseller operations and client activities.
        </p>
      </div>

      <AdminStatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingRenewals />
        <RecentInvoices />
      </div>
    </div>
  );
}
