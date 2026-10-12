import { Sparkles } from "lucide-react";

export default function AssistantAvatar() {
  return (
    <div
      aria-label="PointerAI"
      className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-200"
    >
      <Sparkles size={15} />
    </div>
  );
}