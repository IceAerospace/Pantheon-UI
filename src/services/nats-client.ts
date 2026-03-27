/**
 * NATS WebSocket client for PantheonOS ChatRoom communication.
 *
 * Wraps nats.ws to provide:
 *   - connect / disconnect
 *   - RPC calls via Magique protocol
 *   - Streaming subscription for chat responses
 *   - Automatic reconnection
 */

import {
  connect,
  NatsConnection,
  Subscription,
  JSONCodec,
  NatsError,
} from "nats.ws";
import type { RpcRequest, RpcResponse, StreamChunk } from "@/types";

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

type StatusCallback = (status: ConnectionStatus, error?: string) => void;

const jc = JSONCodec();

let _connection: NatsConnection | null = null;
let _serviceId = "default";
let _statusCallbacks: StatusCallback[] = [];
let _reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let _currentStatus: ConnectionStatus = "disconnected";
let _streamSubscriptions: Map<string, Subscription> = new Map();

function _notifyStatus(status: ConnectionStatus, error?: string) {
  _currentStatus = status;
  _statusCallbacks.forEach((cb) => cb(status, error));
}

function _clearReconnect() {
  if (_reconnectTimer) {
    clearTimeout(_reconnectTimer);
    _reconnectTimer = null;
  }
}

/**
 * Connect to the NATS server.
 * @param url  WebSocket URL, e.g. "ws://localhost:4222"
 * @param serviceId  ChatRoom service identifier
 */
export async function natsConnect(
  url: string,
  serviceId: string
): Promise<void> {
  _clearReconnect();

  if (_connection) {
    await natsDisconnect();
  }

  _serviceId = serviceId;
  _notifyStatus("connecting");

  try {
    _connection = await connect({
      servers: url,
      reconnect: true,
      maxReconnectAttempts: -1,
      reconnectTimeWait: 2000,
    });

    _notifyStatus("connected");

    // Monitor closed / error events
    _connection.closed().then(() => {
      _notifyStatus("disconnected");
    });

    // Start drain/disconnect handling
    (async () => {
      for await (const s of _connection!.status()) {
        if (s.type === "disconnect") {
          _notifyStatus("connecting");
        } else if (s.type === "reconnect") {
          _notifyStatus("connected");
        } else if (s.type === "error") {
          _notifyStatus("error", String(s.data));
        }
      }
    })().catch(() => {/* ignore after close */});
  } catch (err) {
    _notifyStatus("error", String(err));
    // Schedule reconnect
    _reconnectTimer = setTimeout(() => {
      natsConnect(url, serviceId).catch(() => {/* handled inside */});
    }, 5000);
    throw err;
  }
}

/**
 * Disconnect from NATS.
 */
export async function natsDisconnect(): Promise<void> {
  _clearReconnect();
  _streamSubscriptions.forEach((sub) => {
    sub.unsubscribe();
  });
  _streamSubscriptions.clear();

  if (_connection) {
    try {
      await _connection.drain();
    } catch {
      // ignore
    }
    _connection = null;
  }
  _notifyStatus("disconnected");
}

/**
 * Register a callback for connection status changes.
 */
export function onConnectionChange(cb: StatusCallback): () => void {
  _statusCallbacks.push(cb);
  // Immediately notify current status
  cb(_currentStatus);
  return () => {
    _statusCallbacks = _statusCallbacks.filter((c) => c !== cb);
  };
}

/**
 * Get the current connection status.
 */
export function getConnectionStatus(): ConnectionStatus {
  return _currentStatus;
}

/**
 * Execute a Magique RPC call against the ChatRoom service.
 * Subject pattern: `magique.{serviceId}.{method}`
 */
export async function callTool<T = unknown>(
  method: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  if (!_connection) {
    throw new Error("Not connected to NATS");
  }

  const subject = `magique.${_serviceId}.${method}`;
  const request: RpcRequest = {
    method,
    params,
    requestId: crypto.randomUUID(),
  };

  const msg = await _connection.request(subject, jc.encode(request), {
    timeout: 30_000,
  });

  const response = jc.decode(msg.data) as RpcResponse<T>;

  if (response.error) {
    throw new Error(
      `RPC error ${response.error.code}: ${response.error.message}`
    );
  }

  return response.result as T;
}

/**
 * Subscribe to streaming chat responses.
 * Subject: `pantheon.stream.{chatId}`
 *
 * @param chatId  The chat session ID
 * @param onChunk  Called for each streamed chunk
 * @returns  Unsubscribe function
 */
export function subscribeStream(
  chatId: string,
  onChunk: (chunk: StreamChunk) => void
): () => void {
  if (!_connection) {
    throw new Error("Not connected to NATS");
  }

  // Unsubscribe previous subscription for this chat
  const existing = _streamSubscriptions.get(chatId);
  if (existing) {
    existing.unsubscribe();
    _streamSubscriptions.delete(chatId);
  }

  const subject = `pantheon.stream.${chatId}`;
  const sub = _connection.subscribe(subject);

  _streamSubscriptions.set(chatId, sub);

  (async () => {
    for await (const msg of sub) {
      try {
        const chunk = jc.decode(msg.data) as StreamChunk;
        onChunk(chunk);
        if (chunk.done) {
          sub.unsubscribe();
          _streamSubscriptions.delete(chatId);
          break;
        }
      } catch (err) {
        console.error("Stream decode error:", err);
      }
    }
  })().catch((err: NatsError) => {
    if (!err.message.includes("SUB-001")) {
      // ignore unsubscribe errors
      console.error("Stream subscription error:", err);
    }
  });

  return () => {
    sub.unsubscribe();
    _streamSubscriptions.delete(chatId);
  };
}

/**
 * Publish a fire-and-forget message to a NATS subject.
 */
export function publish(subject: string, data: unknown): void {
  if (!_connection) {
    throw new Error("Not connected to NATS");
  }
  _connection.publish(subject, jc.encode(data));
}

/**
 * Check if currently connected.
 */
export function isConnected(): boolean {
  return _currentStatus === "connected";
}

// Expose raw connection for advanced usage (read-only)
export function getRawConnection(): NatsConnection | null {
  return _connection;
}
