
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
    messages.length === 0 &&
    !pendingText &&
    !isStreaming &&
    !error;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: isStreaming ? "auto" : "smooth",
      block: "end",
    });
  }, [
    messages.length,
    pendingText,
    streamingText,
    isStreaming,
    error,
  ]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      {isEmpty ? (
        <EmptyState onSelect={onSelect} disabled={disabled} />
      ) : (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-7 px-4 py-6 md:px-8 md:py-8">
          {messages.map((message) =>
            message.type === "CLARIFICATION_QUESTION" ? (
              <ClarificationCard
                key={message.id}
                question={message.content}
                options={message.options ?? []}
                disabled={disabled}
                onSelect={onSelect}
              />
            ) : (
              <MessageBubble
                key={message.id}
                role={message.role}
                content={message.content}
              />
            ),
          )}

          {pendingText && (
            <MessageBubble
              role="USER"
              content={pendingText}
              pending
            />
          )}

          {isStreaming && (
            <StreamingBubble text={streamingText} />
          )}

          {error && (
            <div
              role="alert"
              className="ml-10 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
