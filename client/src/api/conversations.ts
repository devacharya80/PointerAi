import { api } from "./axios";

export type MessageRole = "USER" | "ASSISTANT";

export type MessageType =
  | "NORMAL"
  | "CLARIFICATION_QUESTION";

export interface MessageSource {
  id: string;
  title: string;
  url: string;
  score: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  options: string[];
  createdAt: string;
  sources?: MessageSource[];
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
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
  message?: string;
  data: T;
}

type ApiMessage = Omit<Message, "sources"> & {
  source?: MessageSource[];
  sources?: MessageSource[];
};

type ApiConversationDetail = Omit<
  ConversationDetail,
  "messages"
> & {
  messages: ApiMessage[];
};

const normalizeMessage = ({
  source,
  sources,
  ...message
}: ApiMessage): Message => ({
  ...message,
  options: message.options ?? [],
  sources: sources ?? source ?? [],
});

export const getConversations = async (
  page = 1,
  limit = 50,
): Promise<ConversationsPage> => {
  const { data } = await api.get<
    Envelope<ConversationsPage>
  >("/conversations", {
    params: { page, limit },
  });

  return data.data;
};

export const getConversationDetail = async (
  conversationId: string,
): Promise<ConversationDetail> => {
  const { data } = await api.get<
    Envelope<ApiConversationDetail>
  >(`/conversations/${encodeURIComponent(conversationId)}`);

  return {
    ...data.data,
    messages: data.data.messages.map(normalizeMessage),
  };
};

export const deleteConversation = async (
  conversationId: string,
): Promise<void> => {
  await api.delete(
    `/conversations/${encodeURIComponent(conversationId)}`,
  );
};