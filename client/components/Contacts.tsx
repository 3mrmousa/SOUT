"use client";

import { useContacts } from "@/hooks/useContacts";
import { useConversationStore } from "@/stores/useConversationStore";
import Avatar from "@/components/Avatar";

// chat list is rendered here
export default function Contacts() {
  const { data: contacts } = useContacts();
  const openChat = useConversationStore((s) => s.openChat);
  const selectedConversation = useConversationStore(
    (s) => s.selectedConversation,
  );
  const clearChat = useConversationStore((s) => s.clearChat);
  const onlineUsers = useConversationStore((s) => s.onlineUsers);

  return (
    <div className="flex-1">
      {contacts?.map((contact) => {
        const isActive =
          selectedConversation?.recipient?.username === contact.username;
        const isOnline = onlineUsers.includes(contact.id);
        return (
          <div
            onClick={() =>
              isActive ? clearChat() : openChat(contact.username)
            }
            className={`w-full flex items-center
           gap-3 px-2.5 py-2.5 cursor-pointer transition-all duration-200 rounded-lg
           ${isActive ? "bg-purple-500/20" : "hover:bg-zinc-800/60"}
           `}
            key={contact.id}
          >
            <div className="relative shrink-0">
              <Avatar
                src={contact.image?.secure_url}
                name={contact.name}
                size="md"
              />
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#101218]" />
              )}
            </div>
            <div className="flex flex-col">
              <p className="font-medium text-sm">{contact.name}</p>
              <p className="text-xs text-zinc-400">@{contact.username}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
