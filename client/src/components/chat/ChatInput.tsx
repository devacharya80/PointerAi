import {
  useLayoutEffect,
  useRef,
  type KeyboardEvent,
} from "react";

import { motion } from "motion/react";
import { ArrowUp } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

const MAX_LENGTH = 1000;

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend =
    !disabled &&
    value.trim().length > 0 &&
    value.length <= MAX_LENGTH;

  useLayoutEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";

    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      160,
    )}px`;
  }, [value]);

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();

      if (canSend) {
        onSubmit();
      }
    }
  };

  return (
    <div className="shrink-0 border-t border-white/5 bg-black px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:px-6">
      <form
        onSubmit={(event) => {
          event.preventDefault();

          if (canSend) onSubmit();
        }}
        className="mx-auto flex max-w-4xl items-end gap-2 rounded-2xl border border-white/10 bg-[#1a1a1a] p-2 transition-colors focus-within:border-white/25"
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={MAX_LENGTH}
          disabled={disabled}
          aria-label="Message"
          placeholder="Ask anything you're learning..."
          className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-[15px] leading-6 text-white outline-none placeholder:text-gray-500 disabled:opacity-50"
        />

        <div className="flex shrink-0 flex-col items-end gap-1">
          {value.length > 800 && (
            <span
              className={`px-1 text-[10px] ${
                value.length >= MAX_LENGTH
                  ? "text-amber-400"
                  : "text-gray-500"
              }`}
            >
              {value.length}/{MAX_LENGTH}
            </span>
          )}

          <motion.button
            type="submit"
            disabled={!canSend}
            whileTap={{ scale: 0.94 }}
            aria-label="Send message"
            className="flex size-10 items-center justify-center rounded-xl bg-white text-black transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-gray-500"
          >
            <ArrowUp size={18} />
          </motion.button>
        </div>
      </form>

      <p className="mx-auto mt-2 max-w-4xl text-center text-[11px] text-gray-600">
        PointerAI can make mistakes. Verify important information.
      </p>
    </div>
  );
}