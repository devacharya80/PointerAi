
import { memo, useEffect, useRef } from "react";
import { LoaderCircle, MessageSquare } from "lucide-react";

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
  loading?: boolean;
  loadingError?: string | null;
  onRetryLoad?: () => void;
  onSelect: (text: string) => void;
}

const SavedMessages = memo(function SavedMessages({
  messages,
  disabled,
  onSelect,
}: {
  messages: Message[];
  disabled: boolean;
  onSelect: (text: string) => void;
}) {
  return (
    <>
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
            sources={message.sources}
          />
        ),
      )}
    </>
  );
});

function ConversationLoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading conversation"
      className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 md:px-8"
    >
      <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
        <LoaderCircle
          size={17}
          className="animate-spin"
        />
        Loading conversation...
      </div>

      <div className="animate-pulse space-y-8">
        {/* Previous assistant message placeholder */}
        <div className="flex gap-3">
          <div className="size-8 shrink-0 rounded-full bg-white/10" />

          <div className="min-w-0 flex-1 space-y-3 pt-1">
            <div className="h-3 w-28 rounded bg-white/10" />
            <div className="h-3 w-full max-w-2xl rounded bg-white/10" />
            <div className="h-3 w-5/6 max-w-xl rounded bg-white/10" />
            <div className="h-3 w-2/3 max-w-lg rounded bg-white/10" />
          </div>
        </div>

        {/* Previous user message placeholder */}
        <div className="flex justify-end">
          <div className="flex max-w-[75%] items-start gap-3 rounded-2xl bg-[#202020] px-4 py-4">
            <MessageSquare
              size={15}
              className="mt-0.5 shrink-0 text-gray-600"
            />
            <div className="space-y-2">
              <div className="h-3 w-48 max-w-full rounded bg-white/10" />
              <div className="h-3 w-32 max-w-full rounded bg-white/10" />
            </div>
          </div>
        </div>

        {/* Another assistant message placeholder */}
        <div className="flex gap-3">
          <div className="size-8 shrink-0 rounded-full bg-white/10" />

          <div className="min-w-0 flex-1 space-y-3 pt-1">
            <div className="h-3 w-full max-w-xl rounded bg-white/10" />
            <div className="h-3 w-5/6 max-w-2xl rounded bg-white/10" />
            <div className="h-3 w-3/5 max-w-lg rounded bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ConversationLoadError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex min-h-full flex-col items-center justify-center px-4 py-12 text-center"
    >
      <MessageSquare
        size={28}
        className="mb-4 text-gray-500"
      />

      <h2 className="text-base font-medium text-gray-200">
        Couldn't load this conversation
      </h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-200 transition hover:bg-white/10"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export default function MessageList({
  messages,
  pendingText,
  streamingText,
  isStreaming,
  error,
  disabled,
  loading = false,
  loadingError = null,
  onRetryLoad,
  onSelect,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const hasVisibleContent =
    messages.length > 0 ||
    Boolean(pendingText) ||
    Boolean(streamingText) ||
    isStreaming ||
    Boolean(error);

  // Never show the welcome screen while a selected conversation
  // is still loading.
  const shouldShowLoading =
    loading && !hasVisibleContent;

  const shouldShowLoadError =
    Boolean(loadingError) &&
    !hasVisibleContent &&
    !loading;

  const isEmpty =
    !hasVisibleContent &&
    !loading &&
    !loadingError;

  useEffect(() => {
    // Don't scroll to the bottom while showing loading skeletons.
    if (loading || loadingError) return;

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
    loading,
    loadingError,
  ]);

  if (shouldShowLoading) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <ConversationLoadingState />
      </div>
    );
  }

  if (shouldShowLoadError && loadingError) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ConversationLoadError
          message={loadingError}
          onRetry={onRetryLoad}
        />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto">
        <EmptyState
          onSelect={onSelect}
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-7 px-4 py-6 md:px-8 md:py-8">
        <SavedMessages
          messages={messages}
          disabled={disabled}
          onSelect={onSelect}
        />

        {pendingText && (
          <MessageBubble
            role="USER"
            content={pendingText}
            pending
          />
        )}

        {(isStreaming || streamingText) && (
          <StreamingBubble
            text={streamingText}
            streaming={isStreaming}
          />
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
    </div>
  );
}
