import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getServerSettings,
  updateServerSettings,
  getApiKeysStatus,
  updateApiKey,
} from "@/services/chatroom-api";
import type { AppSettings, ApiKeyStatus } from "@/types";
import { applyTheme } from "@/utils/theme";

interface SettingsState {
  theme: "light" | "dark" | "system";
  settings: AppSettings | null;
  apiKeyStatuses: ApiKeyStatus[];
  isLoading: boolean;

  // Actions
  setTheme: (theme: "light" | "dark" | "system") => void;
  loadSettings: () => Promise<void>;
  saveSettings: (partial: Partial<AppSettings>) => Promise<void>;
  loadApiKeyStatuses: () => Promise<void>;
  saveApiKey: (provider: string, key: string) => Promise<void>;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  language: "en",
  fontSize: 14,
  sendWithEnter: true,
  enableNotifications: true,
  autoConnect: false,
  natsUrl: "ws://localhost:4222",
  serviceId: "default",
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: "system",
      settings: DEFAULT_SETTINGS,
      apiKeyStatuses: [],
      isLoading: false,

      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },

      loadSettings: async () => {
        set({ isLoading: true });
        try {
          const settings = await getServerSettings();
          set({ settings, theme: settings.theme });
          applyTheme(settings.theme);
        } catch (err) {
          console.error("Failed to load settings:", err);
        } finally {
          set({ isLoading: false });
        }
      },

      saveSettings: async (partial: Partial<AppSettings>) => {
        const current = get().settings ?? DEFAULT_SETTINGS;
        const merged = { ...current, ...partial };
        await updateServerSettings(merged);
        set({ settings: merged });
        if (partial.theme) {
          set({ theme: partial.theme });
          applyTheme(partial.theme);
        }
      },

      loadApiKeyStatuses: async () => {
        try {
          const statuses = await getApiKeysStatus();
          set({ apiKeyStatuses: statuses });
        } catch (err) {
          console.error("Failed to load API key statuses:", err);
        }
      },

      saveApiKey: async (provider: string, key: string) => {
        await updateApiKey(provider, key);
        await get().loadApiKeyStatuses();
      },
    }),
    {
      name: "pantheon-settings",
      partialize: (state) => ({
        theme: state.theme,
      }),
    }
  )
);
