import { userClient } from "@/features/clientIndex";
import { useQuery } from "@tanstack/react-query";

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ["search-users", query],
    queryFn: async () =>
      (await userClient.searchUsers(query)).data?.users ?? [],
    enabled: query.length > 0,
  });
}
