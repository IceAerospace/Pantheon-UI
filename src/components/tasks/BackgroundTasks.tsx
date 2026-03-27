import React, { useEffect, useState } from "react";
import { RefreshCw, X, Loader, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import {
  listBackgroundTasks,
  cancelBackgroundTask,
  removeBackgroundTask,
} from "@/services/chatroom-api";
import type { BackgroundTask, TaskStatus } from "@/types";
import styles from "./BackgroundTasks.module.css";

const STATUS_ICONS: Record<TaskStatus, React.ReactNode> = {
  pending: <Clock size={14} />,
  running: <Loader size={14} className="animate-spin" />,
  completed: <CheckCircle size={14} />,
  failed: <XCircle size={14} />,
  cancelled: <AlertCircle size={14} />,
};

export const BackgroundTasks: React.FC = () => {
  const [tasks, setTasks] = useState<BackgroundTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listBackgroundTasks();
      setTasks(result);
    } catch (err) {
      setError("Failed to load tasks. Make sure you are connected.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTasks();
  }, []);

  const handleCancel = async (taskId: string) => {
    try {
      await cancelBackgroundTask(taskId);
      await loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (taskId: string) => {
    try {
      await removeBackgroundTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Background Tasks</h2>
        <button
          className={styles.refreshBtn}
          onClick={() => void loadTasks()}
          disabled={isLoading}
          title="Refresh tasks"
          aria-label="Refresh task list"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <div className={styles.errorBanner} role="alert">{error}</div>
      )}

      {tasks.length === 0 ? (
        <div className={styles.empty}>
          <Clock size={32} className={styles.emptyIcon} />
          <p>No background tasks</p>
        </div>
      ) : (
        <ul className={styles.list} role="list">
          {tasks.map((task) => (
            <li key={task.id} className={`${styles.taskItem} ${styles[`status_${task.status}`]}`}>
              <div className={styles.taskIcon} aria-label={task.status}>
                {STATUS_ICONS[task.status]}
              </div>

              <div className={styles.taskInfo}>
                <span className={styles.taskName}>{task.name}</span>
                <span className={styles.taskStatus}>{task.status}</span>
                {task.progress !== undefined && task.status === "running" && (
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                )}
                {task.error && (
                  <span className={styles.taskError}>{task.error}</span>
                )}
              </div>

              <div className={styles.taskActions}>
                {task.status === "running" && (
                  <button
                    className={styles.cancelBtn}
                    onClick={() => void handleCancel(task.id)}
                    title="Cancel task"
                    aria-label="Cancel task"
                  >
                    <X size={13} />
                  </button>
                )}
                {(task.status === "completed" ||
                  task.status === "failed" ||
                  task.status === "cancelled") && (
                  <button
                    className={styles.removeBtn}
                    onClick={() => void handleRemove(task.id)}
                    title="Remove task"
                    aria-label="Remove task from list"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BackgroundTasks;
