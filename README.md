z1 AI Chat App

Hey! Recently released v1 of my latest frontend project. AI Chat App. Looks like ChatGPT clone at first, but it is much more than that. It is a ZDR compliant AI chat application which is highly performant (thanks to IndexedDB), and your data only resides on your local machine.

try it out here, it's Free and Unlimited (for now, at least)
https://ai.z1shivam.in/

v1 features:
- ZDR: No data retention on any server
- Custom Provider and Model Support: If you still don't trust me, bring your own key!
- 100% Static application: No server compute, you're directly talking with LLM.
- Token Streaming: Don't make you wait, tokens arrive as they are generated.
- Image input: Yes, and again no image is stored anywhere on cloud. It is directly encoded to base64 and send as a stream to LLM directly.
- Multiple conversation & Renaming chat: Obviously!
- Dark Mode support: C'mon it's 2025!
- PWA: Can be installed as a standalone app on your phone. TADA!
- System Prompt: Customize your AI to your preference.

*API key instruction: you can use any OpenAI SDK complaint LLM for this.

Upcoming features:
- Export Chat: Save your conversation as json or txt.
- Image generation: Yeah, exactly what it sounds like.
- Web Search: Talk with the internet!
