'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, UserPlus } from 'lucide-react';
import { registerUser, getClients } from '@/lib/api';

interface Client {
  id: number;
  name: string;
}

export default function CreateUserPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
    clientId: '',
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoadingClients(true);
        const response = await getClients();
        setClients(response.clients || []);
      } catch (error: any) {
        console.error('Error fetching clients:', error);
        setMessage({
          type: 'error',
          text: error.message || 'Gagal memuat daftar client',
        });
      } finally {
        setIsLoadingClients(false);
      }
    };

    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        ...(formData.role === 'client' && {
          clientId: formData.clientId,
        }),
      };
      

      await registerUser(userData);

      setMessage({ type: 'success', text: 'Akun berhasil dibuat!' });
      setFormData({ email: '', password: '', role: '', clientId: '' });
    } catch (error: any) {
      console.error('Registration error:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Gagal membuat akun',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'role' && value === 'admin' && { clientId: '' }),
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Buat Akun Pengguna
        </h1>
        <p className="text-muted-foreground">
          Buat akun baru untuk admin atau client
        </p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Form Registrasi Pengguna
            </CardTitle>
            <CardDescription>
              Isi form di bawah untuk membuat akun pengguna baru
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
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange('password', e.target.value)
                    }
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role pengguna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role === 'client' && (
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client *</Label>
                  {isLoadingClients ? (
                    <div className="flex items-center justify-center p-4 border rounded-md">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                      <span className="ml-2 text-sm text-gray-600">
                        Memuat clients...
                      </span>
                    </div>
                  ) : (
                    <Select
                      value={formData.clientId}
                      onValueChange={(value) =>
                        handleInputChange('clientId', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem
                            key={client.id}
                            value={client.id.toString()}
                          >
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || isLoadingClients}
                >
                  {isLoading ? 'Membuat Akun...' : 'Buat Akun'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Informasi</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              • <strong>Admin:</strong> Dapat mengakses panel admin dan
              mengelola semua pengguna
            </p>
            <p>
              • <strong>Client:</strong> Hanya dapat mengakses dashboard billing
              untuk client yang ditentukan
            </p>
            <p>• Password minimal 6 karakter</p>
            <p>• Email harus unik dan belum terdaftar</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
