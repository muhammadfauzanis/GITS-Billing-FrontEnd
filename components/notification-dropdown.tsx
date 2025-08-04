'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Check, Info } from 'lucide-react';

export function NotificationDropdown() {
  const { notifications, unreadCount, fetchNotifications, markAsRead } =
    useDashboardStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = (id: number) => {
    markAsRead(id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-600 text-white">
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>

      {/* ✅ Perbaikan: lebar lebih besar dan scroll jika banyak */}
      <DropdownMenuContent
        align="end"
        className="w-[400px] max-h-96 overflow-y-auto"
      >
        <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <DropdownMenuItem
              key={notif.id}
              className="flex flex-col items-start gap-2 p-3 cursor-default"
            >
              <div className="flex items-start gap-3 w-full">
                <Info className="h-4 w-4 mt-1 text-blue-500 shrink-0" />
                <div className="flex-1">
                  {/* ✅ Perbaikan: agar teks tidak terpotong */}
                  <p className="text-sm break-words whitespace-normal">
                    {notif.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notif.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* ✅ Perbaikan: tombol dibaca pindah ke bawah */}
              <div className="flex justify-end w-full">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkAsRead(notif.id)}
                >
                  <Check className="h-4 w-4 mr-1" /> Tandai Dibaca
                </Button>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Tidak ada notifikasi baru.
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
