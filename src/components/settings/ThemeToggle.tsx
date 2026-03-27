import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useSettingsStore } from "@/stores/settings-store";
import styles from "./ThemeToggle.module.css";

type Theme = "light" | "dark" | "system";

const OPTIONS: Array<{ value: Theme; icon: React.ReactNode; label: string }> = [
  { value: "light", icon: <Sun size={16} />, label: "Light" },
  { value: "dark", icon: <Moon size={16} />, label: "Dark" },
  { value: "system", icon: <Monitor size={16} />, label: "System" },
];

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useSettingsStore();

  return (
    <div className={styles.wrapper} role="group" aria-label="Theme selection">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          className={`${styles.option} ${theme === opt.value ? styles.active : ""}`}
          onClick={() => setTheme(opt.value)}
          aria-pressed={theme === opt.value}
          title={opt.label}
        >
          {opt.icon}
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
