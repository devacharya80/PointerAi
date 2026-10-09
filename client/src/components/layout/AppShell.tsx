
import { useEffect, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  type Variants,
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

const overlayVariants: Variants = {
  closed: {
    opacity: 0,
    transition: { duration: 0.16 },
  },
  open: {
    opacity: 1,
    transition: { duration: 0.16 },
  },
};

const drawerVariants: Variants = {
  closed: {
    x: "-100%",
    transition: { duration: 0.2, ease: "easeIn" },
  },
  open: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 320,
      damping: 34,
    },
  },
};

export default function AppShell({
  sidebar,
  children,
}: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () =>
      typeof window === "undefined"
        ? true
        : window.matchMedia("(min-width: 768px)").matches,
  );

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () =>
    setIsSidebarOpen((open) => !open);

  useEffect(() => {
    if (!isSidebarOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSidebar();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () =>
      window.removeEventListener("keydown", onKeyDown);
  }, [isSidebarOpen]);

  return (
    <div className="flex h-dvh overflow-hidden bg-black text-gray-100">
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <>
            {/* Desktop sidebar */}
            <motion.aside
              key="desktop-sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 288, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
              className="relative hidden h-full shrink-0 overflow-hidden border-r border-white/5 bg-[#0f0f0f] md:block"
            >
              <div className="h-full w-72">
                {sidebar({ onNavigate: closeSidebar })}
              </div>
            </motion.aside>

            {/* Mobile sidebar drawer */}
            <motion.div
              key="mobile-drawer"
              className="fixed inset-0 z-50 md:hidden"
              variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <button
                type="button"
                aria-label="Close sidebar overlay"
                onClick={closeSidebar}
                className="absolute inset-0 h-full w-full cursor-default bg-black/70 backdrop-blur-sm"
              />

              <motion.aside
                variants={drawerVariants}
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
          </>
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
