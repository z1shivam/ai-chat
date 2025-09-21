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
import { ImageIcon, XIcon } from 'lucide-react';
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
      setSelectedModel(availableModels[0]?.id || '');
    }
  }, [availableModels, selectedModel]);

  const handleImageFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64 = result.split(',')[1] || '';
        
        const attachedImage: AttachedImage = {
          file,
          preview: result,
          base64
        };
        
        setAttachedImages(prev => [...prev, attachedImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleImageFiles(files);
    
    // Reset input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    // Only hide overlay if leaving the main container
    if (e.currentTarget === e.target) {
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
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (!text && attachedImages.length === 0) {
      return;
    }
    
    if (!selectedProvider) {
      alert('Please select a provider first');
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
      className="w-full min-h-[80vh] p-8 bg-white relative"
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Image Previews */}
      {attachedImages.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-3 relative z-10">
          {attachedImages.map((image, index) => (
            <div key={index} className="relative group">
              <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                <Image
                  base64={image.base64}
                  uint8Array={new Uint8Array()}
                  mediaType={image.file.type}
                  alt={image.file.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-1 text-xs text-gray-600 max-w-20 truncate">
                {image.file.name}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
        <div className="absolute inset-4 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
          <div className="border-2 border-dashed border-blue-400 rounded-lg p-16 bg-blue-50/50 text-center max-w-md">
            <ImageIcon className="h-16 w-16 text-blue-500 mx-auto mb-6" />
            <p className="text-xl font-medium text-gray-900 mb-2">Drop images here</p>
            <p className="text-sm text-gray-600">Support for PNG, JPG, GIF, WebP</p>
          </div>
        </div>
      )}
      
      <div className="relative z-10">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea
            onChange={(e) => setText(e.target.value)}
            value={text}
            placeholder={selectedProvider ? "Type your message..." : "Please select a provider first..."}
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
                <PromptInputModelSelect onValueChange={setSelectedModel} value={selectedModel}>
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
              
              {!selectedProvider && (
                <div className="text-sm text-gray-500 px-2">
                  No provider selected
                </div>
              )}
            </PromptInputTools>
            <PromptInputSubmit 
              disabled={(!text && attachedImages.length === 0) || !selectedProvider} 
              status={status} 
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};
export default AiInput;
