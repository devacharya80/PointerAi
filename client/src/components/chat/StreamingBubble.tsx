import { motion } from "motion/react";
import AssistantAvatar from "./AssistantAvatar";

interface StreamingBubbleProps {
  text: string;
}

export default function StreamingBubble({ text }: StreamingBubbleProps) {
  return (
    <div className="flex w-full justify-start gap-3">
      <AssistantAvatar />

      <div className="min-w-0 max-w-[85%] whitespace-pre-wrap break-words pt-0.5 text-[15px] leading-relaxed text-gray-100 md:max-w-[75%]">
        {text ? (
          <>
            {text}
            <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-gray-300" />
          </>
        ) : (
          <span className="flex gap-1.5 pt-2">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="size-1.5 rounded-full bg-gray-400"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </span>
        )}
      </div>
    </div>
  );
}