'use client';

import React, { Suspense } from 'react';
import { SetPasswordForm } from '@/components/set-password-form';

export default function SetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <Suspense fallback={<div>Memuat form password...</div>}>
          <SetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
