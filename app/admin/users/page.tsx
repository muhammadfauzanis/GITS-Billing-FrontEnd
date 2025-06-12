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
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
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
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { useAdminStore, type User } from '@/lib/adminStore';

export default function UsersPage() {
  const {
    users,
    clients,
    loading,
    error,
    fetchUsers,
    fetchClients,
    deleteUser,
    updateUserClient,
  } = useAdminStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedClientId, setSelectedClientId] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchClients();
  }, [fetchUsers, fetchClients]);

  const filteredUsers = users.filter((user) =>
    [user.email, user.role, user.client, user.status].some((field) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleDelete = async (userId: number) => {
    await deleteUser(userId);
    toast({ title: 'Berhasil!', description: 'Pengguna berhasil dihapus.' });
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    const client = clients.find((c) => c.name === user.client);
    setSelectedClientId(client ? client.id.toString() : '');
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser || !selectedClientId) {
      toast({
        title: 'Gagal!',
        description: 'Client ID belum dipilih.',
        variant: 'destructive',
      });
      return;
    }
    await updateUserClient(selectedUser.id, Number(selectedClientId));
    setIsEditOpen(false);
    toast({
      title: 'Berhasil!',
      description: 'Client ID pengguna berhasil diperbarui.',
    });
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
        <Button asChild>
          <Link href="/admin/create-user">
            <UserPlus className="mr-2 h-4 w-4" /> Buat User Baru
          </Link>
        </Button>
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
          {loading.users ? (
            <div className="text-center p-10">
              <Loader2 className="animate-spin h-8 w-8" />
            </div>
          ) : (
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
                            onClick={() => handleEditClick(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Konfirmasi Hapus
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Yakin ingin menghapus pengguna "{user.email}"?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(user.id)}
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
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit Client ID untuk {selectedUser?.email}
            </DialogTitle>
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
