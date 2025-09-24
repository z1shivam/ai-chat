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
        console.log(messages);
      } catch (error) {
        console.error("Error loading messages:", error);
        toast.error("Failed to load conversation messages");
      }
    };

    void handleLoadMessages();
  }, [currentConversationId, loadMessages]);

  return (
    <Conversation className="h-full">
      <ConversationContent className="pb-36 max-w-3xl mx-auto">
        {messages.map((message) => {
          return (
            <Message from={message.role} key={message.id}>
              <MessageContent>
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
                          <div key={index} className="relative">
                            <Image
                              base64={image.base64}
                              uint8Array={new Uint8Array()}
                              mediaType={image.type}
                              alt={image.name || `Image ${index + 1}`}
                              className="max-w-sm rounded-lg border"
                            />
                            <div className="text-muted-foreground mt-1 max-w-sm truncate text-xs">
                              {image.name || `Image ${index + 1}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  <Response>{message.content}</Response>
                </>
              </MessageContent>
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
