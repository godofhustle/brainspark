"use client";

import { ChangeEvent, KeyboardEvent, useRef, useEffect, useCallback, memo } from "react";
import { ArrowUp } from "lucide-react";
import debounce from "lodash/debounce";

import { Textarea as ShadcnTextarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { ModelPicker } from "./model-picker";

interface TextareaProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  status: string;
  stop: () => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

export const Textarea = memo(
  ({
    input,
    handleInputChange,
    isLoading,
    status,
    selectedModel,
    setSelectedModel,
    stop,
  }: TextareaProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isMobile = useMediaQuery("(max-width: 800px)");

    const handleTextareaChange = useCallback(
      (e: ChangeEvent<HTMLTextAreaElement>) => {
        handleInputChange(e);

        if (textareaRef.current) {
          requestAnimationFrame(() => {
            const textarea = textareaRef.current;
            if (textarea) {
              const maxHeight = isMobile ? 100 : 150;
              textarea.style.height = "auto";
              textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
            }
          });
        }
      },
      [handleInputChange, isMobile],
    );

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          if (input.trim() && !isLoading) {
            const form = e.currentTarget.closest("form");
            if (form) form.requestSubmit();
          }
        }
      },
      [input, isLoading],
    );

    useEffect(() => {
      const updateHeight = debounce(() => {
        if (textareaRef.current) {
          const maxHeight = isMobile ? 100 : 150;
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
        }
      }, 100);

      updateHeight();
      return () => updateHeight.cancel();
    }, [isMobile]);

    return (
      <div className="bg-secondary rounded-2xl w-full overflow-hidden shadow-sm">
        <div className="relative w-full px-4 pt-3 pb-1">
          <ShadcnTextarea
            ref={textareaRef}
            className={cn(
              "resize-none border-0 bg-transparent w-full pr-2 min-h-[40px]",
              "overflow-y-auto focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-muted-foreground/70",
              "text-base desktop:text-sm",
              "max-h-[100px] desktop:max-h-[150px]",
            )}
            value={input}
            autoFocus
            placeholder="Напишите что-нибудь..."
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="w-full h-px bg-border/30" />

        <div className="flex justify-between items-center px-3 py-2 bg-secondary/50">
          <div className="flex items-center">
            <ModelPicker selectedModel={selectedModel} onModelChange={setSelectedModel} />
          </div>

          {status === "streaming" || status === "submitted" ? (
            <button
              type="button"
              onClick={stop}
              className="flex items-center justify-center cursor-pointer rounded-full p-2 overflow-hidden whitespace-nowrap bg-zinc-900 dark:bg-zinc-700 hover:bg-zinc-800 dark:hover:bg-zinc-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed"
              title="Остановить генерацию"
            >
              <div className="animate-spin h-4 w-4 flex-shrink-0">
                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={cn(
                "flex items-center justify-center rounded-full p-2 overflow-hidden whitespace-nowrap text-white",
                !input.trim()
                  ? "bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed"
                  : "bg-zinc-900 dark:bg-zinc-700 hover:bg-zinc-800 dark:hover:bg-zinc-600",
              )}
              title="Отправить сообщение"
            >
              <ArrowUp className="h-4 w-4 flex-shrink-0" />
            </button>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = "Textarea";