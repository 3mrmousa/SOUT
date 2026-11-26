import { useQuery } from "@tanstack/react-query";
import {
  conversationClient,
  Conversation,
} from "@/features/conversation/clientIndex";

export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await conversationClient.getMyConversations();
      return res.data?.conversations ?? [];
    },
  });
}
