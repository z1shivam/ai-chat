"use client";

import { MessageService, type DBMessage } from "@/lib/database";
import { useAppStore } from "@/store/appStore";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
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
  const { currentConversationId } = useAppStore();
  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadMessages = async () => {
      if (!currentConversationId) {
        setMessages([]);
        return;
      }

      setIsLoading(true);
      try {
        const conversationMessages = await MessageService.getMessages(
          currentConversationId,
        );
        setMessages([
          ...conversationMessages,
          {
            id: crypto.randomUUID(),
            conversationId: currentConversationId ?? "",
            role: "user",
            content: "how is the day",
            timestamp: new Date(),
          },
        ]);
      } catch (error) {
        console.error("Error loading messages:", error);
        toast.error("Failed to load conversation messages");
      } finally {
        setIsLoading(false);
      }
    };

    void loadMessages();
  }, [currentConversationId]);

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
        {isLoading && (
          <div className="pb-8">
            <LoaderCircle className="size-5 animate-spin" />
          </div>
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
