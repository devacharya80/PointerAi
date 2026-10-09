import type { KeyboardEvent } from "react";
import { motion } from "motion/react";
import { ArrowUp } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: ChatInputProps) {
  const canSend = !disabled && value.trim().length > 0;

  // Enter sends, Shift+Enter adds a new line
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSubmit();
    }
  };

  return (
    <div className="shrink-0 border-t border-white/5 bg-black px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:px-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSend) onSubmit();
        }}
        className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-white/10 bg-[#1a1a1a] p-2 transition-colors focus-within:border-white/25"
      >
        <textarea
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask anything you're learning..."
          className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-[15px] text-white outline-none placeholder:text-gray-500 disabled:opacity-50"
        />

        <motion.button
          type="submit"
          disabled={!canSend}
          whileTap={{ scale: 0.92 }}
          aria-label="Send message"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-gray-500"
        >
          <ArrowUp size={18} />
        </motion.button>
      </form>
    </div>
  );
}