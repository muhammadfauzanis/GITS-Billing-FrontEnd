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
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminStore } from '@/lib/adminStore';
import { ContractDialog } from '@/components/admin/contracts/ContractDialog';
import { ContractStatsCards } from '@/components/admin/contracts/ContractStatsCards';
import { ContractsTable} from '@/components/admin/contracts/ContractsTable';
import { Contract, ContractFormState, ContractStatus } from '@/lib/adminStore';

// Data Dummy
const dummyContracts: Contract[] = [
  {
    id: '1',
    clientName: 'PT. Teknologi Maju',
    startDate: '2024-01-15',
    endDate: '2025-12-31',
    notes:
      'Kontrak layanan cloud computing dan infrastruktur IT untuk periode 2025. Termasuk SLA 99.9% dan support 24/7. Pembayaran dilakukan per kuartal dengan invoice dikirimkan pada awal periode. Project Manager: Budi Santoso.',
    fileUrl: '/contracts/pt-teknologi-maju-2024.pdf',
    fileName: 'pt-teknologi-maju-2024.pdf',
    clientEmails: ['admin@teknologimaju.com', 'it@teknologimaju.com'],
    internalEmails: ['contracts@gits.id', 'admin@gits.id'],
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10',
  },
  {
    id: '2',
    clientName: 'CV. Digital Solutions',
    startDate: '2023-06-01',
    endDate: '2024-08-25',
    notes: 'Kontrak pengembangan aplikasi mobile dan web development services.',
    fileUrl: '/contracts/cv-digital-solutions-2023.pdf',
    fileName: 'cv-digital-solutions-2023.pdf',
    clientEmails: ['contact@digitalsolutions.co.id'],
    internalEmails: ['contracts@gits.id'],
    createdAt: '2023-05-25',
    updatedAt: '2023-05-25',
  },
  {
    id: '3',
    clientName: 'PT. Inovasi Bisnis',
    startDate: '2023-03-01',
    endDate: '2024-02-29',
    notes: 'Kontrak konsultasi digital transformation dan system integration.',
    fileUrl: '/contracts/pt-inovasi-bisnis-2023.pdf',
    fileName: 'pt-inovasi-bisnis-2023.pdf',
    clientEmails: ['procurement@inovasibisnis.com', 'cto@inovasibisnis.com'],
    internalEmails: ['contracts@gits.id', 'sales@gits.id'],
    createdAt: '2023-02-20',
    updatedAt: '2023-02-20',
  },
];

const getContractStatus = (endDate: string): ContractStatus => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= 30) return 'expiring_soon';
  return 'active';
};

export default function ContractsPage() {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>(dummyContracts);
  const { clients, fetchClients } = useAdminStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [filterStatus, setFilterStatus] = useState<ContractStatus>('all');

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filteredContracts = useMemo(() => {
    if (filterStatus === 'all') return contracts;
    return contracts.filter(
      (c) => getContractStatus(c.endDate) === filterStatus
    );
  }, [contracts, filterStatus]);

  const handleAddSubmit = async (formData: ContractFormState) => {
    console.log('Adding new contract:', formData);
    await new Promise((res) => setTimeout(res, 1000));
    toast({ title: 'Success', description: 'New contract has been uploaded.' });
    setIsAddDialogOpen(false);
  };

  const handleEditSubmit = async (formData: ContractFormState) => {
    console.log('Updating contract:', editingContract?.id, formData);
    await new Promise((res) => setTimeout(res, 1000));
    toast({ title: 'Success', description: 'Contract has been updated.' });
    setIsEditDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    console.log('Deleting contract:', id);
    await new Promise((res) => setTimeout(res, 500));
    toast({ title: 'Success', description: 'Contract has been deleted.' });
  };

  const openEditDialog = (contract: Contract) => {
    setEditingContract(contract);
    setIsEditDialogOpen(true);
  };

  const editingContractInitialData = useMemo<ContractFormState | null>(() => {
    if (!editingContract) return null;
    return {
      clientName: editingContract.clientName,
      startDate: editingContract.startDate,
      endDate: editingContract.endDate,
      notes: editingContract.notes,
      file: null,
      clientEmails:
        editingContract.clientEmails.length > 0
          ? editingContract.clientEmails
          : [''],
      internalEmails:
        editingContract.internalEmails.length > 0
          ? editingContract.internalEmails
          : [''],
    };
  }, [editingContract]);

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
                All
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
