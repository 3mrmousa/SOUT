"use client";

import { PanelLeftClose } from "lucide-react";
import SidebarNav from "@/components/SidebarNav";
import SidebarProfile from "@/components/SidebarProfile";
import { useSidebarStore } from "@/stores/useSidebarStore";

interface SidebarProps {
  isAddOpen: boolean;
  onOpenAdd: () => void;
}

export default function Sidebar({ isAddOpen, onOpenAdd }: SidebarProps) {
  const isOpen = useSidebarStore((s) => s.isOpen);
  const close = useSidebarStore((s) => s.close);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-[80%] md:w-50 bg-[#090b10] border-r border-[#1f2937] p-3 z-40 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1f2937]/80">
            <img
              src="/logo.svg"
              alt="SOUT"
              className="h-7 w-auto object-contain"
            />

            <button
              type="button"
              onClick={close}
              title="Close sidebar"
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition cursor-pointer md:hidden"
              aria-label="Close sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation & Contacts */}
          <SidebarNav isAddOpen={isAddOpen} onOpenAdd={onOpenAdd} />
        </div>

        <SidebarProfile />
      </aside>
    </>
  );
}
