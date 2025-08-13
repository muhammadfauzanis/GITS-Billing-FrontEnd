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
  value: string;
  onChange: (value: string) => void;
}

export const ClientCombobox: React.FC<ClientComboboxProps> = ({
  clients,
  value,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleSelect = (clientName: string) => {
    onChange(clientName);
    setSearch(clientName);
    setOpen(false);
  };

  const handleInputChange = (searchValue: string) => {
    setSearch(searchValue);
    onChange(searchValue);
  };

  const displayValue = value
    ? clients.find((c) => c.name.toLowerCase() === value.toLowerCase())?.name ||
      value
    : 'Pilih atau ketik nama client...';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {displayValue}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput
            placeholder="Cari client atau ketik baru..."
            value={search}
            onValueChange={handleInputChange}
          />
          {/* FIX: Menambahkan max-height dan overflow agar list bisa di-scroll */}
          <CommandList className="max-h-[250px] overflow-y-auto">
            <CommandEmpty>Client tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {clients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={client.name}
                  onSelect={() => handleSelect(client.name)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value.toLowerCase() === client.name.toLowerCase()
                        ? 'opacity-100'
                        : 'opacity-0'
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
