import AiConversation from "@/components/custom/ai_conversation";
import AiInput from "@/components/custom/ai_input";

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center justify-center bg-background">

      <AiConversation />
      <AiInput />
    </main>
  );
}
