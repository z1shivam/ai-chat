import Dexie, { type EntityTable } from 'dexie';

// Message interface for database storage
export interface DBMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  provider?: string;
  metadata?: Record<string, any>; // For storing additional data like token counts, etc.
}

// Conversation metadata interface (lightweight version without messages)
export interface DBConversation {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  model?: string;
  provider?: string;
  messageCount: number;
  lastMessageAt?: Date;
}

// Database schema
class AIChatDatabase extends Dexie {
  messages!: EntityTable<DBMessage, 'id'>;
  conversations!: EntityTable<DBConversation, 'id'>;

  constructor() {
    super('AIChatDatabase');
    
    this.version(1).stores({
      messages: 'id, conversationId, timestamp, role',
      conversations: 'id, name, createdAt, updatedAt, lastMessageAt'
    });
  }
}

const db = new AIChatDatabase();

// Message operations
class MessageService {
  /**
   * Get all messages for a conversation, ordered by timestamp
   */
  static async getMessages(conversationId: string): Promise<DBMessage[]> {
    return await db.messages
      .where('conversationId')
      .equals(conversationId)
      .toArray()
      .then(messages => messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));
  }

  /**
   * Get messages with pagination
   */
  static async getMessagesPaginated(
    conversationId: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<DBMessage[]> {
    const allMessages = await db.messages
      .where('conversationId')
      .equals(conversationId)
      .toArray();
    
    return allMessages
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(offset, offset + limit);
  }

  /**
   * Get the latest N messages for a conversation
   */
  static async getLatestMessages(conversationId: string, count: number = 10): Promise<DBMessage[]> {
    const allMessages = await db.messages
      .where('conversationId')
      .equals(conversationId)
      .toArray();
    
    return allMessages
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, count)
      .reverse(); // Return in chronological order
  }

  /**
   * Add a single message to a conversation
   */
  static async addMessage(message: Omit<DBMessage, 'id' | 'timestamp'>): Promise<string> {
    const newMessage: DBMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    await db.transaction('rw', [db.messages, db.conversations], async () => {
      // Add the message
      await db.messages.add(newMessage);
      
      // Update conversation metadata
      await MessageService.updateConversationMetadata(message.conversationId);
    });

    return newMessage.id;
  }

  /**
   * Append multiple messages to a conversation
   */
  static async appendMessages(conversationId: string, messages: Omit<DBMessage, 'id' | 'timestamp' | 'conversationId'>[]): Promise<string[]> {
    const newMessages: DBMessage[] = messages.map(msg => ({
      ...msg,
      conversationId,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }));

    await db.transaction('rw', [db.messages, db.conversations], async () => {
      // Add all messages
      await db.messages.bulkAdd(newMessages);
      
      // Update conversation metadata
      await MessageService.updateConversationMetadata(conversationId);
    });

    return newMessages.map(msg => msg.id);
  }

  /**
   * Update a message's content
   */
  static async updateMessage(messageId: string, content: string): Promise<void> {
    await db.messages.update(messageId, { content });
  }

  /**
   * Delete a specific message
   */
  static async deleteMessage(messageId: string): Promise<void> {
    const message = await db.messages.get(messageId);
    if (message) {
      await db.transaction('rw', [db.messages, db.conversations], async () => {
        await db.messages.delete(messageId);
        await MessageService.updateConversationMetadata(message.conversationId);
      });
    }
  }

  /**
   * Delete all messages for a conversation
   */
  static async clearConversation(conversationId: string): Promise<void> {
    await db.transaction('rw', [db.messages, db.conversations], async () => {
      await db.messages.where('conversationId').equals(conversationId).delete();
      await MessageService.updateConversationMetadata(conversationId);
    });
  }

  /**
   * Get message count for a conversation
   */
  static async getMessageCount(conversationId: string): Promise<number> {
    return await db.messages.where('conversationId').equals(conversationId).count();
  }

  /**
   * Search messages by content
   */
  static async searchMessages(conversationId: string, query: string): Promise<DBMessage[]> {
    const allMessages = await db.messages
      .where('conversationId')
      .equals(conversationId)
      .toArray();
    
    return allMessages
      .filter(message => message.content.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Update conversation metadata (message count, last message time)
   */
  private static async updateConversationMetadata(conversationId: string): Promise<void> {
    const messageCount = await MessageService.getMessageCount(conversationId);
    const allMessages = await db.messages
      .where('conversationId')
      .equals(conversationId)
      .toArray();
    
    const latestMessage = allMessages
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    await db.conversations.update(conversationId, {
      messageCount,
      lastMessageAt: latestMessage?.timestamp,
      updatedAt: new Date(),
    });
  }
}

// Conversation operations
class ConversationService {
  /**
   * Create a new conversation
   */
  static async createConversation(conversation: Omit<DBConversation, 'messageCount' | 'lastMessageAt'>): Promise<string> {
    const newConversation: DBConversation = {
      ...conversation,
      messageCount: 0,
    };

    await db.conversations.add(newConversation);
    return conversation.id;
  }

  /**
   * Get all conversations, ordered by last activity
   */
  static async getConversations(): Promise<DBConversation[]> {
    const conversations = await db.conversations.toArray();
    return conversations.sort((a, b) => {
      const aTime = a.lastMessageAt?.getTime() || a.updatedAt.getTime();
      const bTime = b.lastMessageAt?.getTime() || b.updatedAt.getTime();
      return bTime - aTime;
    });
  }

  /**
   * Get a specific conversation
   */
  static async getConversation(conversationId: string): Promise<DBConversation | undefined> {
    return await db.conversations.get(conversationId);
  }

  /**
   * Update conversation details
   */
  static async updateConversation(conversationId: string, updates: Partial<DBConversation>): Promise<void> {
    await db.conversations.update(conversationId, {
      ...updates,
      updatedAt: new Date(),
    });
  }

  /**
   * Delete a conversation and all its messages
   */
  static async deleteConversation(conversationId: string): Promise<void> {
    await db.transaction('rw', [db.messages, db.conversations], async () => {
      await db.messages.where('conversationId').equals(conversationId).delete();
      await db.conversations.delete(conversationId);
    });
  }

  /**
   * Rename a conversation
   */
  static async renameConversation(conversationId: string, newName: string): Promise<void> {
    await ConversationService.updateConversation(conversationId, { name: newName });
  }
}

// Database utilities
class DatabaseService {
  /**
   * Export all data for backup
   */
  static async exportData(): Promise<string> {
    const conversations = await db.conversations.toArray();
    const messages = await db.messages.toArray();
    
    return JSON.stringify({
      conversations,
      messages,
      exportedAt: new Date(),
      version: 1,
    }, null, 2);
  }

  /**
   * Import data from backup
   */
  static async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      await db.transaction('rw', [db.conversations, db.messages], async () => {
        if (data.conversations) {
          await db.conversations.bulkAdd(data.conversations);
        }
        if (data.messages) {
          await db.messages.bulkAdd(data.messages);
        }
      });
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('Invalid data format');
    }
  }

  /**
   * Clear all data
   */
  static async clearAllData(): Promise<void> {
    await db.transaction('rw', [db.conversations, db.messages], async () => {
      await db.conversations.clear();
      await db.messages.clear();
    });
  }

  /**
   * Get database statistics
   */
  static async getStats(): Promise<{
    conversationCount: number;
    messageCount: number;
    totalSize: number;
  }> {
    const conversationCount = await db.conversations.count();
    const messageCount = await db.messages.count();
    
    // Rough estimate of storage size
    const conversations = await db.conversations.toArray();
    const messages = await db.messages.toArray();
    const totalSize = JSON.stringify({ conversations, messages }).length;

    return {
      conversationCount,
      messageCount,
      totalSize,
    };
  }
}

// Export the main services for easy use
export { db, MessageService, ConversationService, DatabaseService };