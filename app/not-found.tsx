import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Home, ArrowLeft, Search, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <FileQuestion className="h-10 w-10 text-gray-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Halaman Tidak Ditemukan
            </CardTitle>
            <CardDescription className="text-gray-600">
              Maaf, halaman yang Anda cari tidak dapat ditemukan atau mungkin
              telah dipindahkan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-6xl font-bold text-gray-300 mb-4">404</div>

            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/dashboard">
                  <Home className="mr-2 h-4 w-4" />
                  Kembali ke Dashboard
                </Link>
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link href="javascript:history.back()">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Halaman Sebelumnya
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 mb-3">
                Atau coba navigasi ke:
              </p>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="w-full justify-start"
                >
                  <Link href="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="w-full justify-start"
                >
                  <Link href="/dashboard/usage">
                    <Search className="mr-2 h-4 w-4" />
                    Penggunaan
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Jika masalah berlanjut, silakan hubungi{' '}
            <a
              href="mailto:support@company.com"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              tim support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
