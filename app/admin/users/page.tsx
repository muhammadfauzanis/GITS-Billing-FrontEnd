'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import {
  getUsers,
  deleteUser,
  getClients,
  updateUserClientId,
} from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'; // Import AlertDialog components
import { useToast } from '@/hooks/use-toast'; // Import useToast hook

interface User {
  id: number;
  email: string;
  role: string;
  client: string;
  status: string;
  createdAt: string;
}

interface Client {
  id: number;
  name: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const { toast } = useToast(); // Initialize useToast hook

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getUsers();
      setUsers(res.users || []);
    } catch (error: any) {
      setError(error.message || 'Gagal memuat data pengguna');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async () => {
    const res = await getClients();
    setClients(res.clients || []);
  };

  useEffect(() => {
    fetchUsers();
    fetchClients();
  }, []);

  const filteredUsers = users.filter((user) =>
    [user.email, user.role, user.client, user.status].some((field) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleDeleteUser = async (userId: number) => {
    setIsDeleting(userId);
    try {
      await deleteUser(userId);
      setUsers(users.filter((u) => u.id !== userId));
      toast({
        // Tampilkan toast sukses
        title: 'Berhasil!',
        description: 'Pengguna berhasil dihapus.',
      });
    } catch (error: any) {
      toast({
        // Tampilkan toast error
        title: 'Gagal!',
        description: error.message || 'Gagal menghapus pengguna.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditClick = (id: number) => {
    setSelectedUserId(id);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUserId || !selectedClientId) {
      toast({
        title: 'Gagal!',
        description: 'Client ID belum dipilih.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await updateUserClientId(selectedUserId, Number(selectedClientId));
      await fetchUsers();
      setIsEditOpen(false);
      toast({
        title: 'Berhasil!',
        description: 'Client ID pengguna berhasil diperbarui.',
      });
    } catch (error: any) {
      toast({
        title: 'Gagal!',
        description: error.message || 'Gagal memperbarui Client ID pengguna.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelola Pengguna</h1>
          <p className="text-muted-foreground">
            Kelola semua pengguna dalam sistem
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchUsers}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button asChild>
            <Link href="/admin/create-user">
              <UserPlus className="mr-2 h-4 w-4" /> Buat User Baru
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
          <CardDescription>
            Total {users.length} pengguna terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="search"
            placeholder="Cari pengguna..."
            className="mb-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === 'admin' ? 'destructive' : 'secondary'
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.client || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === 'Aktif' ? 'default' : 'secondary'
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(user.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          {' '}
                          {/* AlertDialog Trigger */}
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isDeleting === user.id}
                            >
                              {isDeleting === user.id ? (
                                <div className="animate-spin h-4 w-4 border-b-2 border-gray-900 rounded-full"></div>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Konfirmasi Hapus Pengguna
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus pengguna "
                                {user.email}"? Tindakan ini tidak dapat
                                dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client ID</DialogTitle>
          </DialogHeader>
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id.toString()}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-end mt-4">
            <Button onClick={handleSaveEdit}>Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
