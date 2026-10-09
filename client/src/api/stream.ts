
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

const isClarificationData = (
  value: unknown,
): value is ClarificationData =>
  isRecord(value) &&
  typeof value.type === "string" &&
  typeof value.conversationId === "string" &&
  isMessage(value.userMessage) &&
  isMessage(value.aiMessage);

const buildUrl = (conversationId?: string): string => {
  const base = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, "");

  if (!base) {
    throw new Error("VITE_BACKEND_URL is not configured.");
  }

  return conversationId
    ? `${base}/conversations/${encodeURIComponent(conversationId)}/messages`
    : `${base}/conversations/messages`;
};

const postMessage = (
  url: string,
  content: string,
  token: string | null,
  signal?: AbortSignal,
): Promise<Response> =>
  fetch(url, {
    method: "POST",
    credentials: "include",
    signal,
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream, application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ content }),
  });

const readErrorMessage = async (
  response: Response,
): Promise<string> => {
  try {
    const payload: unknown = await response.json();

    if (
      isRecord(payload) &&
      typeof payload.message === "string"
    ) {
      return payload.message;
    }

    if (
      isRecord(payload) &&
      isRecord(payload.error) &&
      typeof payload.error.message === "string"
    ) {
      return payload.error.message;
    }
  } catch {
    // An API error can have an empty or non-JSON body.
  }

  return `Request failed (${response.status}). Please try again.`;
};

const handleClarification = async (
  raw: unknown,
  handlers: StreamHandlers,
): Promise<void> => {
  if (!isRecord(raw) || !isClarificationData(raw.data)) {
    handlers.onError(
      "The server returned an invalid clarification response.",
    );
    return;
  }

  handlers.onConversationId?.(raw.data.conversationId);

  await handlers.onClarification?.(raw.data);
};

const handleEvent = async (
  rawEvent: string,
  handlers: StreamHandlers,
): Promise<void> => {
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

  const data = dataLines.join("\n");

  let parsed: unknown;

  try {
    parsed = JSON.parse(data);
  } catch {
    if (eventType === "error") {
      handlers.onError(data || "The response stream failed.");
    }

    return;
  }

  if (eventType === "error") {
    handlers.onError(
      isRecord(parsed) && typeof parsed.message === "string"
        ? parsed.message
        : "The AI response failed. Please try again.",
    );

    return;
  }

  if (!isRecord(parsed)) return;

  if (typeof parsed.conversationId === "string") {
    handlers.onConversationId?.(parsed.conversationId);
  }

  if (typeof parsed.text === "string") {
    handlers.onText(parsed.text);
  }

  if (
    parsed.done === true &&
    typeof parsed.messageId === "string"
  ) {
    await handlers.onDone(parsed.messageId);
  }
};

const readSse = async (
  body: ReadableStream<Uint8Array>,
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<void> => {
  const reader = body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  try {
    while (true) {
      if (signal?.aborted) break;

      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE accepts both LF and CRLF line endings.
      const normalized = buffer.replace(/\r\n/g, "\n");
      const events = normalized.split("\n\n");

      buffer = events.pop() ?? "";

      for (const event of events) {
        await handleEvent(event, handlers);
      }
    }

    buffer += decoder.decode();

    if (buffer.trim()) {
      await handleEvent(
        buffer.replace(/\r\n/g, "\n"),
        handlers,
      );
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // The stream may already have been cancelled.
    }
  }
};

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

  try {
    let response = await postMessage(
      url,
      content,
      getAccessToken(),
      signal,
    );

    // If the access token expired, refresh and retry once.
    if (response.status === 401) {
      let accessToken: string;

      try {
        ({ accessToken } = await refreshUser());
      } catch {
        handlers.onError(
          "Your session has expired. Please log in again.",
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

    if (!response.ok) {
      handlers.onError(await readErrorMessage(response));
      return;
    }

    const contentType =
      response.headers.get("content-type") ?? "";

    // Clarification responses are JSON, not SSE.
    if (contentType.includes("application/json")) {
      await handleClarification(
        await response.json(),
        handlers,
      );
      return;
    }

    if (!response.body) {
      handlers.onError(
        "The server returned an empty response.",
      );
      return;
    }

    await readSse(response.body, handlers, signal);
  } catch (error) {
    if (signal?.aborted) return;

    handlers.onError(
      error instanceof TypeError
        ? "Network error. Check that the backend is running and try again."
        : error instanceof Error
          ? error.message
          : "Something went wrong while receiving the AI response.",
    );
  }
};
