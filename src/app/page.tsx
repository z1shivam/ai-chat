"use client";

import AiConversation from "@/components/custom/ai_conversation";
import AiInput from "@/components/custom/ai_input";
import { useAppStore } from "@/store/appStore";

export default function HomePage() {
  const { messages } = useAppStore();
  const showCenteredInput = messages.length === 0;

  return (
    <main className="relative h-dvh overflow-hidden">
      <div className="hidden"> 
        {/* just to make it run */}
        <AiConversation />
      </div>
      {showCenteredInput ? (
        <>
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <div className="text-foreground/80 pb-2 text-2xl font-medium md:pb-6">
              What&apos;s on your mind today?
            </div>
            <div className="w-full max-w-3xl px-4 lg:px-0">
              <AiInput />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="absolute inset-0 overflow-hidden">
            <div className="mx-auto h-full max-w-3xl">
              <AiConversation />
            </div>
          </div>
          <div className="bg-background/50 absolute right-0 bottom-0 left-0 z-10 backdrop-blur-md">
            <div className="mx-auto max-w-3xl px-4 lg:px-0">
              <AiInput />
            </div>
          </div>
        </>
      )}
    </main>
  );
}
