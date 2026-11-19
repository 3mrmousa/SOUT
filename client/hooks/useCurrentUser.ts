import { useQuery } from "@tanstack/react-query";
import { authClient, SafeUser } from "@/features/clientIndex";

export function useCurrentUser() {
  return useQuery<SafeUser | null>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const res = await authClient.getMe();
        const user = res.data?.user;
        if (!user) return null;

        const img = (user as any).image || user.profileImage || null;
        return {
          ...user,
          image: img,
          profileImage: img,
        };
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
}
