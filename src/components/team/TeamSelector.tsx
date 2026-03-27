import React, { useEffect, useState } from "react";
import { ChevronDown, Users, Loader } from "lucide-react";
import { useAgentStore } from "@/stores/agent-store";
import { useChatStore } from "@/stores/chat-store";
import type { TeamTemplate } from "@/types";
import styles from "./TeamSelector.module.css";

export const TeamSelector: React.FC = () => {
  const {
    teamTemplates,
    selectedTemplateId,
    isLoading,
    loadTeamTemplates,
    applyTemplate,
  } = useAgentStore();
  const { activeChatId } = useChatStore();
  const [isOpen, setIsOpen] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    void loadTeamTemplates();
  }, [loadTeamTemplates]);

  const selectedTemplate = teamTemplates.find(
    (t) => t.id === selectedTemplateId
  );

  const handleSelect = async (template: TeamTemplate) => {
    setIsOpen(false);
    if (!activeChatId) return;
    setApplying(true);
    try {
      await applyTemplate(activeChatId, template.id);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={isLoading || applying}
      >
        <Users size={15} />
        <span className={styles.selectedLabel}>
          {applying
            ? "Applying…"
            : selectedTemplate?.name ?? "Select Team Template"}
        </span>
        {(isLoading || applying) ? (
          <Loader size={14} className="animate-spin" />
        ) : (
          <ChevronDown size={14} className={isOpen ? styles.iconOpen : ""} />
        )}
      </button>

      {isOpen && !isLoading && (
        <ul className={styles.dropdown} role="listbox">
          {teamTemplates.length === 0 ? (
            <li className={styles.emptyOption}>No templates available</li>
          ) : (
            teamTemplates.map((tmpl) => (
              <li key={tmpl.id} role="option" aria-selected={tmpl.id === selectedTemplateId}>
                <button
                  className={`${styles.option} ${tmpl.id === selectedTemplateId ? styles.optionActive : ""}`}
                  onClick={() => void handleSelect(tmpl)}
                >
                  <Users size={13} />
                  <span>{tmpl.name}</span>
                  {tmpl.description && (
                    <span className={styles.optionDesc}>{tmpl.description}</span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default TeamSelector;
