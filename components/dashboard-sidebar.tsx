'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BarChart3, FileText, Home, Settings } from 'lucide-react';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Usage',
    href: '/dashboard/usage',
    icon: BarChart3,
  },
  {
    title: 'Invoice',
    href: '/dashboard/invoices',
    icon: FileText,
  },
  {
    title: 'Setting',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function DashboardSidebar({
  className,
  isMobile = false,
  onLinkClick,
}: {
  className?: string;
  isMobile?: boolean;
  onLinkClick?: () => void;
}) {
  const pathname = usePathname();

  return (
    // Hapus `h-full` dari sini agar tingginya diatur otomatis oleh flexbox
    <aside className={cn('flex w-64 flex-col border-r bg-white', className)}>
      <div className={cn('flex flex-col gap-1 p-4', isMobile && 'pt-14')}>
        <nav className="grid gap-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium',
                pathname === item.href
                  ? 'bg-black text-white'
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
