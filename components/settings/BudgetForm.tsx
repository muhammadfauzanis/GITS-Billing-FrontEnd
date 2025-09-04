'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { useDashboardStore } from '@/lib/store';
import { toast } from '@/components/ui/use-toast';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';

export function BudgetForm({ onClose }: { onClose: () => void }) {
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
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveThreshold(index)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
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
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveEmail(index)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
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
