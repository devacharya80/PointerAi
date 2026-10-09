
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { streamMessage } from "../api/stream";
import type { Message } from "../api/conversations";

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
  const abortRef = useRef<AbortController | null>(null);
  const activeIdRef = useRef<string | undefined>(conversationId);
  const onCreatedRef = useRef(onConversationCreated);

  useEffect(() => {
    activeIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    onCreatedRef.current = onConversationCreated;
  }, [onConversationCreated]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const refreshMessages = useCallback(
    async (id = activeIdRef.current) => {
      if (id) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["conversation", id],
          }),
          queryClient.invalidateQueries({
            queryKey: ["messages", id],
          }),
        ]);
      }

      await queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
    [queryClient],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (streamingRef.current) return;

      const trimmed = content.trim();
      if (!trimmed) return;

      streamingRef.current = true;

      setError(null);
      setStreamingText("");
      setClarificationMessage(null);
      setIsStreaming(true);

      // Display the user's message immediately.
      const optimisticUserMessage: Message = {
        id: `optimistic-${Date.now()}`,
        conversationId: activeIdRef.current ?? "",
        role: "USER",
        type: "NORMAL",
        content: trimmed,
        options: null,
        createdAt: new Date().toISOString(),
      };

      setSentUserMessage(optimisticUserMessage);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await streamMessage(
          trimmed,
          activeIdRef.current,
          {
            onText: (text) => {
              setStreamingText((current) => current + text);
            },

            onConversationId: (id) => {
              activeIdRef.current = id;

              setSentUserMessage((message) =>
                message
                  ? { ...message, conversationId: id }
                  : message,
              );

              onCreatedRef.current?.(id);
            },

            onDone: async () => {
              // Keep the stream visible while saved data reloads.
              await refreshMessages(activeIdRef.current);
            },

            onError: (message) => {
              setError(message);
            },

            onClarification: async (data) => {
              activeIdRef.current = data.conversationId;

              setSentUserMessage(data.userMessage);
              setClarificationMessage(data.aiMessage);

              onCreatedRef.current?.(data.conversationId);

              await refreshMessages(data.conversationId);
            },
          },
          controller.signal,
        );
      } finally {
        streamingRef.current = false;
        setIsStreaming(false);

        if (abortRef.current === controller) {
          abortRef.current = null;
        }

        // The ChatPage removes the temporary streamed copy
        // after the saved assistant message has been fetched.
      }
    },
    [refreshMessages],
  );

  const clearSentMessage = useCallback(() => {
    setSentUserMessage(null);
  }, []);

  const clearClarification = useCallback(() => {
    setClarificationMessage(null);
  }, []);

  const clearStreamingText = useCallback(() => {
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
