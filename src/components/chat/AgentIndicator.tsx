import React from "react";
import { Bot } from "lucide-react";
import { useAgentStore } from "@/stores/agent-store";
import styles from "./AgentIndicator.module.css";

export const AgentIndicator: React.FC = () => {
  const { activeAgent } = useAgentStore();

  return (
    <div className={styles.container}>
      <div className={styles.avatar}>
        {activeAgent?.icon ? (
          <img src={activeAgent.icon} alt={activeAgent.name} className={styles.avatarImg} />
        ) : (
          <Bot size={14} />
        )}
      </div>
      <span className={styles.name}>
        {activeAgent?.name ?? "Agent"} is typing
      </span>
      <span className={styles.dots} aria-hidden>
        <span className="loading-dots">
          <span>·</span>
          <span>·</span>
          <span>·</span>
        </span>
      </span>
    </div>
  );
};

export default AgentIndicator;
