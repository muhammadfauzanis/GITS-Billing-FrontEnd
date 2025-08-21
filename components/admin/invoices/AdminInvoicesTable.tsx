'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminInvoice, GroupedAdminInvoices } from '@/lib/store/admin/types';
import { useAdminStore } from '@/lib/store/admin';
import { formatCurrency, formatDate, formatMonthOnly } from '@/lib/utils';
import { ExternalLink, Edit, Loader2, Eye } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AdminInvoicesTableProps {
  groupedInvoices: GroupedAdminInvoices[];
  onUpdateStatus: (invoice: AdminInvoice) => void;
  onView: (invoiceId: number) => void;
  isActionLoading: number | null;
}

const statusStyles: { [key: string]: string } = {
  paid: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
  pending:
    'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
  overdue: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
  failed: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100',
};

export const AdminInvoicesTable: React.FC<AdminInvoicesTableProps> = ({
  groupedInvoices,
  onUpdateStatus,
  onView,
  isActionLoading,
}) => {
  const { loading } = useAdminStore();

  if (loading.adminInvoices) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (groupedInvoices.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10">
        No invoices found for the selected filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Proof of Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedInvoices.map((group) => (
            <React.Fragment key={group.month}>
              <TableRow className="bg-muted hover:bg-muted">
                <TableCell
                  colSpan={8}
                  className="py-2 px-4 font-semibold text-muted-foreground"
                >
                  {group.month}
                </TableCell>
              </TableRow>
              {group.invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    {invoice.invoice_number}
                  </TableCell>
                  <TableCell>{invoice.client_name}</TableCell>
                  <TableCell>
                    {formatMonthOnly(invoice.invoice_period)}
                  </TableCell>
                  <TableCell>{formatDate(invoice.due_date)}</TableCell>
                  <TableCell>{formatCurrency(invoice.total_amount)}</TableCell>
                  <TableCell>
                    {invoice.proof_of_payment_url ? (
                      <Button variant="link" asChild className="p-0 h-auto">
                        <Link
                          href={invoice.proof_of_payment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Proof <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'capitalize',
                        statusStyles[invoice.status.toLowerCase()] || ''
                      )}
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(invoice.id)}
                        disabled={isActionLoading === invoice.id}
                      >
                        {isActionLoading === invoice.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onUpdateStatus(invoice)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
