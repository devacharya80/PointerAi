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
  // Meaning: "the active conversation is this ID"
  onConversationId?: (id: string) => void;
  onDone: (messageId: string) => void;
  onError: (message: string) => void;
  onClarification?: (data: ClarificationData) => void;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isClarificationData = (value: unknown): value is ClarificationData =>
  isRecord(value) &&
  typeof value.type === "string" &&
  typeof value.conversationId === "string" &&
  isRecord(value.userMessage) &&
  isRecord(value.aiMessage);

const buildUrl = (conversationId?: string): string => {
  const base = import.meta.env.VITE_BACKEND_URL;
  return conversationId
    ? `${base}/conversations/${conversationId}/messages`
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
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ content }),
  });

const readErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data: unknown = await response.json();
    if (isRecord(data) && typeof data.message === "string") {
      return data.message;
    }
  } catch {
    // Body was not JSON
  }
  return "Something went wrong.";
};

const handleClarification = (raw: unknown, handlers: StreamHandlers): void => {
  // Backend sends { data: ClarificationResult }
  if (!isRecord(raw) || !isClarificationData(raw.data)) {
    handlers.onError("Invalid clarification response.");
    return;
  }

  const clarification = raw.data;
  handlers.onConversationId?.(clarification.conversationId);
  handlers.onClarification?.(clarification);
};

const handleEvent = (rawEvent: string, handlers: StreamHandlers): void => {
  let eventType: string | undefined;
  let data: string | undefined;

  for (const line of rawEvent.split("\n")) {
    if (line.startsWith("event:")) {
      eventType = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      data = line.slice(5).replace(/^ /, "");
    }
  }

  if (data === undefined) return;

  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch {
    handlers.onError(
      eventType === "error" ? data : "Failed to parse server event.",
    );
    return;
  }

  if (eventType === "error") {
    handlers.onError(
      isRecord(parsed) && typeof parsed.message === "string"
        ? parsed.message
        : "Server stream error.",
    );
    return;
  }

  if (!isRecord(parsed)) return;

  if (typeof parsed.text === "string") {
    handlers.onText(parsed.text);
  }

  if (typeof parsed.conversationId === "string") {
    handlers.onConversationId?.(parsed.conversationId);
  }

  if (parsed.done === true && typeof parsed.messageId === "string") {
    handlers.onDone(parsed.messageId);
  }
};

const readSse = async (
  body: ReadableStream<Uint8Array>,
  handlers: StreamHandlers,
): Promise<void> => {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Each SSE event ends with a blank line
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const event of events) {
      handleEvent(event, handlers);
    }
  }

  // Flush any bytes held by the decoder, then the final event
  buffer += decoder.decode();
  if (buffer.trim()) {
    handleEvent(buffer, handlers);
  }
};

export const streamMessage = async (
  content: string,
  conversationId: string | undefined,
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<void> => {
  const url = buildUrl(conversationId);

  try {
    let response = await postMessage(url, content, getAccessToken(), signal);

    // Access token expired: refresh once, then retry once
    if (response.status === 401) {
      let accessToken: string;

      try {
        ({ accessToken } = await refreshUser());
      } catch {
        handlers.onError("Session expired. Please log in again.");
        return;
      }

      response = await postMessage(url, content, accessToken, signal);
    }

    if (!response.ok) {
      handlers.onError(await readErrorMessage(response));
      return;
    }

    const contentType = response.headers.get("Content-Type") ?? "";

    if (contentType.includes("application/json")) {
      handleClarification(await response.json(), handlers);
      return;
    }

    if (!response.body) {
      handlers.onError("Empty response from server.");
      return;
    }

    await readSse(response.body, handlers);
  } catch (err) {
    // The user cancelled the stream. Not an error.
    if (signal?.aborted) return;

    handlers.onError(
      err instanceof TypeError
        ? "Network error. Check your connection and try again."
        : "Something went wrong.",
    );
  }
};