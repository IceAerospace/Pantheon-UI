import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { useSettingsStore } from "@/stores/settings-store";
import styles from "./CodeBlock.module.css";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const { theme } = useSettingsStore();
  const [copied, setCopied] = useState(false);

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.lang}>{language ?? "plaintext"}</span>
        <button
          className={styles.copyBtn}
          onClick={() => void handleCopy()}
          title="Copy code"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check size={13} />
              Copied
            </>
          ) : (
            <>
              <Copy size={13} />
              Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language ?? "text"}
        style={isDark ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          borderRadius: "0 0 var(--radius-md) var(--radius-md)",
          fontSize: "13px",
          lineHeight: 1.6,
        }}
        showLineNumbers={code.split("\n").length > 5}
        wrapLongLines={false}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
