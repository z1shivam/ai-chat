"use client";
import {
  PromptInput,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ui/shadcn-io/ai/prompt-input";
import { ImageIcon, XIcon } from "lucide-react";
import { type FormEventHandler, useState, useRef, useMemo } from "react";
import React from "react";
import { useAppStore, useSelectedProvider, useSelectedModel } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/shadcn-io/ai/image";
import { OPENROUTER_FREE_MODELS } from "@/types/provider";
import { MessageService } from "@/lib/database";
import { toast } from "sonner";
import { generateAIResponse, prepareMessagesWithImages, buildConversationHistory } from "@/lib/ai-service";

interface AttachedImage {
  file: File;
  preview: string;
  base64: string;
}

const AiInput = () => {
  const [text, setText] = useState<string>("");
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<
    "submitted" | "streaming" | "ready" | "error"
  >("ready");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const selectedProvider = useSelectedProvider();
  const selectedModel = useSelectedModel();
  const { setSelectedModel, createConversation, currentConversationId, refreshConversation } = useAppStore();
  const previousProviderRef = useRef<string | null>(null);

  // Memoize available models to prevent unnecessary recalculations
  const availableModels = useMemo(() => {
    if (!selectedProvider) return [];
    
    switch (selectedProvider.type) {
      case 'openrouter':
        return OPENROUTER_FREE_MODELS.filter(model => 
          selectedProvider.selectedModels.includes(model.id)
        );
      case 'custom':
        return selectedProvider.selectedModels;
      case 'openai':
        // For OpenAI, we could return a list of standard OpenAI models
        // For now, returning empty array as models would be handled differently
        return [];
      default:
        return [];
    }
  }, [selectedProvider]);

  // Set default model when there's no selected model and models are available
  React.useEffect(() => {
    if (availableModels.length > 0 && !selectedModel) {
      const firstModel = availableModels[0];
      if (firstModel) {
        setSelectedModel(firstModel);
      }
    }
  }, [availableModels, selectedModel, setSelectedModel]);

  // Reset model selection only when provider actually changes
  React.useEffect(() => {
    const currentProviderId = selectedProvider?.id ?? null;
    
    // Check if provider actually changed
    if (previousProviderRef.current !== currentProviderId) {
      previousProviderRef.current = currentProviderId;
      
      if (selectedProvider && availableModels.length > 0) {
        // Check if current selectedModel is still available in the new provider
        const isCurrentModelAvailable = selectedModel && availableModels.some(
          model => model.id === selectedModel.id
        );
        
        if (!isCurrentModelAvailable) {
          // Auto-select the first available model only when provider changes
          const firstModel = availableModels[0];
          if (firstModel) {
            setSelectedModel(firstModel);
          }
        }
      } else if (!selectedProvider) {
        // Clear model selection if no provider
        setSelectedModel(null);
      }
    }
  }, [selectedProvider, availableModels, selectedModel, setSelectedModel]);

  // Helper function to handle model selection from dropdown
  const handleModelChange = (modelId: string) => {
    const model = availableModels.find(m => m.id === modelId);
    if (model) {
      setSelectedModel(model);
    }
  };

  // Handle drag end globally to ensure overlay is hidden when drag operation ends
  React.useEffect(() => {
    const handleDragEnd = () => {
      setIsDragOver(false);
    };

    window.addEventListener('dragend', handleDragEnd);
    window.addEventListener('dragleave', handleDragEnd);
    
    return () => {
      window.removeEventListener('dragend', handleDragEnd);
      window.removeEventListener('dragleave', handleDragEnd);
    };
  }, []);

  const handleImageFiles = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64 = result.split(",")[1] ?? "";

        const attachedImage: AttachedImage = {
          file,
          preview: result,
          base64,
        };

        setAttachedImages((prev) => [...prev, attachedImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    handleImageFiles(files);

    // Reset input value
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Use relatedTarget to check if we're truly leaving the component
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    // Check if the mouse is outside the component bounds
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleImageFiles(files);
  };

  const removeImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void (async () => {
      if (!text && attachedImages.length === 0) {
        return;
      }

      if (isProcessing) {
        return; // Prevent multiple submissions
      }

      if (!selectedProvider) {
        toast.error("Please select a provider first");
        return;
      }

      if (!selectedModel) {
        toast.error("Please select a model first");
        return;
      }

    try {
      // Validate provider and model selection
      if (!selectedProvider) {
        toast.error("Please select a provider before sending a message.");
        return;
      }
      
      if (!selectedModel) {
        toast.error("Please select a model before sending a message.");
        return;
      }
      
      if (!selectedProvider.apiKey || selectedProvider.apiKey.trim() === '') {
        toast.error("Please configure your API key in the provider settings.");
        return;
      }

      setIsProcessing(true);
      setStatus("submitted");
      
      // Get or create conversation
      let conversationId = currentConversationId;
      if (!conversationId) {
        // Create new conversation with first few words of the message as name
        const conversationName = text.length > 30 ? text.substring(0, 30) + "..." : text;
        conversationId = await createConversation(conversationName);
      }

      // Prepare user message with images
      const userMessageContent = {
        text,
        images: attachedImages.map(img => ({
          name: img.file.name,
          type: img.file.type,
          base64: img.base64
        }))
      };

      // Add user message to conversation
      const userMessageId = await MessageService.addMessage({
        conversationId,
        role: 'user',
        content: text,
        model: selectedModel.id,
        provider: selectedProvider.id,
        metadata: userMessageContent
      });

      // Add AI loading message
      const aiMessageId = await MessageService.addMessage({
        conversationId,
        role: 'assistant',
        content: '',
        model: selectedModel.id,
        provider: selectedProvider.id,
        metadata: {
          isLoading: true
        }
      });

      // Refresh conversation metadata
      await refreshConversation(conversationId);

      // Clear input
      setText("");
      setAttachedImages([]);
      setStatus("streaming");

      // Get conversation history for AI context
      let conversationMessages;
      try {
        conversationMessages = await MessageService.getMessages(conversationId);
      } catch (error) {
        console.error('Error loading conversation history:', error);
        toast.error('Failed to load conversation history');
        throw error;
      }
      
      const previousMessages = conversationMessages
        .filter(msg => msg.id !== userMessageId && msg.id !== aiMessageId)
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));

      // Prepare current message with images
      const currentMessage = prepareMessagesWithImages(
        text,
        attachedImages.map(img => ({ base64: img.base64, type: img.file.type }))
      );

      const messages = buildConversationHistory(currentMessage, previousMessages);

      // Generate AI response with streaming
      let aiResponse = '';
      
      await generateAIResponse({
        provider: selectedProvider,
        model: selectedModel,
        messages,
        onChunk: (chunk: string) => {
          aiResponse += chunk;
          
          // Update the database with the current response
          // Don't await this to keep streaming smooth
          void MessageService.updateMessageData(aiMessageId, {
            content: aiResponse,
            metadata: { isLoading: false }
          }).catch(error => {
            console.error('Error updating message during streaming:', error);
          });
        },
        onComplete: (fullResponse: string) => {
          // Final update with complete response
          void (async () => {
            try {
              await MessageService.updateMessageData(aiMessageId, {
                content: fullResponse,
                metadata: { isLoading: false }
              });
              await refreshConversation(conversationId);
            } catch (error) {
              console.error('Error finalizing AI response:', error);
              toast.error('Failed to save AI response');
            }
            setStatus("ready");
            setIsProcessing(false);
          })();
        },
        onError: (error: Error) => {
          // Remove the loading message and show error
          void (async () => {
            try {
              await MessageService.deleteMessage(aiMessageId);
            } catch (dbError) {
              console.error('Error cleaning up failed message:', dbError);
            }
            toast.error(`AI Error: ${error.message}`);
            setStatus("error");
            setIsProcessing(false);
          })();
        }
      });
      
    } catch (error) {
      console.error('Error handling message submission:', error);
      setStatus("error");
      setIsProcessing(false);
      
      // Show specific error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to send message: ${errorMessage}`);
    }
    })();
  };

  return (
    <div
      className="relative w-full pb-3 "
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Image Previews */}
      {attachedImages.length > 0 && (
        <div className="relative z-10 mb-4 flex flex-wrap gap-3">
          {attachedImages.map((image, index) => (
            <div key={index} className="group relative">
              <div className="h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
                <Image
                  base64={image.base64}
                  uint8Array={new Uint8Array()}
                  mediaType={image.file.type}
                  alt={image.file.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-1 max-w-20 truncate text-xs text-gray-600">
                {image.file.name}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 p-0 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                onClick={() => removeImage(index)}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-background/80">
          <div className="border-2 border-dashed border-foreground/30 rounded-2xl p-20 bg-background/50 text-center w-full max-w-2xl mx-8 min-h-[300px] flex flex-col items-center justify-center transition-all duration-200">
            <ImageIcon className="h-24 w-24 text-foreground/60 mx-auto mb-8" />
            <p className="text-3xl font-medium text-foreground mb-4">Drop images here</p>
            <p className="text-lg text-foreground/60">Support for PNG, JPG, GIF, WebP</p>
          </div>
        </div>
      )}

      <div className="relative z-10">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea
            onChange={(e) => setText(e.target.value)}
            value={text}
            placeholder={
              isProcessing
                ? "Processing your message..."
                : selectedProvider
                ? "Type your message..."
                : "Please select a provider first..."
            }
            disabled={!selectedProvider || isProcessing}
          />
          <PromptInputToolbar>
            <PromptInputTools>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <PromptInputButton
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!selectedProvider || isProcessing}
                title="Add images"
              >
                <ImageIcon size={16} />
              </PromptInputButton>

              {selectedProvider && (
                <PromptInputModelSelect
                  onValueChange={handleModelChange}
                  value={selectedModel?.id ?? ""}
                >
                  <PromptInputModelSelectTrigger>
                    <PromptInputModelSelectValue placeholder="Select model" />
                  </PromptInputModelSelectTrigger>
                  <PromptInputModelSelectContent>
                    {availableModels.map((model) => (
                      <PromptInputModelSelectItem
                        key={model.id}
                        value={model.id}
                      >
                        {model.displayName}
                      </PromptInputModelSelectItem>
                    ))}
                  </PromptInputModelSelectContent>
                </PromptInputModelSelect>
              )}

              {(!selectedProvider || isProcessing) && (
                <div className="px-2 text-sm text-gray-500">
                  {isProcessing ? "Processing..." : "No provider selected"}
                </div>
              )}
            </PromptInputTools>
            <PromptInputSubmit
              disabled={
                (!text && attachedImages.length === 0) || !selectedProvider || isProcessing
              }
              status={status}
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};
export default AiInput;
