import React, { useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { ApiKeysPanel } from "./ApiKeysPanel";
import { useConnectionStore } from "@/stores/connection-store";
import { useSettingsStore } from "@/stores/settings-store";
import styles from "./SettingsView.module.css";

export const SettingsView: React.FC = () => {
  const { natsUrl, serviceId, status } = useConnectionStore();
  const { loadSettings, loadApiKeyStatuses } = useSettingsStore();

  useEffect(() => {
    if (status === "connected") {
      void loadSettings();
      void loadApiKeyStatuses();
    }
  }, [status, loadSettings, loadApiKeyStatuses]);

  return (
    <div className={styles.container}>
      <div className={styles.page}>
        <h2 className={styles.pageTitle}>Settings</h2>

        {/* Appearance */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Appearance</h3>
          <ThemeToggle />
        </section>

        {/* API Keys */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>API Keys</h3>
          <ApiKeysPanel />
        </section>

        {/* Connection info */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Connection</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Status</span>
              <span className={`${styles.infoValue} ${styles[status]}`}>
                {status}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>NATS URL</span>
              <span className={styles.infoValue}>{natsUrl}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Service ID</span>
              <span className={styles.infoValue}>{serviceId}</span>
            </div>
          </div>
        </section>

        {/* About */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>About</h3>
          <div className={styles.aboutCard}>
            <p className={styles.appName}>Pantheon UI</p>
            <p className={styles.appDesc}>
              Desktop client for <strong>PantheonOS</strong> multi-agent framework.
            </p>
            <p className={styles.version}>Version 0.1.0</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsView;
