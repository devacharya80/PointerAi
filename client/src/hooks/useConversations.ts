import { useQuery } from "@tanstack/react-query";
import { getAllConversation, type Conversation } from "../api/conversation";

export const useConversations = () => {
  return useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: getAllConversation,
  });
};
