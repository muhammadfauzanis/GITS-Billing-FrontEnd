'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { Contract, GwContract, ContractStatus } from '@/lib/adminStore';
import { getContractStatus, formatDate } from '@/lib/utils';

const getStatusBadge = (status: ContractStatus) => {
  if (status === 'expired')
    return (
      <Badge variant="destructive" className="hover:bg-destructive">
        Expired
      </Badge>
    );
  if (status === 'expiring_soon')
    return (
      <Badge
        variant="secondary"
        className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100"
      >
        Expiring Soon
      </Badge>
    );
  return (
    <Badge
      variant="default"
      className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
    >
      Active
    </Badge>
  );
};

interface ContractsTableProps {
  contracts: (Contract | GwContract)[];
  contractType: 'gcp' | 'gw';
  loading: boolean;
  deletingContractId: string | null;
  onEdit: (contract: Contract | GwContract) => void;
  onDelete: (id: string) => void;
}

export const ContractsTable: React.FC<ContractsTableProps> = ({
  contracts,
  contractType,
  loading,
  deletingContractId,
  onEdit,
  onDelete,
}) => {
  if (loading && contracts.length === 0) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Client Name</TableHead>
            {/* Tampilkan kolom Domain dan SKU hanya untuk GW */}
            {contractType === 'gw' && (
              <>
                <TableHead className="min-w-[150px]">Domain</TableHead>
                <TableHead className="min-w-[200px]">SKU</TableHead>
              </>
            )}
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.length > 0 ? (
            contracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell className="font-medium">
                  {contract.client_name}
                </TableCell>
                {/* Tampilkan data Domain dan SKU hanya untuk GW */}
                {contractType === 'gw' && (
                  <>
                    <TableCell>
                      {(contract as GwContract).domain || '-'}
                    </TableCell>
                    <TableCell>{(contract as GwContract).sku || '-'}</TableCell>
                  </>
                )}
                <TableCell>{formatDate(contract.start_date)}</TableCell>
                <TableCell>{formatDate(contract.end_date)}</TableCell>
                <TableCell>
                  {getStatusBadge(getContractStatus(contract.end_date))}
                </TableCell>
                <TableCell className="max-w-[150px] truncate">
                  {contract.notes}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(contract.file_url, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(contract)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          disabled={deletingContractId === contract.id}
                        >
                          {deletingContractId === contract.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the contract for{' '}
                            <strong>{contract.client_name}</strong>.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(contract.id)}
                            disabled={!!deletingContractId}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={contractType === 'gw' ? 8 : 6}
                className="h-24 text-center"
              >
                No contracts found for the selected filter.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
