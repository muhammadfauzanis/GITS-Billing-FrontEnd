'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { useDashboardStore } from '@/lib/store';

export function AccountInfoCard() {
  const { user } = useAuth();
  const { clientName, loading } = useDashboardStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Akun</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user?.email || ''} disabled />
        </div>
        <div className="space-y-2">
          <Label>Client</Label>
          <Input
            value={
              clientName || (loading.dashboard ? 'Memuat...' : 'Tidak ada')
            }
            disabled
          />
        </div>
      </CardContent>
    </Card>
  );
}
