import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";

interface ConversationItemProps {
  id: string;
  title: string;
  active: boolean;
  onNavigate: () => void;
}

export default function ConversationItem({
  id,
  title,
  active,
  onNavigate,
}: ConversationItemProps) {
  return (
    <Link
      to={`/chat/${id}`}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-white/10 text-white"
          : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
      }`}
    >
      <MessageSquare size={14} className="shrink-0 opacity-60" />
      <span className="truncate">{title || "Untitled"}</span>
    </Link>
  );
}