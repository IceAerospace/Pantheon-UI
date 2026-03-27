/**
 * ChatRoom API — complete mapping of all @tool methods exposed by
 * `pantheon/chatroom/room.py` via Magique RPC over NATS.
 */

import { callTool } from "./nats-client";
import type {
  ChatSession,
  ChatMessage,
  ChatMeta,
  Agent,
  TeamTemplate,
  Endpoint,
  Toolset,
  StoreItem,
  StoreSearchParams,
  StoreSearchResult,
  BackgroundTask,
  AppSettings,
  ApiKeyStatus,
  GatewayChannel,
  GatewaySession,
  FileAttachment,
} from "@/types";

// ----------------------------------------------------------
// Session management
// ----------------------------------------------------------

/** Create a new chat session. */
export async function createChat(title?: string): Promise<ChatSession> {
  return callTool("create_chat", { title: title ?? "New Chat" });
}

/** List all chat sessions. */
export async function listChats(): Promise<ChatSession[]> {
  return callTool("list_chats", {});
}

/** Retrieve all messages for a given chat. */
export async function getChatMessages(chatId: string): Promise<ChatMessage[]> {
  return callTool("get_chat_messages", { chat_id: chatId });
}

/** Rename a chat session. */
export async function renameChat(
  chatId: string,
  title: string
): Promise<void> {
  return callTool("rename_chat", { chat_id: chatId, title });
}

/** Delete a chat session. */
export async function deleteChat(chatId: string): Promise<void> {
  return callTool("delete_chat", { chat_id: chatId });
}

/** Get metadata for a single chat session. */
export async function getChatMeta(chatId: string): Promise<ChatMeta> {
  return callTool("get_chat_meta", { chat_id: chatId });
}

// ----------------------------------------------------------
// Core chat
// ----------------------------------------------------------

export interface ChatParams {
  chatId: string;
  message: string;
  attachments?: FileAttachment[];
  stream?: boolean;
}

/**
 * Send a chat message.
 * When stream=true, the backend will publish chunks to
 * `pantheon.stream.{chatId}` — subscribe with subscribeStream().
 */
export async function chat(params: ChatParams): Promise<ChatMessage | void> {
  return callTool("chat", {
    chat_id: params.chatId,
    message: params.message,
    attachments: params.attachments ?? [],
    stream: params.stream ?? true,
  });
}

// ----------------------------------------------------------
// Agent / Team
// ----------------------------------------------------------

/** List all available agents. */
export async function getAgents(): Promise<Agent[]> {
  return callTool("get_agents", {});
}

/** Set the active agent for a chat session. */
export async function setActiveAgent(
  chatId: string,
  agentId: string
): Promise<void> {
  return callTool("set_active_agent", { chat_id: chatId, agent_id: agentId });
}

/** Get the active agent for a chat session. */
export async function getActiveAgent(chatId: string): Promise<Agent> {
  return callTool("get_active_agent", { chat_id: chatId });
}

/** Set up a team configuration for a chat session. */
export async function setupTeamForChat(
  chatId: string,
  templateId: string
): Promise<void> {
  return callTool("setup_team_for_chat", {
    chat_id: chatId,
    template_id: templateId,
  });
}

/** List all team templates. */
export async function listTeamTemplates(): Promise<TeamTemplate[]> {
  return callTool("list_team_templates", {});
}

/** Get a specific team template. */
export async function getTeamTemplate(
  templateId: string
): Promise<TeamTemplate> {
  return callTool("get_team_template", { template_id: templateId });
}

// ----------------------------------------------------------
// Endpoint
// ----------------------------------------------------------

/** Get the current endpoint configuration. */
export async function getEndpoint(): Promise<Endpoint> {
  return callTool("get_endpoint", {});
}

/** Update the endpoint configuration. */
export async function setEndpoint(endpoint: Partial<Endpoint>): Promise<void> {
  return callTool("set_endpoint", { endpoint });
}

// ----------------------------------------------------------
// Toolsets
// ----------------------------------------------------------

/** List all available toolsets. */
export async function getToolsets(): Promise<Toolset[]> {
  return callTool("get_toolsets", {});
}

/** Proxy a toolset action. */
export async function proxyToolset(
  toolsetId: string,
  action: string,
  params?: Record<string, unknown>
): Promise<unknown> {
  return callTool("proxy_toolset", {
    toolset_id: toolsetId,
    action,
    params: params ?? {},
  });
}

