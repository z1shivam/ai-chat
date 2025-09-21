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
import { type FormEventHandler, useState, useRef } from "react";
import React from "react";
import { useProvider } from "@/contexts/provider-context";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/shadcn-io/ai/image";

interface AttachedImage {
  file: File;
  preview: string;
  base64: string;
}

const AiInput = () => {
  const [text, setText] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [status, setStatus] = useState<
    "submitted" | "streaming" | "ready" | "error"
  >("ready");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { selectedProvider, availableModels } = useProvider();

  // Set default model when available models change
  React.useEffect(() => {
    if (availableModels.length > 0 && !selectedModel) {
      setSelectedModel(availableModels[0]?.id ?? "");
    }
  }, [availableModels, selectedModel]);

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
    if (!text && attachedImages.length === 0) {
      return;
    }

    if (!selectedProvider) {
      alert("Please select a provider first");
      return;
    }

    setStatus("submitted");
    setTimeout(() => {
      setStatus("streaming");
    }, 200);
    setTimeout(() => {
      setStatus("ready");
      setText("");
      setAttachedImages([]);
    }, 2000);
  };

  return (
    <div
      className="bg-transparent relative w-full pb-3 backdrop-blur-lg"
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
              selectedProvider
                ? "Type your message..."
                : "Please select a provider first..."
            }
            disabled={!selectedProvider}
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
                disabled={!selectedProvider}
                title="Add images"
              >
                <ImageIcon size={16} />
              </PromptInputButton>

              {selectedProvider && (
                <PromptInputModelSelect
                  onValueChange={setSelectedModel}
                  value={selectedModel}
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

              {!selectedProvider && (
                <div className="px-2 text-sm text-gray-500">
                  No provider selected
                </div>
              )}
            </PromptInputTools>
            <PromptInputSubmit
              disabled={
                (!text && attachedImages.length === 0) || !selectedProvider
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
