export interface Model {
  id: string;
  name: string;
  displayName: string;
  inputCost: number; // Cost per 1M tokens
  outputCost: number; // Cost per 1M tokens
  contextLength: number;
  isFree?: boolean;
}

export interface DefaultHeaders {
  'HTTP-Referer'?: string;
  'X-Title'?: string;
  [key: string]: string | undefined;
}

export interface BaseProviderConfig {
  id: string;
  name: string;
  type: 'openai' | 'openrouter' | 'custom';
  apiKey: string;
  defaultHeaders?: DefaultHeaders;
}

export interface OpenAIProviderConfig extends BaseProviderConfig {
  type: 'openai';
  baseURL?: string; // Optional override for OpenAI
}

export interface OpenRouterProviderConfig extends BaseProviderConfig {
  type: 'openrouter';
  baseURL: 'https://openrouter.ai/api/v1';
  selectedModels: string[]; // Array of model IDs
}

export interface CustomProviderConfig extends BaseProviderConfig {
  type: 'custom';
  baseURL: string;
  selectedModels: Model[]; // Custom models defined by user
}

export type ProviderConfig =  OpenRouterProviderConfig | CustomProviderConfig | OpenAIProviderConfig;

export interface ProviderContextType {
  providers: ProviderConfig[];
  selectedProvider: ProviderConfig | null;
  availableModels: Model[];
  setSelectedProvider: (provider: ProviderConfig | null) => void;
  addProvider: (provider: ProviderConfig) => void;
  updateProvider: (id: string, provider: ProviderConfig) => void;
  deleteProvider: (id: string) => void;
}

