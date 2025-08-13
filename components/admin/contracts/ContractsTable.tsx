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
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Contract, ContractStatus } from '@/lib/adminStore';
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
  contracts: Contract[];
  onEdit: (contract: Contract) => void;
  onDelete: (id: string) => void;
}

export const ContractsTable: React.FC<ContractsTableProps> = ({
  contracts,
  onEdit,
  onDelete,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client Name</TableHead>
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
              {/* FIX: Menggunakan snake_case sesuai tipe data backend */}
              <TableCell className="font-medium">
                {contract.client_name}
              </TableCell>
              <TableCell>{formatDate(contract.start_date)}</TableCell>
              <TableCell>{formatDate(contract.end_date)}</TableCell>
              <TableCell>
                {getStatusBadge(getContractStatus(contract.end_date))}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {/* FIX: Menambahkan null check untuk notes */}
                {contract.notes?.substring(0, 50)}
                {contract.notes && contract.notes.length > 50 && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" className="p-0 h-auto ml-1">
                        ...see details
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Notes for {contract.client_name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="py-4 my-4 border-t border-b">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {contract.notes}
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
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
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will permanently delete the contract for{' '}
                          <strong>{contract.client_name}</strong>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(contract.id)}
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
            <TableCell colSpan={6} className="h-24 text-center">
              No contracts found for the selected filter.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
