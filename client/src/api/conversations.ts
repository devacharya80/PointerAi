import { api } from "./axios";

export type MessageRole = "USER" | "ASSISTANT";
export type MessageType = "NORMAL" | "CLARIFICATION_QUESTION";

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  options: string[] | null;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ConversationsPage {
  conversations: Conversation[];
  pagination: Pagination;
}

export interface ConversationDetail extends Conversation {
  userId: string;
  messages: Message[];
}

interface Envelope<T> {
  message: string;
  data: T;
}

export const getConversations = async (
  page = 1,
  limit = 20,
): Promise<ConversationsPage> => {
  const { data } = await api.get<Envelope<ConversationsPage>>("/conversations", {
    params: { page, limit },
  });
  return data.data;
};

export const getConversationDetail = async (
  conversationId: string,
): Promise<ConversationDetail> => {
  const { data } = await api.get<Envelope<ConversationDetail>>(
    `/conversations/${conversationId}`,
  );
  return data.data;
};