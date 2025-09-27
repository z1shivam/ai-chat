"use client";

import AiConversation from "@/components/custom/ai_conversation";
import AiInput from "@/components/custom/ai_input";
import { useAppStore } from "@/store/appStore";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import { toast } from "sonner";

function HomePageContent() {
  const { messages, setCurrentConversation, getConversationById, loadConversations, clearMessages} = useAppStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleChatFromUrl = async () => {
      const chatId = searchParams.get("chat");
      
      if (!chatId) {
        setCurrentConversation(null);
        clearMessages();
        // fuck hydration errros
        if (typeof window !== 'undefined') {
          const currentUrl = window.location.href;
          const url = new URL(currentUrl);
          if (url.searchParams.has('chat')) {
            url.searchParams.delete('chat');
            window.history.replaceState({}, '', url.toString());
          }
        }
        return;
      }

      await loadConversations();
      
      const conversation = getConversationById(chatId);
      
      if (conversation) {
        setCurrentConversation(chatId);
      } else {
        toast.error("Conversation not found");
        router.replace("/");
      }
    };

    void handleChatFromUrl();
  }, [searchParams, setCurrentConversation, getConversationById, loadConversations, router, clearMessages]);

  const showCenteredInput = messages.length === 0;

  return (
    <main className="relative h-svh overflow-hidden">
      <div className="hidden">
        <AiConversation />
      </div>
      {showCenteredInput ? (
        <>
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <div className="text-foreground/80 pb-0 text-2xl font-medium md:pb-4">
              Arre kehna kya chahte ho?
            </div>
            <div className="w-full max-w-3xl px-4 lg:px-0">
              <AiInput />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="absolute inset-0 overflow-hidden">
            <div className="h-full w-full">
              <AiConversation />
            </div>
          </div>
          <div className="absolute right-0 bottom-0 left-0 z-10 bg-transparent">
            <div className="bg-background/50 mx-auto max-w-4xl px-3 backdrop-blur-md lg:px-14">
              <AiInput />
            </div>
          </div>
        </>
      )}
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
