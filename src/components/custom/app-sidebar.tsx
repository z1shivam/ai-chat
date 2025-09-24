"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DatabaseService } from "@/lib/database";
import { useAppStore } from "@/store/appStore";
import {
  Edit2,
  MessageCircle,
  MessageCirclePlus,
  MoreHorizontal,
  Trash,
  Trash2
} from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { ProviderSelector } from "./provider-selector";

export function AppSidebar() {
  const {
    setProviderModelOpen,
    conversations,
    createConversation,
    deleteConversation,
    renameConversation,
    setCurrentConversation,
    currentConversationId,
    loadConversations,
    clearAllData,
  } = useAppStore();

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  const handleNewChat = async () => {
    const totalChats = conversations.length;
    const newChatName = `Untitled ${totalChats + 1}`;
    await createConversation(newChatName);
  };

  const handleDeleteAllChats = async () => {
    try {
      // Clear all data from database
      await DatabaseService.clearAllData();
      // Clear app store data
      await clearAllData();
      // Reload conversations (should be empty now)
      await loadConversations();
      setIsDeleteAllDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete all chats:", error);
    }
  };

  const handleConversationClick = (conversationId: string) => {
    setCurrentConversation(conversationId);
  };

  const handleRenameClick = (conversationId: string, currentName: string) => {
    setSelectedConversationId(conversationId);
    setNewName(currentName);
    setIsRenameDialogOpen(true);
  };

  const handleDeleteClick = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const handleRenameSubmit = async () => {
    if (selectedConversationId && newName.trim()) {
      try {
        await renameConversation(selectedConversationId, newName.trim());
        setIsRenameDialogOpen(false);
        setSelectedConversationId(null);
        setNewName("");
      } catch (error) {
        console.error("Failed to rename conversation:", error);
      }
    }
  };

  const handleRenameCancel = () => {
    setIsRenameDialogOpen(false);
    setSelectedConversationId(null);
    setNewName("");
  };

  return (
    <>
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
            <SidebarMenuItem className={`block md:hidden`}>
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
                <SidebarMenuButton onClick={handleNewChat}>
                  <MessageCirclePlus /> <span className="font-semibold">New Chat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsDeleteAllDialogOpen(true)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash />{" "}
                  <span className="font-semibold">Delete All Chats</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Conversations</SidebarGroupLabel>
            <SidebarMenu>
              {conversations.map((conv) => {
                const isActive = conv.id === currentConversationId;
                return (
                  <SidebarMenuItem key={conv.id}>
                    <div className="group flex w-full items-center">
                      <SidebarMenuButton
                        onClick={() => handleConversationClick(conv.id)}
                        className={`flex-1 ${isActive ? "bg-accent text-accent-foreground" : ""}`}
                      >
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <MessageCircle className="shrink-0" />
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{conv.name}</p>
                          </TooltipContent>
                        </Tooltip>
                        <div className="flex w-full items-center justify-between">
                          <div className="w-full truncate">{conv.name}</div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <div
                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md p-0 opacity-100 md:opacity-0 transition-opacity hover:bg-accent hover:text-accent-foreground group-hover:opacity-100 cursor-pointer"
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleRenameClick(conv.id, conv.name)
                                }
                              >
                                <Edit2 className="mr-2 h-4 w-4" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(conv.id)}
                                className="text-red-400 hover:text-red-300 font-semibold"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </SidebarMenuButton>
                    </div>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter />
      </Sidebar>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Conversation</DialogTitle>
            <DialogDescription>
              Enter a new name for this conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Conversation name"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void handleRenameSubmit();
                } else if (e.key === "Escape") {
                  handleRenameCancel();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleRenameCancel}>
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit} disabled={!newName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete All Confirmation Dialog */}
      <Dialog
        open={isDeleteAllDialogOpen}
        onOpenChange={setIsDeleteAllDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Conversations</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all conversations? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteAllDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAllChats}>
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
