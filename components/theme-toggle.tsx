"use client";

import { ComputerIcon, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  const isDark = (theme === "system" ? systemTheme : theme) === "dark";

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const icon = theme === "system" ? <ComputerIcon className="h-5 w-5" /> : isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />;

  const nextTheme = theme === "light" ? "темную" : theme === "dark" ? "системную" : "светлую";

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-md bg-transparent transition-colors hover:bg-secondary"
      aria-label={`Переключить на ${nextTheme} тему`}
    >
      {icon}
    </button>
  );
}