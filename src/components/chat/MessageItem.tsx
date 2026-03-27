import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User } from "lucide-react";
import { CodeBlock } from "./CodeBlock";
import type { ChatMessage } from "@/types";
import styles from "./MessageItem.module.css";

interface MessageItemProps {
  message: ChatMessage;
}

export const MessageItem: React.FC<MessageItemProps> = memo(({ message }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`${styles.wrapper} ${isUser ? styles.user : styles.assistant} animate-fade-in`}
    >
      <div className={styles.avatar}>
        {isUser ? (
          <User size={16} />
        ) : (
          message.agentIcon ? (
            <img
              src={message.agentIcon}
              alt={message.agentName ?? "Agent"}
              className={styles.avatarImg}
            />
          ) : (
            <Bot size={16} />
          )
        )}
      </div>

      <div className={styles.content}>
        {!isUser && message.agentName && (
          <span className={styles.agentName}>{message.agentName}</span>
        )}

        <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}>
          {isUser ? (
            <p className={styles.userText}>{message.content}</p>
          ) : (
            <div className="prose">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  code(props: any) {
                    const { children, className } = props;
                    const match = /language-(\w+)/.exec(className ?? "");
                    const lang = match ? match[1] : undefined;
                    const isBlock = className?.includes("language-");

                    if (isBlock) {
                      return (
                        <CodeBlock
                          code={String(children).replace(/\n$/, "")}
                          language={lang}
                        />
                      );
                    }
                    return (
                      <code className={className}>{children}</code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
              {message.isStreaming && (
                <span className={styles.cursor} aria-hidden />
              )}
            </div>
          )}
        </div>

        <span className={styles.timestamp}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
});

MessageItem.displayName = "MessageItem";
export default MessageItem;
