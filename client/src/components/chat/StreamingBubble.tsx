
import { motion } from "motion/react";
import AssistantAvatar from "./AssistantAvatar";
import MarkdownContent from "./MarkdownContent";

interface StreamingBubbleProps {
  text: string;
}

export default function StreamingBubble({
  text,
}: StreamingBubbleProps) {
  return (
    <div className="flex w-full justify-start gap-3">
      <AssistantAvatar />

      <div className="min-w-0 max-w-full flex-1 pt-0.5 md:max-w-full">
        {text ? (
          <MarkdownContent content={text} streaming />
        ) : (
          <span className="flex gap-1.5 pt-3">
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
