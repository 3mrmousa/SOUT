"use client";

import React from "react";
import { UserPlus } from "lucide-react";
import BranchedMenu, { BranchedMenuItem } from "@/components/BranchedMenu";
import Avatar from "@/components/Avatar";
import { useContacts } from "@/hooks/useContacts";
import { useConversationStore } from "@/stores/useConversationStore";

interface SidebarNavProps {
  isAddOpen: boolean;
  onOpenAdd: () => void;
}

export default function SidebarNav({ isAddOpen, onOpenAdd }: SidebarNavProps) {
  const { data: contacts } = useContacts();
  const openChat = useConversationStore((s) => s.openChat);
  const clearChat = useConversationStore((s) => s.clearChat);
  const selectedConversation = useConversationStore(
    (s) => s.selectedConversation,
  );
  const onlineUsers = useConversationStore((s) => s.onlineUsers);

  const activeUsername = selectedConversation?.recipient?.username ?? "";

  const items: BranchedMenuItem[] = [
    {
      label: "Contacts",
      children:
        contacts?.map((contact) => {
          const isOnline = onlineUsers.includes(contact.id);
          return {
            value: contact.username,
            label: contact.name,
            icon: (
              <div className="relative shrink-0">
                <Avatar
                  src={contact.image?.secure_url}
                  name={contact.name}
                  size="sm"
                  className="w-6 h-6 text-[10px]"
                />
                {isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#090b10]" />
                )}
              </div>
            ),
          };
        }) ?? [],
    },
    {
      value: "__add_contact__",
      label: "Add Contact",
      icon: <UserPlus className="w-3.5 h-3.5 text-purple-400" />,
    },
  ];

  const handleSelect = (value: string) => {
    if (value === "__add_contact__") {
      onOpenAdd();
      return;
    }

    if (value === activeUsername) {
      clearChat();
    } else {
      openChat(value);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 pr-1">
      <BranchedMenu
        items={items}
        defaultOpen={[0]}
        activeValue={activeUsername || (isAddOpen ? "__add_contact__" : "")}
        onSelect={handleSelect}
        color="#f4f4f5"
        accentColor="#a855f7"
        lineColor="#27272a"
        width={200}
        rowHeight={38}
        indent={32}
        trunk={12}
        radius={8}
        lineWidth={1.5}
        fontSize={13}
      />
    </div>
  );
}
