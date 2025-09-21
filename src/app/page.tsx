import AiConversation from "@/components/custom/ai_conversation";
import AiInput from "@/components/custom/ai_input";

export default function HomePage() {
  // This would ideally come from a state management solution
  // For now, we'll assume there are conversations (you can modify this logic)
  const hasConversations = false; // This should be dynamic based on actual conversation state

  return (
    <main className="h-screen relative overflow-hidden">
      {hasConversations ? (
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
          {/* When no conversations - center the input */}
          <div className="flex flex-col gap-4 h-full items-center justify-center">
            <div className="text-2xl font-medium pb-6 text-foreground/80">What's on your mind today?</div>
            <div className="w-full max-w-3xl">
              <AiInput />
            </div>
          </div>
        </>
      )}
    </main>
  );
}
