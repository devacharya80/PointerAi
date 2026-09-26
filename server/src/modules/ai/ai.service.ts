import { getGroqChatCompletion, getGroqChatCompletionStream } from "./providers/groq.provider.js";
import type { ChatMessage, AiResponse } from "./ai.types.js";
import type { GenerateAiResponseOptions } from "./ai.types.js";

export const generateAiResponse = async (
  messages: ChatMessage[],
  model?: string,
  options? : GenerateAiResponseOptions
): Promise<AiResponse> => {
  return getGroqChatCompletion(messages, model, options);
};

export const generateAiResponseStream = async (
  messages: ChatMessage[],
  model?: string
) => {
  return getGroqChatCompletionStream(messages, model);
};