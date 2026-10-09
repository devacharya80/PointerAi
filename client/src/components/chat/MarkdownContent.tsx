import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownContentProps {
  content: string;
  streaming?: boolean;
}

export default function MarkdownContent({
  content,
  streaming = false,
}: MarkdownContentProps) {
  return (
    <div className="pointer-events-auto min-w-0 max-w-none text-[15px] leading-7 text-gray-100 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_a]:text-sky-400 [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-sky-300 [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-white/20 [&_blockquote]:pl-4 [&_blockquote]:text-gray-300 [&_code:not(pre_code)]:rounded-md [&_code:not(pre_code)]:bg-white/10 [&_code:not(pre_code)]:px-1.5 [&_code:not(pre_code)]:py-0.5 [&_code:not(pre_code)]:font-mono [&_code:not(pre_code)]:text-[0.9em] [&_h1]:mb-4 [&_h1]:mt-7 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_hr]:my-6 [&_hr]:border-white/15 [&_li]:my-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-3 [&_pre]:my-4 [&_strong]:font-semibold [&_strong]:text-white [&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_th]:bg-white/10 [&_th]:font-semibold [&_th]:text-white [&_td]:text-gray-200 [&_td]:align-top [&_td]:break-words [&_td]:border [&_td]:border-white/10 [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-white/10 [&_th]:px-3 [&_th]:py-2 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => (
            <a href={href} target="_blank" rel="noreferrer noopener" {...props}>
              {children}
            </a>
          ),
          pre: ({ children }) => <>{children}</>,
          code: ({ className, children }) => {
            const match = /language-([\w+#.-]+)/.exec(className || "");
            const source = String(children).replace(/\n$/, "");

            if (match) {
              return (
                <div className="group relative my-4 overflow-hidden rounded-xl border border-white/10 bg-[#111]">
                  <div className="flex h-9 items-center border-b border-white/10 bg-white/[0.04] px-3 text-xs text-gray-400">
                    <span>{match[1]}</span>

                    <button
                      type="button"
                      onClick={() =>
                        void navigator.clipboard?.writeText(source)
                      }
                      className="ml-auto rounded px-2 py-1 text-gray-400 hover:bg-white/10 hover:text-white"
                    >
                      Copy code
                    </button>
                  </div>

                  <SyntaxHighlighter
                    language={match[1]}
                    style={oneDark}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      padding: "1rem",
                      background: "transparent",
                      fontSize: "0.875rem",
                      lineHeight: "1.7",
                      overflowX: "auto",
                    }}
                    codeTagProps={{
                      style: {
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, monospace",
                      },
                    }}
                  >
                    {source}
                  </SyntaxHighlighter>
                </div>
              );
            }

            return <code className={className}>{children}</code>;
          },
        }}
      >
        {content}
      </ReactMarkdown>

      {streaming && (
        <span className="ml-1 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-gray-300" />
      )}
    </div>
  );
}
