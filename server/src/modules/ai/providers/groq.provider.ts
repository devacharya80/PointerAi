import "dotenv/config";
import Groq from "groq-sdk";
import type { ChatMessage, AiResponse, GenerateAiResponseOptions } from "../ai.types.js";
import { AppError } from "../../../lib/AppError.js";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY, // This is the default and can be omitted
});

export const getGroqChatCompletion = async (
  messages: ChatMessage[],
  model : string = "openai/gpt-oss-20b",
  options? : GenerateAiResponseOptions
): Promise<AiResponse> => {
  const chatCompletion = await client.chat.completions.create({
    messages,
    model: model,
    response_format: options?.responseFormat
  });
  const responseMessage = chatCompletion.choices[0]?.message?.content;
  if (!responseMessage) {
    throw new AppError("No response from Groq",500);
  }

  return {
    message: responseMessage,
    model: chatCompletion.model,
    usage: {
      promptTokens: chatCompletion.usage?.prompt_tokens ?? 0,
      completionTokens: chatCompletion.usage?.completion_tokens ?? 0,
      totalTokens: chatCompletion.usage?.total_tokens ?? 0,
    },
  };
};

// getGroqChatCompletion({role:"user",content:"hi"})
// model: "openai/gpt-oss-20b"