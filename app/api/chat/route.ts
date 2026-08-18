import { getNimModel } from "@/ai/providers";
import { streamText, type UIMessage } from "ai";

export const maxDuration = 60;
export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const {
      messages,
      selectedModel,
    }: { messages: UIMessage[]; selectedModel: string } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response("Сообщения не переданы", { status: 400 });
    }

    if (!selectedModel) {
      return new Response("Модель не указана", { status: 400 });
    }

    const result = streamText({
      model: getNimModel(selectedModel),
      system:
        "Ты — ассистент BrainSpark. Отвечай пользователю на том же языке, на котором он пишет.",
      messages,
      temperature: 0.7,
      maxTokens: 2048,
    });

    return result.toDataStreamResponse({
      sendReasoning: true,
      getErrorMessage: (error) => {
        if (error instanceof Error) {
          console.error("Chat error:", error);

          if (
            error.message.includes("401") ||
            error.message.toLowerCase().includes("unauthorized") ||
            error.message.toLowerCase().includes("api key")
          ) {
            return "Неверный API-ключ NVIDIA NIM. Проверьте настройки.";
          }

          if (error.message.toLowerCase().includes("rate limit")) {
            return "Превышен лимит запросов. Попробуйте позже.";
          }
        }

        return "Не удалось получить ответ. Попробуйте ещё раз.";
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response("Ошибка при обработке запроса", { status: 500 });
  }
}