"use client";

import React, { useState } from "react";
import { ProviderSelector } from "./provider-selector";
import { AddProviderDialog } from "./add-provider-dialog";
import { useTheme } from "next-themes";
import { ModeToggle } from "../theme-toggle";
import { SidebarTrigger } from "../ui/sidebar";
import { useAppStore } from "@/store/appStore";

export default function Header() {
  const {providerModelOpen, setProviderModelOpen} = useAppStore();
  return (
    <>
      <header className="bg-background/50 border-secondary fixed top-0 z-40 h-14 w-full border-b-2 backdrop-blur-md">
        <div className="flex h-full w-full items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <span className="font-semibold">z1</span>
            <div className="block md:hidden">
              <SidebarTrigger />
            </div>
            <ModeToggle />
            <div className="hidden md:block">
              <ProviderSelector
                onAddProvider={() => setProviderModelOpen(true)}
              />
            </div>
          </div>
        </div>
      </header>

      <AddProviderDialog
        open={providerModelOpen}
        onOpenChange={setProviderModelOpen}
      />
    </>
  );
}
