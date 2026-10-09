import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "Explain recursion with a simple example",
  "Help me understand Big-O notation",
  "Quiz me on JavaScript closures",
  "Summarize how TCP handshakes work",
];

interface EmptyStateProps {
  onSelect: (text: string) => void;
  disabled: boolean;
}

export default function EmptyState({ onSelect, disabled }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex h-full flex-col items-center justify-center px-4 py-10 text-center"
    >
      <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-white/10">
        <Sparkles size={22} />
      </div>

      <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
        What are you learning today?
      </h2>

      <p className="mt-2 max-w-md text-sm text-gray-400">
        Ask anything. PointerAI adapts its explanations to you.
      </p>

      <div className="mt-8 grid w-full max-w-xl gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(s)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>
    </motion.div>
  );
}