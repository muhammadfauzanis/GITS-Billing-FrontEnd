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

export default function SettingsPage() {
  const { user } = useAuth();
  const [clientName, setClientName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetThreshold, setBudgetThreshold] = useState('');
  const [initialBudget, setInitialBudget] = useState({
    budgetValue: '',
    budgetThreshold: '',
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
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
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Gagal memuat data dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);

      const payload: { budget_value?: number; budget_threshold?: number } = {};
      if (budgetAmount !== initialBudget.budgetValue) {
        payload.budget_value = Number(budgetAmount);
      }
      if (budgetThreshold !== initialBudget.budgetThreshold) {
        payload.budget_threshold = Number(budgetThreshold);
      }

      if (Object.keys(payload).length === 0) {
        console.log('Tidak ada perubahan. Skip update ke server.');
        return;
      }

      await setBudget(payload);

      setInitialBudget({
        budgetValue: budgetAmount,
        budgetThreshold: budgetThreshold,
      });

      setHasChanges(false);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error saving budget:', err);
      setError(err.message || 'Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

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
                    disabled={!isEditing}
                    onChange={(e) => {
                      const value = e.target.value;
                      setBudgetAmount(value);
                      setHasChanges(
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
                    disabled={!isEditing}
                    onChange={(e) => {
                      const value = e.target.value;
                      setBudgetThreshold(value);
                      setHasChanges(
                        value !== initialBudget.budgetThreshold ||
                          budgetAmount !== initialBudget.budgetValue
                      );
                    }}
                  />
                </div>
              </div>
              <Button
                onClick={
                  isEditing
                    ? hasChanges
                      ? handleSaveChanges
                      : undefined
                    : () => setIsEditing(true)
                }
                disabled={isSaving || (isEditing && !hasChanges)}
              >
                {isSaving
                  ? 'Menyimpan...'
                  : isEditing
                  ? hasChanges
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
