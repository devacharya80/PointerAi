import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { streamMessage } from "../api/stream";

interface UseChatOptions {
  conversationId?: string;
  onConversationCreated?: (id: string) => void;
}

export const useChat = ({
  conversationId,
  onConversationCreated,
}: UseChatOptions) => {
  const queryClient = useQueryClient();

  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Source of truth for the double-send guard.
  // State updates are async, so a ref is needed here.
  const streamingRef = useRef(false);

  // Cancels the in-flight stream
  const abortRef = useRef<AbortController | null>(null);

  // Always holds the current conversation ID, including
  // one that arrives mid-stream for a brand-new chat.
  const activeIdRef = useRef<string | undefined>(conversationId);

  // Keep the ref in sync when the prop changes (switching chats)
  useEffect(() => {
    activeIdRef.current = conversationId;
  }, [conversationId]);

  // Abort the stream if the component unmounts
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const refreshMessages = useCallback(() => {
    const id = activeIdRef.current;

    if (id) {
      queryClient.invalidateQueries({ queryKey: ["messages", id] });
    }

    queryClient.invalidateQueries({ queryKey: ["conversations"] });
  }, [queryClient]);

  const sendMessage = useCallback(
    async (content: string) => {
      // 1. Guard against double sends
      if (streamingRef.current) {
        return;
      }

      streamingRef.current = true;

      // 2. Reset state
      setError(null);
      setStreamingText("");
      setIsStreaming(true);

      // 3. Create AbortController
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        // 4. Start streaming
        await streamMessage(
          content,
          activeIdRef.current,
          {
            onText: (text) => {
              setStreamingText((prev) => prev + text);
            },

            onConversationId: (id) => {
              activeIdRef.current = id;
              onConversationCreated?.(id);
            },

            onDone: () => {
              refreshMessages();
            },

            onError: (message) => {
              setError(message);
            },

            onClarification: () => {
              refreshMessages();
            },
          },
          controller.signal,
        );
      } finally {
        // 5. Reset flags only. streamingText is intentionally
        // not cleared here, to avoid a flicker before the
        // refetched messages arrive. It is reset on the next send.
        streamingRef.current = false;
        setIsStreaming(false);

        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    },
    [onConversationCreated, refreshMessages],
  );

  return {
    sendMessage,
    streamingText,
    isStreaming,
    error,
  };
};