import React, { useState } from "react";
import { Download, Trash2, Loader, Bot, Users, Zap, Package } from "lucide-react";
import { installStoreItem, uninstallStoreItem } from "@/services/chatroom-api";
import type { StoreItem } from "@/types";
import styles from "./StoreCard.module.css";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  agent: <Bot size={16} />,
  team: <Users size={16} />,
  skill: <Zap size={16} />,
  toolset: <Package size={16} />,
};

interface StoreCardProps {
  item: StoreItem;
  onInstallChange?: (itemId: string, installed: boolean) => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({ item, onInstallChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [installed, setInstalled] = useState(item.isInstalled ?? false);

  const handleAction = async () => {
    setIsLoading(true);
    try {
      if (installed) {
        await uninstallStoreItem(item.id);
        setInstalled(false);
        onInstallChange?.(item.id, false);
      } else {
        await installStoreItem(item.id);
        setInstalled(true);
        onInstallChange?.(item.id, true);
      }
    } catch (err) {
      console.error("Store action failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.iconRow}>
        <div className={styles.typeIcon}>{TYPE_ICONS[item.type] ?? <Package size={16} />}</div>
        <span className={styles.typeLabel}>{item.type}</span>
      </div>

      <h3 className={styles.name}>{item.name}</h3>

      {item.description && (
        <p className={styles.description}>{item.description}</p>
      )}

      {item.tags && item.tags.length > 0 && (
        <div className={styles.tags}>
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
      )}

      <div className={styles.footer}>
        {item.author && <span className={styles.author}>by {item.author}</span>}
        <button
          className={`${styles.actionBtn} ${installed ? styles.uninstallBtn : styles.installBtn}`}
          onClick={() => void handleAction()}
          disabled={isLoading}
          title={installed ? "Uninstall" : "Install"}
        >
          {isLoading ? (
            <Loader size={14} className="animate-spin" />
          ) : installed ? (
            <>
              <Trash2 size={14} />
              Uninstall
            </>
          ) : (
            <>
              <Download size={14} />
              Install
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StoreCard;
