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
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [filterStatus, setFilterStatus] = useState<ContractStatus>('all');

  // FIX: Dependency array disederhanakan untuk mencegah infinite loop
  useEffect(() => {
    fetchClients();
    fetchContracts();
  }, [fetchClients, fetchContracts]);

  const filteredContracts = useMemo(() => {
    if (filterStatus === 'all') return contracts;
    return contracts.filter(
      (c) => getContractStatus(c.end_date) === filterStatus
    );
  }, [contracts, filterStatus]);

  const handleAddSubmit = async (formData: ContractFormState) => {
    try {
      await addContract(formData);
      toast({
        title: 'Success',
        description: 'New contract has been uploaded.',
      });
      setIsAddDialogOpen(false);
      await fetchContracts(); // Re-fetch
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEditSubmit = async (formData: ContractFormState) => {
    if (!editingContract) return;
    try {
      await editContract(editingContract.id, formData);
      toast({ title: 'Success', description: 'Contract has been updated.' });
      setIsEditDialogOpen(false);
      await fetchContracts(); // Re-fetch
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeContract(id);
      toast({ title: 'Success', description: 'Contract has been deleted.' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (contract: Contract) => {
    setEditingContract(contract);
    setIsEditDialogOpen(true);
  };

  const editingContractInitialData = useMemo<ContractFormState | null>(() => {
    if (!editingContract) return null;
    return {
      clientId: editingContract.client_id,
      clientName: editingContract.client_name,
      startDate: editingContract.start_date,
      endDate: editingContract.end_date,
      notes: editingContract.notes || '',
      file: null,
      clientEmails:
        editingContract.client_emails?.length > 0
          ? editingContract.client_emails
          : [''],
      internalEmails:
        editingContract.internal_emails?.length > 0
          ? editingContract.internal_emails
          : [''],
    };
  }, [editingContract]);

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
            <div className="flex items-center space-x-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All ({contracts.length})
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('active')}
              >
                Active
              </Button>
              <Button
                variant={
                  filterStatus === 'expiring_soon' ? 'default' : 'outline'
                }
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
          </div>
        </CardHeader>
        <CardContent>
          <ContractsTable
            contracts={filteredContracts}
            onEdit={openEditDialog}
            onDelete={handleDelete}
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
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleEditSubmit}
        initialData={editingContractInitialData}
        clients={clients}
      />
    </div>
  );
}
