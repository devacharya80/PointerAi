
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import {
  getConversationDetail,
} from "../api/conversations";

import { useChat } from "../hooks/useChat";

import AppShell from "../components/layout/AppShell";
import Sidebar from "../components/sidebar/Sidebar";
import ChatHeader from "../components/chat/ChatHeader";
import MessageList from "../components/chat/MessageList";
import ChatInput from "../components/chat/ChatInput";

export default function ChatPage() {
  const { conversationId } = useParams<{
    conversationId?: string;
  }>();

  const navigate = useNavigate();
  const [input, setInput] = useState("");

  const {
    data: conversation,
    isLoading: conversationLoading,
    isError: conversationError,
    refetch: refetchConversation,
  } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => getConversationDetail(conversationId!),
    enabled: Boolean(conversationId),
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });

  const handleConversationCreated = useCallback(
    (id: string) => {
      if (id !== conversationId) {
        navigate(`/chat/${id}`, {
          replace: true,
        });
      }
    },
    [conversationId, navigate],
  );

  const {
    sendMessage,
    streamingText,
    isStreaming,
    error,
    sentUserMessage,
    clarificationMessage,
    clearSentMessage,
    clearClarification,
    clearStreamingText,
  } = useChat({
    conversationId,
    onConversationCreated: handleConversationCreated,
  });

  useEffect(() => {
    const messages = conversation?.messages;

    if (!messages) return;

    if (
      sentUserMessage &&
      messages.some((message) => {
        if (message.id === sentUserMessage.id) {
          return true;
        }

        return (
          message.role === "USER" &&
          message.content === sentUserMessage.content &&
          Date.parse(message.createdAt) >=
            Date.parse(sentUserMessage.createdAt) - 1000
        );
      })
    ) {
      clearSentMessage();
    }

    if (
      clarificationMessage &&
      messages.some(
        (message) =>
          message.id === clarificationMessage.id,
      )
    ) {
      clearClarification();
    }

    const lastAssistantMessage = [...messages]
      .reverse()
      .find(
        (message) =>
          message.role === "ASSISTANT" &&
          message.type === "NORMAL",
      );

    if (
      !isStreaming &&
      streamingText &&
      lastAssistantMessage?.content === streamingText
    ) {
      clearStreamingText();
    }
  }, [
    conversation?.messages,
    sentUserMessage,
    clarificationMessage,
    isStreaming,
    streamingText,
    clearSentMessage,
    clearClarification,
    clearStreamingText,
  ]);

  const send = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();

      if (!text || isStreaming || text.length > 1000) {
        return;
      }

      setInput("");
      await sendMessage(text);
    },
    [isStreaming, sendMessage],
  );

  const visibleMessages = useMemo(() => {
    const messages = [...(conversation?.messages ?? [])];

    if (sentUserMessage) {
      const alreadySaved = messages.some((message) => {
        if (message.id === sentUserMessage.id) {
          return true;
        }

        return (
          message.role === "USER" &&
          message.content === sentUserMessage.content &&
          Date.parse(message.createdAt) >=
            Date.parse(sentUserMessage.createdAt) - 1000
        );
      });

      if (!alreadySaved) {
        messages.push(sentUserMessage);
      }
    }

    if (
      clarificationMessage &&
      !messages.some(
        (message) =>
          message.id === clarificationMessage.id,
      )
    ) {
      messages.push(clarificationMessage);
    }

    return messages;
  }, [
    conversation?.messages,
    sentUserMessage,
    clarificationMessage,
  ]);

  const title =
    conversation?.title ??
    (conversationId
      ? conversationLoading
        ? "Loading conversation..."
        : "Conversation"
      : "New chat");

  return (
    <AppShell
      sidebar={({ onNavigate }) => (
        <Sidebar
          activeId={conversationId}
          onNavigate={onNavigate}
        />
      )}
    >
      {({ toggleSidebar, isSidebarOpen }) => (
        <div className="flex min-h-0 flex-1 flex-col">
          <ChatHeader
            title={title}
            onMenuClick={toggleSidebar}
            sidebarOpen={isSidebarOpen}
          />

          <MessageList
            messages={visibleMessages}
            pendingText={null}
            streamingText={streamingText}
            isStreaming={isStreaming}
            error={error}
            disabled={isStreaming}
            loading={Boolean(
              conversationId &&
              conversationLoading &&
              !conversation,
            )}
            loadingError={
              conversationError && !conversation
                ? "The conversation couldn't be retrieved. Check your connection and try again."
                : null
            }
            onRetryLoad={() => {
              void refetchConversation();
            }}
            onSelect={send}
          />

          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={() => void send(input)}
            disabled={isStreaming}
          />
        </div>
      )}
    </AppShell>
  );
}
