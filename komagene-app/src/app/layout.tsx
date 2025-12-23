import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/layout/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { NotificationProvider } from "@/components/NotificationProvider";
import { CommandPalette } from "@/components/CommandPalette";
import { RealtimeManager } from "@/components/RealtimeManager";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { AutoSyncManager } from "@/components/AutoSyncManager";
import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Günkasa - İşletme Yönetim Paneli",
  description: "Modern, Güvenli ve Akıllı İşletme Yönetimi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const brightness = useStore((state) => state.settings.brightness);

  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={cn(jakarta.className, "min-h-screen bg-background antialiased")} style={{ filter: `brightness(${brightness}%)` }}>
        <meta name="theme-color" content="#D71920" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="min-h-screen bg-background relative flex flex-col bg-[radial-gradient(circle_at_20%_20%,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
              <ServiceWorkerRegister />
              <RealtimeManager />
              {/* Header */}
              <header className="border-b bg-background/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="px-4 flex h-14 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sidebar />
                    <span className="font-extrabold text-lg tracking-tight uppercase italic hidden md:inline-block">GÜN<span className="text-primary not-italic">KASA</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href="/reports?tab=history">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary transition-colors h-9 w-9 rounded-xl border border-border/50 bg-secondary/20">
                        <Archive className="h-4 w-4" />
                      </Button>
                    </Link>
                    <ThemeToggle />
                  </div>
                </div>
              </header>

              <main className="flex-1 px-4 py-6">
                <CommandPalette />
                <AutoSyncManager />
                <NotificationProvider>
                  {children}
                </NotificationProvider>
              </main>
            </div>

            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


