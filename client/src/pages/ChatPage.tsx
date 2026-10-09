import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getConversationDetail } from "../api/conversations";
import { useChat } from "../hooks/useChat";
import AppShell from "../components/layout/AppShell";
import Sidebar from "../components/sidebar/Sidebar";
import ChatHeader from "../components/chat/ChatHeader";
import MessageList from "../components/chat/MessageList";
import ChatInput from "../components/chat/ChatInput";

interface PendingMessage {
  text: string;
  // Saved message count when the user sent this.
  // Once the saved count grows, the optimistic bubble is no longer needed.
  baseCount: number;
}

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [pending, setPending] = useState<PendingMessage | null>(null);

  const { data: conversation } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => getConversationDetail(conversationId!),
    enabled: !!conversationId,
  });

  const messageCount = conversation?.messages.length ?? 0;

  const handleConversationCreated = useCallback(
    (id: string) => navigate(`/chat/${id}`, { replace: true }),
    [navigate],
  );

  const { sendMessage, streamingText, isStreaming, error } = useChat({
    conversationId,
    onConversationCreated: handleConversationCreated,
  });

  // Derived, not stored: show the optimistic bubble only
  // until the saved copy has arrived, and never on error.
  const visiblePending =
    pending && !error && messageCount <= pending.baseCount
      ? pending.text
      : null;

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    setPending({ text: trimmed, baseCount: messageCount });
    setInput("");

    await sendMessage(trimmed);
  };

  const title =
    conversation?.title ?? (conversationId ? "Loading..." : "New chat");

  return (
    <AppShell
      sidebar={({ onNavigate }) => (
        <Sidebar activeId={conversationId} onNavigate={onNavigate} />
      )}
    >
      {({ openSidebar }) => (
        <div className="flex min-h-0 flex-1 flex-col">
          <ChatHeader title={title} onMenuClick={openSidebar} />

          <MessageList
            messages={conversation?.messages ?? []}
            pendingText={visiblePending}
            streamingText={streamingText}
            isStreaming={isStreaming}
            error={error}
            disabled={isStreaming}
            onSelect={send}
          />

          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={() => send(input)}
            disabled={isStreaming}
          />
        </div>
      )}
    </AppShell>
  );
}