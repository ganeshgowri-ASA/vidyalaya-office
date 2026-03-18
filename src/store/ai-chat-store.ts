"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type EditorContext = "document" | "spreadsheet" | "presentation" | "pdf" | "graphics" | "email" | "chat" | "general";
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  editorContext?: EditorContext;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  editorContext: EditorContext;
  createdAt: string;
  updatedAt: string;
}

interface AIChatState {
  isOpen: boolean;
  isLoading: boolean;
  activeConversationId: string | null;
  conversations: Conversation[];
  showHistory: boolean;
  selectedProvider: string;

  togglePanel: () => void;
  setOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setShowHistory: (show: boolean) => void;
  setSelectedProvider: (provider: string) => void;
  createConversation: (editorContext: EditorContext) => string;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: Omit<ChatMessage, "id" | "timestamp">) => void;
  deleteConversation: (id: string) => void;
  clearAllConversations: () => void;
  getActiveConversation: () => Conversation | null;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const useAIChatStore = create<AIChatState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      isLoading: false,
      activeConversationId: null,
      conversations: [],
      showHistory: false,
      selectedProvider: "claude",

      togglePanel: () => set((s) => ({ isOpen: !s.isOpen })),
      setOpen: (open) => set({ isOpen: open }),
      setLoading: (loading) => set({ isLoading: loading }),
      setShowHistory: (show) => set({ showHistory: show }),
      setSelectedProvider: (provider) => set({ selectedProvider: provider }),

      createConversation: (editorContext) => {
        const id = generateId();
        const conversation: Conversation = {
          id,
          title: "New Chat",
          messages: [],
          editorContext,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({
          conversations: [conversation, ...s.conversations],
          activeConversationId: id,
        }));
        return id;
      },

      setActiveConversation: (id) => set({ activeConversationId: id, showHistory: false }),

      addMessage: (conversationId, message) => {
        const msg: ChatMessage = {
          ...message,
          id: generateId(),
          timestamp: new Date().toISOString(),
        };
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== conversationId) return c;
            const messages = [...c.messages, msg];
            // Auto-title from first user message
            const title =
              c.messages.length === 0 && message.role === "user"
                ? message.content.slice(0, 50) + (message.content.length > 50 ? "..." : "")
                : c.title;
            return { ...c, messages, title, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      deleteConversation: (id) =>
        set((s) => ({
          conversations: s.conversations.filter((c) => c.id !== id),
          activeConversationId: s.activeConversationId === id ? null : s.activeConversationId,
        })),

      clearAllConversations: () => set({ conversations: [], activeConversationId: null }),

      getActiveConversation: () => {
        const { activeConversationId, conversations } = get();
        return conversations.find((c) => c.id === activeConversationId) || null;
      },
    }),
    {
      name: "vidyalaya_ai_chat",
      partialize: (state) => ({
        conversations: state.conversations,
        selectedProvider: state.selectedProvider,
      }),
    }
  )
);
