'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAdminStore } from '@/lib/store/admin';
import { AdminInvoice } from '@/lib/store/admin/types';
import { AdminInvoicesTable } from '@/components/admin/invoices/AdminInvoicesTable';
import { UpdateStatusDialog } from '@/components/admin/invoices/UpdateStatusDialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { X, Loader2, ShieldCheck, Rocket } from 'lucide-react'; // Diubah: Menambahkan Rocket
import { getInvoiceViewUrl } from '@/lib/api/invoices';
import { generatePagination } from '@/lib/utils';

const ITEMS_PER_PAGE = 15;

export default function AdminInvoicesPage() {
  const {
    clients,
    adminInvoices,
    adminInvoicesPagination,
    fetchClients,
    fetchAdminInvoices,
    approveInvoice,
    rejectInvoice,
    approveAllInvoices,
    triggerGenerateInvoices, // Ditambahkan: Mengambil action baru dari store
    loading,
  } = useAdminStore();
  const { toast } = useToast();

  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<AdminInvoice | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingUrl, setViewingUrl] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState<number | null>(null);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [isGenerating, setIsGenerating] = useState(false); // Ditambahkan: State untuk loading generate

  const [filters, setFilters] = useState({
    status: 'all',
    approval_status: 'draft',
    clientId: 'all',
    month: 'all',
    year: new Date().getFullYear().toString(),
  });

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const refetchCurrentPage = () => {
    const params = {
      status: filters.status === 'all' ? null : filters.status,
      approval_status:
        filters.approval_status === 'all' ? null : filters.approval_status,
      clientId: filters.clientId === 'all' ? null : Number(filters.clientId),
      month: filters.month === 'all' ? null : Number(filters.month),
      year: filters.month === 'all' ? null : Number(filters.year),
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    };
    fetchAdminInvoices(params);
  };

  useEffect(() => {
    refetchCurrentPage();
    setSelectedRows({});
  }, [filters, currentPage]);

  const handleApprove = async (invoiceId: number) => {
    try {
      await approveInvoice(invoiceId);
      toast({
        title: 'Success',
        description: `Invoice approved. Sending process started.`,
      });
      refetchCurrentPage();
    } catch (e: any) {
      toast({
        title: 'Error Approving',
        description: e.message,
        variant: 'destructive',
      });
    }
  };

  const handleRejectClick = (invoice: AdminInvoice) => {
    setSelectedInvoice(invoice);
    setIsRejectDialogOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedInvoice || !rejectionReason.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Reason for rejection cannot be empty.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await rejectInvoice(selectedInvoice.id, rejectionReason);
      toast({ title: 'Success', description: `Invoice has been rejected.` });
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      refetchCurrentPage();
    } catch (e: any) {
      toast({
        title: 'Error Rejecting',
        description: e.message,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStatusClick = (invoice: AdminInvoice) => {
    setSelectedInvoice(invoice);
    setIsUpdateDialogOpen(true);
  };

  const handleViewClick = async (invoiceId: number) => {
    setIsActionLoading(invoiceId);
    try {
      const data = await getInvoiceViewUrl(invoiceId);
      if (data.url) setViewingUrl(data.url);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAll = () => {
    const allDraftIdsInView = adminInvoices
      .flatMap((group) => group.invoices)
      .filter((inv) => inv.approval_status === 'draft')
      .map((inv) => inv.id);

    const isAllSelected =
      allDraftIdsInView.length > 0 &&
      allDraftIdsInView.every((id) => selectedRows[id]);

    const newSelection: Record<string, boolean> = {};
    if (!isAllSelected) {
      allDraftIdsInView.forEach((id) => {
        newSelection[id] = true;
      });
    }
    setSelectedRows(newSelection);
  };

  const handleApproveSelected = async () => {
    const idsToApprove = Object.entries(selectedRows)
      .filter(([, isSelected]) => isSelected)
      .map(([id]) => Number(id));

    if (idsToApprove.length === 0) {
      toast({ title: 'No invoices selected', variant: 'destructive' });
      return;
    }
    setIsBulkLoading(true);
    try {
      await approveAllInvoices(idsToApprove);
      toast({
        title: 'Success',
        description: `${idsToApprove.length} invoices are being processed.`,
      });
      refetchCurrentPage();
    } catch (e: any) {
      toast({
        title: 'Bulk Approve Error',
        description: e.message,
        variant: 'destructive',
      });
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleFilterChange = (type: keyof typeof filters, value: string) => {
    setCurrentPage(1);
    setFilters((f) => ({ ...f, [type]: value }));
  };

  // Ditambahkan: Handler untuk tombol Generate Invoices
  const handleGenerateInvoices = async () => {
    setIsGenerating(true);
    try {
      await triggerGenerateInvoices();
      toast({
        title: 'Proses Dimulai',
        description: 'Pembuatan semua invoice telah dimulai di background.',
      });
    } catch (e: any) {
      toast({
        title: 'Gagal Memulai Proses',
        description: e.message,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: (i + 1).toString(),
        label: new Date(0, i).toLocaleString('id-ID', { month: 'long' }),
      })),
    []
  );
  const years = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        value: String(new Date().getFullYear() - 1 + i),
        label: String(new Date().getFullYear() - 1 + i),
      })),
    []
  );
  const totalPages = adminInvoicesPagination?.total_pages || 1;
  const pageNumbers = generatePagination(currentPage, totalPages);
  const selectedCount = Object.values(selectedRows).filter(Boolean).length;

  return (
    <>
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Invoice Management
          </h2>
          {/* Ditambahkan: Tombol Generate Invoices */}
          <Button onClick={handleGenerateInvoices} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Rocket className="mr-2 h-4 w-4" />
            )}
            Generate Invoices
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>All Client Invoices</CardTitle>
                <CardDescription>
                  View, approve, and manage all client invoices.
                </CardDescription>
              </div>
              {selectedCount > 0 && (
                <Button
                  onClick={handleApproveSelected}
                  disabled={isBulkLoading}
                >
                  {isBulkLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                  )}
                  Approve Selected ({selectedCount})
                </Button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-4">
              <Select
                value={filters.approval_status}
                onValueChange={(v) => handleFilterChange('approval_status', v)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Approval</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.clientId}
                onValueChange={(v) => handleFilterChange('clientId', v)}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.status}
                onValueChange={(v) => handleFilterChange('status', v)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading.adminInvoices && adminInvoices.length === 0 ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <AdminInvoicesTable
                groupedInvoices={adminInvoices}
                onView={handleViewClick}
                onApprove={handleApprove}
                onReject={handleRejectClick}
                onUpdateStatus={handleUpdateStatusClick}
                isActionLoading={isActionLoading}
                selectedRows={selectedRows}
                onRowSelect={handleSelectRow}
                onSelectAll={handleSelectAll}
              />
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <Pagination className="flex w-full justify-end mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((p) => Math.max(1, p - 1));
                  }}
                  className={cn(
                    'cursor-pointer',
                    currentPage === 1 && 'pointer-events-none opacity-50'
                  )}
                />
              </PaginationItem>
              {pageNumbers.map((page, index) => (
                <PaginationItem key={index}>
                  {typeof page === 'string' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      isActive={currentPage === page}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                  }}
                  className={cn(
                    'cursor-pointer',
                    currentPage === totalPages &&
                      'pointer-events-none opacity-50'
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Reject Invoice: {selectedInvoice?.invoice_number}
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. This will be recorded.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Reason..."
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmReject}>Confirm Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!viewingUrl}
        onOpenChange={(open) => !open && setViewingUrl(null)}
      >
        <DialogContent className="max-w-4xl w-full h-[90vh] p-2 md:p-4 bg-transparent border-0 shadow-none focus-visible:outline-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          <DialogClose asChild>
            <Button
              variant="ghost"
              className="absolute top-[-14px] right-[-14px] z-20 h-9 w-9 rounded-full p-0 bg-background border shadow-md hover:bg-muted"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
          <Card className="w-full h-full">
            <CardContent className="p-0 h-full overflow-hidden rounded-lg">
              {viewingUrl && (
                <iframe
                  src={viewingUrl}
                  className="w-full h-full border-0"
                  title="Invoice Preview"
                />
              )}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      {selectedInvoice && (
        <UpdateStatusDialog
          isOpen={isUpdateDialogOpen}
          onClose={() => setIsUpdateDialogOpen(false)}
          invoice={selectedInvoice}
          onSuccess={() => {
            refetchCurrentPage();
            setIsUpdateDialogOpen(false);
          }}
        />
      )}
    </>
  );
}
