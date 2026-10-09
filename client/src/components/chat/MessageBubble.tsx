
import { motion } from "motion/react";
import AssistantAvatar from "./AssistantAvatar";
import MarkdownContent from "./MarkdownContent";

interface MessageBubbleProps {
  role: "USER" | "ASSISTANT";
  content: string;
  pending?: boolean;
}

export default function MessageBubble({
  role,
  content,
  pending = false,
}: MessageBubbleProps) {
  const isUser = role === "USER";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex w-full gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && <AssistantAvatar />}

      {isUser ? (
        <div
          className={`min-w-0 max-w-[88%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-[#292929] px-4 py-3 text-[15px] leading-7 text-white md:max-w-[78%] ${
            pending ? "opacity-70" : ""
          }`}
        >
          {content}
        </div>
      ) : (
        <div
          className={`min-w-0 max-w-full flex-1 pt-0.5 md:max-w-full ${
            pending ? "opacity-70" : ""
          }`}
        >
          <MarkdownContent content={content} />
        </div>
      )}
    </motion.div>
  );
}
