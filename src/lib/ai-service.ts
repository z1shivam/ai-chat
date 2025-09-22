import type { ProviderConfig, Model } from '@/types/provider';

export interface MessageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | MessageContent[];
}

export interface StreamResponse {
  content: string;
  done: boolean;
}

export interface AIServiceOptions {
  provider: ProviderConfig;
  model: Model;
  messages: ChatMessage[];
  onChunk?: (chunk: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Generate AI response with streaming support
 */
export async function generateAIResponse(options: AIServiceOptions): Promise<string> {
  const { provider, model, messages, onChunk, onComplete, onError } = options;

  try {
    // Validate provider and model
    if (!provider) {
      throw new Error('No provider selected. Please select a provider in the settings.');
    }
    
    if (!model) {
      throw new Error('No model selected. Please select a model.');
    }
    
    // Validate API credentials
    if (!provider.apiKey || provider.apiKey.trim() === '') {
      throw new Error('No auth credentials found. Please configure your API key in the provider settings.');
    }

    let baseURL = '';
    const apiKey = provider.apiKey;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };

    // Set base URL based on provider type
    switch (provider.type) {
      case 'openrouter':
        baseURL = 'https://openrouter.ai/api/v1';
        // Add OpenRouter specific headers if they exist
        if (provider.defaultHeaders) {
          Object.entries(provider.defaultHeaders).forEach(([key, value]) => {
            if (value !== undefined) {
              headers[key] = value;
            }
          });
        }
        break;
      case 'openai':
        baseURL = provider.baseURL ?? 'https://api.openai.com/v1';
        break;
      case 'custom':
        baseURL = provider.baseURL;
        // Add custom headers if they exist
        if (provider.defaultHeaders) {
          Object.entries(provider.defaultHeaders).forEach(([key, value]) => {
            if (value !== undefined) {
              headers[key] = value;
            }
          });
        }
        break;
      default:
        throw new Error(`Unsupported provider type: ${(provider as { type: string }).type}`);
    }

    let response: Response;
    try {
      response = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: model.id,
          messages,
          stream: true,
        }),
      });
    } catch {
      throw new Error(`Network error: Unable to connect to AI service. Please check your internet connection.`);
    }

    if (!response.ok) {
      let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      
      // Handle common HTTP error codes
      switch (response.status) {
        case 400:
          errorMessage = 'Invalid request. Please check your message and try again.';
          break;
        case 401:
          errorMessage = 'Authentication failed. Please check your API key.';
          break;
        case 403:
          errorMessage = 'Access forbidden. Your API key may not have permission for this model.';
          break;
        case 404:
          errorMessage = 'Model not found. Please check if the selected model is available.';
          break;
        case 429:
          errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
          break;
        case 500:
          errorMessage = 'Server error occurred. Please try again later.';
          break;
        case 503:
          errorMessage = 'Service temporarily unavailable. Please try again later.';
          break;
      }
      
      try {
        // Try to get more detailed error message from response body
        const errorBody = await response.text();
        if (errorBody) {
          const errorData = JSON.parse(errorBody) as {
            error?: { message?: string };
            message?: string;
            detail?: string;
          };
          
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        }
      } catch {
        // If we can't parse the error response, use the default message
      }
      
      throw new Error(errorMessage);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let fullResponse = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Append new chunk to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete lines from buffer
        while (true) {
          const lineEnd = buffer.indexOf('\n');
          if (lineEnd === -1) break;

          const line = buffer.slice(0, lineEnd).trim();
          buffer = buffer.slice(lineEnd + 1);

          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data) as {
                choices?: Array<{
                  delta?: { content?: string };
                }>;
              };
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                // For very smooth streaming, emit character by character if content is long
                if (content.length > 1) {
                  for (let i = 0; i < content.length; i++) {
                    const char = content[i]!;
                    fullResponse += char;
                    onChunk?.(char);
                    
                    // Small delay for smoother appearance (only for long chunks)
                    if (content.length > 5 && i < content.length - 1) {
                      await new Promise<void>(resolve => setTimeout(resolve, 5));
                    }
                  }
                } else {
                  // Single character or short content, emit immediately
                  fullResponse += content;
                  onChunk?.(content);
                }
              }
            } catch (e) {
              // Ignore invalid JSON
              console.warn('Failed to parse streaming chunk:', e);
            }
          }
        }
      }
    } finally {
      void reader.cancel();
    }

    onComplete?.(fullResponse);
    return fullResponse;

  } catch (error) {
    let errorMessage: Error;
    
    if (error instanceof Error) {
      errorMessage = error;
    } else if (typeof error === 'string') {
      errorMessage = new Error(error);
    } else {
      errorMessage = new Error('Unknown error occurred while generating AI response');
    }
    
    onError?.(errorMessage);
    throw errorMessage;
  }
}

/**
 * Prepare messages with image support
 */
export function prepareMessagesWithImages(
  textContent: string,
  images: Array<{ base64: string; type: string }> = []
): ChatMessage {
  if (images.length === 0) {
    return {
      role: 'user',
      content: textContent,
    };
  }

  const content: MessageContent[] = [
    {
      type: 'text',
      text: textContent,
    },
  ];

  // Add images to content
  images.forEach((image) => {
    content.push({
      type: 'image_url',
      image_url: {
        url: `data:${image.type};base64,${image.base64}`,
      },
    });
  });

  return {
    role: 'user',
    content,
  };
}

/**
 * Get conversation history for AI context
 */
export function buildConversationHistory(
  currentMessage: ChatMessage,
  previousMessages: Array<{ role: 'user' | 'assistant'; content: string }> = []
): ChatMessage[] {
  const history: ChatMessage[] = previousMessages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));

  history.push(currentMessage);
  return history;
}