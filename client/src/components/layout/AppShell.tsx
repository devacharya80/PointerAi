import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { X } from "lucide-react";

interface AppShellProps {
  sidebar: (props: { onNavigate: () => void }) => ReactNode;
  children: (props: { openSidebar: () => void }) => ReactNode;
}

const overlayVariants: Variants = {
  closed: { opacity: 0, transition: { duration: 0.2 } },
  open: { opacity: 1, transition: { duration: 0.2 } },
};

const drawerVariants: Variants = {
  closed: { x: "-100%", transition: { duration: 0.2, ease: "easeIn" } },
  open: {
    x: 0,
    transition: { type: "spring", stiffness: 320, damping: 34 },
  },
};

export default function AppShell({ sidebar, children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Escape closes the drawer
  useEffect(() => {
    if (!isSidebarOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSidebarOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSidebarOpen]);

  return (
    <div className="flex h-dvh overflow-hidden bg-black text-gray-100">
      {/* Desktop sidebar: always visible from md up */}
      <aside className="hidden w-72 shrink-0 border-r border-white/5 bg-[#0f0f0f] md:flex">
        {sidebar({ onNavigate: () => {} })}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            key="mobile-drawer"
            className="fixed inset-0 z-50 md:hidden"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={closeSidebar}
            />

            <motion.aside
              variants={drawerVariants}
              className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-white/5 bg-[#0f0f0f]"
            >
              <button
                type="button"
                onClick={closeSidebar}
                aria-label="Close menu"
                className="absolute right-3 top-4 rounded-md p-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>

              {sidebar({ onNavigate: closeSidebar })}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex min-w-0 flex-1 flex-col">
        {children({ openSidebar })}
      </main>
    </div>
  );
}