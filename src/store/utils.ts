// Utility function to generate unique IDs
export const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Utility function to generate conversation name
export const generateConversationName = () => {
  return `New Conversation ${new Date().toLocaleDateString()}`;
};