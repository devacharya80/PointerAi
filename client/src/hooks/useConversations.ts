import { useQuery } from "@tanstack/react-query";
import { getConversations } from "../api/conversations";

export const useConversations = (page = 1, limit = 20) => {
return useQuery({
queryKey: ["conversations", page, limit],
queryFn: () => getConversations(page, limit),
});
};
