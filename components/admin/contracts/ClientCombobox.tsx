'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Client } from '@/lib/adminStore';

interface ClientComboboxProps {
  clients: Client[];
  value: { id: number | null; name: string };
  onChange: (value: { id: number | null; name: string }) => void;
}

export const ClientCombobox: React.FC<ClientComboboxProps> = ({
  clients,
  value,
  onChange,
}) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (client: Client) => {
    if (client.id === value.id) {
      onChange({ id: null, name: '' });
    } else {
      onChange({ id: client.id, name: client.name });
    }
    setOpen(false);
  };

  const handleInputChange = (searchQuery: string) => {
    const matchedClient = clients.find(
      (c) => c.name.toLowerCase() === searchQuery.toLowerCase()
    );
    if (matchedClient) {
      onChange({ id: matchedClient.id, name: matchedClient.name });
    } else {
      onChange({ id: null, name: searchQuery });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value.name ? value.name : 'Pilih atau ketik nama client...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput
            placeholder="Cari client..."
            value={value.name}
            onValueChange={handleInputChange}
          />
          <CommandList>
            <CommandEmpty>
              <p className="p-4 text-sm text-center">
                Client tidak ditemukan. <br /> Silakan buat client terlebih
                dahulu.
              </p>
            </CommandEmpty>
            <CommandGroup>
              {clients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={client.name}
                  onSelect={() => handleSelect(client)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value.id === client.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {client.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
