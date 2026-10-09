
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getConversationDetail } from "../api/conversations";
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
  } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => getConversationDetail(conversationId!),
    enabled: Boolean(conversationId),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const handleConversationCreated = useCallback(
    (id: string) => {
      if (id !== conversationId) {
        navigate(`/chat/${id}`, { replace: true });
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

  // Remove temporary messages after the server copy arrives.
  useEffect(() => {
    if (!conversation?.messages) return;

    const finalAssistant = [...conversation.messages]
      .reverse()
      .find(
        (message) =>
          message.role === "ASSISTANT" &&
          message.type === "NORMAL",
      );

    if (
      finalAssistant &&
      !isStreaming &&
      streamingText &&
      finalAssistant.content === streamingText
    ) {
      clearStreamingText();
    }

    if (
      sentUserMessage &&
      conversation.messages.some(
        (message) =>
          message.role === "USER" &&
          message.content === sentUserMessage.content &&
          message.createdAt >= sentUserMessage.createdAt,
      )
    ) {
      clearSentMessage();
    }

    if (
      clarificationMessage &&
      conversation.messages.some(
        (message) => message.id === clarificationMessage.id,
      )
    ) {
      clearClarification();
    }
  }, [
    conversation?.messages,
    isStreaming,
    streamingText,
    sentUserMessage,
    clarificationMessage,
    clearSentMessage,
    clearClarification,
    clearStreamingText,
  ]);

  const send = async (text: string) => {
    const trimmed = text.trim();

    if (!trimmed || isStreaming) return;

    setInput("");
    await sendMessage(trimmed);
  };

  const title =
    conversation?.title ??
    (conversationId
      ? conversationLoading
        ? "Loading chat..."
        : "Conversation"
      : "New chat");

  const visibleMessages = useMemo(() => {
    const existing = conversation?.messages ?? [];
    const combined = [...existing];

    // Keep the optimistic message visible until persisted.
    if (
      sentUserMessage &&
      !combined.some(
        (message) =>
          message.id === sentUserMessage.id ||
          (message.role === "USER" &&
            message.content === sentUserMessage.content &&
            message.createdAt >= sentUserMessage.createdAt),
      )
    ) {
      combined.push(sentUserMessage);
    }

    // Clarification responses use JSON rather than SSE.
    if (
      clarificationMessage &&
      !combined.some(
        (message) => message.id === clarificationMessage.id,
      )
    ) {
      combined.push(clarificationMessage);
    }

    return combined;
  }, [
    conversation?.messages,
    sentUserMessage,
    clarificationMessage,
  ]);

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
            onSelect={(text) => void send(text)}
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
