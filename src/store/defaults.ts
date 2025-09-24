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
  apiKey: "sk-or-v1-somekey",
  baseURL: "https://openrouter.ai/api/v1",
  selectedModels: ["x-ai/grok-4-fast:free"],
};

// Default model configuration
export const defaultModel: Model = {
  id: "x-ai/grok-4-fast:free",
  name: "grok-4-fast",
  displayName: "Grok 4 Fast (Free)",
  inputCost: 0,
  outputCost: 0,
  contextLength: 128000,
  isFree: true,
};