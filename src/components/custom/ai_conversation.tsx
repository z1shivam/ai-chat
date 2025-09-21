"use client";

import { useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "../ui/shadcn-io/ai/conversation";
import { Message, MessageAvatar, MessageContent } from "../ui/shadcn-io/ai/message";
import { Response } from "../ui/shadcn-io/ai/response";

// Define message type
type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

// 10 default messages
const defaultMessages: ChatMessage[] = Array.from({ length: 10 }, (_, i) => ({
  id: i.toString(),
  role: i % 2 === 0 ? "user" : "assistant",
  content: `This is default message ${i + 1}`,
}));

type ChatProps = {
  messages?: ChatMessage[];
};

export default function AiConversation({ messages = defaultMessages }: ChatProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      // TODO: update messages state here if needed
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <Conversation>
        <ConversationContent>
          {messages.map((message) => (
            <Message from={message.role} key={message.id}>
              <MessageContent>
                <Response>{message.content}</Response>
              </MessageContent>
               <MessageAvatar name={"user"} src={""} />
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </div>
  );
}
