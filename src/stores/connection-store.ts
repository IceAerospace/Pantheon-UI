import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  natsConnect,
  natsDisconnect,
  onConnectionChange,
} from "@/services/nats-client";
import type { ConnectionStatus } from "@/types";

interface ConnectionState {
  status: ConnectionStatus;
  natsUrl: string;
  serviceId: string;
  error?: string;
  isDialogOpen: boolean;

  // Actions
  setNatsUrl: (url: string) => void;
  setServiceId: (id: string) => void;
  connect: (url?: string, serviceId?: string) => Promise<void>;
  disconnect: () => Promise<void>;
  openDialog: () => void;
  closeDialog: () => void;
}

export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set, get) => {
      // Subscribe to NATS connection status changes
      onConnectionChange((status, error) => {
        set({ status, error });
      });

      return {
        status: "disconnected",
        natsUrl: "ws://localhost:4222",
        serviceId: "default",
        isDialogOpen: false,

        setNatsUrl: (url) => set({ natsUrl: url }),
        setServiceId: (id) => set({ serviceId: id }),

        connect: async (url?: string, serviceId?: string) => {
          const resolvedUrl = url ?? get().natsUrl;
          const resolvedId = serviceId ?? get().serviceId;

          if (url) set({ natsUrl: url });
          if (serviceId) set({ serviceId: serviceId });

          set({ error: undefined });
          await natsConnect(resolvedUrl, resolvedId);
          set({ isDialogOpen: false });
        },

        disconnect: async () => {
          await natsDisconnect();
        },

        openDialog: () => set({ isDialogOpen: true }),
        closeDialog: () => set({ isDialogOpen: false }),
      };
    },
    {
      name: "pantheon-connection",
      partialize: (state) => ({
        natsUrl: state.natsUrl,
        serviceId: state.serviceId,
      }),
    }
  )
);
