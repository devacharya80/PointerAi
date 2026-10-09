import { motion } from "motion/react";
import AssistantAvatar from "./AssistantAvatar";

interface ClarificationCardProps {
  question: string;
  options: string[];
  disabled: boolean;
  onSelect: (option: string) => void;
}

export default function ClarificationCard({
  question,
  options,
  disabled,
  onSelect,
}: ClarificationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex w-full gap-3"
    >
      <AssistantAvatar />

      <div className="min-w-0 max-w-[85%] flex-1 space-y-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 md:max-w-[75%]">
        <p className="text-[15px] leading-relaxed text-gray-100">{question}</p>

        {options.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <motion.button
                key={option}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(option)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-sm text-blue-200 transition-colors hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {option}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}