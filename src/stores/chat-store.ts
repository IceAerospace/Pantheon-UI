import { create } from "zustand";
import {
  createChat,
  listChats,
  getChatMessages,
  renameChat,
  deleteChat,
  chat as sendChatMessage,
} from "@/services/chatroom-api";
import { subscribeStream } from "@/services/nats-client";
import type { ChatSession, ChatMessage, FileAttachment } from "@/types";

interface ChatState {
  sessions: ChatSession[];
  activeChatId: string | null;
  messages: Record<string, ChatMessage[]>;
  isStreaming: boolean;
  streamingMessageId: string | null;

  // Actions
  loadSessions: () => Promise<void>;
  createSession: (title?: string) => Promise<ChatSession>;
  selectSession: (chatId: string) => Promise<void>;
  renameSession: (chatId: string, title: string) => Promise<void>;
  deleteSession: (chatId: string) => Promise<void>;
  sendMessage: (
    content: string,
    attachments?: FileAttachment[]
  ) => Promise<void>;
  appendStreamChunk: (chatId: string, chunk: string, agentName?: string) => void;
  finalizeStream: (chatId: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  sessions: [],
  activeChatId: null,
  messages: {},
  isStreaming: false,
  streamingMessageId: null,

  loadSessions: async () => {
    try {
      const sessions = await listChats();
      set({ sessions });
    } catch (err) {
      console.error("Failed to load sessions:", err);
    }
  },

  createSession: async (title?: string) => {
    const session = await createChat(title);
    set((state) => ({
      sessions: [session, ...state.sessions],
      activeChatId: session.id,
      messages: { ...state.messages, [session.id]: [] },
    }));
    return session;
  },

  selectSession: async (chatId: string) => {
    set({ activeChatId: chatId });
    const existing = get().messages[chatId];
    if (!existing) {
      try {
        const msgs = await getChatMessages(chatId);
        set((state) => ({
          messages: { ...state.messages, [chatId]: msgs },
        }));
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    }
  },

  renameSession: async (chatId: string, title: string) => {
    await renameChat(chatId, title);
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === chatId ? { ...s, title } : s
      ),
    }));
  },

  deleteSession: async (chatId: string) => {
    await deleteChat(chatId);
    set((state) => {
      const sessions = state.sessions.filter((s) => s.id !== chatId);
      const messages = { ...state.messages };
      delete messages[chatId];
      const activeChatId =
        state.activeChatId === chatId
          ? sessions[0]?.id ?? null
          : state.activeChatId;
      return { sessions, messages, activeChatId };
    });
  },

  sendMessage: async (
    content: string,
    attachments?: FileAttachment[]
  ) => {
    const { activeChatId } = get();
    if (!activeChatId) {
      throw new Error("No active chat session");
    }

    // Add user message optimistically
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      chatId: activeChatId,
      role: "user",
      content,
      timestamp: Date.now(),
      attachments,
    };

    // Add placeholder assistant message
    const assistantMsgId = crypto.randomUUID();
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      chatId: activeChatId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      isStreaming: true,
    };

    set((state) => ({
      messages: {
        ...state.messages,
        [activeChatId]: [
          ...(state.messages[activeChatId] ?? []),
          userMsg,
          assistantMsg,
        ],
      },
      isStreaming: true,
      streamingMessageId: assistantMsgId,
    }));

    // Subscribe to streaming response
    const unsub = subscribeStream(activeChatId, (chunk) => {
      if (chunk.error) {
        get().finalizeStream(activeChatId);
        unsub();
        return;
      }

      if (!chunk.done) {
        get().appendStreamChunk(
          activeChatId,
          chunk.content,
          chunk.agentName
        );
      } else {
        get().finalizeStream(activeChatId);
        unsub();
      }
    });

    try {
      await sendChatMessage({
        chatId: activeChatId,
        message: content,
        attachments,
        stream: true,
      });
    } catch (err) {
      unsub();
      get().finalizeStream(activeChatId);
      console.error("Failed to send message:", err);
      throw err;
    }
  },

  appendStreamChunk: (chatId: string, chunk: string, agentName?: string) => {
    const { streamingMessageId } = get();
    if (!streamingMessageId) return;

    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] ?? []).map((msg) =>
          msg.id === streamingMessageId
            ? {
                ...msg,
                content: msg.content + chunk,
                agentName: agentName ?? msg.agentName,
              }
            : msg
        ),
      },
    }));
  },

  finalizeStream: (chatId: string) => {
    const { streamingMessageId } = get();
    if (!streamingMessageId) return;

    set((state) => ({
      isStreaming: false,
      streamingMessageId: null,
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] ?? []).map((msg) =>
          msg.id === streamingMessageId
            ? { ...msg, isStreaming: false }
            : msg
        ),
      },
    }));
  },

  clearMessages: () => {
    set({ messages: {}, activeChatId: null });
  },
}));
