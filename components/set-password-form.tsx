'use client';

import React, { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { updateUserPasswordStatus } from '@/lib/api'; // <-- Import fungsi baru

export function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPasswordValue] = useState('');
  const [repassword, setRepassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    const emailFromParams = searchParams.get('email');
    if (emailFromParams) {
      setEmail(emailFromParams);
    } else if (user?.email) {
      setEmail(user.email);
    }
  }, [searchParams, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (password !== repassword) {
      setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok.' });
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password minimal 6 karakter.' });
      setIsLoading(false);
      return;
    }

    try {
      // 1. Update password di Supabase Auth
      const { error } = await supabase.auth.updateUser({ password: password });
      if (error) throw error;

      if (!user) {
        throw new Error('User session not found, cannot update status.');
      }

      await updateUserPasswordStatus(user.id);

      setMessage({
        type: 'success',
        text: 'Password berhasil disetel! Anda akan diarahkan secara otomatis.',
      });

      // 3. Panggil router.refresh() untuk memicu middleware
      router.refresh();
    } catch (error: any) {
      console.error('Error setting password:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Gagal mengatur password.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atur Password Baru</CardTitle>
        <CardDescription>
          Halo {email || 'Pengguna'}! Silakan atur password baru Anda untuk
          melanjutkan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <Alert
              variant={message.type === 'error' ? 'destructive' : 'default'}
            >
              {message.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {message.type === 'error' ? 'Error' : 'Berhasil'}
              </AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="new-password">Password Baru</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPasswordValue(e.target.value)}
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
            <Input
              id="confirm-password"
              type="password"
              value={repassword}
              onChange={(e) => setRepassword(e.target.value)}
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Menyimpan Password...' : 'Atur Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Komponen default tidak perlu diubah
export default function SetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <Suspense fallback={<div>Memuat form password...</div>}>
          <SetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
