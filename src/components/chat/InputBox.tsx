import React, { useRef, useState, useCallback } from "react";
import { Send, Paperclip, X, Mic } from "lucide-react";
import type { FileAttachment } from "@/types";
import styles from "./InputBox.module.css";

interface InputBoxProps {
  onSend: (content: string, attachments?: FileAttachment[]) => void | Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export const InputBox: React.FC<InputBoxProps> = ({
  onSend,
  disabled = false,
  placeholder = "Message Pantheon… (Enter to send, Shift+Enter for new line)",
}) => {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSend = (text.trim().length > 0 || attachments.length > 0) && !disabled;

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    autoResize();
  };

  const handleSend = useCallback(async () => {
    if (!canSend) return;
    const content = text.trim();
    setText("");
    setAttachments([]);
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    await onSend(content, attachments.length > 0 ? attachments : undefined);
  }, [canSend, text, attachments, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
    if (e.key === "Escape") {
      setText("");
      setAttachments([]);
    }
  };

  // File handling
  const processFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const att: FileAttachment = {
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          mimeType: file.type,
          data: (e.target?.result as string | undefined)?.split(",")[1],
        };
        setAttachments((prev) => [...prev, att]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFilePick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    e.target.value = ""; // reset so same file can be re-selected
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div
      className={`${styles.outer} ${isDragOver ? styles.dragOver : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className={styles.attachments}>
          {attachments.map((att) => (
            <div key={att.id} className={styles.attachment}>
              <Paperclip size={12} />
              <span className={styles.attachName}>{att.name}</span>
              <button
                className={styles.removeAtt}
                onClick={() => removeAttachment(att.id)}
                aria-label={`Remove ${att.name}`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={styles.row}>
        <button
          className={styles.actionBtn}
          onClick={handleFilePick}
          title="Attach file"
          aria-label="Attach file"
          disabled={disabled}
        >
          <Paperclip size={18} />
        </button>

        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          aria-label="Message input"
        />

        <button
          className={styles.actionBtn}
          title="Voice input (coming soon)"
          aria-label="Voice input"
          disabled
        >
          <Mic size={18} />
        </button>

        <button
          className={`${styles.sendBtn} ${canSend ? styles.sendActive : ""}`}
          onClick={() => void handleSend()}
          disabled={!canSend}
          title="Send message (Enter)"
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className={styles.hiddenInput}
        onChange={handleFileInputChange}
      />
    </div>
  );
};

export default InputBox;
