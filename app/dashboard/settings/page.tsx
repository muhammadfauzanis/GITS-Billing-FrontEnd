'use client';

import { useEffect, useState } from 'react';
import { useDashboardStore } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { AccountInfoCard } from '@/components/settings/AccountInfoCard';
import { ContactInfoCard } from '@/components/settings/ContactInfoCard';
import { BillingSettingsCard } from '@/components/settings/BillingSettingsCard';
import { PasswordCard } from '@/components/settings/PasswordCard';
import { BudgetForm } from '@/components/settings/BudgetForm';

export default function SettingsPage() {
  const { fetchSettingsData, fetchUserProfile, settingsData } =
    useDashboardStore();
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchSettingsData();
    fetchUserProfile();
  }, [fetchSettingsData, fetchUserProfile]);

  const budgetExists = settingsData && settingsData.budget_value > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">
          Kelola pengaturan akun dan preferensi notifikasi
        </p>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        {/* Struktur grid 2x2 sederhana, tanpa div pembungkus kolom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AccountInfoCard />
          <ContactInfoCard />
          <BillingSettingsCard />
          <PasswordCard />
        </div>

        <DialogContent className="sm:max-w-[480px] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>
              {budgetExists ? 'Ubah' : 'Buat'} Pengaturan Budget
            </DialogTitle>
            <DialogDescription>
              Tentukan budget dan atur peringatan untuk mengontrol pengeluaran.
            </DialogDescription>
          </DialogHeader>
          <BudgetForm onClose={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
