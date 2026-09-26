export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface AiResponse {
  message: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export type GenerateAiResponseOptions = {
    responseFormat : { 
        type : 'json_object'
    }
}