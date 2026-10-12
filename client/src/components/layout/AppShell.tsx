import { useEffect, useState, type ReactNode } from "react";

import {
  AnimatePresence,
  motion,
} from "motion/react";

import { X } from "lucide-react";

interface AppShellProps {
  sidebar: (props: {
    onNavigate: () => void;
  }) => ReactNode;

  children: (props: {
    openSidebar: () => void;
    closeSidebar: () => void;
    toggleSidebar: () => void;
    isSidebarOpen: boolean;
  }) => ReactNode;
}

export default function AppShell({
  sidebar,
  children,
}: AppShellProps) {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches,
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches,
  );

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  const toggleSidebar = () =>
    setIsSidebarOpen((open) => !open);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");

    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
      setIsSidebarOpen(!event.matches);
    };

    media.addEventListener("change", handleChange);

    return () =>
      media.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!isSidebarOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen]);

  return (
    <div className="flex h-dvh overflow-hidden bg-black text-gray-100">
      <AnimatePresence initial={false}>
        {!isMobile && isSidebarOpen && (
          <motion.aside
            key="desktop-sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 288, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
            className="h-full shrink-0 overflow-hidden border-r border-white/5 bg-[#0f0f0f]"
          >
            <div className="h-full w-72">
              {sidebar({ onNavigate: closeSidebar })}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            key="mobile-sidebar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <button
              type="button"
              aria-label="Close sidebar overlay"
              onClick={closeSidebar}
              className="absolute inset-0 size-full bg-black/70 backdrop-blur-sm"
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 34,
              }}
              className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-white/5 bg-[#0f0f0f]"
            >
              <button
                type="button"
                onClick={closeSidebar}
                aria-label="Close menu"
                className="absolute right-3 top-4 z-10 rounded-md p-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>

              {sidebar({ onNavigate: closeSidebar })}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex min-w-0 flex-1 flex-col">
        {children({
          openSidebar,
          closeSidebar,
          toggleSidebar,
          isSidebarOpen,
        })}
      </main>
    </div>
  );
}