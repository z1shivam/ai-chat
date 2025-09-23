"use client"

import { useState, useEffect } from "react";
import AiConversation from "@/components/custom/ai_conversation";
import AiInput from "@/components/custom/ai_input";
import { useAppStore } from "@/store/appStore";
import { MessageService } from "@/lib/database";

export default function HomePage() {
  const { currentConversationId } = useAppStore();
  const [messageCount, setMessageCount] = useState(0);

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
    }, 1000); 

    return () => clearInterval(interval);
  }, [currentConversationId]);

  const shouldCenterInput = !currentConversationId || messageCount === 0;

  return (
    <main className="h-screen relative overflow-hidden">
      {!shouldCenterInput ? (
        <>
          <div className="absolute inset-0 overflow-hidden">
            <div className="h-full max-w-3xl mx-auto">
              <AiConversation />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-background/50 backdrop-blur-md">
            <div className="max-w-3xl mx-auto px-4 lg:px-0">
              <AiInput />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-4 h-full items-center justify-center">
            <div className="text-2xl font-medium pb-2 md:pb-6 text-foreground/80">What&apos;s on your mind today?</div>
            <div className="w-full max-w-3xl px-4 lg:px-0">
              <AiInput />
            </div>
          </div>
        </>
      )}
    </main>
  );
}
