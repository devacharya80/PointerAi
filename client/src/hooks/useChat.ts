import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useQueryClient } from "@tanstack/react-query";

import { streamMessage } from "../api/stream";
import type {
  ConversationDetail,
  Message,
} from "../api/conversations";

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

  const [sentUserMessage, setSentUserMessage] =
    useState<Message | null>(null);

  const [clarificationMessage, setClarificationMessage] =
    useState<Message | null>(null);

  const streamingRef = useRef(false);
  const streamErrorRef = useRef(false);

  const abortRef = useRef<AbortController | null>(null);

  const activeIdRef = useRef<string | undefined>(conversationId);
  const requestIdRef = useRef<string | undefined>(conversationId);

  const onCreatedRef = useRef(onConversationCreated);

  const pendingTextRef = useRef("");
  const frameRef = useRef<number | null>(null);

  const flushStreamingText = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    const pending = pendingTextRef.current;
    pendingTextRef.current = "";

    if (pending) {
      setStreamingText((current) => current + pending);
    }
  }, []);

  useEffect(() => {
    onCreatedRef.current = onConversationCreated;
  }, [onConversationCreated]);

  // Preserve the in-flight stream when a new conversation ID
  // arrives from the server. Abort only when navigating elsewhere.
  useEffect(() => {
    if (activeIdRef.current === conversationId) return;

    abortRef.current?.abort();

    activeIdRef.current = conversationId;

    setStreamingText("");
    setError(null);
    setSentUserMessage(null);
    setClarificationMessage(null);

    pendingTextRef.current = "";

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, [conversationId]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const refreshMessages = useCallback(
    async (id = requestIdRef.current) => {
      if (id) {
        await queryClient.invalidateQueries({
          queryKey: ["conversation", id],
        });
      }

      await queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
    [queryClient],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();

      if (!trimmed || streamingRef.current) return;

      streamingRef.current = true;
      streamErrorRef.current = false;

      requestIdRef.current = activeIdRef.current;

      setError(null);
      setStreamingText("");
      setClarificationMessage(null);
      setIsStreaming(true);

      pendingTextRef.current = "";

      const now = new Date().toISOString();

      const optimisticMessage: Message = {
        id: `optimistic-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        conversationId: activeIdRef.current ?? "",
        role: "USER",
        type: "NORMAL",
        content: trimmed,
        options: [],
        createdAt: now,
        sources: [],
      };

      setSentUserMessage(optimisticMessage);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await streamMessage(
          trimmed,
          activeIdRef.current,
          {
            onText: (chunk) => {
              pendingTextRef.current += chunk;

              if (frameRef.current === null) {
                frameRef.current = requestAnimationFrame(
                  flushStreamingText,
                );
              }
            },

            onConversationId: (id) => {
              activeIdRef.current = id;
              requestIdRef.current = id;

              setSentUserMessage((current) =>
                current
                  ? {
                      ...current,
                      conversationId: id,
                    }
                  : current,
              );

              onCreatedRef.current?.(id);
            },

            onDone: () => {
              flushStreamingText();
            },

            onError: (message) => {
              streamErrorRef.current = true;
              setError(message);
            },

            onClarification: async (data) => {
              activeIdRef.current = data.conversationId;
              requestIdRef.current = data.conversationId;

              setSentUserMessage(data.userMessage);
              setClarificationMessage(data.aiMessage);

              onCreatedRef.current?.(data.conversationId);
            },
          },
          controller.signal,
        );
      } finally {
        flushStreamingText();

        try {
          await refreshMessages(requestIdRef.current);
        } catch {
          // The current stream result stays visible even if refresh fails.
        }

        const requestId = requestIdRef.current;

        const detail = requestId
          ? queryClient.getQueryData<ConversationDetail>([
              "conversation",
              requestId,
            ])
          : undefined;

        const savedUserMessage = detail?.messages.some(
          (message) =>
            message.role === "USER" &&
            message.content === trimmed &&
            Date.parse(message.createdAt) >=
              Date.parse(optimisticMessage.createdAt) - 1000,
        );

        if (!savedUserMessage && streamErrorRef.current) {
          setSentUserMessage(null);
        }

        if (!requestId && streamErrorRef.current) {
          setSentUserMessage(null);
        }

        streamingRef.current = false;
        setIsStreaming(false);

        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    },
    [
      flushStreamingText,
      queryClient,
      refreshMessages,
    ],
  );

  const clearSentMessage = useCallback(() => {
    setSentUserMessage(null);
  }, []);

  const clearClarification = useCallback(() => {
    setClarificationMessage(null);
  }, []);

  const clearStreamingText = useCallback(() => {
    pendingTextRef.current = "";

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    setStreamingText("");
  }, []);

  return {
    sendMessage,
    streamingText,
    isStreaming,
    error,
    sentUserMessage,
    clarificationMessage,
    clearSentMessage,
    clearClarification,
    clearStreamingText,
  };
};