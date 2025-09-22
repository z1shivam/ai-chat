"use client";

import { useState, useEffect, useRef } from "react";
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
import { Image } from "../ui/shadcn-io/ai/image";
import {
  CopyIcon,
  RefreshCcwIcon,
  ShareIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { MessageService, type DBMessage } from "@/lib/database";
import { toast } from "sonner";
import { useStickToBottomContext } from "use-stick-to-bottom";

type ChatProps = {
  messages?: DBMessage[];
};

// Hook for streaming text that returns the current displayed content
function useStreamingText(content: string, isComplete: boolean): string {
  const [displayedContent, setDisplayedContent] = useState(content);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { scrollToBottom } = useStickToBottomContext();

  useEffect(() => {
    // If content is complete, show it all immediately
    if (isComplete) {
      setDisplayedContent(content);
      setCurrentIndex(content.length);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Only proceed if we have new content to display
    if (currentIndex >= content.length) {
      return;
    }

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Stream the content word by word
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => {
        if (prevIndex >= content.length) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return prevIndex;
        }

        // Find the next word boundary or take the next few characters
        const remainingContent = content.slice(prevIndex);
        let nextChunkSize = 1;
        
        // If we're at a space, include the word after it
        if (content[prevIndex] === ' ') {
          const nextSpaceIndex = remainingContent.indexOf(' ', 1);
          nextChunkSize = nextSpaceIndex === -1 ? remainingContent.length : nextSpaceIndex;
        } else {
          // Find the next space to complete the current word
          const nextSpaceIndex = remainingContent.indexOf(' ');
          if (nextSpaceIndex !== -1 && nextSpaceIndex < 20) { // Limit to reasonable word length
            nextChunkSize = nextSpaceIndex + 1; // Include the space
          }
        }

        const newIndex = Math.min(prevIndex + nextChunkSize, content.length);
        setDisplayedContent(content.slice(0, newIndex));
        
        // Trigger scroll to bottom for each update
        setTimeout(() => scrollToBottom(), 10);
        
        return newIndex;
      });
    }, 50); // Update every 50ms for smooth animation

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [content, currentIndex, isComplete, scrollToBottom]);

  // Reset when content changes significantly (new message)
  useEffect(() => {
    if (content.length < displayedContent.length) {
      setDisplayedContent('');
      setCurrentIndex(0);
    }
  }, [content, displayedContent.length]);

  return displayedContent;
}

// Component for individual message that can use hooks
function MessageItem({ message }: { message: DBMessage }) {
  // Use streaming text hook for assistant messages
  const displayContent = message.role === 'assistant' 
    ? useStreamingText(message.content, !message.metadata?.isLoading)
    : message.content;

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

  return (
    <div>
      <Message from={message.role}>
        <MessageContent>
          <>
            {/* Show images if they exist in user messages */}
            {message.role === 'user' && message.metadata?.images && Array.isArray(message.metadata.images) && (
              <div className="mb-3 flex flex-wrap gap-2">
                {(message.metadata.images as Array<{base64: string, type: string, name: string}>).map((image, index) => (
                  <div key={index} className="relative">
                    <Image
                      base64={image.base64}
                      uint8Array={new Uint8Array()}
                      mediaType={image.type}
                      alt={image.name || `Image ${index + 1}`}
                      className="max-w-sm rounded-lg border"
                    />
                    <div className="mt-1 text-xs text-muted-foreground truncate max-w-sm">
                      {image.name || `Image ${index + 1}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {message.metadata?.isLoading ? (
              <Loader />
            ) : (
              <Response>{displayContent}</Response>
            )}
          </>
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
  );
}

// Inner component that can access the StickToBottom context
function ConversationMessages() {
  const { currentConversationId } = useAppStore();
  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { scrollToBottom } = useStickToBottomContext();

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
        toast.error('Failed to load conversation messages');
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
        
        // Only update if messages actually changed to avoid unnecessary re-renders
        setMessages(prevMessages => {
          if (JSON.stringify(prevMessages) !== JSON.stringify(conversationMessages)) {
            return conversationMessages;
          }
          return prevMessages;
        });
      } catch (error) {
        console.error('Error polling messages:', error);
        toast.error('Failed to refresh messages');
      }
    }, 1000); // Poll every second

    return () => clearInterval(interval);
  }, [currentConversationId]);

  // Trigger scroll when messages change or when streaming
  useEffect(() => {
    const hasLoadingMessage = messages.some(msg => msg.metadata?.isLoading);
    if (hasLoadingMessage || messages.length > 0) {
      // Use a small delay to ensure the DOM has updated
      setTimeout(() => scrollToBottom(), 10);
    }
  }, [messages, scrollToBottom]);

  if (isLoading && messages.length === 0) {
    return (
      <ConversationContent className="h-full flex items-center justify-center">
        <Loader />
      </ConversationContent>
    );
  }

  return (
    <ConversationContent className="h-full">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </ConversationContent>
  );
}

export default function AiConversation({
  messages: propMessages,
}: ChatProps) {
  return (
    <Conversation className="h-full">
      <ConversationMessages />
      <ConversationScrollButton />
    </Conversation>
  );
}