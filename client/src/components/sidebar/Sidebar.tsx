
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ChevronDown,
  LogOut,
  UserRound,
} from "lucide-react";
import { useConversations } from "../../hooks/useConversations";
import { useAuth } from "../../context/AuthContext";
import NewChatButton from "./NewChatButton";
import ConversationItem from "./ConversationItem";

interface SidebarProps {
  activeId?: string;
  onNavigate: () => void;
}

export default function Sidebar({
  activeId,
  onNavigate,
}: SidebarProps) {
  const { data, isLoading, isError } = useConversations();
  const { user, logout } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const conversations = data?.conversations ?? [];

  const displayName = useMemo(() => {
    const fullName = [
      user?.firstName,
      user?.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    return (
      fullName ||
      user?.email?.split("@")[0] ||
      "User"
    );
  }, [user]);

  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();
      window.location.assign("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex h-full w-full min-w-0 flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 pb-4 pt-5 pr-12">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-black">
          P
        </div>

        <span className="text-sm font-semibold tracking-tight text-white">
          PointerAI
        </span>
      </div>

      {/* New chat */}
      <div className="px-3 pb-4">
        <NewChatButton onNavigate={onNavigate} />
      </div>

      <p className="px-5 pb-2 text-[11px] font-medium uppercase tracking-wider text-gray-500">
        Recent
      </p>

      {/* Conversation history */}
      <nav
        aria-label="Recent conversations"
        className="min-h-0 flex-1 overflow-y-auto px-2 pb-4"
      >
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

        {!isLoading &&
          !isError &&
          conversations.length === 0 && (
            <p className="px-3 text-sm text-gray-500">
              No conversations yet.
            </p>
          )}

        <ul className="space-y-0.5">
          {conversations.map((conversation, index) => (
            <motion.li
              key={conversation.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.16,
                delay: Math.min(index, 8) * 0.02,
              }}
            >
              <ConversationItem
                id={conversation.id}
                title={conversation.title}
                active={conversation.id === activeId}
                onNavigate={onNavigate}
              />
            </motion.li>
          ))}
        </ul>
      </nav>

      {/* User profile */}
      <div className="relative mt-auto border-t border-white/10 p-2">
        {profileOpen && (
          <div className="absolute bottom-[calc(100%+0.5rem)] left-2 right-2 z-30 overflow-hidden rounded-xl border border-white/10 bg-[#202020] p-1 shadow-2xl">
            <div className="px-3 py-3">
              <p className="truncate text-sm font-medium text-white">
                {displayName}
              </p>

              <p className="mt-1 truncate text-xs text-gray-400">
                {user?.email ?? "Signed in"}
              </p>
            </div>

            <div className="my-1 border-t border-white/10" />

            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-gray-200 hover:bg-white/5 disabled:opacity-50"
            >
              <LogOut size={15} />
              {loggingOut ? "Signing out..." : "Log out"}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            setProfileOpen((open) => !open)
          }
          aria-expanded={profileOpen}
          className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-white/5"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-indigo-200">
            {initials || <UserRound size={17} />}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-100">
              {displayName}
            </p>

            <p className="truncate text-xs text-gray-500">
              {user?.email ?? "Signed in"}
            </p>
          </div>

          <ChevronDown
            size={16}
            className={`shrink-0 text-gray-500 transition-transform ${
              profileOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
}
