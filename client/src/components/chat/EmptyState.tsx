import { memo } from "react";
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

function EmptyStateComponent({
  onSelect,
  disabled,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex min-h-full flex-col items-center justify-center px-4 py-10 text-center"
    >
      <div className="mb-5 flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        <Sparkles size={22} />
      </div>

      <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
        What are you learning today?
      </h2>

      <p className="mt-3 max-w-md text-sm leading-6 text-gray-400">
        Ask a question, explore an idea, or get help understanding
        a difficult programming concept.
      </p>

      <div className="mt-8 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(suggestion)}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm leading-6 text-gray-300 transition hover:border-white/20 hover:bg-white/[0.07] disabled:opacity-50"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export default memo(EmptyStateComponent);