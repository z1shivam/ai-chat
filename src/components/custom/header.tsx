"use client";

import React, { useState } from "react";
import { ProviderSelector } from "./provider-selector";
import { AddProviderDialog } from "./add-provider-dialog";
import { SidebarTrigger } from "../ui/sidebar";
import { useTheme } from "next-themes";
import { ModeToggle } from "../theme-toggle";

export default function Header() {
  const [isAddProviderDialogOpen, setIsAddProviderDialogOpen] = useState(false);
  const { setTheme } = useTheme();

  return (
    <>
      <header className="fixed top-0 z-40 h-14 w-full bg-background/50 backdrop-blur-md border-b-2 border-secondary">
        <div className="flex h-full items-center justify-between px-4 w-full">
          <div className="flex items-center gap-4">
            <span className="font-semibold">z1</span>
            <ProviderSelector
              onAddProvider={() => setIsAddProviderDialogOpen(true)}
            />
            <ModeToggle />
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
