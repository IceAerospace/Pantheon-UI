import React, { useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { MessageList } from "./MessageList";
import { InputBox } from "./InputBox";
import { AgentIndicator } from "./AgentIndicator";
import { useChat } from "@/hooks/useChat";
import styles from "./ChatView.module.css";

export const ChatView: React.FC = () => {
  const {
    activeChatId,
    activeMessages,
    isStreaming,
    loadSessions,
    newChat,
    sendMessage,
  } = useChat();

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  if (!activeChatId) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyContent}>
          <MessageSquare size={52} className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>Welcome to Pantheon UI</h2>
          <p className={styles.emptyDesc}>
            Select a conversation from the sidebar or start a new one.
          </p>
          <button
            className={styles.newChatBtn}
            onClick={() => void newChat()}
          >
            + New Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <MessageList messages={activeMessages} />
      {isStreaming && <AgentIndicator />}
      <InputBox
        onSend={sendMessage}
        disabled={isStreaming}
      />
    </div>
  );
};

export default ChatView;
