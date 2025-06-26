'use client';

import type React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { useAuth } from '@/lib/auth';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);
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
          <DashboardSidebar />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    );
  }

  return null;
}
