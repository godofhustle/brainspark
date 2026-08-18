"use client";

import { useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function ModelPicker({
  selectedModel,
  onModelChange,
}: {
  selectedModel: string;
  onModelChange: (model: string) => void;
}) {
  const [models, setModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const selectedModelRef = useRef(selectedModel);
  selectedModelRef.current = selectedModel;

  useEffect(() => {
    let cancelled = false;

    fetch("/api/models")
      .then((response) => response.json())
      .then((data: { models?: string[] }) => {
        if (cancelled) return;

        const list = Array.isArray(data.models) ? data.models : [];
        setModels(list);

        if (list.length > 0 && !list.includes(selectedModelRef.current)) {
          onModelChange(list[0]);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [onModelChange]);

  return (
    <div className="w-auto">
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-auto min-w-[80px] desktop:min-w-[90px] h-7 text-xs bg-background/10 border-0 focus:ring-0 text-muted-foreground hover:bg-background/20 transition-colors">
          <SelectValue placeholder="Модель" />
        </SelectTrigger>
        <SelectContent align="start" className="max-h-[300px]">
          <SelectGroup>
            {isLoading && models.length === 0 ? (
              <SelectItem value={selectedModel} disabled>
                Загрузка...
              </SelectItem>
            ) : (
              models.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}