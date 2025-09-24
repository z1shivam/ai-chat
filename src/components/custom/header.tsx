"use client";

import React from "react";
import { ProviderSelector } from "./provider-selector";
import { AddProviderDialog } from "./add-provider-dialog";
import { ModeToggle } from "../theme-toggle";
import { SidebarTrigger } from "../ui/sidebar";
import { useAppStore } from "@/store/appStore";
import { Button } from "../ui/button";
import { MessageCirclePlus } from "lucide-react";

export default function Header() {
  const {
    providerModelOpen,
    setProviderModelOpen,
    conversations,
    createConversation,
  } = useAppStore();
  const handleNewChat = async () => {
    const totalChats = conversations.length;
    const newChatName = `Untitled ${totalChats + 1}`;
    await createConversation(newChatName);
  };
  return (
    <>
      <header className="bg-background/50 border-secondary fixed top-0 z-40 h-14 w-full border-b backdrop-blur-md">
        <div className="flex h-full w-full items-center justify-between px-4">
          <div className="flex w-full items-center justify-between gap-4 md:justify-start">
            <div className="flex items-center gap-4">
              <span className="hidden font-semibold md:block">z1 AI</span>
              <div className="block md:hidden">
                <SidebarTrigger />
              </div>
              <span className="font-semibold md:hidden">z1 AI</span>
            </div>
            <div className="hidden md:block">
              <ProviderSelector
                onAddProvider={() => setProviderModelOpen(true)}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant={"outline"}
                size={"icon"}
                className="flex md:hidden"
                onClick={handleNewChat}
              >
                <MessageCirclePlus />
              </Button>
              <ModeToggle />
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
