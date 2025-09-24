import { v4 as uuidv4 } from 'uuid';

// Utility function to generate unique IDs
export const generateId = () => uuidv4();

// Utility function to generate conversation name
export const generateConversationName = () => {
  return `New Conversation ${new Date().toLocaleDateString()}`;
};