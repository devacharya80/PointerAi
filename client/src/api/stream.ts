import { refreshUser } from "./auth";
import { getAccessToken } from "./token-store";
import type { Message } from "./conversations";

export interface ClarificationData {
  type: string;
  conversationId: string;
  userMessage: Message;
  aiMessage: Message;
}

export interface StreamHandlers {
  onText: (text: string) => void;
  onConversationId?: (id: string) => void;
  onDone: (messageId: string) => void | Promise<void>;
  onError: (message: string) => void;
  onClarification?: (
    data: ClarificationData,
  ) => void | Promise<void>;
}

const isRecord = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isMessage = (value: unknown): value is Message =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.conversationId === "string" &&
  (value.role === "USER" || value.role === "ASSISTANT") &&
  typeof value.content === "string";

const isClarification = (
  value: unknown,
): value is ClarificationData =>
  isRecord(value) &&
  value.type === "clarification" &&
  typeof value.conversationId === "string" &&
  isMessage(value.userMessage) &&
  isMessage(value.aiMessage);

const buildUrl = (conversationId?: string): string => {
  const base = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, "");

  if (!base) {
    throw new Error(
      "VITE_BACKEND_URL is not configured in client/.env.",
    );
  }

  return conversationId
    ? `${base}/conversations/${encodeURIComponent(conversationId)}/messages`
    : `${base}/conversations/messages`;
};

async function postMessage(
  url: string,
  content: string,
  token: string | null,
  signal?: AbortSignal,
): Promise<Response> {
  return fetch(url, {
    method: "POST",
    credentials: "include",
    signal,
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream, application/json",
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
    },
    body: JSON.stringify({ content }),
  });
}

async function readErrorMessage(
  response: Response,
): Promise<string> {
  try {
    const payload: unknown = await response.json();

    if (
      isRecord(payload) &&
      typeof payload.message === "string"
    ) {
      return payload.message;
    }
  } catch {
    // Non-JSON error body.
  }

  if (response.status === 429) {
    return "Too many requests. Please wait a little and try again.";
  }

  return `Request failed (${response.status}). Please try again.`;
}

async function handleClarification(
  payload: unknown,
  handlers: StreamHandlers,
): Promise<void> {
  if (!isRecord(payload) || !isClarification(payload.data)) {
    handlers.onError(
      "The server returned an invalid clarification response.",
    );
    return;
  }

  handlers.onConversationId?.(payload.data.conversationId);

  await handlers.onClarification?.(payload.data);
}

async function handleSseEvent(
  rawEvent: string,
  handlers: StreamHandlers,
): Promise<void> {
  let eventType = "message";
  const dataLines: string[] = [];

  for (const line of rawEvent.split(/\r?\n/)) {
    if (line.startsWith("event:")) {
      eventType = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).replace(/^ /, ""));
    }
  }

  if (dataLines.length === 0) return;

  let payload: unknown;

  try {
    payload = JSON.parse(dataLines.join("\n"));
  } catch {
    if (eventType === "error") {
      handlers.onError("The server stream returned an invalid error.");
    }
    return;
  }

  if (eventType === "error") {
    handlers.onError(
      isRecord(payload) && typeof payload.message === "string"
        ? payload.message
        : "The AI response failed. Please try again",
    );
    return;
  }

  if (!isRecord(payload)) return;

  if (typeof payload.conversationId === "string") {
    handlers.onConversationId?.(payload.conversationId);
  }

  if (typeof payload.text === "string") {
    handlers.onText(payload.text);
  }

  if (
    payload.done === true &&
    typeof payload.messageId === "string"
  ) {
    await handlers.onDone(payload.messageId);
  }
}

async function readSse(
  body: ReadableStream<Uint8Array>,
  handlers: StreamHandlers,
  signal: AbortSignal | undefined,
  onDoneEvent: () => void,
  onErrorEvent: () => void,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  // Wrap handlers so we can detect whether the server completed.
  const wrappedHandlers: StreamHandlers = {
    ...handlers,

    onDone: async (messageId) => {
      onDoneEvent();
      await handlers.onDone(messageId);
    },

    onError: (message) => {
      onErrorEvent();
      handlers.onError(message);
    },
  };

  try {
    while (!signal?.aborted) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse complete SSE events without discarding partial ones.
      let separator: RegExpExecArray | null;

      while ((separator = /\r?\n\r?\n/.exec(buffer)) !== null) {
        const event = buffer.slice(0, separator.index);

        buffer = buffer.slice(
          separator.index + separator[0].length,
        );

        await handleSseEvent(event, wrappedHandlers);
      }
    }

    buffer += decoder.decode();

    if (buffer.trim()) {
      await handleSseEvent(
        buffer.replace(/\r\n/g, "\n"),
        wrappedHandlers,
      );
    }
  } finally {
    reader.releaseLock();
  }
}

export const streamMessage = async (
  content: string,
  conversationId: string | undefined,
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<void> => {
  let url: string;

  try {
    url = buildUrl(conversationId);
  } catch (error) {
    handlers.onError(
      error instanceof Error
        ? error.message
        : "Backend URL is missing.",
    );
    return;
  }

  let receivedDone = false;
  let reportedError = false;

  try {
    let response = await postMessage(
      url,
      content,
      getAccessToken(),
      signal,
    );

    if (response.status === 401 && !signal?.aborted) {
      let accessToken: string;

      try {
        ({ accessToken } = await refreshUser());
      } catch {
        handlers.onError(
          "Your session has expired. Please sign in again.",
        );
        return;
      }

      response = await postMessage(
        url,
        content,
        accessToken,
        signal,
      );
    }

    if (signal?.aborted) return;

    if (!response.ok) {
      handlers.onError(await readErrorMessage(response));
      return;
    }

    const contentType =
      response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      await handleClarification(
        await response.json(),
        handlers,
      );
      return;
    }

    if (!response.body) {
      handlers.onError("The server returned an empty response.");
      return;
    }

    await readSse(
      response.body,
      handlers,
      signal,
      () => {
        receivedDone = true;
      },
      () => {
        reportedError = true;
      },
    );

    if (
      !signal?.aborted &&
      !receivedDone &&
      !reportedError
    ) {
      handlers.onError(
        "The connection ended before the response completed.",
      );
    }
  } catch (error) {
    if (signal?.aborted) return;

    handlers.onError(
      error instanceof TypeError
        ? "Network error. Check your connection and try again."
        : error instanceof Error
          ? error.message
          : "Something went wrong while receiving the response.",
    );
  }
};