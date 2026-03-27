import React, { useState, useEffect } from "react";
import { useAgentStore } from "@/stores/agent-store";
import type { TeamTemplate } from "@/types";
import styles from "./TemplateEditor.module.css";

interface TemplateEditorProps {
  templateId?: string;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ templateId }) => {
  const { loadTemplate } = useAgentStore();
  const [template, setTemplate] = useState<TeamTemplate | null>(null);
  const [yaml, setYaml] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!templateId) return;
    setIsLoading(true);
    loadTemplate(templateId)
      .then((t) => {
        setTemplate(t);
        setYaml(t.yaml);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [templateId, loadTemplate]);

  if (!templateId) {
    return (
      <div className={styles.placeholder}>
        Select a team template to view or edit its configuration.
      </div>
    );
  }

  if (isLoading) {
    return <div className={styles.placeholder}>Loading…</div>;
  }

  return (
    <div className={styles.container}>
      {template && (
        <div className={styles.header}>
          <h4 className={styles.title}>{template.name}</h4>
          {template.description && (
            <p className={styles.desc}>{template.description}</p>
          )}
        </div>
      )}
      <textarea
        className={styles.editor}
        value={yaml}
        onChange={(e) => setYaml(e.target.value)}
        spellCheck={false}
        aria-label="Template YAML editor"
      />
      <div className={styles.footer}>
        <span className={styles.hint}>YAML configuration (read-only in this version)</span>
      </div>
    </div>
  );
};

export default TemplateEditor;
