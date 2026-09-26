import type { ChatMessage } from "../../ai/ai.types.js";
import type { WebSearchResult } from "./web.search.js";
import type { Message } from "../../../generated/prisma/client.js";

export interface ReadyToStreamResult {
  type: "ready_to_stream";
  conversationId: string;
  userMessage: Message;
  messages: ChatMessage[];
  webResults: WebSearchResult[];
}

export interface ClarificationResult {
  type: "clarification";
  conversationId: string;
  userMessage: Message;
  aiMessage: Message;
}