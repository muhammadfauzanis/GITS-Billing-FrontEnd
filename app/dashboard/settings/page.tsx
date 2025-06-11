// app/dashboard/settings/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { getBudget, getClientName, setBudget } from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const { user, session } = useAuth();
  const [clientName, setClientName] = useState('');
  const [isSavingBudget, setIsSavingBudget] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetThreshold, setBudgetThreshold] = useState('');
  const [initialBudget, setInitialBudget] = useState({
    budgetValue: '',
    budgetThreshold: '',
  });
  const [hasBudgetChanges, setHasBudgetChanges] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [clientNameResponse, budgetResponse] = await Promise.all([
          getClientName(),
          getBudget(),
        ]);

        setClientName(clientNameResponse.name);
        setBudgetAmount(String(budgetResponse.budgetValue));
        setBudgetThreshold(String(budgetResponse.budgetThreshold));

        setInitialBudget({
          budgetValue: String(budgetResponse.budgetValue),
          budgetThreshold: String(budgetResponse.budgetThreshold),
        });
      } catch (err: any) {
        console.error('Error fetching settings data:', err);
        setError(err.message || 'Gagal memuat data pengaturan');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchSettingsData();
    }
  }, [user]);

  const handleSaveChanges = async () => {
    try {
      setIsSavingBudget(true);

      const payload: { budget_value?: number; budget_threshold?: number } = {};
      if (budgetAmount !== initialBudget.budgetValue) {
        payload.budget_value = Number(budgetAmount);
      }
      if (budgetThreshold !== initialBudget.budgetThreshold) {
        payload.budget_threshold = Number(budgetThreshold);
      }

      if (Object.keys(payload).length === 0) {
        console.log('Tidak ada perubahan budget. Skip update ke server.');
        setHasBudgetChanges(false);
        setIsEditingBudget(false);
        return;
      }

      await setBudget(payload);

      setInitialBudget({
        budgetValue: budgetAmount,
        budgetThreshold: budgetThreshold,
      });

      setHasBudgetChanges(false);
      setIsEditingBudget(false);
    } catch (err: any) {
      console.error('Error saving budget:', err);
      setError(err.message || 'Gagal menyimpan pengaturan budget');
    } finally {
      setIsSavingBudget(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setPasswordMessage(null);

    if (!newPassword || !confirmNewPassword) {
      setPasswordMessage({
        type: 'error',
        text: 'Semua field password harus diisi.',
      });
      setIsChangingPassword(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({
        type: 'error',
        text: 'Konfirmasi password baru tidak cocok.',
      });
      setIsChangingPassword(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({
        type: 'error',
        text: 'Password baru minimal 6 karakter.',
      });
      setIsChangingPassword(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      const { error: updateProfileError } = await supabase
        .from('users') // Your public.users table
        .update({ is_password_set: true })
        .eq('email', user?.email || session?.user.email); // Link to public.users table by email

      if (updateProfileError) {
        console.error(
          'Error updating profile is_password_set after password change:',
          updateProfileError
        );
      }

      setPasswordMessage({
        type: 'success',
        text: 'Password berhasil diganti!',
      });
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      console.error('Error changing password:', err);
      setPasswordMessage({
        type: 'error',
        text:
          err.message ||
          'Gagal mengganti password. Pastikan password baru memenuhi kriteria.',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">
          Kelola pengaturan akun dan preferensi notifikasi
        </p>
      </div>

      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Akun</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Akun</CardTitle>
              <CardDescription>Perbarui informasi akun Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue={user?.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-name">Client Name</Label>
                  <Input id="client-name" defaultValue={clientName} disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ganti Password</CardTitle>
              <CardDescription>Ubah password akun Anda.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                {passwordMessage && (
                  <Alert
                    variant={
                      passwordMessage.type === 'error'
                        ? 'destructive'
                        : 'default'
                    }
                  >
                    {passwordMessage.type === 'error' ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <AlertTitle>
                      {passwordMessage.type === 'error' ? 'Error' : 'Berhasil'}
                    </AlertTitle>
                    <AlertDescription>{passwordMessage.text}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password Baru</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isChangingPassword}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password">
                    Konfirmasi Password Baru
                  </Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isChangingPassword}
                  />
                </div>
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword
                    ? 'Mengganti Password...'
                    : 'Ganti Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Billing</CardTitle>
              <CardDescription>
                Kelola pengaturan billing dan budget
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="budget-budgetValue">
                    Budget Bulanan (Rp)
                  </Label>
                  <Input
                    id="budget-budgetValue"
                    value={budgetAmount}
                    disabled={!isEditingBudget}
                    onChange={(e) => {
                      const value = e.target.value;
                      setBudgetAmount(value);
                      setHasBudgetChanges(
                        value !== initialBudget.budgetValue ||
                          budgetThreshold !== initialBudget.budgetThreshold
                      );
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget-budgetThreshold">
                    Ambang Peringatan (%)
                  </Label>
                  <Input
                    id="budget-budgetThreshold"
                    value={budgetThreshold}
                    disabled={!isEditingBudget}
                    onChange={(e) => {
                      const value = e.target.value;
                      setBudgetThreshold(value);
                      setHasBudgetChanges(
                        value !== initialBudget.budgetThreshold ||
                          budgetAmount !== initialBudget.budgetValue
                      );
                    }}
                  />
                </div>
              </div>
              <Button
                onClick={
                  isEditingBudget
                    ? hasBudgetChanges
                      ? handleSaveChanges
                      : undefined
                    : () => setIsEditingBudget(true)
                }
                disabled={
                  isSavingBudget || (isEditingBudget && !hasBudgetChanges)
                }
              >
                {isSavingBudget
                  ? 'Menyimpan...'
                  : isEditingBudget
                  ? hasBudgetChanges
                    ? 'Simpan Perubahan'
                    : 'Simpan Perubahan'
                  : 'Edit Budget'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
