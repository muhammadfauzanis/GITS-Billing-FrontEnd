'use client';

import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getClients } from '@/lib/api';

type Props = {
  onClientChange: (clientId: string) => void;
  selectedClientId?: string;
};

export function ClientSelector({ onClientChange, selectedClientId }: Props) {
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await getClients();
        setClients(response.clients);
      } catch (err) {
        console.error('Failed to fetch clients:', err);
      }
    };

    fetchClients();
  }, []);

  return (
    <Select value={selectedClientId} onValueChange={onClientChange}>
      <SelectTrigger>
        <SelectValue placeholder="Pilih Client" />
      </SelectTrigger>
      <SelectContent>
        {clients.map((client) => (
          <SelectItem key={client.id} value={client.id}>
            {client.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
