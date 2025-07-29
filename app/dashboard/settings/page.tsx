'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useDashboardStore } from '@/lib/store';
import { Loader2, AlertCircle, Trash2, PlusCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';

// Helper to format currency
const formatCurrency = (value: number) => {
  return `Rp ${value.toLocaleString('id-ID')}`;
};

// The main form component inside the dialog
function BudgetForm({ onClose }: { onClose: () => void }) {
  const { settingsData, updateBudget } = useDashboardStore();

  const [budgetValue, setBudgetValue] = useState<string>(
    settingsData?.budget_value?.toString() || ''
  );
  const [thresholds, setThresholds] = useState<number[]>(
    settingsData?.alertThresholds || [80]
  );
  const [emails, setEmails] = useState<string[]>(
    settingsData?.alertEmails || ['']
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleAddThreshold = () => setThresholds([...thresholds, 0]);
  const handleRemoveThreshold = (index: number) =>
    setThresholds(thresholds.filter((_, i) => i !== index));
  const handleThresholdChange = (index: number, value: string) => {
    const newThresholds = [...thresholds];
    newThresholds[index] = Number(value);
    setThresholds(newThresholds);
  };

  const handleAddEmail = () => setEmails([...emails, '']);
  const handleRemoveEmail = (index: number) =>
    setEmails(emails.filter((_, i) => i !== index));
  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateBudget({
        budget_value: Number(budgetValue),
        alertThresholds: thresholds.filter((t) => t > 0), // Filter out empty/zero values
        alertEmails: emails.filter((e) => e.trim() !== ''), // Filter out empty emails
      });
      toast({
        title: 'Sukses',
        description: 'Pengaturan budget berhasil disimpan.',
      });
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-4 p-6">
        <div className="space-y-2">
          <Label htmlFor="budget-amount">Budget Bulanan (Rp)</Label>
          <Input
            id="budget-amount"
            type="number"
            placeholder="e.g., 5000000"
            value={budgetValue}
            onChange={(e) => setBudgetValue(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Ambang Peringatan (%)</Label>
          {thresholds.map((threshold, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="e.g., 80"
                value={threshold || ''}
                onChange={(e) => handleThresholdChange(index, e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveThreshold(index)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddThreshold}
            className="gap-1"
          >
            <PlusCircle className="h-4 w-4" /> Tambah Ambang Batas
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Email Penerima Peringatan</Label>
          {emails.map((email, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => handleEmailChange(index, e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveEmail(index)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddEmail}
            className="gap-1"
          >
            <PlusCircle className="h-4 w-4" /> Tambah Email
          </Button>
        </div>
      </div>
      <DialogFooter className="p-6 pt-0">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Budget
        </Button>
      </DialogFooter>
    </>
  );
}

// The main page component
export default function SettingsPage() {
  const { user } = useAuth();
  const { fetchSettingsData, settingsData, loading, clientName } =
    useDashboardStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    fetchSettingsData();
  }, [fetchSettingsData]);

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

  const isPasswordFormValid =
    newPassword.length > 0 && confirmPassword.length > 0;
  const budgetExists = settingsData && settingsData.budget_value > 0;

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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Billing</CardTitle>
              <CardDescription>
                Atur budget bulanan dan peringatan email.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
