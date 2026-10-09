import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

interface NewChatButtonProps {
  onNavigate: () => void;
}

export default function NewChatButton({ onNavigate }: NewChatButtonProps) {
  return (
    <Link
      to="/chat"
      onClick={onNavigate}
      className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-gray-100 transition hover:bg-white/10"
    >
      <Plus size={16} />
      New chat
    </Link>
  );
}