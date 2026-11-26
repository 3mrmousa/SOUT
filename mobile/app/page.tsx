"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function MobileEntryPage() {
  const { data: user, isPending } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;
    if (!user) {
      router.replace("/login");
    } else {
      router.replace("/chat");
    }
  }, [user, isPending, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0b0d12]">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600" />
    </div>
  );
}
