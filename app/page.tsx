'use client';

import { LoginForm } from '@/components/login-form';
import { useAuth } from '@/lib/auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // useEffect(() => {
  //   if (!isLoading && user) {
  //     router.replace(user.role === 'admin' ? '/admin' : '/dashboard');
  //   }
  // }, [user, isLoading, router]);

  if (isLoading || user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            GCP Billing Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Masuk untuk melihat informasi billing GCP Anda
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
