import React, { useEffect, useRef } from "react";
import { MessageItem } from "./MessageItem";
import type { ChatMessage } from "@/types";
import styles from "./MessageList.module.css";

interface MessageListProps {
  messages: ChatMessage[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  // Track whether the user is near the bottom of the scroll
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const threshold = 100;
    isNearBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  };

  // Auto-scroll when new messages arrive, but only if user was near bottom
  useEffect(() => {
    if (isNearBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Always scroll to bottom when chat changes (new message id pattern)
  const prevLastId = useRef<string | null>(null);
  useEffect(() => {
    const lastId = messages[messages.length - 1]?.id ?? null;
    if (lastId !== prevLastId.current) {
      prevLastId.current = lastId;
      if (isNearBottomRef.current) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  });

  if (messages.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No messages yet. Say something!</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={styles.container}
      onScroll={handleScroll}
    >
      <div className={styles.inner}>
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} className={styles.anchor} aria-hidden />
      </div>
    </div>
  );
};

export default MessageList;
