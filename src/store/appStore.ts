import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProviderConfig, Model } from "@/types/provider";

// Import database types and services
import {
  ConversationService,
  DatabaseService,
  type DBMessage,
  type DBConversation,
} from "@/lib/database";

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

// Re-export message type for convenience
export type { DBMessage as Message };

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
interface AppState {
  // Conversations
  conversations: Conversation[];
  currentConversationId: string | null;

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

  // Conversation Actions
  createConversation: (name?: string) => Promise<string>;
  deleteConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, newName: string) => Promise<void>;
  setCurrentConversation: (id: string | null) => void;
  getCurrentConversation: () => Conversation | null;
  loadConversations: () => Promise<void>;
  refreshConversation: (conversationId: string) => Promise<void>;

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

  // Utility Actions
  exportConversations: () => string;
  importConversations: (data: string) => void;
  clearAllData: () => Promise<void>;
}

// Default settings
const defaultSettings: AppSettings = {
  theme: "system",
  fontSize: "medium",
  autoSave: true,
  showTimestamps: true,
  maxConversationHistory: 100,
  defaultSystemPrompt: "You are a helpful AI assistant.",
  enableStreaming: true,
  temperature: 0.7,
  maxTokens: 4000,
};

// Utility function to generate unique IDs
const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Utility function to generate conversation name
const generateConversationName = () => {
  return `New Conversation ${new Date().toLocaleDateString()}`;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      conversations: [],
      currentConversationId: null,
      providers: [],
      selectedProvider: null,
      selectedModel: null,
      availableModels: [],
      settings: defaultSettings,
      sidebarOpen: true,
      providerModelOpen: false,
      isLoading: false,

      // Conversation Actions
      createConversation: async (name?: string) => {
        const id = generateId();
        const conversation: DBConversation = {
          id,
          name: name ?? generateConversationName(),
          createdAt: new Date(),
          updatedAt: new Date(),
          model: get().selectedModel?.id,
          provider: get().selectedProvider?.id,
          messageCount: 0,
        };

        await ConversationService.createConversation(conversation);

        set((state) => ({
          conversations: [conversation, ...state.conversations],
          currentConversationId: id,
        }));

        return id;
      },

      deleteConversation: async (id: string) => {
        await ConversationService.deleteConversation(id);
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          currentConversationId:
            state.currentConversationId === id
              ? null
              : state.currentConversationId,
        }));
      },

      renameConversation: async (id: string, newName: string) => {
        await ConversationService.renameConversation(id, newName);
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, name: newName, updatedAt: new Date() } : c,
          ),
        }));
      },

      setCurrentConversation: (id: string | null) => {
        set({ currentConversationId: id });
      },

      getCurrentConversation: () => {
        const state = get();
        return (
          state.conversations.find(
            (c) => c.id === state.currentConversationId,
          ) ?? null
        );
      },

      loadConversations: async () => {
        const conversations = await ConversationService.getConversations();
        set({ conversations });
      },

      refreshConversation: async (conversationId: string) => {
        const updatedConversation =
          await ConversationService.getConversation(conversationId);
        if (updatedConversation) {
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === conversationId ? updatedConversation : c,
            ),
          }));
        }
      },

      // Provider Actions
      addProvider: (provider: ProviderConfig) => {
        set((state) => ({
          providers: [...state.providers, provider],
          selectedProvider: provider, // Auto-select the newly added provider
        }));
      },

      updateProvider: (id: string, updatedProvider: ProviderConfig) => {
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === id ? updatedProvider : p,
          ),
          selectedProvider:
            state.selectedProvider?.id === id
              ? updatedProvider
              : state.selectedProvider,
        }));
      },

      deleteProvider: (id: string) => {
        set((state) => ({
          providers: state.providers.filter((p) => p.id !== id),
          selectedProvider:
            state.selectedProvider?.id === id ? null : state.selectedProvider,
        }));
      },

      setSelectedProvider: (provider: ProviderConfig | null) => {
        set({
          selectedProvider: provider,
          selectedModel: null, // Reset model when provider changes
        });
      },

      setAvailableModels: (models: Model[]) => {
        set({ availableModels: models });
      },

      setSelectedModel: (model: Model | null) => {
        set({ selectedModel: model });
      },

      // Settings Actions
      updateSettings: (newSettings: Partial<AppSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      resetSettings: () => {
        set({ settings: defaultSettings });
      },

      // UI Actions
      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },
      setProviderModelOpen: (open: boolean) => {
        set({ providerModelOpen: open });
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Utility Actions
      exportConversations: () => {
        const state = get();
        return JSON.stringify(
          {
            conversations: state.conversations,
            settings: state.settings,
            exportedAt: new Date(),
          },
          null,
          2,
        );
      },

      importConversations: (data: string) => {
        try {
          const parsed = JSON.parse(data) as {
            conversations?: Conversation[];
            settings?: Partial<AppSettings>;
          };
          set((state) => ({
            conversations: [...(parsed.conversations ?? []), ...state.conversations],
            settings: { ...state.settings, ...(parsed.settings ?? {}) },
          }));
        } catch (error) {
          console.error("Failed to import conversations:", error);
        }
      },

      clearAllData: async () => {
        // Clear database first
        await DatabaseService.clearAllData();
        
        // Clear store
        set({
          conversations: [],
          currentConversationId: null,
        });
      },
    }),
    {
      name: "ai-chat-store",
      partialize: (state) => ({
        // Don't persist conversations - they're in IndexedDB
        currentConversationId: state.currentConversationId,
        providers: state.providers,
        selectedProvider: state.selectedProvider,
        selectedModel: state.selectedModel,
        settings: state.settings,
        sidebarOpen: state.sidebarOpen,
      }),
      onRehydrateStorage: () => (state) => {
        // Load conversations from IndexedDB after rehydration
        if (state) {
          void state.loadConversations();
        }
      },
    },
  ),
);

// Selector hooks for commonly used state
export const useCurrentConversation = () =>
  useAppStore((state) => state.getCurrentConversation());
export const useConversations = () =>
  useAppStore((state) => state.conversations);
export const useProviders = () => useAppStore((state) => state.providers);
export const useSelectedProvider = () =>
  useAppStore((state) => state.selectedProvider);
export const useSelectedModel = () =>
  useAppStore((state) => state.selectedModel);
export const useSettings = () => useAppStore((state) => state.settings);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen);
