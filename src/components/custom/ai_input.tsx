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
import { useAppStore } from "@/store/appStore";
import { ImageIcon, MicIcon, PaperclipIcon, XIcon } from "lucide-react";
import { type FormEventHandler, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Image } from "@/components/ui/shadcn-io/ai/image";
import { toast } from "sonner";
import { MessageService } from "@/lib/database";
import {
  buildConversationHistory,
  prepareMessagesWithImages,
} from "@/lib/ai-service";
import { tokens } from "./test";

interface AttachedImage {
  file: File;
  preview: string;
  base64: string;
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
  } = useAppStore();
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      if (!selectedModel) {
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

        setIsProcessing(true);
        setStatus("submitted");
        setText("");
        setAttachedImages([]);
        let conversationId = currentConversationId;
        if (!conversationId) {
          const conversationName =
            text.length > 30 ? text.substring(0, 30) + "..." : text;
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
          model: selectedModel.id,
          provider: selectedProvider.id,
          metadata: userMessageContent,
        });

        const aiMessageId = await MessageService.addMessage({
          conversationId,
          role: "assistant",
          content: "",
          model: selectedModel.id,
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
          model: selectedModel.id,
          provider: selectedProvider.id,
          metadata: userMessageContent,
        });

        addMessage({
          id: aiMessageId,
          timestamp: new Date(),
          conversationId,
          role: "assistant",
          content: "",
          model: selectedModel.id,
          provider: selectedProvider.id,
          metadata: {
            isLoading: true,
          },
        });

        let currentContent = "";
        let index = 0;
        const interval = setInterval(() => {
          if (index < tokens.length) {
            currentContent += tokens[index];
            updateMessage(aiMessageId, currentContent);
            index++;
          } else {
            clearInterval(interval);
          }
        }, 30);

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

        const messages = buildConversationHistory(
          currentMessage,
          previousMessages,
        );

        setIsProcessing(false);
        setStatus("ready");
      } catch (error) {}
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
    <div className="w-full px-0 py-2">
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

      <PromptInput onSubmit={handleSubmit} autoFocus>
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
                    <PromptInputModelSelectItem key={model.id} value={model.id}>
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
          <PromptInputSubmit disabled={!text} status={status} />
        </PromptInputToolbar>
      </PromptInput>
    </div>
  );
}
