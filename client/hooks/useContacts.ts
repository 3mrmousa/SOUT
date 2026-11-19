import { useQuery } from "@tanstack/react-query";
import {
  conversationClient,
  SafeUser,
} from "@/features/conversation/clientIndex";

export function useContacts() {
  return useQuery<SafeUser[]>({
    queryKey: ["contacts"],
    queryFn: async () => {
      const res = await conversationClient.getMyContacts();
      return res.data?.contacts ?? [];
    },
  });
}
