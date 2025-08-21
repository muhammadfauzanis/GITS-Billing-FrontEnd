// app/admin/page.tsx
'use client';

import { useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, UserPlus, Building, Activity, Loader2 } from 'lucide-react';
import { useAdminStore } from '@/lib/store/admin/index';
import Link from 'next/link';

export default function AdminDashboard() {
  const { stats, loading, fetchStats } = useAdminStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Kelola pengguna dan client GCP Billing Dashboard
        </p>
      </div>

      {loading.stats ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Clients
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/admin/create-user"
              className="flex items-center gap-2 rounded-md border p-3 hover:bg-gray-50 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span>Buat Akun Pengguna Baru</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-2 rounded-md border p-3 hover:bg-gray-50 transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>Kelola Pengguna</span>
            </Link>
            <Link
              href="/admin/clients"
              className="flex items-center gap-2 rounded-md border p-3 hover:bg-gray-50 transition-colors"
            >
              <Building className="h-4 w-4" />
              <span>Kelola Clients</span>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Aktivitas terbaru (Placeholder)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Fitur ini akan diimplementasikan.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
