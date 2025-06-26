'use client';

import { Loader2 } from 'lucide-react';

export default function ContinuePage() {
  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
      <span className="text-muted-foreground">Mempersiapkan akun Anda...</span>
    </div>
  );
}
