import { useEffect, useCallback } from "react";
import { useConnectionStore } from "@/stores/connection-store";
import { isConnected, callTool } from "@/services/nats-client";

export function useNats() {
  const { status, natsUrl, serviceId, connect, disconnect, error } =
    useConnectionStore();

  useEffect(() => {
    // Nothing to do here — connection is managed by the store
  }, []);

  const call = useCallback(
    async <T>(method: string, params: Record<string, unknown> = {}): Promise<T> => {
      if (!isConnected()) {
        throw new Error("Not connected to NATS");
      }
      return callTool<T>(method, params);
    },
    []
  );

  return {
    status,
    isConnected: status === "connected",
    isConnecting: status === "connecting",
    natsUrl,
    serviceId,
    error,
    connect,
    disconnect,
    call,
  };
}
