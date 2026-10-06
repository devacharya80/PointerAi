import { api } from "./axios";

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export const getAllConversation = async (): Promise<Conversation[]> => {
  const response = await api.get("/conversations");

  return response.data.data.conversations;
};