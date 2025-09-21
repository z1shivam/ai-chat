"use client";

import React, { useState } from 'react';
import { ProviderSelector } from './provider-selector';
import { AddProviderDialog } from './add-provider-dialog';

export default function Header() {
  const [isAddProviderDialogOpen, setIsAddProviderDialogOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 h-14 w-full border-b-2 border-slate-200 bg-white z-40">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <span className="font-semibold">AI Chat</span>
            <ProviderSelector onAddProvider={() => setIsAddProviderDialogOpen(true)} />
          </div>
        </div>
      </header>
      
      <AddProviderDialog 
        open={isAddProviderDialogOpen} 
        onOpenChange={setIsAddProviderDialogOpen}
      />
    </>
  );
}
