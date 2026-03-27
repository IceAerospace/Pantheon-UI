import React, { useState } from "react";
import { Wifi, WifiOff, X, Loader } from "lucide-react";
import { useConnectionStore } from "@/stores/connection-store";
import styles from "./ConnectionDialog.module.css";

export const ConnectionDialog: React.FC = () => {
  const { natsUrl, serviceId, isDialogOpen, status, connect, closeDialog } =
    useConnectionStore();

  const [url, setUrl] = useState(natsUrl);
  const [svcId, setSvcId] = useState(serviceId);
  const [error, setError] = useState<string | null>(null);

  if (!isDialogOpen) return null;

  const handleConnect = async () => {
    setError(null);
    try {
      await connect(url.trim(), svcId.trim());
    } catch (err) {
      setError(String(err));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      void handleConnect();
    }
    if (e.key === "Escape") {
      closeDialog();
    }
  };

  const isConnecting = status === "connecting";

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="connection-dialog-title"
    >
      <div className={styles.dialog} onKeyDown={handleKeyDown}>
        <header className={styles.header}>
          <div className={styles.titleRow}>
            <Wifi size={20} />
            <h2 id="connection-dialog-title" className={styles.title}>
              Connect to PantheonOS
            </h2>
          </div>
          <button
            className={styles.closeBtn}
            onClick={closeDialog}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </header>

        <div className={styles.body}>
          <p className={styles.description}>
            Enter the NATS WebSocket server address and ChatRoom Service ID to
            connect.
          </p>

          <label className={styles.fieldLabel} htmlFor="nats-url">
            NATS WebSocket URL
          </label>
          <input
            id="nats-url"
            className={styles.input}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="ws://localhost:4222"
            disabled={isConnecting}
          />

          <label className={styles.fieldLabel} htmlFor="service-id">
            Service ID
          </label>
          <input
            id="service-id"
            className={styles.input}
            type="text"
            value={svcId}
            onChange={(e) => setSvcId(e.target.value)}
            placeholder="default"
            disabled={isConnecting}
          />

          {error && (
            <div className={styles.errorBox} role="alert">
              <WifiOff size={14} />
              <span>{error}</span>
            </div>
          )}
        </div>

        <footer className={styles.footer}>
          <button className={styles.cancelBtn} onClick={closeDialog}>
            Cancel
          </button>
          <button
            className={styles.connectBtn}
            onClick={() => void handleConnect()}
            disabled={isConnecting || !url.trim() || !svcId.trim()}
          >
            {isConnecting ? (
              <>
                <Loader size={15} className="animate-spin" />
                Connecting…
              </>
            ) : (
              <>
                <Wifi size={15} />
                Connect
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ConnectionDialog;
