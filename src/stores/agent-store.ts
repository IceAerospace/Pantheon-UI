import { create } from "zustand";
import {
  getAgents,
  setActiveAgent,
  getActiveAgent,
  setupTeamForChat,
  listTeamTemplates,
  getTeamTemplate,
} from "@/services/chatroom-api";
import type { Agent, TeamTemplate } from "@/types";

interface AgentState {
  agents: Agent[];
  activeAgent: Agent | null;
  teamTemplates: TeamTemplate[];
  selectedTemplateId: string | null;
  isLoading: boolean;

  // Actions
  loadAgents: () => Promise<void>;
  loadActiveAgent: (chatId: string) => Promise<void>;
  switchAgent: (chatId: string, agentId: string) => Promise<void>;
  loadTeamTemplates: () => Promise<void>;
  loadTemplate: (templateId: string) => Promise<TeamTemplate>;
  applyTemplate: (chatId: string, templateId: string) => Promise<void>;
  setSelectedTemplateId: (id: string | null) => void;
}

export const useAgentStore = create<AgentState>()((set) => ({
  agents: [],
  activeAgent: null,
  teamTemplates: [],
  selectedTemplateId: null,
  isLoading: false,

  loadAgents: async () => {
    set({ isLoading: true });
    try {
      const agents = await getAgents();
      set({ agents });
    } catch (err) {
      console.error("Failed to load agents:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  loadActiveAgent: async (chatId: string) => {
    try {
      const agent = await getActiveAgent(chatId);
      set({ activeAgent: agent });
    } catch (err) {
      console.error("Failed to get active agent:", err);
    }
  },

  switchAgent: async (chatId: string, agentId: string) => {
    await setActiveAgent(chatId, agentId);
    set((state) => ({
      activeAgent: state.agents.find((a) => a.id === agentId) ?? state.activeAgent,
    }));
  },

  loadTeamTemplates: async () => {
    try {
      const templates = await listTeamTemplates();
      set({ teamTemplates: templates });
    } catch (err) {
      console.error("Failed to load team templates:", err);
    }
  },

  loadTemplate: async (templateId: string) => {
    const template = await getTeamTemplate(templateId);
    return template;
  },

  applyTemplate: async (chatId: string, templateId: string) => {
    await setupTeamForChat(chatId, templateId);
    set({ selectedTemplateId: templateId });
  },

  setSelectedTemplateId: (id) => set({ selectedTemplateId: id }),
}));
