"use client";
import { Image } from "@/components/ui/shadcn-io/ai/image";
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
import {
  buildConversationHistory,
  prepareMessagesWithImages,
} from "@/lib/ai-service";
import { MessageService } from "@/lib/database";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAppStore } from "@/store/appStore";
import { defaultModel, zdrModel } from "@/store/defaults";
import { ImageIcon, XIcon } from "lucide-react";
import { type FormEventHandler, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface AttachedImage {
  file: File;
  preview: string;
  base64: string;
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string | Array<{
    type: "text" | "image_url";
    text?: string;
    image_url?: { url: string };
  }>;
}

export default function AiInput() {
  const {
    availableModels,
    selectedModel,
    setSelectedModel,
    selectedProvider,
    currentConversationId,
    createConversation,
    refreshConversation,
    addMessage,
    updateMessage,
    setIsResponding,
    settings,
  } = useAppStore();
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [text, setText] = useState<string>("");
  const [status, setStatus] = useState<
    "submitted" | "streaming" | "ready" | "error"
  >("ready");

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

      // Use ZDR model if ZDR is enabled, otherwise use selected model or default
      const modelToUse = settings.zdrEnabled ? zdrModel : (selectedModel ?? defaultModel);
      
      if (!modelToUse) {
        toast.error("Please select a model first");
        return;
      }

      try {
        if (!selectedProvider.apiKey || selectedProvider.apiKey.trim() === "") {
          toast.error(
            "Please configure your API key in the provider settings.",
          );
          return;
        }

        let conversationId = currentConversationId;
        if (!conversationId) {
          const conversationName =
            text.length > 30 ? text.substring(0, 10) + "..." : text;
          conversationId = await createConversation(conversationName);
        }

        const userMessageContent = {
          text,
          images: attachedImages.map((img) => ({
            name: img.file.name,
            type: img.file.type,
            base64: img.base64,
          })),
        };

        const userMessageId = await MessageService.addMessage({
          conversationId,
          role: "user",
          content: text,
          model: modelToUse.id,
          provider: selectedProvider.id,
          metadata: userMessageContent,
        });

        const aiMessageId = await MessageService.addMessage({
          conversationId,
          role: "assistant",
          content: "",
          model: modelToUse.id,
          provider: selectedProvider.id,
          metadata: {
            isLoading: true,
          },
        });

        await refreshConversation(conversationId);
        addMessage({
          id: userMessageId,
          conversationId,
          timestamp: new Date(),
          role: "user",
          content: text,
          model: modelToUse.id,
          provider: selectedProvider.id,
          metadata: userMessageContent,
        });

        addMessage({
          id: aiMessageId,
          timestamp: new Date(),
          conversationId,
          role: "assistant",
          content: "",
          model: modelToUse.id,
          provider: selectedProvider.id,
          metadata: {
            isLoading: true,
          },
        });

        setIsResponding(true);
        setIsProcessing(true);
        setStatus("submitted");
        setText("");
        setAttachedImages([]);
        let conversationMessages;
        try {
          conversationMessages =
            await MessageService.getMessages(conversationId);
        } catch (error) {
          console.error("Error loading conversation history:", error);
          toast.error("Failed to load conversation history");
          throw error;
        }

        const previousMessages = conversationMessages
          .filter((msg) => msg.id !== userMessageId && msg.id !== aiMessageId)
          .map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          }));

        const currentMessage = prepareMessagesWithImages(
          text,
          attachedImages.map((img) => ({
            base64: img.base64,
            type: img.file.type,
          })),
        );

        let messages = buildConversationHistory(
          currentMessage,
          previousMessages,
        );

        if (settings.systemPromptEnabled && settings.systemPrompt.trim()) {
          messages = [
            { role: "system", content: settings.systemPrompt },
            ...messages
          ];
        }

        let baseURL = "";
        const apiKey = selectedProvider.apiKey;
        const headers: Record<string, string> = {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        };

        switch (selectedProvider.type) {
          case "openrouter":
            baseURL = "https://openrouter.ai/api/v1";
            // Add OpenRouter specific headers if they exist
            if (selectedProvider.defaultHeaders) {
              Object.entries(selectedProvider.defaultHeaders).forEach(
                ([key, value]) => {
                  if (value !== undefined) {
                    headers[key] = value;
                  }
                },
              );
            }
            break;
          case "openai":
            baseURL = selectedProvider.baseURL ?? "https://api.openai.com/v1";
            break;
          case "custom":
            baseURL = selectedProvider.baseURL;
            if (selectedProvider.defaultHeaders) {
              Object.entries(selectedProvider.defaultHeaders).forEach(
                ([key, value]) => {
                  if (value !== undefined) {
                    headers[key] = value;
                  }
                },
              );
            }
            break;
          default:
            throw new Error(
              `Unsupported provider type: ${(selectedProvider as { type: string }).type}`,
            );
        }

        let aires = "";
        let response: Response;
        try {
          const requestBody: {
            model: string;
            messages: ChatMessage[];
            stream: boolean;
            provider?: { zdr: boolean };
          } = {
            model: modelToUse.id,
            messages,
            stream: true,
          };

          if (settings.zdrEnabled) {
            requestBody.provider = {
              zdr: true
            };
          }

          response = await fetch(`${baseURL}/chat/completions`, {
            method: "POST",
            headers,
            body: JSON.stringify(requestBody),
          });
        } catch {
          throw new Error(
            `Network error: Unable to connect to AI service. Please check your internet connection.`,
          );
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Response body is not readable");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            while (true) {
              const lineEnd = buffer.indexOf("\n");
              if (lineEnd === -1) break;

              const line = buffer.slice(0, lineEnd).trim();
              buffer = buffer.slice(lineEnd + 1);

              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") break;

                try {
                  const parsed = JSON.parse(data) as { choices: Array<{ delta: { content?: string } }> };
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    updateMessage(aiMessageId, aires);
                    aires += content;
                  }
                } catch {
                  // Ignore parsing errors for streaming data
                }
              }
            }
          }
          updateMessage(aiMessageId, aires);
          void MessageService.updateMessage(aiMessageId, aires);
        } finally {
          void reader.cancel();
        }

        setIsResponding(false);
        setIsProcessing(false);
        setStatus("ready");
        setTimeout(() => {
          if (!isMobile) {
            textAreaRef.current?.focus();
          }
        }, 200);
      } catch {
        setIsResponding(false);
        setIsProcessing(false);
        setStatus("error");
        setTimeout(() => {
          if (!isMobile) {
            textAreaRef.current?.focus();
          }
        }, 200);
      }
    })();
  };

  const handleModelChange = (modelId: string) => {
    const model = availableModels.find((m) => m.id === modelId);
    if (model) {
      setSelectedModel(model);
    }
  };

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

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full px-0 pt-2 pb-3">
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

      <PromptInput
        onSubmit={handleSubmit}
        className="focus-within:ring-secondary rounded-lg transition-all duration-200 focus-within:ring-2"
      >
        <PromptInputTextarea
          onChange={(e) => setText(e.target.value)}
          ref={textAreaRef}
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
            {selectedModel?.id !== "meta-llama/llama-3.3-70b-instruct:free" &&  <PromptInputButton
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!selectedProvider || isProcessing}
              title="Add images"
            >
              <ImageIcon size={16} />
            </PromptInputButton>}

            {selectedProvider && (
              <PromptInputModelSelect
                onValueChange={handleModelChange}
                value={settings.zdrEnabled ? zdrModel.id : (selectedModel?.id ?? "")}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue 
                    placeholder="Select model" 
                  />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {settings.zdrEnabled ? (
                    <PromptInputModelSelectItem key={zdrModel.id} value={zdrModel.id}>
                      {zdrModel.displayName}
                    </PromptInputModelSelectItem>
                  ) : (
                    availableModels.map((model) => (
                      <PromptInputModelSelectItem key={model.id} value={model.id}>
                        {model.displayName}
                      </PromptInputModelSelectItem>
                    ))
                  )}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            )}
            {(!selectedProvider || isProcessing) && (
              <div className="px-2 text-sm text-gray-500">
                {isProcessing ? "Processing..." : "No provider selected"}
              </div>
            )}
          </PromptInputTools>
          <PromptInputSubmit disabled={!text} status={status} />
        </PromptInputToolbar>
      </PromptInput>
    </div>
  );
}
