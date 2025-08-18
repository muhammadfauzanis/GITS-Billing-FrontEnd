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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  GwContract,
  ContractFormState,
  GwContractFormState,
  ContractStatus,
} from '@/lib/adminStore';
import { getContractStatus } from '@/lib/utils';
import { ContractDialog } from '@/components/admin/contracts/ContractDialog';
import { ContractStatsCards } from '@/components/admin/contracts/ContractStatsCards';
import { ContractsTable } from '@/components/admin/contracts/ContractsTable';
import { EmailInputBox } from '@/components/admin/contracts/EmailInputBox';

type ContractType = 'gcp' | 'gw';

export default function ContractsPage() {
  const { toast } = useToast();
  const store = useAdminStore();

  const [activeTab, setActiveTab] = useState<ContractType>('gcp');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingContract, setEditingContract] = useState<
    Contract | GwContract | null
  >(null);
  const [deletingContractId, setDeletingContractId] = useState<string | null>(
    null
  );

  const [gcpFilterDate, setGcpFilterDate] = useState({
    month: 'all',
    year: new Date().getFullYear().toString(),
  });

  const [gwFilterDate, setGwFilterDate] = useState({
    month: 'all',
    year: new Date().getFullYear().toString(),
  });

  useEffect(() => {
    store.fetchClients();
    store.fetchGwClients();
  }, []);

  useEffect(() => {
    const monthToSend =
      gcpFilterDate.month === 'all' ? null : Number(gcpFilterDate.month);
    const yearToSend =
      gcpFilterDate.month === 'all' ? null : Number(gcpFilterDate.year);
    store.fetchContracts(monthToSend, yearToSend);
  }, [gcpFilterDate, store.fetchContracts]);

  useEffect(() => {
    const monthToSend =
      gwFilterDate.month === 'all' ? null : Number(gwFilterDate.month);
    const yearToSend =
      gwFilterDate.month === 'all' ? null : Number(gwFilterDate.year);
    store.fetchGwContracts(monthToSend, yearToSend);
  }, [gwFilterDate, store.fetchGwContracts]);

  const openDialog = (
    mode: 'add' | 'edit',
    contract: Contract | GwContract | null = null
  ) => {
    setDialogMode(mode);
    setEditingContract(contract);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingContract(null);
  };

  const refetchDataForActiveTab = () => {
    if (activeTab === 'gcp') {
      const monthToSend =
        gcpFilterDate.month === 'all' ? null : Number(gcpFilterDate.month);
      const yearToSend =
        gcpFilterDate.month === 'all' ? null : Number(gcpFilterDate.year);
      store.fetchContracts(monthToSend, yearToSend);
    } else {
      const monthToSend =
        gwFilterDate.month === 'all' ? null : Number(gwFilterDate.month);
      const yearToSend =
        gwFilterDate.month === 'all' ? null : Number(gwFilterDate.year);
      store.fetchGwContracts(monthToSend, yearToSend);
    }
  };

  const handleDelete = async (id: string, type: ContractType) => {
    setDeletingContractId(id);
    try {
      if (type === 'gcp') await store.removeContract(id);
      else await store.removeGwContract(id);

      toast({ title: 'Success', description: 'Contract has been deleted.' });
      refetchDataForActiveTab();
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

  // --- FUNGSI RENDER UNTUK KONTEN TAB GCP ---
  const renderGcpContracts = () => {
    const [filterStatus, setFilterStatus] = useState<ContractStatus>('all');

    const filteredGcpContracts = useMemo(() => {
      if (filterStatus === 'all') return store.contracts;
      return store.contracts.filter(
        (c) => getContractStatus(c.end_date) === filterStatus
      );
    }, [store.contracts, filterStatus]);

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

    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>All GCP Contracts</CardTitle>
              <CardDescription>
                A list of all GCP client contracts and their status.
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select
                value={gcpFilterDate.month}
                onValueChange={(value) =>
                  setGcpFilterDate((prev) => ({ ...prev, month: value }))
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
                value={gcpFilterDate.year}
                onValueChange={(value) =>
                  setGcpFilterDate((prev) => ({ ...prev, year: value }))
                }
                disabled={gcpFilterDate.month === 'all'}
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
              All ({filteredGcpContracts.length})
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
            contractType="gcp"
            contracts={filteredGcpContracts}
            loading={store.loading.contracts}
            deletingContractId={deletingContractId}
            onEdit={(contract) => openDialog('edit', contract)}
            onDelete={(id) => handleDelete(id, 'gcp')}
          />
        </CardContent>
      </Card>
    );
  };

  // --- FUNGSI RENDER UNTUK KONTEN TAB GW ---
  const renderGwContracts = () => {
    const [filterStatus, setFilterStatus] = useState<ContractStatus>('all');

    const filteredGwContracts = useMemo(() => {
      if (filterStatus === 'all') return store.gwContracts;
      return store.gwContracts.filter(
        (c) => getContractStatus(c.end_date) === filterStatus
      );
    }, [store.gwContracts, filterStatus]);

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

    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>All Google Workspace Contracts</CardTitle>
              <CardDescription>
                A list of all GW client contracts and their status.
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select
                value={gwFilterDate.month}
                onValueChange={(value) =>
                  setGwFilterDate((prev) => ({ ...prev, month: value }))
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
                value={gwFilterDate.year}
                onValueChange={(value) =>
                  setGwFilterDate((prev) => ({ ...prev, year: value }))
                }
                disabled={gwFilterDate.month === 'all'}
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
              All ({filteredGwContracts.length})
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
            contractType="gw"
            contracts={filteredGwContracts}
            loading={store.loading.gwContracts}
            deletingContractId={deletingContractId}
            onEdit={(contract) => openDialog('edit', contract)}
            onDelete={(id) => handleDelete(id, 'gw')}
          />
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Contract Management
        </h2>
        <Button onClick={() => openDialog('add')}>
          <Upload className="mr-2 h-4 w-4" /> Upload Contract
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as ContractType)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gcp">GCP</TabsTrigger>
          <TabsTrigger value="gw">Google Workspace</TabsTrigger>
        </TabsList>
        <div className="mt-6 space-y-6">
          <ContractStatsCards
            contracts={
              activeTab === 'gcp' ? store.contracts : store.gwContracts
            }
          />

          <TabsContent value="gcp" className="m-0">
            {renderGcpContracts()}
          </TabsContent>
          <TabsContent value="gw" className="m-0">
            {renderGwContracts()}
          </TabsContent>
        </div>
      </Tabs>

      {isDialogOpen && (
        <ContractDialog
          key={`${activeTab}-${dialogMode}-${editingContract?.id || 'add'}`}
          isOpen={isDialogOpen}
          onOpenChange={closeDialog}
          mode={dialogMode}
          contractType={activeTab}
          initialData={editingContract}
          onSuccess={() => {
            closeDialog();
            refetchDataForActiveTab();
          }}
        />
      )}
    </div>
  );
}
