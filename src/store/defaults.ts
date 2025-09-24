import type { ProviderConfig, Model } from "@/types/provider";
import type { AppSettings } from "./types";

// Default settings
export const defaultSettings: AppSettings = {
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

// Default provider configuration
export const defaultProvider: ProviderConfig = {
  id: "default",
  name: "Default",
  type: "openrouter",
  apiKey: "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",
  baseURL: "https://openrouter.ai/api/v1",
  selectedModels: ["x-ai/grok-4-fast:free"],
};

// Default model configuration
export const defaultModel: Model = {
  id: "x-ai/grok-4-fast:free",
  name: "grok-4-fast",
  displayName: "Grok 4 Fast",
  inputCost: 0,
  outputCost: 0,
  contextLength: 128000,
  isFree: true,
};