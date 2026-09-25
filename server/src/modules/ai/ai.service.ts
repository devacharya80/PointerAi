import { getGroqChatCompletion } from "./providers/groq.provider.js";
import type { ChatMessage, AiResponse } from "./ai.types.js";

export const generateAiResponse = async (
  message: ChatMessage[],
): Promise<AiResponse> => {
  return await getGroqChatCompletion(message);
};
