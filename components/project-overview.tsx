import { SparklesIcon } from "lucide-react";

export function ProjectOverview() {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center h-full">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <SparklesIcon className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl desktop:text-3xl font-semibold mb-3">BrainSpark</h1>
        <p className="text-muted-foreground mb-6 text-sm desktop:text-base">
          Задавайте вопросы, получайте ответы и используйте возможности искусственного интеллекта
        </p>

        <div className="grid grid-cols-1 desktop:grid-cols-2 gap-3 text-left">
          <div className="bg-secondary/50 p-4 rounded-lg">
            <h3 className="font-medium mb-1">Быстрые ответы</h3>
            <p className="text-sm text-muted-foreground">Получайте ответы на ваши вопросы мгновенно</p>
          </div>
          <div className="bg-secondary/50 p-4 rounded-lg">
            <h3 className="font-medium mb-1">Сохранение чатов</h3>
            <p className="text-sm text-muted-foreground">Ваши диалоги сохраняются автоматически</p>
          </div>
        </div>
      </div>
    </div>
  );
}