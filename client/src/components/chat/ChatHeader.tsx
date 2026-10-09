
import { Menu, PanelLeftClose } from "lucide-react";

interface ChatHeaderProps {
  title: string;
  onMenuClick: () => void;
  sidebarOpen?: boolean;
}

export default function ChatHeader({
  title,
  onMenuClick,
  sidebarOpen = true,
}: ChatHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/5 bg-black/90 px-4 backdrop-blur md:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        className="shrink-0 rounded-md p-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
      >
        {sidebarOpen ? (
          <PanelLeftClose
            size={19}
            className="hidden md:block"
          />
        ) : null}

        <Menu
          size={20}
          className={sidebarOpen ? "md:hidden" : "block"}
        />
      </button>

      <h1 className="min-w-0 truncate text-sm font-medium text-gray-200">
        {title}
      </h1>
    </header>
  );
}
