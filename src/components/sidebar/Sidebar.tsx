import React from "react";
import {
  MessageSquare,
  Store,
  Settings,
  ListTodo,
  Users,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { SessionList } from "./SessionList";
import { AgentPanel } from "./AgentPanel";
import { useChat } from "@/hooks/useChat";
import type { NavSection } from "@/types";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
  activeSection: NavSection;
  onSectionChange: (section: NavSection) => void;
}

const NAV_ITEMS: Array<{ id: NavSection; icon: React.ReactNode; label: string }> = [
  { id: "chat", icon: <MessageSquare size={20} />, label: "Chats" },
  { id: "store", icon: <Store size={20} />, label: "Store" },
  { id: "team", icon: <Users size={20} />, label: "Team" },
  { id: "tasks", icon: <ListTodo size={20} />, label: "Tasks" },
  { id: "settings", icon: <Settings size={20} />, label: "Settings" },
];

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onCollapse,
  activeSection,
  onSectionChange,
}) => {
  const { newChat } = useChat();

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}
      aria-label="Sidebar"
    >
      {/* Top nav icons */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${activeSection === item.id ? styles.navActive : ""}`}
            onClick={() => onSectionChange(item.id)}
            title={item.label}
            aria-label={item.label}
            aria-current={activeSection === item.id ? "page" : undefined}
          >
            {item.icon}
            {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Section content */}
      {!collapsed && (
        <div className={styles.content}>
          {activeSection === "chat" && (
            <>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Conversations</span>
                <button
                  className={styles.newChatBtn}
                  onClick={() => void newChat()}
                  title="New Chat (Ctrl+N)"
                  aria-label="New Chat"
                >
                  <Plus size={16} />
                </button>
              </div>
              <SessionList />
            </>
          )}

          {activeSection === "team" && (
            <>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Agents</span>
              </div>
              <AgentPanel />
            </>
          )}
        </div>
      )}

      {/* Collapse toggle */}
      <button
        className={styles.collapseBtn}
        onClick={() => onCollapse(!collapsed)}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
};

export default Sidebar;
