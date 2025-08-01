'use client';

import type React from 'react';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { useAuth } from '@/lib/auth';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useDashboardStore } from '@/lib/store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const { fetchNotifications } = useDashboardStore(); // Get the action

  useEffect(() => {
    if (user) {
      const intervalId = setInterval(() => {
        fetchNotifications();
      }, 30000);

      return () => clearInterval(intervalId);
    }
  }, [user, fetchNotifications]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">
          Memverifikasi sesi...
        </span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <DashboardHeader />
        <div className="flex flex-1">
          {/* Hapus div pembungkus dari sini */}
          <DashboardSidebar className="hidden md:flex" />
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    );
  }

  return null;
}
