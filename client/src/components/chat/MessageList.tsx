import { useEffect, useRef } from "react";
import type { Message } from "../../api/conversations";
import MessageBubble from "./MessageBubble";
import ClarificationCard from "./ClarificationCard";
import StreamingBubble from "./StreamingBubble";
import EmptyState from "./EmptyState";

interface MessageListProps {
  messages: Message[];
  pendingText: string | null;
  streamingText: string;
  isStreaming: boolean;
  error: string | null;
  disabled: boolean;
  onSelect: (text: string) => void;
}

export default function MessageList({
  messages,
  pendingText,
  streamingText,
  isStreaming,
  error,
  disabled,
  onSelect,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const isEmpty =
    messages.length === 0 && !pendingText && !isStreaming && !error;

  // Keep the newest content in view.
  // Instant scrolling while streaming, smooth otherwise.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: isStreaming ? "auto" : "smooth",
      block: "end",
    });
  }, [messages.length, pendingText, streamingText, isStreaming, error]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      {isEmpty ? (
        <EmptyState onSelect={onSelect} disabled={disabled} />
      ) : (
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 md:px-6">
          {messages.map((m) =>
            m.type === "CLARIFICATION_QUESTION" ? (
              <ClarificationCard
                key={m.id}
                question={m.content}
                options={m.options ?? []}
                disabled={disabled}
                onSelect={onSelect}
              />
            ) : (
              <MessageBubble key={m.id} role={m.role} content={m.content} />
            ),
          )}

          {pendingText && (
            <MessageBubble role="USER" content={pendingText} pending />
          )}

          {isStreaming && <StreamingBubble text={streamingText} />}

          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}