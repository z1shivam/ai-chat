"use client";

import { type DBMessage } from "@/lib/database";
import { useAppStore } from "@/store/appStore";
import { LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "../ui/shadcn-io/ai/conversation";
import { Message, MessageContent } from "../ui/shadcn-io/ai/message";
import { Response } from "../ui/shadcn-io/ai/response";
import { Image } from "../ui/shadcn-io/ai/image";

type ChatProps = {
  messages?: DBMessage[];
};

export default function AiConversation({ messages: _propMessages }: ChatProps) {
  const { currentConversationId, messages, isResponding, loadMessages } =
    useAppStore();

  useEffect(() => {
    const handleLoadMessages = async () => {
      if (!currentConversationId) {
        return;
      }

      try {
        await loadMessages(currentConversationId);
      } catch (error) {
        console.error("Error loading messages:", error);
        toast.error("Failed to load conversation messages");
      }
    };

    void handleLoadMessages();
  }, [currentConversationId, loadMessages]);

  // Debug: Check for duplicate message IDs
  useEffect(() => {
    const messageIds = messages.map(m => m.id);
    const uniqueIds = new Set(messageIds);
    if (messageIds.length !== uniqueIds.size) {
      console.error('Duplicate message IDs detected:', messageIds);
      const duplicates = messageIds.filter((id, index) => messageIds.indexOf(id) !== index);
      console.error('Duplicate IDs:', duplicates);
    }
  }, [messages]);

  return (
    <Conversation className="h-full">
      <ConversationContent className="mx-auto max-w-3xl pb-36">
        {messages.map((message, index) => {
          return (
            <Message from={message.role} key={`${message.id}-${index}-${message.timestamp?.getTime() || Date.now()}`} className="flex-col">
              <>
                {message.role === "user" &&
                  message.metadata?.images &&
                  Array.isArray(message.metadata.images) && (
                    <div className="flex flex-wrap gap-2">
                      {(
                        message.metadata.images as Array<{
                          base64: string;
                          type: string;
                          name: string;
                        }>
                      ).map((image, index) => (
                        <div key={`${message.id}-image-${index}-${image.name || index}`} className="relative">
                          <Image
                            base64={image.base64}
                            uint8Array={new Uint8Array()}
                            mediaType={image.type}
                            alt={image.name || `Image ${index + 1}`}
                            className="max-w-sm rounded-lg border "
                          />
                          <div className="text-muted-foreground mt-1 max-w-sm truncate text-xs">
                            {image.name.slice(0,12) || `Image ${index + 1}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                <MessageContent>
                  <Response>{message.content}</Response>
                </MessageContent>
              </>
            </Message>
          );
        })}
        {isResponding && (
          <div className="flex w-full items-center justify-start pb-8">
            <LoaderCircle className="mr-2 size-5 animate-spin" /> Thinking...
          </div>
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
