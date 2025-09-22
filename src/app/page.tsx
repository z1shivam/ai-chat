"use client"

import { useState, useEffect } from "react";
import AiConversation from "@/components/custom/ai_conversation";
import AiInput from "@/components/custom/ai_input";
import { useAppStore } from "@/store/appStore";
import { MessageService } from "@/lib/database";

export default function HomePage() {
  const { currentConversationId } = useAppStore();
  const [messageCount, setMessageCount] = useState(0);

  // Load message count when conversation changes
  useEffect(() => {
    const loadMessageCount = async () => {
      if (!currentConversationId) {
        setMessageCount(0);
        return;
      }

      try {
        const count = await MessageService.getMessageCount(currentConversationId);
        setMessageCount(count);
      } catch (error) {
        console.error('Error loading message count:', error);
        setMessageCount(0);
      }
    };

    void loadMessageCount();
  }, [currentConversationId]);

  // Poll for message count updates (for real-time updates)
  useEffect(() => {
    if (!currentConversationId) return;

    const interval = setInterval(() => {
      void (async () => {
        try {
          const count = await MessageService.getMessageCount(currentConversationId);
          setMessageCount(count);
        } catch (error) {
          console.error('Error polling message count:', error);
        }
      })();
    }, 1000); // Poll every second

    return () => clearInterval(interval);
  }, [currentConversationId]);

  // Show centered input when there's no conversation or no messages
  const shouldCenterInput = !currentConversationId || messageCount === 0;

  return (
    <main className="h-screen relative overflow-hidden">
      {!shouldCenterInput ? (
        <>
          {/* Conversation takes full screen height and goes behind input */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="h-full max-w-3xl mx-auto">
              <AiConversation />
            </div>
          </div>
          {/* Input positioned absolutely at bottom with higher z-index */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <div className="max-w-3xl mx-auto">
              <AiInput />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* When no conversation or no messages - center the input */}
          <div className="flex flex-col gap-4 h-full items-center justify-center">
            <div className="text-2xl font-medium pb-6 text-foreground/80">What&apos;s on your mind today?</div>
            <div className="w-full max-w-3xl">
              <AiInput />
            </div>
          </div>
        </>
      )}
    </main>
  );
}
