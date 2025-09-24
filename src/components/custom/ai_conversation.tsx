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

type ChatProps = {
  messages?: DBMessage[];
};

export default function AiConversation({ messages: _propMessages }: ChatProps) {
  const { 
    currentConversationId, 
    messages, 
    messagesLoading, 
    loadMessages
  } = useAppStore();

  useEffect(() => {
    const handleLoadMessages = async () => {
      if (!currentConversationId) {
        return;
      }

      try {
        await loadMessages(currentConversationId);
        console.log(messages)
      } catch (error) {
        console.error("Error loading messages:", error);
        toast.error("Failed to load conversation messages");
      }
    };

    void handleLoadMessages();
  }, [currentConversationId, loadMessages]);

  return (
    <Conversation className="h-full">
      <ConversationContent className="pb-36">
        {messages.map((message) => {
          return (
            <Message from={message.role} key={message.id}>
              <MessageContent>
                <Response>{message.content}</Response>
              </MessageContent>
            </Message>
          );
        })}
        {messagesLoading && (
          <div className="pb-8 w-full flex items-center justify-center">
            <LoaderCircle className="size-5 animate-spin" />
          </div>
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
