"use client";

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
import {
  CopyIcon,
  RefreshCcwIcon,
  ShareIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";

// Define message type
type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  from: "user" | "assistant";

  content: string;
};

// 10 default messages
const defaultMessages: ChatMessage[] = Array.from({ length: 10 }, (_, i) => ({
  id: i.toString(),
  role: i % 2 === 0 ? "user" : "assistant",
  from: i % 2 === 0 ? "user" : "assistant",
  content: `Here's some code:
  lorem dfjd lsdjflksd dljfslkdjf ljdflkjsdl lsdjfflkdsjlkds ljsdffkldjslkdj ljdlkd lkjdfkdl shivam hsivam shivam hsivam shivam shivam shivam shivm shivam
\`\`\`javascript
const greeting = "Hello, world!";
console.log(greeting);
\`\`\`
`,
}));

type ChatProps = {
  messages?: ChatMessage[];
};

export default function AiConversation({
  messages = defaultMessages,
}: ChatProps) {
  const actions = [
    {
      icon: RefreshCcwIcon,
      label: "Retry",
    },
    {
      icon: ThumbsUpIcon,
      label: "Like",
    },
    {
      icon: ThumbsDownIcon,
      label: "Dislike",
    },
    {
      icon: CopyIcon,
      label: "Copy",
    },
    {
      icon: ShareIcon,
      label: "Share",
    },
  ];

  return (
    <Conversation className="h-full">
      <ConversationContent className="h-full">
        {messages.map((message) => (
          <div key={message.id}>
            <Message from={message.role} key={message.id}>
              <MessageContent>
                <Response>{message.content}</Response>
              </MessageContent>
        
            </Message>
            {message.from === "assistant" && (
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
