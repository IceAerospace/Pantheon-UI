import React, { useEffect } from "react";
import { Bot, Loader } from "lucide-react";
import { useAgentStore } from "@/stores/agent-store";
import { useChatStore } from "@/stores/chat-store";
import styles from "./AgentPanel.module.css";

export const AgentPanel: React.FC = () => {
  const { agents, activeAgent, isLoading, loadAgents, switchAgent } =
    useAgentStore();
  const { activeChatId } = useChatStore();

  useEffect(() => {
    void loadAgents();
  }, [loadAgents]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Loader size={18} className="animate-spin" />
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className={styles.empty}>
        <Bot size={26} className={styles.emptyIcon} />
        <p>No agents available</p>
      </div>
    );
  }

  return (
    <ul className={styles.list} role="list">
      {agents.map((agent) => (
        <li key={agent.id}>
          <button
            className={`${styles.agentItem} ${activeAgent?.id === agent.id ? styles.active : ""}`}
            onClick={() => {
              if (activeChatId) {
                void switchAgent(activeChatId, agent.id);
              }
            }}
            title={agent.description ?? agent.name}
          >
            <div className={styles.agentAvatar}>
              {agent.icon ? (
                <img src={agent.icon} alt={agent.name} className={styles.avatarImg} />
              ) : (
                <Bot size={16} />
              )}
            </div>
            <div className={styles.agentInfo}>
              <span className={styles.agentName}>{agent.name}</span>
              {agent.type && (
                <span className={styles.agentType}>{agent.type}</span>
              )}
            </div>
            {activeAgent?.id === agent.id && (
              <span className={styles.activeDot} aria-label="Active" />
            )}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default AgentPanel;
