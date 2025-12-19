import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/layout/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/AuthProvider";

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
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={jakarta.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="min-h-screen bg-background relative flex flex-col bg-[radial-gradient(circle_at_20%_20%,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
              {/* Header */}
              <header className="border-b bg-background/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="px-4 flex h-14 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sidebar />
                    <span className="font-extrabold text-lg tracking-tight uppercase italic hidden md:inline-block">GÜN<span className="text-primary not-italic">KASA</span></span>
                  </div>
                  <div className="flex items-center gap-4">
                    <ThemeToggle />
                  </div>
                </div>
              </header>

              <main className="flex-1 px-4 py-6">
                {children}
              </main>
            </div>

            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


