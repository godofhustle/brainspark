"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useMediaQuery } from "./hooks/use-media-query";

type MenuStateContextType = {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
};

const MenuStateContext = createContext<MenuStateContextType>({
  isCollapsed: false,
  setIsCollapsed: () => {},
});

export function MenuStateProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useMediaQuery("(max-width: 799px)");

  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile]);

  return (
    <MenuStateContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </MenuStateContext.Provider>
  );
}

export const useMenuState = () => useContext(MenuStateContext);