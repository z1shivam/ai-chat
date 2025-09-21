"use client";

import React, { useState } from 'react';
import { PlusIcon, ChevronDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useProvider } from '@/contexts/provider-context';
import type { ProviderConfig } from '@/types/provider';

interface ProviderSelectorProps {
  onAddProvider: () => void;
}

export function ProviderSelector({ onAddProvider }: ProviderSelectorProps) {
  const [open, setOpen] = useState(false);
  const { providers, selectedProvider, setSelectedProvider } = useProvider();

  const handleSelectProvider = (provider: ProviderConfig) => {
    setSelectedProvider(provider);
    setOpen(false);
  };

  const getProviderDisplayName = (provider: ProviderConfig) => {
    return `${provider.name} (${provider.type})`;
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[250px] justify-between"
          >
            {selectedProvider ? (
              <span className="truncate">
                {getProviderDisplayName(selectedProvider)}
              </span>
            ) : (
              <span className="text-muted-foreground">No provider selected</span>
            )}
            <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0">
          <Command>
            <CommandInput placeholder="Search providers..." />
            <CommandList>
              <CommandEmpty>No providers found.</CommandEmpty>
              <CommandGroup>
                {providers.map((provider) => (
                  <CommandItem
                    key={provider.id}
                    value={provider.id}
                    onSelect={() => handleSelectProvider(provider)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{provider.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {provider.type === 'openrouter' && 'OpenRouter'}
                        {provider.type === 'openai' && 'OpenAI'}
                        {provider.type === 'custom' && 'Custom Provider'}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      <Button
        variant="outline"
        size="icon"
        onClick={onAddProvider}
        title="Add Provider"
      >
        <PlusIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}