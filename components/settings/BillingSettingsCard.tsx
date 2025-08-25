'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@/components/ui/dialog';
import { useDashboardStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';

const formatCurrency = (value: number) => {
  return `Rp ${value.toLocaleString('id-ID')}`;
};

export function BillingSettingsCard() {
  const { settingsData, loading } = useDashboardStore();
  const budgetExists = settingsData && settingsData.budget_value > 0;

  return (
    <Card className="flex flex-col flex-grow">
      <CardHeader>
        <CardTitle>Pengaturan Billing</CardTitle>
        <CardDescription>
          Atur budget bulanan dan peringatan email.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {loading.settings ? (
          <div className="flex justify-center items-center h-24">
            <Loader2 className="animate-spin" />
          </div>
        ) : budgetExists ? (
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">
                Budget Bulanan
              </Label>
              <p className="font-semibold text-lg">
                {formatCurrency(settingsData.budget_value)}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Ambang Peringatan
              </Label>
              <p>{settingsData.alertThresholds.join('%, ')}%</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Email Penerima
              </Label>
              <ul className="list-disc list-inside">
                {settingsData.alertEmails.map((email) => (
                  <li key={email}>{email}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Belum ada budget yang diatur.
          </p>
        )}
      </CardContent>
      <CardFooter>
        <DialogTrigger asChild>
          <Button>{budgetExists ? 'Ubah Budget' : 'Buat Budget'}</Button>
        </DialogTrigger>
      </CardFooter>
    </Card>
  );
}
