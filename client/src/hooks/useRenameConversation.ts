import { useMutation, useQueryClient } from "@tanstack/react-query";
import { renameConversation } from "../api/conversations";

export const useRenameConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      renameConversation(id, title),

    onSuccess: (updated) => {
      // Update the detail cache in place so the header changes immediately
      queryClient.setQueryData(
        ["conversation", updated.id],
        (old: { messages: unknown[] } | undefined) =>
          old ? { ...old, title: updated.title } : old,
      );

      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};