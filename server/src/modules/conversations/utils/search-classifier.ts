import { generateAiResponse } from "../../ai/ai.service.js";
import type { ChatMessage } from "../../ai/ai.types.js";

export const shouldSearchWeb = async (
  recentMessages: ChatMessage[],
  currentMessage: string
): Promise<boolean> => {
  const classificationMessages: ChatMessage[] = [
    {
      role: "system",
      content: `You are a classifier. Based on the conversation context and the latest user message, determine if answering requires current or real-time information that you might not know (e.g. recent events, current prices, latest versions, today's date-related facts).

Respond with ONLY the word "true" or "false" — nothing else.`,
    },
    ...recentMessages,
    {
      role: "user",
      content: currentMessage,
    },
  ];

  const response = await generateAiResponse(
    classificationMessages,
    "openai/gpt-oss-20b"
  );

  return response.message.trim().toLowerCase() === "true";
};