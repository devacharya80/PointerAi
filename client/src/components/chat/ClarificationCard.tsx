import { memo } from "react";
import { motion } from "motion/react";

import AssistantAvatar from "./AssistantAvatar";

interface ClarificationCardProps {
  question: string;
  options: string[];
  disabled: boolean;
  onSelect: (option: string) => void;
}

function ClarificationCardComponent({
  question,
  options,
  disabled,
  onSelect,
}: ClarificationCardProps) {
  return (
    <div className="flex w-full gap-3">
      <AssistantAvatar />

      <div className="min-w-0 max-w-full flex-1 space-y-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
        <p className="text-[15px] leading-7 text-gray-100">
          {question}
        </p>

        {options.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <motion.button
                key={option}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(option)}
                whileTap={{ scale: 0.97 }}
                className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-2 text-sm text-blue-200 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {option}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ClarificationCardComponent);