import React from "react";
import { Wifi, WifiOff, Loader, AlertCircle } from "lucide-react";
import { useConnectionStore } from "@/stores/connection-store";
import styles from "./StatusBar.module.css";

const STATUS_CONFIG = {
  connected: {
    icon: <Wifi size={12} />,
    label: "Connected",
    className: styles.connected,
  },
  connecting: {
    icon: <Loader size={12} className="animate-spin" />,
    label: "Connecting…",
    className: styles.connecting,
  },
  disconnected: {
    icon: <WifiOff size={12} />,
    label: "Disconnected",
    className: styles.disconnected,
  },
  error: {
    icon: <AlertCircle size={12} />,
    label: "Connection error",
    className: styles.error,
  },
};

export const StatusBar: React.FC = () => {
  const { status, natsUrl, serviceId, openDialog } = useConnectionStore();
  const config = STATUS_CONFIG[status];

  return (
    <div className={styles.bar}>
      <button
        className={`${styles.statusChip} ${config.className}`}
        onClick={openDialog}
        title={`${config.label} — click to manage connection`}
      >
        {config.icon}
        <span>{config.label}</span>
      </button>

      {status === "connected" && (
        <span className={styles.serverInfo} title={natsUrl}>
          {natsUrl} · {serviceId}
        </span>
      )}
    </div>
  );
};

export default StatusBar;
