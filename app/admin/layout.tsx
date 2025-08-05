'use client';

import type React from 'react';
import { AdminSidebar } from '@/components/admin-sidebar';
import { AdminHeader } from '@/components/admin-header';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useDashboardStore } from '@/lib/store';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // useEffect(() => {
  //   if (!isLoading) {
  //     if (!user) {
  //       router.push('/');
  //     } else if (user.role !== 'admin') {
  //       router.push('/dashboard');
  //     }
  //   }
  // }, [user, isLoading, router]);

  // const { fetchNotifications } = useDashboardStore();

  // useEffect(() => {
  //   if (user) {
  //     const intervalId = setInterval(() => {
  //       fetchNotifications();
  //     }, 30000);

  //     return () => clearInterval(intervalId);
  //   }
  // }, [user, fetchNotifications]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">
          Memverifikasi sesi admin...
        </span>
      </div>
    );
  }

  if (user && user.role === 'admin') {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <AdminHeader />
        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    );
  }
  return null;
}
