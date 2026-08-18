"use client";

import { ThemeToggle } from "./theme-toggle";
import { useMenuState } from "@/lib/menu-state";

export function Header() {
  const { isCollapsed } = useMenuState();

  return (
    <div className={`fixed right-0 left-0 top-0 z-30 w-full bg-background border-b desktop:ml-[64px] transition-all duration-200 ${isCollapsed ? "desktop:ml-[64px]" : "desktop:ml-[220px]"}`}>
      <div className="flex justify-end items-center h-14 px-4">
        <ThemeToggle />
      </div>
    </div>
  );
}