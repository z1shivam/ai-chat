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
  systemPrompt: "You are a helpful AI assistant.",
  enableStreaming: true,
  temperature: 0.7,
  maxTokens: 4000,
  zdrEnabled: false,
  systemPromptEnabled: true,
};

// Default provider configuration
export const defaultProvider: ProviderConfig = {
  id: "default",
  name: "Default",
  type: "openrouter",
  apiKey:
    "sk-or-v1",
  baseURL: "https://openrouter.ai/api/v1",
  selectedModels: [
    "x-ai/grok-4-fast:free",
    "meta-llama/llama-3.3-70b-instruct:free",
  ],
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

export const defaultModel2: Model = {
  id: "meta-llama/llama-3.3-70b-instruct:free",
  name: "meta-llama",
  displayName: "Meta: Llama 3.3 70B",
  inputCost: 0,
  outputCost: 0,
  contextLength: 128000,
  isFree: true,
};


// ZDR model configuration
export const zdrModel: Model = {
  id: "z-ai/glm-4.5-air:free",
  name: "Z.AI | z-ai/glm-4.5-air:free",
  displayName: "Z.AI: GLM 4.5 Air",
  inputCost: 0,
  outputCost: 0,
  contextLength: 131072,
  isFree: true,
};
