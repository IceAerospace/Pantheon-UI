import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ChatView } from "@/components/chat/ChatView";
import { StoreView } from "@/components/store/StoreView";
import { SettingsView } from "@/components/settings/SettingsView";
import { BackgroundTasks } from "@/components/tasks/BackgroundTasks";
import { ConnectionDialog } from "@/components/connection/ConnectionDialog";
import { StatusBar } from "@/components/connection/StatusBar";
import { TeamSelector } from "@/components/team/TeamSelector";
import { TemplateEditor } from "@/components/team/TemplateEditor";
import { useConnectionStore } from "@/stores/connection-store";
import { useAgentStore } from "@/stores/agent-store";
import type { NavSection } from "@/types";
import styles from "./AppLayout.module.css";

export const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<NavSection>("chat");
  const { status, openDialog } = useConnectionStore();
  const { selectedTemplateId } = useAgentStore();

  // Show connection dialog on startup if not connected
  useEffect(() => {
    if (status === "disconnected") {
      openDialog();
    }
  // only on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === "n") {
        e.preventDefault();
        setActiveSection("chat");
        // newChat() is handled inside ChatView / Sidebar
      }
    },
    []
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const renderMain = () => {
    switch (activeSection) {
      case "chat":
        return <ChatView />;
      case "store":
        return <StoreView />;
      case "settings":
        return <SettingsView />;
      case "tasks":
        return <BackgroundTasks />;
      case "team":
        return (
          <div className={styles.teamPanel}>
            <div className={styles.teamLeft}>
              <h2 className={styles.teamTitle}>Team Configuration</h2>
              <TeamSelector />
            </div>
            <div className={styles.teamRight}>
              <TemplateEditor templateId={selectedTemplateId ?? undefined} />
            </div>
          </div>
        );
      default:
        return <ChatView />;
    }
  };

  return (
    <div className={styles.root}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <main className={styles.main}>
        <div className={styles.content}>{renderMain()}</div>
        <StatusBar />
      </main>

      <ConnectionDialog />
    </div>
  );
};

export default AppLayout;
