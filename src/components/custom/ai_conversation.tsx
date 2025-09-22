"use client";

import { useState, useEffect } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "../ui/shadcn-io/ai/conversation";
import {
  Message,
  MessageContent,
} from "../ui/shadcn-io/ai/message";
import { Response } from "../ui/shadcn-io/ai/response";
import { Action, Actions } from "../ui/shadcn-io/ai/actions";
import { Loader } from "../ui/shadcn-io/ai/loader";
import {
  CopyIcon,
  RefreshCcwIcon,
  ShareIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { MessageService, type DBMessage } from "@/lib/database";

type ChatProps = {
  messages?: DBMessage[];
};

export default function AiConversation({
  messages: propMessages,
}: ChatProps) {
  const { currentConversationId } = useAppStore();
  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load messages when conversation changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentConversationId) {
        setMessages([]);
        return;
      }

      setIsLoading(true);
      try {
        const conversationMessages = await MessageService.getMessages(currentConversationId);
        setMessages(conversationMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [currentConversationId]);

  // Poll for new messages (for real-time updates)
  useEffect(() => {
    if (!currentConversationId) return;

    const interval = setInterval(async () => {
      try {
        const conversationMessages = await MessageService.getMessages(currentConversationId);
        setMessages(conversationMessages);
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    }, 1000); // Poll every second

    return () => clearInterval(interval);
  }, [currentConversationId]);

  const actions = [
    {
      icon: CopyIcon,
      label: "Copy",
    },
    {
      icon: RefreshCcwIcon,
      label: "Regenerate",
    },
    {
      icon: ThumbsUpIcon,
      label: "Good response",
    },
    {
      icon: ThumbsDownIcon,
      label: "Bad response",
    },
    {
      icon: ShareIcon,
      label: "Share",
    },
  ];

  if (isLoading && messages.length === 0) {
    return (
      <Conversation className="h-full">
        <ConversationContent className="h-full flex items-center justify-center">
          <Loader />
        </ConversationContent>
      </Conversation>
    );
  }

  return (
    <Conversation className="h-full">
      <ConversationContent className="h-full">
        {messages.map((message) => (
          <div key={message.id}>
            <Message from={message.role} key={message.id}>
              <MessageContent>
                {message.metadata?.isLoading ? (
                  <Loader />
                ) : (
                  <Response>{message.content}</Response>
                )}
              </MessageContent>
            </Message>
            {message.role === "assistant" && !message.metadata?.isLoading && (
              <Actions className="">
                {actions.map((action) => (
                  <Action key={action.label} label={action.label} tooltip={action.label}>
                    <action.icon className="size-4" />
                  </Action>
                ))}
              </Actions>
            )}
          </div>
        ))}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
