"use client"

import { useEffect, useState, type MouseEvent } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Button } from "./button"
import {
  Home,
  User,
  ChevronLeft,
  MessageSquare,
  Trash2,
  Menu,
  X,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { getAllChats, deleteChat, type Chat } from "@/lib/supabase"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { useMediaQuery } from "@/lib/hooks/use-media-query"
import { useMenuState } from "@/lib/menu-state"

export function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { theme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 799px)")
  const { isCollapsed, setIsCollapsed } = useMenuState()

  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true)
    }
    setIsMobileOpen(false)
  }, [isMobile, setIsCollapsed])

  const loadChats = async () => {
    setIsLoading(true)
    try {
      const chatsList = await getAllChats()
      setChats(chatsList)
    } catch (error) {
      console.error("Failed to load chats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteChat = async (e: MouseEvent, chatId: string) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const success = await deleteChat(chatId)
      if (success) {
        setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId))
        if (pathname === `/chat/${chatId}`) {
          router.push("/")
        }
      } else {
        toast.error("Не удалось удалить чат")
      }
    } catch (error) {
      console.error("Error deleting chat:", error)
      toast.error("Ошибка при удалении чата")
    }
  }

  useEffect(() => {
    loadChats()
    if (isMobile) {
      setIsMobileOpen(false)
    }
  }, [pathname, isMobile])

  const MobileMenuButton = () => (
    <Button
      variant="ghost"
      size="icon"
      className="fixed z-50 top-2 left-2 mobile:block desktop:hidden h-10 w-10"
      onClick={() => setIsMobileOpen(!isMobileOpen)}
    >
      {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </Button>
  )

  if (isMobile) {
    return (
      <>
        <MobileMenuButton />
        <AnimatePresence>
          {isMobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-40"
                onClick={() => setIsMobileOpen(false)}
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="fixed left-0 top-0 z-50 h-screen w-[220px] border-r bg-background"
              >
                <div className="flex h-full flex-col">
                  <div className="flex h-14 items-center justify-between px-4">
                    <Link className="flex items-center gap-2 font-semibold" href="/">
                      <Image
                        src={theme === "dark" ? "/white.svg" : "/dark.svg"}
                        alt="Logo"
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span className="text-sm whitespace-nowrap">BrainSpark</span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex-1 overflow-auto py-2">
                    <nav className="grid items-start gap-1 px-2 text-sm font-medium">
                      <Link
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-primary",
                          pathname === "/" && "bg-muted text-primary",
                        )}
                        href="/"
                      >
                        <Home className="h-5 w-5" />
                        <span className="whitespace-nowrap">Главная</span>
                      </Link>

                      <Link
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-primary",
                          pathname === "/profile" && "bg-muted text-primary",
                        )}
                        href="/profile"
                      >
                        <User className="h-5 w-5" />
                        <span className="whitespace-nowrap">Профиль</span>
                      </Link>

                      <div className="my-2 border-t" />

                      {isLoading ? (
                        <div className="flex justify-center py-2">
                          <span className="text-xs text-muted-foreground">Загрузка чатов...</span>
                        </div>
                      ) : chats.length === 0 ? (
                        <div className="flex justify-center py-2 px-3 text-center">
                          <span className="text-xs text-muted-foreground">Нет сохраненных чатов</span>
                        </div>
                      ) : (
                        chats.map((chat) => (
                          <Link
                            key={chat.id}
                            className={cn(
                              "group flex items-center justify-between rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-primary",
                              pathname === `/chat/${chat.id}` && "bg-muted text-primary",
                            )}
                            href={`/chat/${chat.id}`}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <MessageSquare className="h-5 w-5 shrink-0" />
                              <span className="truncate">{chat.title}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-70 transition-opacity"
                              onClick={(e) => handleDeleteChat(e, chat.id as string)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </Link>
                        ))
                      )}
                    </nav>
                  </div>

                  <div className="border-t p-4">
                    <div className="flex items-center gap-2">
                      <Image
                        src={theme === "dark" ? "/white.svg" : "/dark.svg"}
                        alt="Avatar"
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium">BrainSpark</p>
                        <p className="text-xs text-muted-foreground">AI Assistant</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    )
  }

  return (
    <motion.div
      initial={{ width: isCollapsed ? 64 : 220 }}
      animate={{ width: isCollapsed ? 64 : 220 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="fixed left-0 top-0 z-40 h-screen border-r bg-background mobile:hidden desktop:block"
    >
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center justify-between px-4">
          <Link className="flex items-center gap-2 font-semibold" href="/">
            <Image
              src={theme === "dark" ? "/white.svg" : "/dark.svg"}
              alt="Logo"
              width={24}
              height={24}
              className="rounded-full"
            />
            <span
              className={cn(
                "text-sm whitespace-nowrap transition-all duration-200",
                isCollapsed ? "opacity-0 w-0" : "opacity-100",
              )}
            >
              BrainSpark
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronLeft
              className={cn("h-4 w-4 transition-all duration-200", isCollapsed && "rotate-180")}
            />
          </Button>
        </div>

        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start gap-1 px-2 text-sm font-medium">
            {isCollapsed ? (
              <>
                <Link
                  className={cn(
                    "flex items-center justify-center rounded-lg px-3 py-2",
                    pathname === "/"
                      ? "bg-muted text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-primary",
                  )}
                  href="/"
                >
                  <Home className="h-5 w-5" />
                </Link>

                <Link
                  className={cn(
                    "flex items-center justify-center rounded-lg px-3 py-2",
                    pathname === "/profile"
                      ? "bg-muted text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-primary",
                  )}
                  href="/profile"
                >
                  <User className="h-5 w-5" />
                </Link>

                {chats.map((chat) => (
                  <Link
                    key={chat.id}
                    className={cn(
                      "flex items-center justify-center rounded-lg px-3 py-2",
                      pathname === `/chat/${chat.id}`
                        ? "bg-muted text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-primary",
                    )}
                    href={`/chat/${chat.id}`}
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Link>
                ))}
              </>
            ) : (
              <>
                <Link
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-primary",
                    pathname === "/" && "bg-muted text-primary",
                  )}
                  href="/"
                >
                  <Home className="h-5 w-5" />
                  <span className="whitespace-nowrap">Главная</span>
                </Link>

                <Link
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-primary",
                    pathname === "/profile" && "bg-muted text-primary",
                  )}
                  href="/profile"
                >
                  <User className="h-5 w-5" />
                  <span className="whitespace-nowrap">Профиль</span>
                </Link>

                <div className="my-2 border-t" />

                {isLoading ? (
                  <div className="flex justify-center py-2">
                    <span className="text-xs text-muted-foreground">Загрузка чатов...</span>
                  </div>
                ) : chats.length === 0 ? (
                  <div className="flex justify-center py-2 px-3 text-center">
                    <span className="text-xs text-muted-foreground">Нет сохраненных чатов</span>
                  </div>
                ) : (
                  chats.map((chat) => (
                    <Link
                      key={chat.id}
                      className={cn(
                        "group flex items-center justify-between rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-primary",
                        pathname === `/chat/${chat.id}` && "bg-muted text-primary",
                      )}
                      href={`/chat/${chat.id}`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <MessageSquare className="h-5 w-5 shrink-0" />
                        <span className="truncate">{chat.title}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleDeleteChat(e, chat.id as string)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Link>
                  ))
                )}
              </>
            )}
          </nav>
        </div>

        <div className="border-t p-4">
          <div className="flex items-center gap-2">
            <Image
              src={theme === "dark" ? "/white.svg" : "/dark.svg"}
              alt="Avatar"
              width={24}
              height={24}
              className="rounded-full"
            />
            <div
              className={cn(
                "whitespace-nowrap transition-all duration-200",
                isCollapsed ? "opacity-0 w-0" : "opacity-100",
              )}
            >
              <p className="text-sm font-medium">BrainSpark</p>
              <p className="text-xs text-muted-foreground">AI Assistant</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}