// OpenRouter free models data
export const OPENROUTER_FREE_MODELS: Model[] = [
  {
    id: 'deepseek/deepseek-chat-v3.1:free',
    name: 'DeepSeek V3.1 (free)',
    displayName: 'DeepSeek: DeepSeek V3.1 (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 163840,
    isFree: true,
  },
  {
    id: 'x-ai/grok-4-fast:free',
    name: 'Grok 4 Fast (free)',
    displayName: 'xAI: Grok 4 Fast (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 2000000,
    isFree: true,
  },
  {
    id: 'deepseek/deepseek-r1-0528:free',
    name: 'R1 0528 (free)',
    displayName: 'DeepSeek: R1 0528 (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 163840,
    isFree: true,
  },
  {
    id: 'deepseek/deepseek-chat-v3-0324:free',
    name: 'DeepSeek V3 0324 (free)',
    displayName: 'DeepSeek: DeepSeek V3 0324 (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 163840,
    isFree: true,
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'R1 (free)',
    displayName: 'DeepSeek: R1 (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 163840,
    isFree: true,
  },
  {
    id: 'tngtech/deepseek-r1t2-chimera:free',
    name: 'DeepSeek R1T2 Chimera (free)',
    displayName: 'TNG: DeepSeek R1T2 Chimera (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 163840,
    isFree: true,
  },
  {
    id: 'z-ai/glm-4.5-air:free',
    name: 'GLM 4.5 Air (free)',
    displayName: 'Z.AI: GLM 4.5 Air (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 131072,
    isFree: true,
  },
  {
    id: 'qwen/qwen3-coder:free',
    name: 'Qwen3 Coder 480B A35B (free)',
    displayName: 'Qwen: Qwen3 Coder 480B A35B (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 262144,
    isFree: true,
  },
  {
    id: 'tngtech/deepseek-r1t-chimera:free',
    name: 'DeepSeek R1T Chimera (free)',
    displayName: 'TNG: DeepSeek R1T Chimera (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 163840,
    isFree: true,
  },
  {
    id: 'qwen/qwen3-235b-a22b:free',
    name: 'Qwen3 235B A22B (free)',
    displayName: 'Qwen: Qwen3 235B A22B (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 131072,
    isFree: true,
  },
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash Experimental (free)',
    displayName: 'Google: Gemini 2.0 Flash Experimental (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 1048576,
    isFree: true,
  },
  {
    id: 'microsoft/mai-ds-r1:free',
    name: 'MAI DS R1 (free)',
    displayName: 'Microsoft: MAI DS R1 (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 163840,
    isFree: true,
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B Instruct (free)',
    displayName: 'Meta: Llama 3.3 70B Instruct (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 65536,
    isFree: true,
  },
  {
    id: 'moonshotai/kimi-k2:free',
    name: 'Kimi K2 0711 (free)',
    displayName: 'MoonshotAI: Kimi K2 0711 (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 32768,
    isFree: true,
  },
  {
    id: 'nvidia/nemotron-nano-9b-v2:free',
    name: 'Nemotron Nano 9B V2 (free)',
    displayName: 'NVIDIA: Nemotron Nano 9B V2 (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 128000,
    isFree: true,
  },
  {
    id: 'deepseek/deepseek-r1-distill-llama-70b:free',
    name: 'R1 Distill Llama 70B (free)',
    displayName: 'DeepSeek: R1 Distill Llama 70B (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 8192,
    isFree: true,
  },
  {
    id: 'openai/gpt-oss-20b:free',
    name: 'gpt-oss-20b (free)',
    displayName: 'OpenAI: gpt-oss-20b (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 131072,
    isFree: true,
  },
  {
    id: 'mistralai/mistral-small-3.2-24b-instruct:free',
    name: 'Mistral Small 3.2 24B (free)',
    displayName: 'Mistral: Mistral Small 3.2 24B (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 131072,
    isFree: true,
  },
  {
    id: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
    name: 'Deepseek R1 0528 Qwen3 8B (free)',
    displayName: 'DeepSeek: Deepseek R1 0528 Qwen3 8B (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 131072,
    isFree: true,
  },
  {
    id: 'meta-llama/llama-4-maverick:free',
    name: 'Llama 4 Maverick (free)',
    displayName: 'Meta: Llama 4 Maverick (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 128000,
    isFree: true,
  },
  {
    id: 'qwen/qwen2.5-vl-72b-instruct:free',
    name: 'Qwen2.5 VL 72B Instruct (free)',
    displayName: 'Qwen: Qwen2.5 VL 72B Instruct (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 32768,
    isFree: true,
  },
  {
    id: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
    name: 'Uncensored (free)',
    displayName: 'Venice: Uncensored (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 32768,
    isFree: true,
  },
  {
    id: 'mistralai/mistral-nemo:free',
    name: 'Mistral Nemo (free)',
    displayName: 'Mistral: Mistral Nemo (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 131072,
    isFree: true,
  },
  {
    id: 'qwen/qwen3-14b:free',
    name: 'Qwen3 14B (free)',
    displayName: 'Qwen: Qwen3 14B (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 40960,
    isFree: true,
  },
  {
    id: 'meta-llama/llama-3.3-8b-instruct:free',
    name: 'Llama 3.3 8B Instruct (free)',
    displayName: 'Meta: Llama 3.3 8B Instruct (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 128000,
    isFree: true,
  },
  {
    id: 'meta-llama/llama-3.1-405b-instruct:free',
    name: 'Llama 3.1 405B Instruct (free)',
    displayName: 'Meta: Llama 3.1 405B Instruct (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 65536,
    isFree: true,
  },
  {
    id: 'moonshotai/kimi-dev-72b:free',
    name: 'Kimi Dev 72B (free)',
    displayName: 'MoonshotAI: Kimi Dev 72B (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 131072,
    isFree: true,
  },
  {
    id: 'qwen/qwen3-30b-a3b:free',
    name: 'Qwen3 30B A3B (free)',
    displayName: 'Qwen: Qwen3 30B A3B (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 40960,
    isFree: true,
  },
  {
    id: 'google/gemma-3-27b-it:free',
    name: 'Gemma 3 27B (free)',
    displayName: 'Google: Gemma 3 27B (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 96000,
    isFree: true,
  },
  {
    id: 'agentica-org/deepcoder-14b-preview:free',
    name: 'Deepcoder 14B Preview (free)',
    displayName: 'Agentica: Deepcoder 14B Preview (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 96000,
    isFree: true,
  },
  {
    id: 'mistralai/mistral-7b-instruct:free',
    name: 'Mistral 7B Instruct (free)',
    displayName: 'Mistral: Mistral 7B Instruct (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 32768,
    isFree: true,
  },
  {
    id: 'qwen/qwen-2.5-coder-32b-instruct:free',
    name: 'Qwen2.5 Coder 32B Instruct (free)',
    displayName: 'Qwen2.5 Coder 32B Instruct (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 32768,
    isFree: true,
  },
  {
    id: 'meta-llama/llama-4-scout:free',
    name: 'Llama 4 Scout (free)',
    displayName: 'Meta: Llama 4 Scout (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 128000,
    isFree: true,
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct:free',
    name: 'Qwen2.5 72B Instruct (free)',
    displayName: 'Qwen2.5 72B Instruct (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 32768,
    isFree: true,
  },
  {
    id: 'mistralai/mistral-small-3.1-24b-instruct:free',
    name: 'Mistral Small 3.1 24B (free)',
    displayName: 'Mistral: Mistral Small 3.1 24B (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 128000,
    isFree: true,
  },
  {
    id: 'qwen/qwen3-8b:free',
    name: 'Qwen3 8B (free)',
    displayName: 'Qwen: Qwen3 8B (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 40960,
    isFree: true,
  },
  {
    id: 'qwen/qwq-32b:free',
    name: 'QwQ 32B (free)',
    displayName: 'Qwen: QwQ 32B (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 32768,
    isFree: true,
  },
  {
    id: 'qwen/qwen2.5-vl-32b-instruct:free',
    name: 'Qwen2.5 VL 32B Instruct (free)',
    displayName: 'Qwen: Qwen2.5 VL 32B Instruct (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 8192,
    isFree: true,
  },
  {
    id: 'shisa-ai/shisa-v2-llama3.3-70b:free',
    name: 'Shisa V2 Llama 3.3 70B (free)',
    displayName: 'Shisa AI: Shisa V2 Llama 3.3 70B (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 32768,
    isFree: true,
  },
  {
    id: 'moonshotai/kimi-vl-a3b-thinking:free',
    name: 'Kimi VL A3B Thinking (free)',
    displayName: 'MoonshotAI: Kimi VL A3B Thinking (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 131072,
    isFree: true,
  },
  {
    id: 'mistralai/devstral-small-2505:free',
    name: 'Devstral Small 2505 (free)',
    displayName: 'Mistral: Devstral Small 2505 (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 32768,
    isFree: true,
  },
  {
    id: 'cognitivecomputations/dolphin3.0-mistral-24b:free',
    name: 'Dolphin3.0 Mistral 24B (free)',
    displayName: 'Dolphin3.0 Mistral 24B (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 32768,
    isFree: true,
  },
  {
    id: 'qwen/qwen3-4b:free',
    name: 'Qwen3 4B (free)',
    displayName: 'Qwen: Qwen3 4B (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 40960,
    isFree: true,
  },
  {
    id: 'nousresearch/deephermes-3-llama-3-8b-preview:free',
    name: 'DeepHermes 3 Llama 3 8B Preview (free)',
    displayName: 'Nous: DeepHermes 3 Llama 3 8B Preview (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 131072,
    isFree: true,
  },
  {
    id: 'tencent/hunyuan-a13b-instruct:free',
    name: 'Hunyuan A13B Instruct (free)',
    displayName: 'Tencent: Hunyuan A13B Instruct (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 32768,
    isFree: true,
  },
  {
    id: 'mistralai/mistral-small-24b-instruct-2501:free',
    name: 'Mistral Small 3 (free)',
    displayName: 'Mistral: Mistral Small 3 (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 32768,
    isFree: true,
  },
  {
    id: 'meta-llama/llama-3.2-3b-instruct:free',
    name: 'Llama 3.2 3B Instruct (free)',
    displayName: 'Meta: Llama 3.2 3B Instruct (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 131072,
    isFree: true,
  },
  {
    id: 'google/gemma-3-12b-it:free',
    name: 'Gemma 3 12B (free)',
    displayName: 'Google: Gemma 3 12B (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 32768,
    isFree: true,
  },
  {
    id: 'arliai/qwq-32b-arliai-rpr-v1:free',
    name: 'QwQ 32B RpR v1 (free)',
    displayName: 'ArliAI: QwQ 32B RpR v1 (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 32768,
    isFree: true,
  },
  {
    id: 'google/gemma-2-9b-it:free',
    name: 'Gemma 2 9B (free)',
    displayName: 'Google: Gemma 2 9B (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 8192,
    isFree: true,
  },
  {
    id: 'cognitivecomputations/dolphin3.0-r1-mistral-24b:free',
    name: 'Dolphin3.0 R1 Mistral 24B (free)',
    displayName: 'Dolphin3.0 R1 Mistral 24B (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 32768,
    isFree: true,
  },
  {
    id: 'google/gemma-3n-e2b-it:free',
    name: 'Gemma 3n 2B (free)',
    displayName: 'Google: Gemma 3n 2B (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 8192,
    isFree: true,
  },
  {
    id: 'google/gemma-3n-e4b-it:free',
    name: 'Gemma 3n 4B (free)',
    displayName: 'Google: Gemma 3n 4B (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 8192,
    isFree: true,
  },
  {
    id: 'google/gemma-3-4b-it:free',
    name: 'Gemma 3 4B (free)',
    displayName: 'Google: Gemma 3 4B (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 32768,
    isFree: true,
  },
  {
    id: 'openai/gpt-oss-120b:free',
    name: 'gpt-oss-120b (free)',
    displayName: 'OpenAI: gpt-oss-120b (free)',
    inputCost: 0,
    outputCost: 0,
    contextLength: 32768,
    isFree: true,
  },
];