"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import type { OpenRouterProviderConfig, OpenAIProviderConfig, CustomProviderConfig, Model } from '@/types/provider';
import { OPENROUTER_FREE_MODELS } from '@/types/provider';

interface AddProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddProviderDialog({ open, onOpenChange }: AddProviderDialogProps) {
  const { addProvider } = useAppStore();
  const [activeTab, setActiveTab] = useState('openrouter');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OpenRouter form state
  const [openRouterForm, setOpenRouterForm] = useState({
    name: '',
    apiKey: '',
    selectedModels: [] as string[],
    httpReferer: '',
    xTitle: '',
  });
  const [modelSearchTerm, setModelSearchTerm] = useState('');
  const [showAdvancedOR, setShowAdvancedOR] = useState(false);

  // OpenAI form state
  const [openAIForm, setOpenAIForm] = useState({
    name: '',
    apiKey: '',
    baseURL: '',
    httpReferer: '',
    xTitle: '',
  });

  // Custom form state
  const [customForm, setCustomForm] = useState({
    name: '',
    apiKey: '',
    baseURL: '',
    customModels: [] as Model[],
    httpReferer: '',
    xTitle: '',
    newModelName: '',
    newModelId: '',
  });
  const [showAdvancedOA, setShowAdvancedOA] = useState(false);
  const [showAdvancedCustom, setShowAdvancedCustom] = useState(false);

  const handleOpenRouterSubmit = async () => {
    if (!openRouterForm.name || !openRouterForm.apiKey || openRouterForm.selectedModels.length === 0) {
      return;
    }

    setIsSubmitting(true);
    
    const provider: OpenRouterProviderConfig = {
      id: crypto.randomUUID(),
      name: openRouterForm.name,
      type: 'openrouter',
      apiKey: openRouterForm.apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      selectedModels: openRouterForm.selectedModels,
      defaultHeaders: {
        ...(openRouterForm.httpReferer && { 'HTTP-Referer': openRouterForm.httpReferer }),
        ...(openRouterForm.xTitle && { 'X-Title': openRouterForm.xTitle }),
      },
    };

    addProvider(provider);
    resetForms();
    onOpenChange(false);
    setIsSubmitting(false);
  };

  const handleOpenAISubmit = async () => {
    if (!openAIForm.name || !openAIForm.apiKey) {
      return;
    }

    setIsSubmitting(true);
    
    const provider: OpenAIProviderConfig = {
      id: crypto.randomUUID(),
      name: openAIForm.name,
      type: 'openai',
      apiKey: openAIForm.apiKey,
      ...(openAIForm.baseURL && { baseURL: openAIForm.baseURL }),
      defaultHeaders: {
        ...(openAIForm.httpReferer && { 'HTTP-Referer': openAIForm.httpReferer }),
        ...(openAIForm.xTitle && { 'X-Title': openAIForm.xTitle }),
      },
    };

    addProvider(provider);
    resetForms();
    onOpenChange(false);
    setIsSubmitting(false);
  };

  const handleCustomSubmit = async () => {
    if (!customForm.name || !customForm.apiKey || !customForm.baseURL || customForm.customModels.length === 0) {
      return;
    }

    setIsSubmitting(true);
    
    const provider: CustomProviderConfig = {
      id: crypto.randomUUID(),
      name: customForm.name,
      type: 'custom',
      apiKey: customForm.apiKey,
      baseURL: customForm.baseURL,
      selectedModels: customForm.customModels,
      defaultHeaders: {
        ...(customForm.httpReferer && { 'HTTP-Referer': customForm.httpReferer }),
        ...(customForm.xTitle && { 'X-Title': customForm.xTitle }),
      },
    };

    addProvider(provider);
    resetForms();
    onOpenChange(false);
    setIsSubmitting(false);
  };

  const resetForms = () => {
    setOpenRouterForm({
      name: '',
      apiKey: '',
      selectedModels: [],
      httpReferer: '',
      xTitle: '',
    });
    setOpenAIForm({
      name: '',
      apiKey: '',
      baseURL: '',
      httpReferer: '',
      xTitle: '',
    });
    setCustomForm({
      name: '',
      apiKey: '',
      baseURL: '',
      customModels: [],
      httpReferer: '',
      xTitle: '',
      newModelName: '',
      newModelId: '',
    });
  };

