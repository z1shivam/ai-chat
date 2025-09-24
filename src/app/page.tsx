"use client";

import AiConversation from "@/components/custom/ai_conversation";
import AiInput from "@/components/custom/ai_input";
import { useAppStore } from "@/store/appStore";

export default function HomePage() {
  const { messages } = useAppStore();
  const showCenteredInput = messages.length === 0;

  return (
    <main className="relative h-svh overflow-hidden">
      <div className="hidden"> 
        {/* just to make it run */}
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
          <div className="bg-transparent absolute right-0 bottom-0 left-0 z-10">
            <div className="mx-auto max-w-4xl px-3 lg:px-14 bg-background/50 backdrop-blur-md ">
              <AiInput />
            </div>
          </div>
        </>
      )}
    </main>
  );
}
