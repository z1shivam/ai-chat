import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type ProviderConfig,
  type Model,
  type OpenRouterProviderConfig,
  OPENROUTER_FREE_MODELS,
} from "@/types/provider";
import {
  ConversationService,
  DatabaseService,
  MessageService,
  type DBConversation,
  type DBMessage,
} from "@/lib/database";

import type { AppState, Conversation, AppSettings } from "./types";
import { defaultSettings, defaultProvider, defaultModel } from "./defaults";
import { generateId, generateConversationName } from "./utils";

export type { Conversation, AppSettings } from "./types";
export type { DBMessage as Message } from "@/lib/database";

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      messages: [],
      messagesLoading: false,
      providers: [defaultProvider],
      selectedProvider: defaultProvider,
      selectedModel: defaultModel,
      availableModels: [defaultModel],
      settings: defaultSettings,
      sidebarOpen: true,
      providerModelOpen: false,
      isResponding: false,
      inputInCenter: true,
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
          messages: []
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
        if (id) {
          // Load messages for the new conversation
          void get().loadMessages(id);
        } else {
          // Clear messages when no conversation is selected
          get().clearMessages();
        }
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

      // Message Actions
      loadMessages: async (conversationId: string) => {
        if (!conversationId) {
          set({ messages: [], messagesLoading: false });
          return;
        }

        set({ messagesLoading: true });
        try {
          const conversationMessages =
            await MessageService.getMessages(conversationId);
          set({ messages: conversationMessages, messagesLoading: false });
        } catch (error) {
          console.error("Error loading messages:", error);
          set({ messages: [], messagesLoading: false });
          throw error;
        }
      },

      addMessage: (message: DBMessage) => {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      },

      updateMessage: (messageId: string, content: string) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === messageId ? { ...msg, content } : msg,
          ),
        }));
      },

      deleteMessage: (messageId: string) => {
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== messageId),
        }));
      },

      clearMessages: () => {
        set({ messages: [] });
      },

      setMessagesLoading: (loading: boolean) => {
        set({ messagesLoading: loading });
      },

      addProvider: (provider: ProviderConfig) => {
        function isOpenRouterConfig(
          config: ProviderConfig,
        ): config is OpenRouterProviderConfig {
          return config.type === "openrouter";
        }
        let models: Model[] = [];
        if (isOpenRouterConfig(provider)) {
          const modelsId = provider.selectedModels;
          models = OPENROUTER_FREE_MODELS.filter((model) =>
            modelsId.includes(model.id),
          );
        }
        set((state) => ({
          providers: [...state.providers, provider],
          selectedProvider: provider, // Auto-select the newly added provider
          availableModels: models,
          selectedModel: models[0]
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
        function isOpenRouterConfig(
          config: ProviderConfig,
        ): config is OpenRouterProviderConfig {
          return config.type === "openrouter";
        }
        let models: Model[] = [];
        if (provider !== null && isOpenRouterConfig(provider)) {
          const modelsId = provider.selectedModels;
          models = OPENROUTER_FREE_MODELS.filter((model) =>
            modelsId.includes(model.id),
          );
        }
        set({
          selectedProvider: provider,
          availableModels: models,
          selectedModel: models[0],
        });
      },

      setAvailableModels: (models: Model[]) => {
        set({ availableModels: models });
      },

      setSelectedModel: (model: Model | null) => {
        set({ selectedModel: model });
      },

      updateSettings: (newSettings: Partial<AppSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      resetSettings: () => {
        set({ settings: defaultSettings });
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },
      setProviderModelOpen: (open: boolean) => {
        set({ providerModelOpen: open });
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setIsResponding: (loading: boolean) => {
        set({ isResponding: loading });
      },

      setInputInCenter: (state: boolean) => {
        set({ inputInCenter: state });
      },

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
            conversations: [
              ...(parsed.conversations ?? []),
              ...state.conversations,
            ],
            settings: { ...state.settings, ...(parsed.settings ?? {}) },
          }));
        } catch (error) {
          console.error("Failed to import conversations:", error);
        }
      },

      clearAllData: async () => {
        await DatabaseService.clearAllData();

        set({
          conversations: [],
          messages:[],
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
        availableModels: state.availableModels,
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

export const useCurrentConversation = () =>
  useAppStore((state) => state.getCurrentConversation());
export const useConversations = () =>
  useAppStore((state) => state.conversations);
export const useMessages = () => useAppStore((state) => state.messages);
export const useMessagesLoading = () =>
  useAppStore((state) => state.messagesLoading);
export const useProviders = () => useAppStore((state) => state.providers);
export const useSelectedProvider = () =>
  useAppStore((state) => state.selectedProvider);
export const useSelectedModel = () =>
  useAppStore((state) => state.selectedModel);
export const useSettings = () => useAppStore((state) => state.settings);
export const useIsResponding = () => useAppStore((state) => state.isResponding);
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen);
