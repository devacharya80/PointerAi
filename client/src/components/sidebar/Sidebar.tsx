import { motion } from "motion/react";
import { useConversations } from "../../hooks/useConversations";
import NewChatButton from "./NewChatButton";
import ConversationItem from "./ConversationItem";

interface SidebarProps {
  activeId?: string;
  onNavigate: () => void;
}

export default function Sidebar({ activeId, onNavigate }: SidebarProps) {
  const { data, isLoading, isError } = useConversations();
  const conversations = data?.conversations ?? [];

  return (
    <div className="flex h-full w-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 pb-4 pt-5 pr-12">
        <div className="flex size-7 items-center justify-center rounded-lg bg-white text-xs font-bold text-black">
          P
        </div>
        <span className="text-sm font-semibold tracking-tight text-white">
          PointerAI
        </span>
      </div>

      <div className="px-3 pb-4">
        <NewChatButton onNavigate={onNavigate} />
      </div>

      <p className="px-5 pb-2 text-[11px] font-medium uppercase tracking-wider text-gray-500">
        Recent
      </p>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {isLoading && (
          <div className="space-y-2 px-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-9 animate-pulse rounded-lg bg-white/5"
              />
            ))}
          </div>
        )}

        {isError && (
          <p className="px-3 text-sm text-red-400">
            Couldn't load conversations.
          </p>
        )}

        {!isLoading && !isError && conversations.length === 0 && (
          <p className="px-3 text-sm text-gray-500">No conversations yet.</p>
        )}

        <ul className="space-y-0.5">
          {conversations.map((c, i) => (
            <motion.li
              key={c.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: Math.min(i, 8) * 0.03 }}
            >
              <ConversationItem
                id={c.id}
                title={c.title}
                active={c.id === activeId}
                onNavigate={onNavigate}
              />
            </motion.li>
          ))}
        </ul>
      </nav>
    </div>
  );
}