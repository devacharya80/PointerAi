import { motion } from "motion/react";
import AssistantAvatar from "./AssistantAvatar";

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
      transition={{ duration: 0.25 }}
      className={`flex w-full gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && <AssistantAvatar />}

      <div
        className={`min-w-0 max-w-[85%] whitespace-pre-wrap break-words text-[15px] leading-relaxed md:max-w-[75%] ${
          isUser
            ? "rounded-2xl rounded-br-md bg-[#2f2f2f] px-4 py-2.5 text-white"
            : "pt-0.5 text-gray-100"
        } ${pending ? "opacity-70" : ""}`}
      >
        {content}
      </div>
    </motion.div>
  );
}