  const handleModelToggle = (modelId: string, checked: boolean) => {
    setOpenRouterForm(prev => ({
      ...prev,
      selectedModels: checked 
        ? [...prev.selectedModels, modelId]
        : prev.selectedModels.filter(id => id !== modelId)
    }));
  };

  const addCustomModel = () => {
    if (!customForm.newModelName || !customForm.newModelId) return;
    
    const newModel: Model = {
      id: customForm.newModelId,
      name: customForm.newModelName,
      displayName: customForm.newModelName,
      inputCost: 0,
      outputCost: 0,
      contextLength: 4096, // Default context length
    };

    setCustomForm(prev => ({
      ...prev,
      customModels: [...prev.customModels, newModel],
      newModelName: '',
      newModelId: '',
    }));
  };

  const removeCustomModel = (modelId: string) => {
    setCustomForm(prev => ({
      ...prev,
      customModels: prev.customModels.filter(model => model.id !== modelId)
    }));
  };

  const filteredModels = OPENROUTER_FREE_MODELS.filter(model => 
    model.displayName.toLowerCase().includes(modelSearchTerm.toLowerCase()) ||
    model.id.toLowerCase().includes(modelSearchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add AI Provider</DialogTitle>
          <DialogDescription>
            Configure a new AI provider. Currently, OpenAI SDK based providers are supported.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="openrouter">OpenRouter</TabsTrigger>
            <TabsTrigger value="openai">OpenAI</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="openrouter" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="or-name" className="text-sm font-medium">Provider Name</label>
                <Input
                  id="or-name"
                  value={openRouterForm.name}
                  onChange={(e) => setOpenRouterForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My OpenRouter Provider"
                  className="mt-1"
                />
              </div>
              
              <div>
                <label htmlFor="or-apikey" className="text-sm font-medium">API Key</label>
                <Input
                  id="or-apikey"
                  type="password"
                  value={openRouterForm.apiKey}
                  onChange={(e) => setOpenRouterForm(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="sk-or-..."
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Select Models</label>
                <div className="mt-1">
                  <Input
                    placeholder="Search models..."
                    value={modelSearchTerm}
                    onChange={(e) => setModelSearchTerm(e.target.value)}
                    className="mb-2"
                  />
                  <div className="max-h-60 overflow-y-auto border rounded-md p-4 space-y-2">
                    {filteredModels.map((model) => (
                      <div key={model.id} className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          id={model.id}
                          checked={openRouterForm.selectedModels.includes(model.id)}
                          onChange={(e) => handleModelToggle(model.id, e.target.checked)}
                          className="mt-1"
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={model.id}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            {model.displayName}
                          </label>
                          <p className="text-xs text-muted-foreground">
                            ID: {model.id} | Context: {model.contextLength.toLocaleString()} tokens
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {filteredModels.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No models found matching &quot;{modelSearchTerm}&quot;
                    </p>
                  )}
                </div>
              </div>

              <Collapsible open={showAdvancedOR} onOpenChange={setShowAdvancedOR}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto">
                    {showAdvancedOR ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                    <span className="text-sm font-medium">Advanced Settings</span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div>
                    <label htmlFor="or-referer" className="text-sm font-medium">HTTP Referer (Optional)</label>
                    <Input
                      id="or-referer"
                      value={openRouterForm.httpReferer}
                      onChange={(e) => setOpenRouterForm(prev => ({ ...prev, httpReferer: e.target.value }))}
                      placeholder="https://your-site.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label htmlFor="or-title" className="text-sm font-medium">Site Title (Optional)</label>
                    <Input
                      id="or-title"
                      value={openRouterForm.xTitle}
                      onChange={(e) => setOpenRouterForm(prev => ({ ...prev, xTitle: e.target.value }))}
                      placeholder="Your Site Name"
                      className="mt-1"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Button 
                onClick={handleOpenRouterSubmit} 
                disabled={!openRouterForm.name || !openRouterForm.apiKey || openRouterForm.selectedModels.length === 0 || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Adding...' : 'Add OpenRouter Provider'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="openai" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="oa-name" className="text-sm font-medium">Provider Name</label>
                <Input
                  id="oa-name"
                  value={openAIForm.name}
                  onChange={(e) => setOpenAIForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My OpenAI Provider"
                  className="mt-1"
                />
              </div>
              
              <div>
                <label htmlFor="oa-apikey" className="text-sm font-medium">API Key</label>
                <Input
                  id="oa-apikey"
                  type="password"
                  value={openAIForm.apiKey}
                  onChange={(e) => setOpenAIForm(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="sk-..."
                  className="mt-1"
                />
              </div>

              <Collapsible open={showAdvancedOA} onOpenChange={setShowAdvancedOA}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto">
                    {showAdvancedOA ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                    <span className="text-sm font-medium">Advanced Settings</span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div>
                    <label htmlFor="oa-baseurl" className="text-sm font-medium">Base URL (Optional)</label>
                    <Input
                      id="oa-baseurl"
                      value={openAIForm.baseURL}
                      onChange={(e) => setOpenAIForm(prev => ({ ...prev, baseURL: e.target.value }))}
                      placeholder="https://api.openai.com/v1"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label htmlFor="oa-referer" className="text-sm font-medium">HTTP Referer (Optional)</label>
                    <Input
                      id="oa-referer"
                      value={openAIForm.httpReferer}
                      onChange={(e) => setOpenAIForm(prev => ({ ...prev, httpReferer: e.target.value }))}
                      placeholder="https://your-site.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label htmlFor="oa-title" className="text-sm font-medium">Site Title (Optional)</label>
                    <Input
                      id="oa-title"
                      value={openAIForm.xTitle}
                      onChange={(e) => setOpenAIForm(prev => ({ ...prev, xTitle: e.target.value }))}
                      placeholder="Your Site Name"
                      className="mt-1"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Button 
                onClick={handleOpenAISubmit} 
                disabled={!openAIForm.name || !openAIForm.apiKey || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Adding...' : 'Add OpenAI Provider'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="cu-name" className="text-sm font-medium">Provider Name</label>
                <Input
                  id="cu-name"
                  value={customForm.name}
                  onChange={(e) => setCustomForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Custom Provider"
                  className="mt-1"
                />
              </div>
              
              <div>
                <label htmlFor="cu-apikey" className="text-sm font-medium">API Key</label>
                <Input
                  id="cu-apikey"
                  type="password"
                  value={customForm.apiKey}
                  onChange={(e) => setCustomForm(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Your API key"
                  className="mt-1"
                />
              </div>

              <div>
                <label htmlFor="cu-baseurl" className="text-sm font-medium">Base URL</label>
                <Input
                  id="cu-baseurl"
                  value={customForm.baseURL}
                  onChange={(e) => setCustomForm(prev => ({ ...prev, baseURL: e.target.value }))}
                  placeholder="https://api.custom-provider.com/v1"
                  className="mt-1"
                />
              </div>

              <Collapsible open={showAdvancedCustom} onOpenChange={setShowAdvancedCustom}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto">
                    {showAdvancedCustom ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                    <span className="text-sm font-medium">Advanced Settings</span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div>
                    <label htmlFor="cu-referer" className="text-sm font-medium">HTTP Referer (Optional)</label>
                    <Input
                      id="cu-referer"
                      value={customForm.httpReferer}
                      onChange={(e) => setCustomForm(prev => ({ ...prev, httpReferer: e.target.value }))}
                      placeholder="https://your-site.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label htmlFor="cu-title" className="text-sm font-medium">Site Title (Optional)</label>
                    <Input
                      id="cu-title"
                      value={customForm.xTitle}
                      onChange={(e) => setCustomForm(prev => ({ ...prev, xTitle: e.target.value }))}
                      placeholder="Your Site Name"
                      className="mt-1"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <div>
                <label className="text-sm font-medium">Custom Models</label>
                <div className="space-y-2 mt-1">
                  <div className="flex gap-2">
                    <Input
                      value={customForm.newModelName}
                      onChange={(e) => setCustomForm(prev => ({ ...prev, newModelName: e.target.value }))}
                      placeholder="Model Display Name"
                      className="flex-1"
                    />
                    <Input
                      value={customForm.newModelId}
                      onChange={(e) => setCustomForm(prev => ({ ...prev, newModelId: e.target.value }))}
                      placeholder="Model ID"
                      className="flex-1"
                    />
                    <Button 
                      onClick={addCustomModel}
                      disabled={!customForm.newModelName || !customForm.newModelId}
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>
                  
                  {customForm.customModels.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                      {customForm.customModels.map((model) => (
                        <div key={model.id} className="flex items-center justify-between text-sm">
                          <span>{model.displayName} ({model.id})</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeCustomModel(model.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Button 
                onClick={handleCustomSubmit} 
                disabled={!customForm.name || !customForm.apiKey || !customForm.baseURL || customForm.customModels.length === 0 || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Adding...' : 'Add Custom Provider'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}