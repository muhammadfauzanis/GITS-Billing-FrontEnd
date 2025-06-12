'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useDashboardStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const { user } = useAuth();
  const { fetchSettingsData, settingsData, loading, updateBudget, clientName } =
    useDashboardStore();

  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetThreshold, setBudgetThreshold] = useState('');
  const [initialBudget, setInitialBudget] = useState({
    budgetValue: '',
    budgetThreshold: '',
  });
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    fetchSettingsData();
  }, [fetchSettingsData]);

  useEffect(() => {
    if (settingsData) {
      const initialValues = {
        budgetValue: String(settingsData.budgetValue || ''),
        budgetThreshold: String(settingsData.budgetThreshold || ''),
      };
      setBudgetAmount(initialValues.budgetValue);
      setBudgetThreshold(initialValues.budgetThreshold);
      setInitialBudget(initialValues);
    }
  }, [settingsData]);

  const handleBudgetSave = async () => {
    setIsSavingBudget(true);
    await updateBudget({
      budget_value: Number(budgetAmount),
      budget_threshold: Number(budgetThreshold),
    });
    setInitialBudget({
      budgetValue: budgetAmount,
      budgetThreshold: budgetThreshold,
    });
    toast({
      title: 'Sukses',
      description: 'Pengaturan budget berhasil disimpan.',
    });
    setIsSavingBudget(false);
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Konfirmasi password tidak cocok.',
        variant: 'destructive',
      });
      return;
    }
    setIsSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Sukses', description: 'Password berhasil diubah.' });
      setNewPassword('');
      setConfirmPassword('');
    }
    setIsSavingPassword(false);
  };

  const isBudgetDirty =
    initialBudget.budgetValue !== budgetAmount ||
    initialBudget.budgetThreshold !== budgetThreshold;
  const isPasswordFormValid =
    newPassword.length > 0 && confirmPassword.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">
          Kelola pengaturan akun dan preferensi notifikasi
        </p>
      </div>

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

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan Billing</CardTitle>
            <CardDescription>
              Tombol simpan akan aktif jika ada perubahan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading.settings ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="budget-amount">Budget Bulanan (Rp)</Label>
                  <Input
                    id="budget-amount"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget-threshold">
                    Ambang Peringatan (%)
                  </Label>
                  <Input
                    id="budget-threshold"
                    value={budgetThreshold}
                    onChange={(e) => setBudgetThreshold(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleBudgetSave}
                  disabled={!isBudgetDirty || isSavingBudget}
                >
                  {isSavingBudget && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Simpan Budget
                </Button>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ganti Password</CardTitle>
            <CardDescription>
              Tombol akan aktif setelah semua kolom diisi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Password Baru</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                disabled={!isPasswordFormValid || isSavingPassword}
              >
                {isSavingPassword && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Ganti Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
