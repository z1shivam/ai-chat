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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { ProviderSelector } from "./provider-selector";
import { Switch } from "../ui/switch";
import { Settings } from "lucide-react";

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
    settings,
    updateSettings,
  } = useAppStore();

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [isCustomizeDialogOpen, setIsCustomizeDialogOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [newName, setNewName] = useState("");
  const [systemPromptType, setSystemPromptType] = useState<string>("default");
  const [customPrompt, setCustomPrompt] = useState("");

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  // Initialize prompt states when dialog opens
  useEffect(() => {
    if (isCustomizeDialogOpen) {
      setCustomPrompt(settings.systemPrompt);
      // Determine current prompt type
      if (settings.systemPrompt === "You are a helpful AI assistant.") {
        setSystemPromptType("default");
      } else if (settings.systemPrompt === "Please provide concise and direct answers.") {
        setSystemPromptType("concise");
      } else if (settings.systemPrompt === "You are a friendly conversational AI. Engage naturally and ask follow-up questions when appropriate.") {
        setSystemPromptType("conversational");
      } else {
        setSystemPromptType("custom");
      }
    }
  }, [isCustomizeDialogOpen, settings.systemPrompt]);

  const predefinedPrompts = {
    default: "You are a helpful AI assistant.",
    concise: "Please provide concise and direct answers.",
    conversational: "You are a friendly conversational AI. Engage naturally and ask follow-up questions when appropriate.",
  };

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

  const handlePromptTypeChange = (value: string) => {
    setSystemPromptType(value);
    if (value !== "custom") {
      setCustomPrompt(predefinedPrompts[value as keyof typeof predefinedPrompts]);
    }
  };

  const handleSaveCustomize = () => {
    const promptToSave = systemPromptType === "custom" 
      ? customPrompt 
      : predefinedPrompts[systemPromptType as keyof typeof predefinedPrompts];
    
    updateSettings({ systemPrompt: promptToSave });
    setIsCustomizeDialogOpen(false);
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
                  <MessageCirclePlus />{" "}
                  <span className="font-semibold">New Chat</span>
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
                                className="hover:bg-accent hover:text-accent-foreground inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md p-0 opacity-100 transition-opacity group-hover:opacity-100 md:opacity-0"
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
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
                                className="font-semibold text-red-400 hover:text-red-300"
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

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
              <div className="flex items-center gap-2 px-2 py-2">
                <Switch 
                  checked={settings.zdrEnabled} 
                  onCheckedChange={(checked) => updateSettings({ zdrEnabled: checked })}
                />
                <span className="text-sm font-medium">Zero Data Retention</span>
              </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setIsCustomizeDialogOpen(true)}>
                <Settings />
                <span className="font-medium">Customize AI</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
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

      {/* Customize AI Dialog */}
      <Dialog
        open={isCustomizeDialogOpen}
        onOpenChange={setIsCustomizeDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customize AI</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Enable System Prompt</span>
              <Switch 
                checked={settings.systemPromptEnabled} 
                onCheckedChange={(checked) => updateSettings({ systemPromptEnabled: checked })}
              />
            </div>
            
            {settings.systemPromptEnabled && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium">System Prompt Type</span>
                  <Select value={systemPromptType} onValueChange={handlePromptTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select prompt type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="concise">Concise</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {systemPromptType === "custom" ? (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Custom System Prompt</span>
                    <Textarea 
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Enter your custom system prompt..."
                      className="min-h-[100px]"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Preview</span>
                    <div className="p-3 bg-muted rounded-md text-sm">
                      {predefinedPrompts[systemPromptType as keyof typeof predefinedPrompts]}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCustomizeDialogOpen(false)}
            >
              Close
            </Button>
            <Button onClick={handleSaveCustomize}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
