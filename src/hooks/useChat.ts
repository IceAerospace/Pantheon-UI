import { useCallback } from "react";
import { useChatStore } from "@/stores/chat-store";
import { useConnectionStore } from "@/stores/connection-store";

export function useChat() {
  const {
    sessions,
    activeChatId,
    messages,
    isStreaming,
    loadSessions,
    createSession,
    selectSession,
    renameSession,
    deleteSession,
    sendMessage,
  } = useChatStore();

  const { status: connectionStatus } = useConnectionStore();

  const activeMessages = activeChatId ? (messages[activeChatId] ?? []) : [];

  const newChat = useCallback(
    async (title?: string) => {
      if (connectionStatus !== "connected") return;
      return createSession(title);
    },
    [connectionStatus, createSession]
  );

  const send = useCallback(
    async (content: string) => {
      if (!activeChatId || connectionStatus !== "connected") return;
      if (!content.trim()) return;
      await sendMessage(content.trim());
    },
    [activeChatId, connectionStatus, sendMessage]
  );

  return {
    sessions,
    activeChatId,
    activeMessages,
    isStreaming,
    connectionStatus,
    loadSessions,
    newChat,
    selectSession,
    renameSession,
    deleteSession,
    sendMessage: send,
  };
}
