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
import { Checkbox } from '@/components/ui/checkbox';
import { AdminInvoice, GroupedAdminInvoices } from '@/lib/store/admin/types';
import { formatCurrency, formatDate, formatMonthOnly } from '@/lib/utils';
import { Edit, Loader2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminInvoicesTableProps {
  groupedInvoices: GroupedAdminInvoices[];
  onView: (invoiceId: number) => void;
  onApprove: (invoiceId: number) => void;
  onReject: (invoice: AdminInvoice) => void;
  onUpdateStatus: (invoice: AdminInvoice) => void;
  isActionLoading: number[];
  selectedRows: Record<string, boolean>;
  onRowSelect: (id: number) => void;
  onSelectAll: () => void;
}

const paymentStatusStyles: { [key: string]: string } = {
  paid: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  overdue: 'bg-red-100 text-red-800 border-red-200',
  sent: 'bg-blue-100 text-blue-800 border-blue-200',
};

const approvalStatusStyles: { [key: string]: string } = {
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  approved: 'bg-teal-100 text-teal-800 border-teal-200',
  rejected: 'bg-rose-100 text-rose-800 border-rose-200',
};

export const AdminInvoicesTable: React.FC<AdminInvoicesTableProps> = ({
  groupedInvoices,
  onView,
  onApprove,
  onReject,
  onUpdateStatus,
  isActionLoading,
  selectedRows,
  onRowSelect,
  onSelectAll,
}) => {
  const allDraftIdsInView = groupedInvoices
    .flatMap((group) => group.invoices)
    .filter((inv) => inv.approval_status === 'draft')
    .map((inv) => inv.id);

  const isAllSelected =
    allDraftIdsInView.length > 0 &&
    allDraftIdsInView.every((id) => selectedRows[id]);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={onSelectAll}
                aria-label="Select all draft invoices"
                disabled={allDraftIdsInView.length === 0}
              />
            </TableHead>
            <TableHead>Invoice #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Approval Status</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedInvoices.length > 0 ? (
            groupedInvoices.map((group) => (
              <React.Fragment key={group.month}>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableCell
                    colSpan={9}
                    className="py-2 px-4 font-semibold text-muted-foreground"
                  >
                    {group.month}
                  </TableCell>
                </TableRow>
                {group.invoices.map((invoice) => {
                  const isProcessing = isActionLoading.includes(invoice.id);
                  return (
                    <TableRow
                      key={invoice.id}
                      data-state={selectedRows[invoice.id] && 'selected'}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedRows[invoice.id] || false}
                          onCheckedChange={() => onRowSelect(invoice.id)}
                          disabled={invoice.approval_status !== 'draft'}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>{invoice.client_name}</TableCell>
                      <TableCell>
                        {formatMonthOnly(invoice.invoice_period)}
                      </TableCell>
                      <TableCell>{formatDate(invoice.due_date)}</TableCell>
                      <TableCell>
                        {formatCurrency(invoice.total_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'capitalize whitespace-nowrap',
                            approvalStatusStyles[
                              invoice.approval_status.toLowerCase()
                            ] || ''
                          )}
                        >
                          {invoice.approval_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'capitalize whitespace-nowrap',
                            paymentStatusStyles[invoice.status.toLowerCase()] ||
                              ''
                          )}
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1 min-h-[40px]">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onView(invoice.id)}
                            disabled={isProcessing}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onUpdateStatus(invoice)}
                            disabled={isProcessing}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {isProcessing ? (
                            <div className="flex items-center justify-center w-[72px]">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : (
                            invoice.approval_status === 'draft' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => onApprove(invoice.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => onReject(invoice)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </React.Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                No invoices found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
