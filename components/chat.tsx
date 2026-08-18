"use client";

import { useChat } from "@ai-sdk/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Message } from "ai";

import { DEFAULT_MODEL_ID } from "@/lib/models";
import {
  createChat,
  updateChat,
  getChat,
  type ChatMessage as StoredChatMessage,
} from "@/lib/supabase";
import { useMenuState } from "@/lib/menu-state";
import { Textarea } from "./textarea";
import { ProjectOverview } from "./project-overview";
import { Messages } from "./messages";
import { Header } from "./header";

export default function Chat({ chatId }: { chatId?: string }) {
  const router = useRouter();
  const { isCollapsed } = useMenuState();

  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL_ID);
  const [isLoading, setIsLoading] = useState(!!chatId);
  const currentChatIdRef = useRef<string | undefined>(chatId);

  const { messages, input, handleInputChange, handleSubmit, status, stop, setMessages } =
    useChat({
      id: chatId,
      maxSteps: 5,
      body: { selectedModel },
      onError: (error) => {
        toast.error(error.message || "Не удалось получить ответ. Попробуйте позже.", {
          position: "top-center",
          richColors: true,
        });
      },
    });

  const toStoredFormat = useCallback((messages: Message[]): StoredChatMessage[] => {
    return messages.map((message) => ({
      role: message.role === "data" ? "system" : message.role,
      content: message.content,
    }));
  }, []);

  const fromStoredFormat = useCallback((messages: StoredChatMessage[]): Message[] => {
    return messages.map((message, index) => ({
      id: `msg-${index}`,
      role: message.role,
      content: message.content,
    }));
  }, []);

  const buildTitle = useCallback((messages: Message[]): string => {
    const firstUserMessage = messages.find((message) => message.role === "user");
    if (!firstUserMessage) return "Новый чат";
    return firstUserMessage.content.length > 30
      ? `${firstUserMessage.content.slice(0, 30)}...`
      : firstUserMessage.content;
  }, []);

  useEffect(() => {
    if (!chatId) return;

    setIsLoading(true);
    getChat(chatId)
      .then((chat) => {
        if (!chat) {
          toast.error("Чат не найден");
          router.push("/");
          return;
        }
        setMessages(fromStoredFormat(chat.messages));
      })
      .catch((error) => {
        console.error("Failed to load chat:", error);
        toast.error("Не удалось загрузить чат");
      })
      .finally(() => setIsLoading(false));
  }, [chatId, router, setMessages, fromStoredFormat]);

  useEffect(() => {
    if (messages.length < 2) return;

    const timer = setTimeout(async () => {
      const storedMessages = toStoredFormat(messages);
      const title = buildTitle(messages);

      try {
        if (currentChatIdRef.current) {
          await updateChat(currentChatIdRef.current, title, storedMessages);
        } else {
          const chat = await createChat(title, storedMessages);
          if (chat?.id) {
            currentChatIdRef.current = chat.id;
            window.history.replaceState(null, "", `/chat/${chat.id}`);
          }
        }
      } catch (error) {
        console.error("Failed to save chat:", error);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [messages, toStoredFormat, buildTitle]);

  const isStreaming = status === "streaming" || status === "submitted";

  if (isLoading) {
    return (
      <div className="h-full flex flex-col justify-center items-center w-full stretch bg-background">
        <div className="animate-pulse text-muted-foreground">Загрузка чата...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-center w-full bg-background">
      <Header />
      <div className="flex-1 overflow-auto pt-14 pb-32 min-h-[calc(100vh-180px)]">
        {messages.length === 0 ? (
          <div className="max-w-xl mx-auto w-full px-4 desktop:px-6">
            <ProjectOverview />
          </div>
        ) : (
          <Messages messages={messages} status={status} />
        )}
      </div>
      <div className={`fixed bottom-0 left-0 right-0 desktop:ml-[64px] bg-gradient-to-t from-background via-background to-transparent pb-6 pt-10 transition-all duration-200 ${isCollapsed ? "desktop:ml-[64px]" : "desktop:ml-[220px]"}`}>
        <form
          onSubmit={handleSubmit}
          className="pb-4 bg-transparent w-full max-w-xl mx-auto px-4 desktop:px-6"
        >
          <Textarea
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            handleInputChange={handleInputChange}
            input={input}
            isLoading={isStreaming}
            status={status}
            stop={stop}
          />
        </form>
      </div>
    </div>
  );
}