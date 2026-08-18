import type { Message as TMessage } from "ai";
import { Message } from "./message";

export function Messages({
  messages,
  status,
}: {
  messages: TMessage[];
  status: "error" | "submitted" | "streaming" | "ready";
}) {
  return (
    <div className="flex-1 h-full space-y-4 overflow-y-auto py-4 bg-background max-h-[calc(100vh-180px)]">
      <div className="max-w-xl mx-auto px-4 desktop:px-6 pb-10">
        {messages.map((message, index) => (
          <Message
            key={index}
            isLatestMessage={index === messages.length - 1}
            message={message}
            status={status}
          />
        ))}
        <div className="h-10" />
      </div>
    </div>
  );
}