// ----------------------------------------------------------
// Store
// ----------------------------------------------------------

/** Search the Pantheon Store. */
export async function searchStore(
  params: StoreSearchParams
): Promise<StoreSearchResult> {
  return callTool("search_store", {
    query: params.query ?? "",
    type: params.type,
    page: params.page ?? 1,
    page_size: params.pageSize ?? 20,
  });
}

/** Install a store item. */
export async function installStoreItem(itemId: string): Promise<void> {
  return callTool("install_store_item", { item_id: itemId });
}

/** Uninstall a store item. */
export async function uninstallStoreItem(itemId: string): Promise<void> {
  return callTool("uninstall_store_item", { item_id: itemId });
}

/** List all installed store items. */
export async function listInstalledStoreItems(): Promise<StoreItem[]> {
  return callTool("list_installed_store_items", {});
}

// ----------------------------------------------------------
// Background tasks
// ----------------------------------------------------------

/** List all background tasks. */
export async function listBackgroundTasks(): Promise<BackgroundTask[]> {
  return callTool("list_background_tasks", {});
}

/** Get details for a specific task. */
export async function getBackgroundTaskDetail(
  taskId: string
): Promise<BackgroundTask> {
  return callTool("get_background_task_detail", { task_id: taskId });
}

/** Cancel a running task. */
export async function cancelBackgroundTask(taskId: string): Promise<void> {
  return callTool("cancel_background_task", { task_id: taskId });
}

/** Remove a completed/cancelled task from the list. */
export async function removeBackgroundTask(taskId: string): Promise<void> {
  return callTool("remove_background_task", { task_id: taskId });
}

// ----------------------------------------------------------
// Settings
// ----------------------------------------------------------

/** Get current application settings from the server. */
export async function getServerSettings(): Promise<AppSettings> {
  return callTool("get_settings", {});
}

/** Update application settings on the server. */
export async function updateServerSettings(
  settings: Partial<AppSettings>
): Promise<void> {
  return callTool("update_settings", { settings });
}

/** Get API key status for all providers. */
export async function getApiKeysStatus(): Promise<ApiKeyStatus[]> {
  return callTool("get_api_keys_status", {});
}

/** Update an API key for a specific provider. */
export async function updateApiKey(
  provider: string,
  apiKey: string
): Promise<void> {
  return callTool("update_api_key", { provider, api_key: apiKey });
}

// ----------------------------------------------------------
// Voice
// ----------------------------------------------------------

/** Transcribe an audio file. */
export async function transcribeAudio(
  audioData: string,
  mimeType?: string
): Promise<string> {
  return callTool("transcribe_audio", {
    audio_data: audioData,
    mime_type: mimeType ?? "audio/webm",
  });
}

// ----------------------------------------------------------
// Gateway channels
// ----------------------------------------------------------

/** Get configuration for a gateway channel. */
export async function getGatewayChannelConfig(
  channelId: string
): Promise<Record<string, unknown>> {
  return callTool("get_gateway_channel_config", { channel_id: channelId });
}

/** Save configuration for a gateway channel. */
export async function saveGatewayChannelConfig(
  channelId: string,
  config: Record<string, unknown>
): Promise<void> {
  return callTool("save_gateway_channel_config", { channel_id: channelId, config });
}

/** List all configured gateway channels. */
export async function listGatewayChannels(): Promise<GatewayChannel[]> {
  return callTool("list_gateway_channels", {});
}

/** Start a gateway channel. */
export async function startGatewayChannel(channelId: string): Promise<void> {
  return callTool("start_gateway_channel", { channel_id: channelId });
}

/** Stop a gateway channel. */
export async function stopGatewayChannel(channelId: string): Promise<void> {
  return callTool("stop_gateway_channel", { channel_id: channelId });
}

/** Get WeChat login QR code data. */
export async function wechatLoginQr(): Promise<{ qrData: string }> {
  return callTool("wechat_login_qr", {});
}

/** Poll WeChat login status. */
export async function wechatLoginStatus(): Promise<{
  status: "pending" | "confirmed" | "expired";
  userId?: string;
}> {
  return callTool("wechat_login_status", {});
}

/** List gateway sessions. */
export async function listGatewaySessions(
  channelId?: string
): Promise<GatewaySession[]> {
  return callTool("list_gateway_sessions", { channel_id: channelId });
}
