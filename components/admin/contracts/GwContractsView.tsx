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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminStore } from '@/lib/store/admin';
import { Contract, GwContract, ContractStatus } from '@/lib/store/admin/types';
import { getContractStatus, generatePagination } from '@/lib/utils';
import { ContractsTable } from './ContractsTable';
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

const ITEMS_PER_PAGE = 15;

interface GwContractsViewProps {
  onEdit: (contract: Contract | GwContract) => void;
  onDelete: (id: string) => void;
  deletingContractId: string | null;
}

export function GwContractsView({
  onEdit,
  onDelete,
  deletingContractId,
}: GwContractsViewProps) {
  const { gwContracts, gwContractsPagination, fetchGwContracts, loading } =
    useAdminStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<ContractStatus>('all');
  const [filterDate, setFilterDate] = useState({
    month: 'all',
    year: new Date().getFullYear().toString(),
  });

  useEffect(() => {
    const monthToSend =
      filterDate.month === 'all' ? null : Number(filterDate.month);
    const yearToSend =
      filterDate.month === 'all' ? null : Number(filterDate.year);
    fetchGwContracts(monthToSend, yearToSend, currentPage, ITEMS_PER_PAGE);
  }, [filterDate, currentPage, fetchGwContracts]);

  const filteredContracts = useMemo(() => {
    if (filterStatus === 'all') return gwContracts;
    return gwContracts.filter(
      (c) => getContractStatus(c.end_date) === filterStatus
    );
  }, [gwContracts, filterStatus]);

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

  const totalPages = gwContractsPagination?.total_pages || 1;
  const pageNumbers = generatePagination(currentPage, totalPages);

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
              value={filterDate.month}
              onValueChange={(value) => {
                setFilterDate((prev) => ({ ...prev, month: value }));
                setCurrentPage(1);
              }}
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
              value={filterDate.year}
              onValueChange={(value) => {
                setFilterDate((prev) => ({ ...prev, year: value }));
                setCurrentPage(1);
              }}
              disabled={filterDate.month === 'all'}
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
            All ({gwContractsPagination?.total_items || 0})
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
          contracts={filteredContracts}
          loading={loading.gwContracts}
          deletingContractId={deletingContractId}
          onEdit={onEdit}
          onDelete={onDelete}
        />
        {gwContractsPagination && gwContractsPagination.total_pages > 1 && (
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
      </CardContent>
    </Card>
  );
}
