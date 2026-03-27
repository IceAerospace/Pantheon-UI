import { useState, useRef, useCallback } from "react";
import { subscribeStream } from "@/services/nats-client";
import type { StreamChunk } from "@/types";

interface StreamingState {
  content: string;
  agentName?: string;
  isStreaming: boolean;
  error?: string;
}

/**
 * Low-level hook for manually managing a streaming subscription.
 * Prefer useChatStore.sendMessage for the full chat flow.
 */
export function useStreaming(chatId: string) {
  const [state, setState] = useState<StreamingState>({
    content: "",
    isStreaming: false,
  });

  const unsubRef = useRef<(() => void) | null>(null);

  const startStream = useCallback(() => {
    // Cancel existing
    if (unsubRef.current) {
      unsubRef.current();
    }

    setState({ content: "", isStreaming: true });

    const unsub = subscribeStream(chatId, (chunk: StreamChunk) => {
      if (chunk.error) {
        setState((prev) => ({
          ...prev,
          isStreaming: false,
          error: chunk.error,
        }));
        return;
      }

      if (!chunk.done) {
        setState((prev) => ({
          ...prev,
          content: prev.content + chunk.content,
          agentName: chunk.agentName ?? prev.agentName,
        }));
      } else {
        setState((prev) => ({ ...prev, isStreaming: false }));
      }
    });

    unsubRef.current = unsub;
    return unsub;
  }, [chatId]);

  const stopStream = useCallback(() => {
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }
    setState((prev) => ({ ...prev, isStreaming: false }));
  }, []);

  const resetStream = useCallback(() => {
    stopStream();
    setState({ content: "", isStreaming: false });
  }, [stopStream]);

  return {
    ...state,
    startStream,
    stopStream,
    resetStream,
  };
}
