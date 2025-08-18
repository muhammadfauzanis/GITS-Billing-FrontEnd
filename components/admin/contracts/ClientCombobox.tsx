'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Client, GwClient } from '@/lib/adminStore';

// Komponen ini sekarang bisa menerima klien GCP atau GW
interface ClientComboboxProps {
  clients: (Client | GwClient)[];
  value: number | null;
  onChange: (clientId: string) => void;
  placeholder?: string;
}

export const ClientCombobox: React.FC<ClientComboboxProps> = ({
  clients,
  value,
  onChange,
  placeholder = 'Pilih client...',
}) => {
  return (
    <Select value={value ? value.toString() : ''} onValueChange={onChange}>
      <SelectTrigger className="w-full justify-between font-normal">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      {/* SelectContent akan otomatis menangani z-index dan positioning di dalam dialog */}
      <SelectContent>
        {clients.length > 0 ? (
          clients.map((client) => (
            // Gunakan kombinasi ID dan nama untuk key yang unik jika ada kemungkinan ID duplikat antar tipe
            <SelectItem
              key={`${client.id}-${client.name}`}
              value={client.id.toString()}
            >
              {client.name}
            </SelectItem>
          ))
        ) : (
          <div className="p-4 text-sm text-center text-muted-foreground">
            Tidak ada client ditemukan.
          </div>
        )}
      </SelectContent>
    </Select>
  );
};
