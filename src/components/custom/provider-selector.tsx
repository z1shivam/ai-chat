"use client";

import React, { useState } from 'react';
import { PlusIcon, ChevronDownIcon, Trash2Icon } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAppStore } from '@/store/appStore';
import type { ProviderConfig } from '@/types/provider';

interface ProviderSelectorProps {
  onAddProvider: () => void;
}

export function ProviderSelector({ onAddProvider }: ProviderSelectorProps) {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<ProviderConfig | null>(null);
  
  const { providers, selectedProvider, setSelectedProvider, deleteProvider } = useAppStore();

  const handleSelectProvider = (provider: ProviderConfig) => {
    setSelectedProvider(provider);
    setOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent, provider: ProviderConfig) => {
    e.stopPropagation(); // Prevent the CommandItem from being selected
    setProviderToDelete(provider);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (providerToDelete) {
      deleteProvider(providerToDelete.id);
      setProviderToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setProviderToDelete(null);
    setDeleteDialogOpen(false);
  };

  const getProviderDisplayName = (provider: ProviderConfig) => {
    return `${provider.name} (${provider.type})`;
  };

  return (
    <div className="flex w-full items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-fit justify-between"
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
                    className="cursor-pointer group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{provider.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {provider.type === 'openrouter' && 'OpenRouter'}
                          {provider.type === 'openai' && 'OpenAI'}
                          {provider.type === 'custom' && 'Custom Provider'}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => handleDeleteClick(e, provider)}
                        title="Delete provider"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Provider</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the provider &quot;{providerToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}