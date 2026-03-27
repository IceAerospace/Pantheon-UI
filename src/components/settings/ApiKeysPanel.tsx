import React, { useState, useEffect } from "react";
import { Key, Eye, EyeOff, Check, Loader } from "lucide-react";
import { useSettingsStore } from "@/stores/settings-store";
import styles from "./ApiKeysPanel.module.css";

const PROVIDERS = [
  { id: "openai", label: "OpenAI", placeholder: "sk-..." },
  { id: "anthropic", label: "Anthropic", placeholder: "sk-ant-..." },
  { id: "gemini", label: "Google Gemini", placeholder: "AIza..." },
  { id: "cohere", label: "Cohere", placeholder: "co-..." },
  { id: "groq", label: "Groq", placeholder: "gsk_..." },
];

export const ApiKeysPanel: React.FC = () => {
  const { apiKeyStatuses, saveApiKey, loadApiKeyStatuses } = useSettingsStore();
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    void loadApiKeyStatuses();
  }, [loadApiKeyStatuses]);

  const getStatus = (providerId: string) =>
    apiKeyStatuses.find((s) => s.provider === providerId);

  const handleSave = async (providerId: string) => {
    const key = inputs[providerId];
    if (!key?.trim()) return;

    setSaving((prev) => ({ ...prev, [providerId]: true }));
    try {
      await saveApiKey(providerId, key.trim());
      setInputs((prev) => ({ ...prev, [providerId]: "" }));
      setSaved((prev) => ({ ...prev, [providerId]: true }));
      setTimeout(
        () => setSaved((prev) => ({ ...prev, [providerId]: false })),
        2000
      );
    } finally {
      setSaving((prev) => ({ ...prev, [providerId]: false }));
    }
  };

  return (
    <div className={styles.container}>
      {PROVIDERS.map((provider) => {
        const status = getStatus(provider.id);
        const isSaving = saving[provider.id] ?? false;
        const isSaved = saved[provider.id] ?? false;
        const isVisible = visible[provider.id] ?? false;
        const inputVal = inputs[provider.id] ?? "";

        return (
          <div key={provider.id} className={styles.providerRow}>
            <div className={styles.providerHeader}>
              <Key size={14} className={styles.keyIcon} />
              <span className={styles.providerLabel}>{provider.label}</span>
              {status?.isSet && (
                <span className={styles.setbadge}>
                  <Check size={11} /> Set
                </span>
              )}
            </div>

            <div className={styles.inputRow}>
              <div className={styles.inputWrapper}>
                <input
                  type={isVisible ? "text" : "password"}
                  className={styles.input}
                  value={inputVal}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      [provider.id]: e.target.value,
                    }))
                  }
                  placeholder={
                    status?.isSet
                      ? "••••••••••••••••• (already set)"
                      : provider.placeholder
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleSave(provider.id);
                  }}
                />
                <button
                  className={styles.visibleToggle}
                  onClick={() =>
                    setVisible((prev) => ({
                      ...prev,
                      [provider.id]: !isVisible,
                    }))
                  }
                  aria-label={isVisible ? "Hide key" : "Show key"}
                >
                  {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              <button
                className={styles.saveBtn}
                onClick={() => void handleSave(provider.id)}
                disabled={isSaving || !inputVal.trim()}
              >
                {isSaving ? (
                  <Loader size={14} className="animate-spin" />
                ) : isSaved ? (
                  <>
                    <Check size={14} /> Saved
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ApiKeysPanel;
