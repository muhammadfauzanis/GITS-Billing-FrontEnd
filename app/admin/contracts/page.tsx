'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
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
import { Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useAdminStore,
  Contract,
  ContractFormState,
  ContractStatus,
} from '@/lib/adminStore';
import { getContractStatus } from '@/lib/utils';
import { ContractDialog } from '@/components/admin/contracts/ContractDialog';
import { ContractStatsCards } from '@/components/admin/contracts/ContractStatsCards';
import { ContractsTable } from '@/components/admin/contracts/ContractsTable';
import { getContractDetails } from '@/lib/api/admin';

export default function ContractsPage() {
  const { toast } = useToast();
  const {
    contracts,
    clients,
    fetchContracts,
    fetchClients,
    addContract,
    editContract,
    removeContract,
    loading,
  } = useAdminStore();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingContractId, setEditingContractId] = useState<string | null>(
    null
  );
  const [editingContractDetails, setEditingContractDetails] =
    useState<ContractFormState | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [deletingContractId, setDeletingContractId] = useState<string | null>(
    null
  );
  const [filterStatus, setFilterStatus] = useState<ContractStatus>('all');

  const [filterDate, setFilterDate] = useState({
    month: 'all',
    year: new Date().getFullYear().toString(),
  });

  useEffect(() => {
    fetchClients();
    const monthToSend =
      filterDate.month === 'all' ? null : Number(filterDate.month);
    const yearToSend =
      filterDate.month === 'all' ? null : Number(filterDate.year);
    fetchContracts(monthToSend, yearToSend);
  }, [fetchClients, fetchContracts, filterDate]);

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: (i + 1).toString(),
        label: new Date(0, i).toLocaleString('id-ID', { month: 'long' }),
      })),
    []
  );

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 4 }, (_, i) => ({
      value: String(currentYear - 1 + i),
      label: String(currentYear - 1 + i),
    }));
  }, []);

  const filteredContracts = useMemo(() => {
    if (filterStatus === 'all') return contracts;
    return contracts.filter(
      (c) => getContractStatus(c.end_date) === filterStatus
    );
  }, [contracts, filterStatus]);

  const refetchContractsWithFilter = async () => {
    const monthToSend =
      filterDate.month === 'all' ? null : Number(filterDate.month);
    const yearToSend =
      filterDate.month === 'all' ? null : Number(filterDate.year);
    await fetchContracts(monthToSend, yearToSend);
  };

  const handleAddSubmit = async (formData: ContractFormState) => {
    try {
      await addContract(formData);
      toast({
        title: 'Success',
        description: 'New contract has been uploaded.',
      });
      setIsAddDialogOpen(false);
      await refetchContractsWithFilter();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEditSubmit = async (formData: ContractFormState) => {
    if (!editingContractId) return;
    try {
      await editContract(editingContractId.toString(), formData);
      toast({ title: 'Success', description: 'Contract has been updated.' });
      setIsEditDialogOpen(false);
      setEditingContractId(null);
      setEditingContractDetails(null);
      await refetchContractsWithFilter();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingContractId(id);
    try {
      await removeContract(id);
      toast({ title: 'Success', description: 'Contract has been deleted.' });
      await refetchContractsWithFilter();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeletingContractId(null);
    }
  };

  const openEditDialog = async (contract: Contract) => {
    setIsFetchingDetails(true);
    setIsEditDialogOpen(true);
    setEditingContractId(contract.id);

    try {
      const details = await getContractDetails(contract.id);
      setEditingContractDetails({
        clientId: details.client_id,
        clientName: details.client_name,
        startDate: new Date(details.start_date).toISOString().split('T')[0],
        endDate: new Date(details.end_date).toISOString().split('T')[0],
        notes: details.notes || '',
        file: null,
        clientEmails:
          details.client_contact_emails?.length > 0
            ? details.client_contact_emails
            : [''],
      });
    } catch (error: any) {
      toast({
        title: 'Gagal Memuat Detail',
        description: error.message,
        variant: 'destructive',
      });
      setIsEditDialogOpen(false);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  if (loading.contracts && contracts.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Contract Management
        </h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" /> Upload Contract
        </Button>
      </div>

      <ContractStatsCards contracts={contracts} />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>All Contracts</CardTitle>
              <CardDescription>
                A list of all client contracts and their status.
              </CardDescription>
            </div>
            {/* --- BAGIAN FILTER BULAN DAN TAHUN --- */}
            <div className="flex items-center space-x-2">
              <Select
                value={filterDate.month}
                onValueChange={(value) =>
                  setFilterDate((prev) => ({ ...prev, month: value }))
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Pilih Bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Bulan</SelectItem>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filterDate.year}
                onValueChange={(value) =>
                  setFilterDate((prev) => ({ ...prev, year: value }))
                }
                disabled={filterDate.month === 'all'}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y.value} value={y.value}>
                      {y.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              All ({filteredContracts.length})
            </Button>
            <Button
              variant={filterStatus === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('active')}
            >
              Active
            </Button>
            <Button
              variant={filterStatus === 'expiring_soon' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('expiring_soon')}
            >
              Expiring
            </Button>
            <Button
              variant={filterStatus === 'expired' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('expired')}
            >
              Expired
            </Button>
          </div>
          <ContractsTable
            contracts={filteredContracts}
            onEdit={openEditDialog}
            onDelete={handleDelete}
            deletingContractId={deletingContractId}
          />
        </CardContent>
      </Card>

      <ContractDialog
        mode="add"
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddSubmit}
        clients={clients}
      />
      <ContractDialog
        mode="edit"
        isOpen={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingContractDetails(null);
            setEditingContractId(null);
          }
        }}
        onSubmit={handleEditSubmit}
        initialData={isFetchingDetails ? null : editingContractDetails}
        clients={clients}
      />
    </div>
  );
}
