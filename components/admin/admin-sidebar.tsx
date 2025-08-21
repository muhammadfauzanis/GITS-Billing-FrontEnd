'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Users,
  UserPlus,
  Home,
  Settings,
  FileText,
  FileBadge, // Impor ikon baru
} from 'lucide-react';

const sidebarItems = [
  { title: 'Dashboard', href: '/admin', icon: Home },
  { title: 'Kelola User', href: '/admin/users', icon: Users },
  { title: 'Buat Akun', href: '/admin/create-user', icon: UserPlus },
  { title: 'Kelola Kontrak', href: '/admin/contracts', icon: FileText },
  { title: 'Kelola Invoice', href: '/admin/invoices', icon: FileBadge },
  { title: 'Pengaturan', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 flex-col border-r bg-white md:flex">
      <div className="flex flex-col gap-1 p-4">
        <nav className="grid gap-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium',
                pathname === item.href
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
