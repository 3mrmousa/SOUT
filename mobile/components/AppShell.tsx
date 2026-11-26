"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import AddModal from "@/components/modals/AddModal";
import Sidebar from "@/components/Sidebar";
import { socket } from "@/lib/socket";
import { useSidebarStore } from "@/stores/useSidebarStore";

interface AppShellProps {
  children?: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: me, isPending } = useCurrentUser();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { isOpen: isSidebarOpen, toggle: toggleSidebar } = useSidebarStore();

  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const APP_SHELL_ROUTES = new Set(["/chat"]);
  const isStandalonePage = !APP_SHELL_ROUTES.has(normalizedPath);

  useEffect(() => {
    if (isPending) return;

    if (!me && !isStandalonePage) {
      router.replace("/login");
    }
  }, [isPending, me, isStandalonePage, router]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsAddOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleSidebar]);

  useEffect(() => {
    if (me) {
      if (!socket.connected) {
        socket.connect();
      }
    } else {
      socket.disconnect();
    }

    return () => {
      socket.disconnect();
    };
  }, [me]);

  useEffect(() => {
    const handleForceLogout = () => {
      socket.disconnect();
      localStorage.removeItem("lastActiveChat");
      window.location.assign("/login");
    };

    socket.on("force_logout", handleForceLogout);
    return () => {
      socket.off("force_logout", handleForceLogout);
    };
  }, []);

  if (isStandalonePage) {
    return <>{children}</>;
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b0d12]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        <div className="hidden" aria-hidden="true">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0d12] text-zinc-100">
      {/* 1. Fixed Top Navbar
      <header className="fixed top-0 left-0 right-0 h-15 bg-[#101218]/85 backdrop-blur-md border-b border-[#1f2937]/80 flex items-center justify-between px-6 z-50">
        <div className="flex items-center justify-between w-full">
          <Link
            href="/"
            className="flex items-center gap-0.5 group transition-all duration-200 select-none cursor-pointer"
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute -inset-1 rounded-xl bg-linear-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <img
                src="/logo-icon.svg"
                alt="SOUT Logo"
                className="w-9 h-9 object-contain drop-shadow-[0_0_10px_rgba(168,85,247,0.4)] transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <span className="font-black text-2xl tracking-wider text-white group-hover:text-purple-300 transition-colors duration-200">
              OUT
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="bg-purple-500 w-2.5 h-2.5 rounded-full animate-ping" />
            <p className="text-base font-semibold text-purple-500">34</p>
          </div>
        </div>
      </header> */}

      {/* 2. Fixed Left Sidebar */}
      <Sidebar isAddOpen={isAddOpen} onOpenAdd={() => setIsAddOpen(true)} />

      <main
        className={`pt-0 ${isSidebarOpen ? "md:pl-50" : "pl-0"} w-full h-screen overflow-hidden flex flex-col transition-all duration-300 ease-in-out`}
      >
        {children}
      </main>

      {/* 4. Add Contact Modal */}
      <AddModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}
