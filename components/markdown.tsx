import { memo, useCallback, useState } from "react";
import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useTheme } from "next-themes";
import { Check, Clipboard } from "lucide-react";

function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  const { resolvedTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  const match = /language-(\w+)/.exec(className ?? "");
  const language = match ? match[1] : "";
  const code = String(children).trim();
  const isDark = resolvedTheme === "dark";

  const copyCode = useCallback(() => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div className="my-4 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center justify-between bg-zinc-100 px-3 py-1.5 dark:bg-zinc-800">
        <span className="font-mono text-xs text-zinc-600 dark:text-zinc-300">
          {language || "text"}
        </span>
        <button
          type="button"
          onClick={copyCode}
          className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
          aria-label="Копировать код"
        >
          {copied ? <Check size={16} className="text-green-500" /> : <Clipboard size={16} />}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={isDark ? vscDarkPlus : vs}
        customStyle={{
          margin: 0,
          padding: "1rem",
          fontSize: "0.875rem",
          overflowX: "auto",
          maxWidth: "100%",
        }}
        codeTagProps={{ style: { whiteSpace: "pre", wordBreak: "keep-all" } }}
        PreTag="div"
        wrapLongLines={false}
        wrapLines={false}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

const components: Components = {
  code({ className, children, ...props }) {
    if (className) {
      return <CodeBlock className={className}>{children}</CodeBlock>;
    }

    return (
      <code
        className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm dark:bg-zinc-800"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => <div className="overflow-x-auto">{children}</div>,
  a: ({ children, href }) => (
    <Link
      href={href ?? "#"}
      target="_blank"
      rel="noreferrer"
      className="text-blue-500 hover:underline"
    >
      {children}
    </Link>
  ),
  h1: ({ children }) => <h1 className="mb-2 mt-6 text-3xl font-semibold">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-2 mt-6 text-2xl font-semibold">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2 mt-6 text-xl font-semibold">{children}</h3>,
  h4: ({ children }) => <h4 className="mb-2 mt-6 text-lg font-semibold">{children}</h4>,
  h5: ({ children }) => <h5 className="mb-2 mt-6 text-base font-semibold">{children}</h5>,
  h6: ({ children }) => <h6 className="mb-2 mt-6 text-sm font-semibold">{children}</h6>,
  ul: ({ children }) => <ul className="ml-4 list-disc">{children}</ul>,
  ol: ({ children }) => <ol className="ml-4 list-decimal">{children}</ol>,
  li: ({ children }) => <li className="py-1">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
};

function NonMemoizedMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
}

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);