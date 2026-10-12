import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteConversation } from "../api/conversations";

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => deleteConversation(conversationId),

    onSuccess: (_data, conversationId) => {
      queryClient.removeQueries({ queryKey: ["conversation", conversationId] });
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};