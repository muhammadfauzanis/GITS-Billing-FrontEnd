'use client';

import { useState } from 'react';
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
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export function PasswordCard() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isFormValid = newPassword.length > 0 && confirmPassword.length > 0;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Konfirmasi password tidak cocok.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
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
    setIsSaving(false);
  };

  return (
    <Card className="flex flex-col flex-grow">
      <CardHeader>
        <CardTitle>Ganti Password</CardTitle>
        <CardDescription>
          Tombol akan aktif setelah semua kolom diisi.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow">
        <form onSubmit={handleSave} className="flex flex-col h-full">
          <div className="space-y-4 flex-grow">
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
          </div>
          <Button type="submit" disabled={!isFormValid || isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ganti Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
