'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminStore } from '@/lib/store/admin';
import { Contract, GwContract } from '@/lib/store/admin/types';
import { ContractDialog } from '@/components/admin/contracts/ContractDialog';
import { ContractStatsCards } from '@/components/admin/contracts/ContractStatsCards';
import { GcpContractsView } from '@/components/admin/contracts/GcpContractsView';
import { GwContractsView } from '@/components/admin/contracts/GwContractsView';

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

  useEffect(() => {
    store.fetchClients();
    store.fetchGwClients();
  }, [store.fetchClients, store.fetchGwClients]);

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
      store.fetchContracts(null, null, 1, 15); // Re-fetch the first page
    } else {
      store.fetchGwContracts(null, null, 1, 15);
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

  const currentContracts =
    activeTab === 'gcp' ? store.contracts : store.gwContracts;

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
          <ContractStatsCards contracts={currentContracts} />

          <TabsContent value="gcp" className="m-0">
            <GcpContractsView
              onEdit={(contract) => openDialog('edit', contract)}
              onDelete={(id) => handleDelete(id, 'gcp')}
              deletingContractId={deletingContractId}
            />
          </TabsContent>
          <TabsContent value="gw" className="m-0">
            <GwContractsView
              onEdit={(contract) => openDialog('edit', contract)}
              onDelete={(id) => handleDelete(id, 'gw')}
              deletingContractId={deletingContractId}
            />
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
