// ============================================================
// Core domain types for Pantheon UI
// ============================================================

// ----------------------------------------------------------
// Connection
// ----------------------------------------------------------
export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export interface ConnectionConfig {
  natsUrl: string;
  serviceId: string;
}

// ----------------------------------------------------------
// Chat
// ----------------------------------------------------------
export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  agentName?: string;
  agentIcon?: string;
  timestamp: number;
  isStreaming?: boolean;
  attachments?: FileAttachment[];
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  activeAgentId?: string;
  messageCount?: number;
}

export interface ChatMeta {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  activeAgentId?: string;
}

// ----------------------------------------------------------
// Agent / Team
// ----------------------------------------------------------
export interface Agent {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  type: string;
  capabilities?: string[];
  isActive?: boolean;
}

export interface TeamTemplate {
  id: string;
  name: string;
  description?: string;
  yaml: string;
  agents: string[];
}

// ----------------------------------------------------------
// Store items
// ----------------------------------------------------------
export type StoreItemType = "agent" | "team" | "skill" | "toolset";

export interface StoreItem {
  id: string;
  name: string;
  description?: string;
  type: StoreItemType;
  author?: string;
  version?: string;
  icon?: string;
  tags?: string[];
  isInstalled?: boolean;
  downloadCount?: number;
  rating?: number;
}

export interface StoreSearchParams {
  query?: string;
  type?: StoreItemType;
  page?: number;
  pageSize?: number;
}

export interface StoreSearchResult {
  items: StoreItem[];
  total: number;
  page: number;
  pageSize: number;
}

// ----------------------------------------------------------
// Toolsets
// ----------------------------------------------------------
export interface Toolset {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  tools?: string[];
}

// ----------------------------------------------------------
// Background tasks
// ----------------------------------------------------------
export type TaskStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface BackgroundTask {
  id: string;
  name: string;
  status: TaskStatus;
  progress?: number;
  createdAt: number;
  updatedAt: number;
  error?: string;
  result?: unknown;
}

// ----------------------------------------------------------
// Settings
// ----------------------------------------------------------
export interface ApiKeyStatus {
  provider: string;
  isSet: boolean;
  lastUpdated?: number;
}

export interface AppSettings {
  theme: "light" | "dark" | "system";
  language: string;
  fontSize: number;
  sendWithEnter: boolean;
  enableNotifications: boolean;
  autoConnect: boolean;
  natsUrl: string;
  serviceId: string;
}

// ----------------------------------------------------------
// Endpoint
// ----------------------------------------------------------
export interface Endpoint {
  url: string;
  type: string;
  status?: string;
}

// ----------------------------------------------------------
// Files
// ----------------------------------------------------------
export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  url?: string;
  data?: string; // base64
}

// ----------------------------------------------------------
// Gateway
// ----------------------------------------------------------
export type GatewayChannelType = "wechat" | "telegram" | "slack" | "webhook";

export interface GatewayChannel {
  id: string;
  type: GatewayChannelType;
  name: string;
  enabled: boolean;
  config?: Record<string, unknown>;
  status?: string;
}

export interface GatewaySession {
  id: string;
  channelId: string;
  userId: string;
  startedAt: number;
  lastActivity: number;
  messageCount: number;
}

// ----------------------------------------------------------
// RPC
// ----------------------------------------------------------
export interface RpcRequest {
  method: string;
  params: Record<string, unknown>;
  requestId?: string;
}

export interface RpcResponse<T = unknown> {
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
  requestId?: string;
}

// ----------------------------------------------------------
// Streaming
// ----------------------------------------------------------
export interface StreamChunk {
  chatId: string;
  content: string;
  agentName?: string;
  agentIcon?: string;
  done: boolean;
  error?: string;
}

// ----------------------------------------------------------
// Navigation
// ----------------------------------------------------------
export type NavSection = "chat" | "store" | "settings" | "tasks" | "team";
