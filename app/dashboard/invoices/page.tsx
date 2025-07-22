'use client';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Download, Eye, Loader2, AlertCircle, X } from 'lucide-react';
import { useDashboardStore } from '@/lib/store';
import { getInvoiceViewUrl, type Invoice } from '@/lib/api/invoices';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const statusStyles = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  overdue: 'bg-red-100 text-red-800',
  failed: 'bg-gray-100 text-gray-800',
};

export default function InvoicesPage() {
  const {
    invoices,
    loading,
    error,
    fetchInvoices,
    selectedClientId,
    clientName,
  } = useDashboardStore();

  const [isActionLoading, setIsActionLoading] = useState<number | null>(null);
  const [viewingUrl, setViewingUrl] = useState<string | null>(null);

  useEffect(() => {
    if (selectedClientId) {
      fetchInvoices();
    }
  }, [selectedClientId, fetchInvoices]);

  const handleView = async (invoiceId: number) => {
    setIsActionLoading(invoiceId);
    try {
      const data = await getInvoiceViewUrl(invoiceId);
      if (data.url) {
        setViewingUrl(data.url);
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

  const handleDownload = async (invoice: Invoice) => {
    setIsActionLoading(invoice.id);
    try {
      const { url } = await getInvoiceViewUrl(invoice.id);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Gagal mengunduh file dari server.');
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      toast({
        title: 'Gagal Mengunduh Tagihan',
        description: err.message || 'Terjadi kesalahan saat proses unduh.',
        variant: 'destructive',
      });
    } finally {
      setIsActionLoading(null);
    }
  };

  const renderContent = () => {
    if (loading.invoices) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (invoices.length === 0) {
      return (
        <div className="text-center h-64 flex items-center justify-center">
          <p className="text-muted-foreground">
            Tidak ada data tagihan yang ditemukan untuk client ini.
          </p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No. Invoice</TableHead>
            <TableHead>Periode</TableHead>
            <TableHead>Jatuh Tempo</TableHead>
            <TableHead>Jumlah</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">
                {invoice.invoiceNumber}
              </TableCell>
              <TableCell>{invoice.period}</TableCell>
              <TableCell>{invoice.dueDate}</TableCell>
              <TableCell>{invoice.total}</TableCell>
              <TableCell>
                <div
                  className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
                    statusStyles[invoice.status] || statusStyles.failed
                  )}
                >
                  {invoice.status}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleView(invoice.id)}
                    disabled={isActionLoading === invoice.id}
                  >
                    {isActionLoading === invoice.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">Lihat</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(invoice)}
                    disabled={isActionLoading === invoice.id}
                  >
                    {isActionLoading === invoice.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span className="sr-only">Unduh</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <>
      <Dialog
        open={!!viewingUrl}
        onOpenChange={(open) => !open && setViewingUrl(null)}
      >
        <DialogContent className="max-w-4xl w-full h-[90vh] p-4 bg-transparent border-0 shadow-none focus:outline-none">
          <Card className="w-full h-full relative flex flex-col">
            <DialogTitle className="sr-only">Pratinjau Tagihan</DialogTitle>
            <DialogClose asChild>
              <Button
                variant="ghost"
                className="absolute top-[-14px] right-[-14px] z-20 h-9 w-9 rounded-full p-0 bg-background border shadow-md hover:bg-muted"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
            <CardContent className="p-2 flex-grow h-full overflow-hidden rounded-lg">
              {viewingUrl && (
                <iframe
                  src={viewingUrl}
                  className="w-full h-full border-0"
                  title="Pratinjau Tagihan"
                />
              )}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tagihan</h1>
            <p className="text-muted-foreground">
              Riwayat tagihan untuk {clientName || '...'}
            </p>
          </div>
          <Button disabled={invoices.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Ekspor
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Riwayat Tagihan</CardTitle>
            <CardDescription>
              Daftar tagihan penggunaan GCP Anda
            </CardDescription>
          </CardHeader>
          <CardContent>{renderContent()}</CardContent>
        </Card>
      </div>
    </>
  );
}
