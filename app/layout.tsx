import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Sidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { MenuStateProvider } from "@/lib/menu-state";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BrainSpark",
  description: "BrainSpark — ассистент на базе моделей NVIDIA NIM.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BrainSpark",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="h-full" suppressHydrationWarning>
      <body className={cn("h-full bg-background font-sans antialiased", geist.className)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <MenuStateProvider>
            <div className="flex flex-col desktop:flex-row h-full">
              <Sidebar />
              <main className="flex-1 h-full w-full pt-0 desktop:ml-[64px]">{children}</main>
            </div>
            <Toaster />
            <Analytics />
            <SpeedInsights />
          </MenuStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}