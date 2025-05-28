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
    if (!confirm('Hapus pengguna ini?')) return;
    try {
      setIsDeleting(userId);
      await deleteUser(userId);
      setUsers(users.filter((u) => u.id !== userId));
    } catch (error: any) {
      alert(`Gagal menghapus user: ${error.message}`);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditClick = (id: number) => {
    setSelectedUserId(id);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUserId || !selectedClientId) return;
    await updateUserClientId(selectedUserId, Number(selectedClientId));
    await fetchUsers();
    setIsEditOpen(false);
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          {isDeleting === user.id ? (
                            <div className="animate-spin h-4 w-4 border-b-2 border-gray-900 rounded-full"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
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
