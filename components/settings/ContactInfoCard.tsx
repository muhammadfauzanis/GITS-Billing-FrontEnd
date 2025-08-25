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
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardStore } from '@/lib/store';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Edit, Save, X } from 'lucide-react';

export function ContactInfoCard() {
  const { userProfile, loading, updateUserProfile } = useDashboardStore();

  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappError, setWhatsappError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setWhatsappNumber(userProfile?.whatsapp_number || '');
  }, [userProfile]);

  const handleSave = async () => {
    setWhatsappError('');
    let sanitizedNumber = whatsappNumber.replace(/[\s-()]/g, '');

    if (sanitizedNumber.startsWith('+')) {
      sanitizedNumber = sanitizedNumber.substring(1);
    }
    if (sanitizedNumber.startsWith('08')) {
      sanitizedNumber = '62' + sanitizedNumber.substring(1);
    }

    const phoneRegex = /^628\d{8,12}$/;
    if (sanitizedNumber && !phoneRegex.test(sanitizedNumber)) {
      setWhatsappError(
        'Format nomor tidak valid. Awali dengan 08, 628, atau +628.'
      );
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile(sanitizedNumber || null);
      toast({ description: 'Nomor WhatsApp berhasil diperbarui.' });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: 'Gagal Menyimpan',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile(null);
      toast({ description: 'Nomor WhatsApp berhasil dihapus.' });
      setWhatsappNumber('');
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: 'Gagal Menghapus',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Kontak</CardTitle>
        <CardDescription>
          Nomor WhatsApp untuk notifikasi penting.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading.userProfile ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <div className="space-y-2">
            <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
            <div className="flex items-center gap-2">
              <Input
                id="whatsapp"
                placeholder="e.g., 081234567890"
                value={whatsappNumber}
                onChange={(e) => {
                  setWhatsappNumber(e.target.value);
                  if (whatsappError) setWhatsappError('');
                }}
                disabled={!isEditing || isSaving}
              />
              {isEditing ? (
                <div className="flex gap-1">
                  <Button size="icon" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
            {whatsappError && (
              <p className="text-sm text-destructive mt-2">{whatsappError}</p>
            )}
          </div>
        )}
      </CardContent>
      {isEditing && (
        <CardFooter>
          <Button
            variant="link"
            className="text-red-600 p-0 h-auto"
            onClick={handleDelete}
            disabled={isSaving}
          >
            Hapus Nomor
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
