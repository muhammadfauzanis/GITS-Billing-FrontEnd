'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDashboardStore } from '@/lib/store';

type Props = {
  onClientChange: (clientId: string) => void;
  selectedClientId?: string;
};

export function ClientSelector({ onClientChange, selectedClientId }: Props) {
  const clients = useDashboardStore((state) => state.clients);

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
