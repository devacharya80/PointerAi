import { Menu } from "lucide-react";

interface ChatHeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function ChatHeader({ title, onMenuClick }: ChatHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/5 bg-black/80 px-4 backdrop-blur md:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="rounded-md p-1.5 text-gray-400 hover:bg-white/5 hover:text-white md:hidden"
      >
        <Menu size={20} />
      </button>

      <h1 className="min-w-0 truncate text-sm font-medium text-gray-200">
        {title}
      </h1>
    </header>
  );
}