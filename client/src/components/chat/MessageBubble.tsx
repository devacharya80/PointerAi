import { memo } from "react";

import {
  BookOpen,
  ExternalLink,
  Globe,
} from "lucide-react";

import type {
  MessageSource,
} from "../../api/conversations";

import AssistantAvatar from "./AssistantAvatar";
import MarkdownContent from "./MarkdownContent";

interface MessageBubbleProps {
  role: "USER" | "ASSISTANT";
  content: string;
  pending?: boolean;
  sources?: MessageSource[];
}

function safeHttpUrl(value: string): string | null {
  try {
    const url = new URL(value);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

function getDomain(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

function MessageBubbleComponent({
  role,
  content,
  pending = false,
  sources = [],
}: MessageBubbleProps) {
  const isUser = role === "USER";

  const validSources = sources
    .map((source) => ({
      ...source,
      safeUrl: safeHttpUrl(source.url),
    }))
    .filter(
      (
        source,
      ): source is MessageSource & { safeUrl: string } =>
        source.safeUrl !== null,
    );

  return (
    <div
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
          className={`min-w-0 max-w-full flex-1 pt-0.5 ${
            pending ? "opacity-70" : ""
          }`}
        >
          <MarkdownContent content={content} />

          {validSources.length > 0 && (
            <section
              aria-label="Sources used for this answer"
              className="mt-6 border-t border-white/10 pt-4"
            >
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-300">
                <BookOpen size={16} />
                Sources
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400">
                  {validSources.length}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {validSources.map((source, index) => (
                  <a
                    key={source.id || source.safeUrl}
                    href={source.safeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex min-w-0 items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-colors hover:border-white/20 hover:bg-white/[0.07]"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-gray-300">
                      <Globe size={17} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 break-words text-sm font-medium leading-5 text-gray-200 group-hover:text-white">
                        {source.title || `Source ${index + 1}`}
                      </p>

                      <p className="mt-1 truncate text-xs text-gray-500">
                        {getDomain(source.safeUrl)}
                      </p>
                    </div>

                    <ExternalLink
                      size={14}
                      className="mt-0.5 shrink-0 text-gray-500 group-hover:text-gray-200"
                    />
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(MessageBubbleComponent);