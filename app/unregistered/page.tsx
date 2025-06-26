// app/unregistered/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UserX } from 'lucide-react';

export default function UnregisteredPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <UserX className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Akses Ditolak</CardTitle>
          <CardDescription>
            Akun Google Anda belum terdaftar dalam sistem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Silakan hubungi team GITS Cloud untuk mendaftarkan akun Anda agar
            dapat mengakses dashboard.
          </p>
          <Button asChild className="w-full">
            <Link href="/">Kembali ke Halaman Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
