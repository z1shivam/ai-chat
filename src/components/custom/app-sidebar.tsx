"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ProviderSelector } from "./provider-selector";
import { useAppStore } from "@/store/appStore";

export function AppSidebar() {
  const {setProviderModelOpen} = useAppStore()
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-between px-2 py-1 group-data-[collapsible=icon]:hidden">
            <Avatar>
              <AvatarImage
                src={"https://avatars.githubusercontent.com/u/118415844?v=4"}
              />
              <AvatarFallback>z1</AvatarFallback>
            </Avatar>
            <SidebarTrigger className="p-5" />
          </SidebarMenuItem>

          <SidebarMenuItem className="hidden justify-center px-2 py-2 group-data-[collapsible=icon]:flex">
            <SidebarTrigger />
          </SidebarMenuItem>
          <SidebarMenuItem className="block">
            <ProviderSelector
                            onAddProvider={() => setProviderModelOpen(true)}
                          />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Plus /> <span className="font-semibold">New Chat</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}
