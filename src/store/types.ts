import type { ProviderConfig, Model } from "@/types/provider";
import type { DBMessage } from "@/lib/database";

// Conversation types (lightweight version without messages)
export interface Conversation {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  model?: string;
  provider?: string;
  messageCount: number;
  lastMessageAt?: Date;
}

// App settings types
export interface AppSettings {
  theme: "light" | "dark" | "system";
  fontSize: "small" | "medium" | "large";
  autoSave: boolean;
  showTimestamps: boolean;
  maxConversationHistory: number;
  defaultSystemPrompt: string;
  enableStreaming: boolean;
  temperature: number;
  maxTokens: number;
}

// Main app state interface
export interface AppState {
  // Conversations
  conversations: Conversation[];
  currentConversationId: string | null;
  
  // Messages
  messages: DBMessage[];
  messagesLoading: boolean;

  // Providers and Models
  providers: ProviderConfig[];
  selectedProvider: ProviderConfig | null;
  selectedModel: Model | null;
  availableModels: Model[];

  // App Settings
  settings: AppSettings;

  // UI State
  sidebarOpen: boolean;
  providerModelOpen: boolean;
  isLoading: boolean;
  inputInCenter: boolean;

  // Conversation Actions
  createConversation: (name?: string) => Promise<string>;
  deleteConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, newName: string) => Promise<void>;
  setCurrentConversation: (id: string | null) => void;
  getCurrentConversation: () => Conversation | null;
  loadConversations: () => Promise<void>;
  refreshConversation: (conversationId: string) => Promise<void>;

  // Message Actions
  loadMessages: (conversationId: string) => Promise<void>;
  addMessage: (message: DBMessage) => void;
  updateMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;
  clearMessages: () => void;
  setMessagesLoading: (loading: boolean) => void;

  // Provider Actions
  addProvider: (provider: ProviderConfig) => void;
  updateProvider: (id: string, updatedProvider: ProviderConfig) => void;
  deleteProvider: (id: string) => void;
  setSelectedProvider: (provider: ProviderConfig | null) => void;
  setAvailableModels: (models: Model[]) => void;
  setSelectedModel: (model: Model | null) => void;

  // Settings Actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;

  // UI Actions
  setSidebarOpen: (open: boolean) => void;
  setProviderModelOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setLoading: (loading: boolean) => void;
  setInputInCenter: (state: boolean) => void;

  // Utility Actions
  exportConversations: () => string;
  importConversations: (data: string) => void;
  clearAllData: () => Promise<void>;
}