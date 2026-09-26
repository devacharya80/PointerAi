import { getGroqChatCompletion } from "./providers/groq.provider.js";
import type { ChatMessage, AiResponse } from "./ai.types.js";

export const generateAiResponse = async (
  messages: ChatMessage[],
  model?: string
): Promise<AiResponse> => {
  return getGroqChatCompletion(messages, model);
};