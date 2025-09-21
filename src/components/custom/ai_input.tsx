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
import { MicIcon, SendIcon, PaperclipIcon, XIcon, FileTextIcon, FileImageIcon } from 'lucide-react';
import { type FormEventHandler, useState, useRef } from "react";
import React from "react";
import { useProvider } from "@/contexts/provider-context";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface AttachedFile {
  file: File;
  preview?: string;
  type: 'image' | 'pdf' | 'docx' | 'other';
}

const AiInput = () => {
  const [text, setText] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
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

  const getFileType = (file: File): AttachedFile['type'] => {
    const mimeType = file.type.toLowerCase();
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf' || extension === 'pdf') return 'pdf';
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || extension === 'docx') return 'docx';
    return 'other';
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const supportedTypes = ['image/', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    files.forEach((file) => {
      const isSupported = supportedTypes.some(type => file.type.startsWith(type)) || 
                         ['pdf', 'docx'].includes(file.name.split('.').pop()?.toLowerCase() || '');
      
      if (isSupported) {
        const fileType = getFileType(file);
        const attachedFile: AttachedFile = {
          file,
          type: fileType
        };

        // Create preview for images
        if (fileType === 'image') {
          const reader = new FileReader();
          reader.onload = (e) => {
            attachedFile.preview = e.target?.result as string;
            setAttachedFiles(prev => [...prev, attachedFile]);
          };
          reader.readAsDataURL(file);
        } else {
          setAttachedFiles(prev => [...prev, attachedFile]);
        }
      }
    });
    
    // Reset input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (!text && attachedFiles.length === 0) {
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
      setAttachedFiles([]);
    }, 2000);
  };

  const renderFilePreview = (attachedFile: AttachedFile, index: number) => {
    const { file, preview, type } = attachedFile;
    
    return (
      <div key={index} className="relative inline-block mr-2 mb-2">
        <div className="flex items-center bg-gray-100 rounded-lg p-2 pr-8 max-w-xs">
          {type === 'image' && preview ? (
            <div className="flex items-center gap-2">
              <Image
                src={preview}
                alt={file.name}
                width={40}
                height={40}
                className="rounded object-cover"
              />
              <span className="text-sm truncate">{file.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {type === 'pdf' && <FileTextIcon className="h-8 w-8 text-red-500" />}
              {type === 'docx' && <FileTextIcon className="h-8 w-8 text-blue-500" />}
              {type === 'other' && <FileImageIcon className="h-8 w-8 text-gray-500" />}
              <span className="text-sm truncate">{file.name}</span>
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute -top-1 -right-1 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
          onClick={() => removeFile(index)}
        >
          <XIcon className="h-3 w-3" />
        </Button>
      </div>
    );
  };
  return (
    <div className="w-full p-8">
      {/* File Previews */}
      {attachedFiles.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-2">Attached files:</div>
          <div className="flex flex-wrap">
            {attachedFiles.map((attachedFile, index) => renderFilePreview(attachedFile, index))}
          </div>
        </div>
      )}
      
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
              accept=".pdf,.docx,image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <PromptInputButton
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!selectedProvider}
            >
              <PaperclipIcon size={16} />
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
            disabled={(!text && attachedFiles.length === 0) || !selectedProvider} 
            status={status} 
          />
        </PromptInputToolbar>
      </PromptInput>
    </div>
  );
};
export default AiInput;
