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
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { X } from 'lucide-react';
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
  } = useAdminStore();
  const { toast } = useToast();

  const [selectedInvoice, setSelectedInvoice] = useState<AdminInvoice | null>(
    null
  );
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [viewingUrl, setViewingUrl] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState<number | null>(null);

  const [filters, setFilters] = useState<{
    status: string | null;
    clientId: number | null;
    month: string;
    year: string;
  }>({
    status: null,
    clientId: null,
    month: 'all',
    year: new Date().getFullYear().toString(),
  });

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    const params = {
      status: filters.status,
      clientId: filters.clientId,
      month: filters.month === 'all' ? null : Number(filters.month),
      year: filters.month === 'all' ? null : Number(filters.year),
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    };
    fetchAdminInvoices(params);
  }, [fetchAdminInvoices, filters, currentPage]);

  const handleUpdateStatusClick = (invoice: AdminInvoice) => {
    setSelectedInvoice(invoice);
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateDialogClose = () => {
    setIsUpdateDialogOpen(false);
    setSelectedInvoice(null);
  };

  const handleViewClick = async (invoiceId: number) => {
    setIsActionLoading(invoiceId);
    try {
      const data = await getInvoiceViewUrl(invoiceId);
      if (data.url) {
        setViewingUrl(data.url.replace(/^http:/, 'https'));
      }
    } catch (err: any) {
      toast({
        title: 'Gagal Membuka Pratinjau',
        description: err.message || 'Tidak dapat mengambil URL tagihan.',
        variant: 'destructive',
      });
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleFilterChange = (
    type: 'status' | 'clientId' | 'month' | 'year',
    value: string
  ) => {
    setCurrentPage(1);
    setFilters((f) => {
      const newFilters = { ...f };
      if (type === 'clientId') {
        newFilters.clientId = value === 'all' ? null : Number(value);
      } else if (type === 'status') {
        newFilters.status = value === 'all' ? null : value;
      } else {
        (newFilters as any)[type] = value;
      }
      return newFilters;
    });
  };

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

  const refetchCurrentPage = () => {
    const params = {
      status: filters.status,
      clientId: filters.clientId,
      month: filters.month === 'all' ? null : Number(filters.month),
      year: filters.month === 'all' ? null : Number(filters.year),
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    };
    fetchAdminInvoices(params);
  };

  const totalPages = adminInvoicesPagination?.total_pages || 1;
  const pageNumbers = generatePagination(currentPage, totalPages);

  return (
    <>
      <Dialog
        open={!!viewingUrl}
        onOpenChange={(open) => !open && setViewingUrl(null)}
      >
        <DialogContent className="max-w-4xl w-full h-[90vh] p-2 md:p-4 bg-transparent border-0 shadow-none focus:outline-none">
          {/* --- PERBAIKAN DI SINI --- */}
          <DialogHeader className="sr-only">
            <DialogTitle>Invoice Preview</DialogTitle>
            <DialogDescription>
              Showing a preview of the selected invoice PDF.
            </DialogDescription>
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
          <Card className="w-full h-full relative flex flex-col">
            <CardContent className="p-0 flex-grow h-full overflow-hidden rounded-lg">
              {viewingUrl && (
                <iframe
                  src={viewingUrl}
                  className="w-full h-full border-0"
                  title="Pratinjau Invoice"
                />
              )}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Invoice Management
          </h2>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>All Client Invoices</CardTitle>
                <CardDescription>
                  View and manage all client invoices.
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <Select
                  value={filters.clientId?.toString() || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('clientId', value)
                  }
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by Client" />
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
                  value={filters.status || 'all'}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.month}
                  onValueChange={(value) => handleFilterChange('month', value)}
                >
                  <SelectTrigger className="w-full sm:w-[140px]">
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
                  value={filters.year}
                  onValueChange={(value) => handleFilterChange('year', value)}
                  disabled={filters.month === 'all'}
                >
                  <SelectTrigger className="w-full sm:w-[100px]">
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
            <AdminInvoicesTable
              groupedInvoices={adminInvoices}
              onUpdateStatus={handleUpdateStatusClick}
              onView={handleViewClick}
              isActionLoading={isActionLoading}
            />
          </CardContent>
        </Card>

        {adminInvoicesPagination && adminInvoicesPagination.total_pages > 1 && (
          <Pagination className="flex w-full justify-end">
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

        {selectedInvoice && (
          <UpdateStatusDialog
            isOpen={isUpdateDialogOpen}
            onClose={handleUpdateDialogClose}
            invoice={selectedInvoice}
            onSuccess={() => {
              refetchCurrentPage();
              handleUpdateDialogClose();
            }}
          />
        )}
      </div>
    </>
  );
}
