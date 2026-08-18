"use client";

import type { Message as TMessage } from "ai";
import { AnimatePresence, motion } from "motion/react";
import { memo, useEffect, useState } from "react";
import equal from "fast-deep-equal";

import { Markdown } from "./markdown";
import { cn } from "@/lib/utils";
import { ChevronDownIcon, ChevronUpIcon, SparklesIcon } from "lucide-react";
import { SpinnerIcon } from "./icons";
import { useTheme } from "next-themes";

type ReasoningDetail = {
  type: "text" | "redacted";
  text?: string;
  data?: string;
  signature?: string;
};

type ReasoningPart = {
  type: "reasoning";
  reasoning: string;
  details: ReasoningDetail[];
};

function ReasoningMessagePart({
  part,
  isReasoning,
}: {
  part: ReasoningPart;
  isReasoning: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: "auto",
      opacity: 1,
      marginTop: "1rem",
      marginBottom: 0,
    },
  };

  useEffect(() => {
    setIsExpanded(isReasoning);
  }, [isReasoning]);

  return (
    <div className="flex flex-col">
      {isReasoning ? (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium text-sm">Reasoning</div>
          <div className="animate-spin">
            <SpinnerIcon />
          </div>
        </div>
      ) : (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium text-sm">Reasoned for a few seconds</div>
          <button
            className={cn(
              "cursor-pointer p-1 rounded-full dark:hover:bg-zinc-800 hover:bg-zinc-200",
              {
                "dark:bg-zinc-800 bg-zinc-200": isExpanded,
              },
            )}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronUpIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="reasoning"
            className="text-sm dark:text-zinc-400 text-zinc-600 flex flex-col gap-4 border-l pl-3 dark:border-zinc-800"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={variants}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {part.details.map((detail, detailIndex) => {
              if (detail.type === "text" && detail.text) {
                return <Markdown key={detailIndex}>{detail.text}</Markdown>;
              }
              return <div key={detailIndex}>{"<redacted>"}</div>;
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type ProcessedMessage =
  | { hasThinking: true; reasoningPart: ReasoningPart; remainingText: string }
  | { hasThinking: false; text: string };

function processThinkingTags(text: string): ProcessedMessage {
  const completeThinkRegex = /<thinking>([\s\S]*?)<\/thinking>/;
  const incompleteThinkRegex = /<thinking>([\s\S]*)$/;

  const completeMatch = text.match(completeThinkRegex);

  if (completeMatch) {
    const thinkingText = completeMatch[1].trim();
    const remainingText = text.replace(completeThinkRegex, "").trim();

    return {
      hasThinking: true,
      reasoningPart: {
        type: "reasoning",
        reasoning: "Reasoning from thinking tags",
        details: [{ type: "text", text: thinkingText }],
      },
      remainingText,
    };
  }

  const incompleteMatch = text.match(incompleteThinkRegex);

  if (incompleteMatch) {
    const thinkingText = incompleteMatch[1].trim();

    return {
      hasThinking: true,
      reasoningPart: {
        type: "reasoning",
        reasoning: "Reasoning in progress...",
        details: [{ type: "text", text: thinkingText }],
      },
      remainingText: "",
    };
  }

  return { hasThinking: false, text };
}

function AssistantAvatar() {
  const [mounted, setMounted] = useState(false);
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? (theme === "system" ? systemTheme : theme) : "light";
  const isDark = currentTheme === "dark";

  return (
    <div
      className={cn(
        "size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border",
        isDark ? "bg-white" : "bg-zinc-800",
      )}
    >
      <div className={isDark ? "text-zinc-800" : "text-white"}>
        <SparklesIcon size={14} />
      </div>
    </div>
  );
}

const PurePreviewMessage = ({
  message,
  isLatestMessage,
  status,
}: {
  message: TMessage;
  status: "error" | "submitted" | "streaming" | "ready";
  isLatestMessage: boolean;
}) => {
  const [isReasoning, setIsReasoning] = useState(false);
  const [thinking, setThinking] = useState<ReasoningPart | null>(null);
  const [visibleText, setVisibleText] = useState<string>(message.content);

  useEffect(() => {
    const processed = processThinkingTags(message.content);

    if (!processed.hasThinking) {
      setIsReasoning(false);
      setThinking(null);
      setVisibleText(processed.text);
      return;
    }

    const activelyReasoning = status === "streaming" && isLatestMessage;
    setIsReasoning(activelyReasoning);
    setThinking(processed.reasoningPart);
    setVisibleText(processed.remainingText);
  }, [message.content, status, isLatestMessage]);

  const avatar = message.role === "user" ? (
    <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path d="M230.92 212c-15.23-26.33-38.7-45.21-66.09-54.16a72 72 0 1 0-73.66 0c-27.39 8.94-50.86 27.82-66.09 54.16a8 8 0 1 0 13.85 8c18.84-32.56 52.14-52 89.07-52s70.23 19.44 89.07 52a8 8 0 1 0 13.85-8ZM72 96a56 56 0 1 1 56 56 56.06 56.06 0 0 1-56-56Z"></path>
      </svg>
    </div>
  ) : (
    <AssistantAvatar />
  );

  return (
    <div
      className={cn("group relative mb-4 flex items-start desktop:gap-6 gap-3", {
        "opacity-50": !isLatestMessage && status === "streaming",
      })}
    >
      <div className="mt-1">{avatar}</div>
      <div className="flex-1 overflow-hidden">
        <p className="mb-1 font-medium">
          {message.role === "user" ? "You" : "AI"}
        </p>
        {thinking && <ReasoningMessagePart part={thinking} isReasoning={isReasoning} />}
        <div className="prose prose-zinc dark:prose-invert prose-pre:bg-zinc-800 prose-pre:text-zinc-100 prose-pre:shadow-md dark:prose-pre:shadow-none max-w-none break-words">
          <Markdown>{visibleText}</Markdown>
        </div>
      </div>
    </div>
  );
};

export const Message = memo(PurePreviewMessage, (prev, next) => {
  return (
    prev.message.content === next.message.content &&
    prev.message.role === next.message.role &&
    prev.status === next.status &&
    prev.isLatestMessage === next.isLatestMessage &&
    equal(prev.message.annotations ?? {}, next.message.annotations ?? {})
  );
});