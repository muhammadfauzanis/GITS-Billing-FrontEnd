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

// Impor komponen-komponen baru
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Kolom Kiri */}
          <div className="flex flex-col gap-6">
            <AccountInfoCard />
            <BillingSettingsCard />
          </div>

          {/* Kolom Kanan */}
          <div className="flex flex-col gap-6">
            <ContactInfoCard />
            <PasswordCard />
          </div>
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
