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
import { cn, generatePagination } from '@/lib/utils';

const ITEMS_PER_PAGE = 15;

export default function AdminInvoicesPage() {
  const {
    clients,
    adminInvoices,
    adminInvoicesPagination,
    fetchClients,
    fetchAdminInvoices,
  } = useAdminStore();

  const [selectedInvoice, setSelectedInvoice] = useState<AdminInvoice | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
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
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedInvoice(null);
  };

  const handleFilterChange = (
    type: 'status' | 'clientId' | 'month' | 'year',
    value: string
  ) => {
    // Reset ke halaman pertama setiap kali filter berubah
    setCurrentPage(1);
    setFilters((f) => {
      const newFilters = { ...f };
      if (type === 'clientId') {
        newFilters.clientId = value === 'all' ? null : Number(value);
      } else {
        (newFilters as any)[type] = value === 'all' ? null : value;
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
                // Gunakan string 'all' sebagai nilai untuk "All Clients"
                value={filters.clientId?.toString() || 'all'}
                onValueChange={(value) => handleFilterChange('clientId', value)}
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
                  <SelectItem value="all">All Status</SelectItem>
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
                  currentPage === totalPages && 'pointer-events-none opacity-50'
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {selectedInvoice && (
        <UpdateStatusDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          invoice={selectedInvoice}
          onSuccess={() => {
            refetchCurrentPage();
            handleDialogClose();
          }}
        />
      )}
    </div>
  );
}
