// lib/conversationStore.ts
// A client-side store to manage multiple agent conversations without local storage persistence

import { create } from 'zustand';

export interface Message {
  id: string;
  role: 'assistant' | 'system' | 'user' | 'data';
  content: string;
  name?: string;
  agentId?: string;
}

interface ConversationState {
  conversations: Record<string, Message[]>; // Key is agentId
  addMessage: (agentId: string, message: Message) => void;
  setMessages: (agentId: string, messages: Message[]) => void;
  clearConversation: (agentId: string) => void;
  clearAllConversations: () => void;
}

export const useConversationStore = create<ConversationState>()((set) => ({
  conversations: {},
  
  addMessage: (agentId, message) => 
    set((state) => {
      const currentMessages = state.conversations[agentId] || [];
      return {
        conversations: {
          ...state.conversations,
          [agentId]: [...currentMessages, message]
        }
      };
    }),
  
  setMessages: (agentId, messages) => 
    set((state) => ({
      conversations: {
        ...state.conversations,
        [agentId]: messages
      }
    })),
  
  clearConversation: (agentId) => 
    set((state) => {
      const { [agentId]: _, ...rest } = state.conversations;
      return {
        conversations: rest
      };
    }),
  
  clearAllConversations: () => 
    set({ conversations: {} }),
}));