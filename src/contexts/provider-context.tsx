"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ProviderConfig, ProviderContextType, Model } from '@/types/provider';
import { OPENROUTER_FREE_MODELS } from '@/types/provider';

const ProviderContext = createContext<ProviderContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROVIDERS: 'ai-providers',
  SELECTED_PROVIDER: 'ai-selected-provider',
};

interface ProviderProviderProps {
  children: ReactNode;
}

export function ProviderProvider({ children }: ProviderProviderProps) {
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ProviderConfig | null>(null);

  // Load providers from localStorage on mount
  useEffect(() => {
    try {
      const savedProviders = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
      const savedSelectedProviderId = localStorage.getItem(STORAGE_KEYS.SELECTED_PROVIDER);
      
      if (savedProviders) {
        const parsedProviders = JSON.parse(savedProviders) as ProviderConfig[];
        setProviders(parsedProviders);
        
        if (savedSelectedProviderId) {
          const selectedProvider = parsedProviders.find(p => p.id === savedSelectedProviderId);
          if (selectedProvider) {
            setSelectedProvider(selectedProvider);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load providers from localStorage:', error);
    }
  }, []);

  // Save providers to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(providers));
    } catch (error) {
      console.error('Failed to save providers to localStorage:', error);
    }
  }, [providers]);

  // Save selected provider to localStorage whenever it changes
  useEffect(() => {
    try {
      if (selectedProvider) {
        localStorage.setItem(STORAGE_KEYS.SELECTED_PROVIDER, selectedProvider.id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.SELECTED_PROVIDER);
      }
    } catch (error) {
      console.error('Failed to save selected provider to localStorage:', error);
    }
  }, [selectedProvider]);

  const addProvider = (provider: ProviderConfig) => {
    setProviders(prev => [...prev, provider]);
    setSelectedProvider(provider); // Auto-select the newly added provider
  };

  const updateProvider = (id: string, updatedProvider: ProviderConfig) => {
    setProviders(prev => prev.map(p => p.id === id ? updatedProvider : p));
    if (selectedProvider?.id === id) {
      setSelectedProvider(updatedProvider);
    }
  };

  const deleteProvider = (id: string) => {
    setProviders(prev => prev.filter(p => p.id !== id));
    if (selectedProvider?.id === id) {
      setSelectedProvider(null);
    }
  };

  const handleSetSelectedProvider = (provider: ProviderConfig | null) => {
    setSelectedProvider(provider);
  };

  // Get available models based on selected provider
  const getAvailableModels = (): Model[] => {
    if (!selectedProvider) return [];
    
    switch (selectedProvider.type) {
      case 'openrouter':
        return OPENROUTER_FREE_MODELS.filter(model => 
          selectedProvider.selectedModels.includes(model.id)
        );
      case 'custom':
        return selectedProvider.selectedModels;
      case 'openai':
        // For OpenAI, we could return a list of standard OpenAI models
        // For now, returning empty array as models would be handled differently
        return [];
      default:
        return [];
    }
  };

  const value: ProviderContextType = {
    providers,
    selectedProvider,
    availableModels: getAvailableModels(),
    setSelectedProvider: handleSetSelectedProvider,
    addProvider,
    updateProvider,
    deleteProvider,
  };

  return (
    <ProviderContext.Provider value={value}>
      {children}
    </ProviderContext.Provider>
  );
}

export function useProvider() {
  const context = useContext(ProviderContext);
  if (context === undefined) {
    throw new Error('useProvider must be used within a ProviderProvider');
  }
  return context;
}