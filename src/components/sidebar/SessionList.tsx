import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, MoreVertical, Pencil, Trash2, Check, X } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import styles from "./SessionList.module.css";

export const SessionList: React.FC = () => {
  const { sessions, activeChatId, selectSession, renameSession, deleteSession } =
    useChat();

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const editInputRef = useRef<HTMLInputElement | null>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Focus input when editing starts
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const startEdit = (id: string, currentTitle: string) => {
    setMenuOpenId(null);
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const confirmEdit = async () => {
    if (editingId && editTitle.trim()) {
      await renameSession(editingId, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    setMenuOpenId(null);
    await deleteSession(id);
  };

  if (sessions.length === 0) {
    return (
      <div className={styles.empty}>
        <MessageSquare size={28} className={styles.emptyIcon} />
        <p>No conversations yet</p>
        <p className={styles.emptyHint}>Start a new chat above</p>
      </div>
    );
  }

  return (
    <ul className={styles.list} role="list">
      {sessions.map((session) => (
        <li
          key={session.id}
          className={`${styles.item} ${activeChatId === session.id ? styles.active : ""}`}
        >
          {editingId === session.id ? (
            <div className={styles.editRow}>
              <input
                ref={editInputRef}
                className={styles.editInput}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void confirmEdit();
                  if (e.key === "Escape") cancelEdit();
                }}
              />
              <button
                className={styles.iconBtn}
                onClick={() => void confirmEdit()}
                aria-label="Confirm rename"
              >
                <Check size={14} />
              </button>
              <button
                className={styles.iconBtn}
                onClick={cancelEdit}
                aria-label="Cancel rename"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              className={styles.sessionBtn}
              onClick={() => void selectSession(session.id)}
              title={session.title}
            >
              <MessageSquare size={15} className={styles.sessionIcon} />
              <span className={styles.sessionTitle}>{session.title}</span>
            </button>
          )}

          {editingId !== session.id && (
            <div className={styles.menuWrapper} ref={menuOpenId === session.id ? menuRef : null}>
              <button
                className={styles.menuTrigger}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(
                    menuOpenId === session.id ? null : session.id
                  );
                }}
                aria-label="Session options"
              >
                <MoreVertical size={14} />
              </button>

              {menuOpenId === session.id && (
                <div className={styles.menu} role="menu">
                  <button
                    className={styles.menuItem}
                    role="menuitem"
                    onClick={() => startEdit(session.id, session.title)}
                  >
                    <Pencil size={13} />
                    Rename
                  </button>
                  <button
                    className={`${styles.menuItem} ${styles.menuItemDanger}`}
                    role="menuitem"
                    onClick={() => void handleDelete(session.id)}
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

export default SessionList;
