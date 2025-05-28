'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, UserPlus, Building, Activity } from 'lucide-react';

const mockStats = {
  totalUsers: 45,
  totalClients: 27,
  activeUsers: 38,
  newUsersThisMonth: 8,
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClients: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStats(mockStats);
      setIsLoading(false);
    };

    loadStats();

    // COMMENT: Uncomment when API endpoints are ready
    /*
    const fetchStats = async () => {
      try {
        setIsLoading(true)

        const [usersResponse, clientsResponse] = await Promise.all([
          getUsers(),
          getClients()
        ])
        
        setStats({
          totalUsers: usersResponse.users?.length || 0,
          totalClients: clientsResponse.clients?.length || 0,
          activeUsers: usersResponse.users?.filter(u => u.isActive)?.length || 0,
          newUsersThisMonth: usersResponse.users?.filter(u => {
            const created = new Date(u.createdAt)
            const now = new Date()
            return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
          })?.length || 0,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
    */
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Kelola pengguna dan client GCP Billing Dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Semua pengguna terdaftar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">Client terdaftar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Pengguna aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New This Month
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newUsersThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Pengguna baru bulan ini
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Aksi cepat untuk admin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/admin/create-user"
              className="flex items-center gap-2 rounded-md border p-3 hover:bg-gray-50 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span>Buat Akun Pengguna Baru</span>
            </a>
            <a
              href="/admin/users"
              className="flex items-center gap-2 rounded-md border p-3 hover:bg-gray-50 transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>Kelola Pengguna</span>
            </a>
            <a
              href="/admin/clients"
              className="flex items-center gap-2 rounded-md border p-3 hover:bg-gray-50 transition-colors"
            >
              <Building className="h-4 w-4" />
              <span>Kelola Clients</span>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Aktivitas terbaru di sistem (Placeholder)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>User baru terdaftar: admin-baru@gmail.com</span>
                <span className="text-muted-foreground ml-auto">
                  2 jam lalu
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span>Client baru ditambahkan: GITS Indonesia</span>
                <span className="text-muted-foreground ml-auto">
                  5 jam lalu
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                <span>Update billing data untuk BahanaTCW</span>
                <span className="text-muted-foreground ml-auto">
                  1 hari lalu
                </span>
              </div>
              <div className="text-xs text-orange-600 mt-4 p-2 bg-orange-50 rounded">
                Note: Data ini adalah placeholder dan akan diganti dengan data
                real dari API
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
