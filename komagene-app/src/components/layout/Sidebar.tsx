"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/components/auth/AuthProvider";
import { LayoutDashboard, BarChart3, Settings, Menu, Shield, Lock, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const NAV_ITEMS = [
    { label: "Özet / Giriş", href: "/", icon: LayoutDashboard },
    { label: "Raporlar", href: "/reports", icon: BarChart3 },
];

export function Sidebar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Mobile Trigger */}
            <div className="md:hidden p-4 border-b flex items-center justify-between bg-white/80 dark:bg-card/80 backdrop-blur-md sticky top-0 z-50">
                <span className="font-bold text-lg tracking-tight text-primary">KOMAGENE</span>
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[240px] p-0">
                        <div className="sr-only">
                            <SheetTitle>Navigasyon Menüsü</SheetTitle>
                        </div>
                        <SidebarContent pathname={pathname} setOpen={setOpen} />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:flex h-screen w-64 flex-col fixed left-0 top-0 glass-sidebar z-40">
                <SidebarContent pathname={pathname} />
            </div>

            {/* Spacer for desktop sidebar */}
            <div className="hidden md:block w-64 flex-shrink-0" />
        </>
    );
}

function SidebarContent({ pathname, setOpen }: { pathname: string; setOpen?: (val: boolean) => void }) {
    const close = () => setOpen?.(false);
    const router = useRouter();
    const { user, signOut, loading } = useAuth();

    const handleLogout = async () => {
        await signOut();
        toast.success("Oturum kapatıldı");
        router.push("/");
        close();
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-card">
            <div className="p-6 border-b">
                <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                    <span className="text-3xl">🥗</span> KOMAGENE
                </h1>
                <p className="text-xs font-bold text-foreground/60 mt-1 uppercase tracking-wider">Merkezi Yönetim</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={close}
                        className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group",
                            pathname === item.href
                                ? "nav-link-active"
                                : "text-foreground/70 hover:bg-accent hover:text-foreground"
                        )}
                    >
                        <item.icon className={cn(
                            "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                            pathname === item.href ? "text-primary stroke-[2.5px]" : "text-foreground/60"
                        )} />
                        <span className="flex-1">{item.label}</span>
                    </Link>
                ))}

                {user && (
                    <Link
                        href="/admin"
                        onClick={close}
                        className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group",
                            pathname === "/admin"
                                ? "nav-link-active"
                                : "text-foreground/70 hover:bg-accent hover:text-foreground"
                        )}
                    >
                        <Settings className={cn(
                            "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                            pathname === "/admin" ? "text-primary stroke-[2.5px]" : "text-foreground/60"
                        )} />
                        <span className="flex-1">Yönetici Paneli</span>
                    </Link>
                )}
            </nav>

            <div className="p-4 border-t mt-auto space-y-3">
                {loading ? (
                    <div className="flex justify-center p-2">
                        <Loader2 className="h-5 w-5 animate-spin text-primary/50" />
                    </div>
                ) : user ? (
                    <div className="space-y-3">
                        <div className="px-4 py-2 bg-accent/30 rounded-xl">
                            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-tighter">Aktif Kullanıcı</p>
                            <p className="text-xs font-bold text-foreground/80 truncate">{user.email}</p>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full gap-2 text-primary border-primary/20 hover:bg-primary/5 rounded-xl h-11"
                            onClick={handleLogout}
                        >
                            <Lock className="h-4 w-4" />
                            Güvenli Çıkış
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant="default"
                        className="w-full gap-2 rounded-xl h-11 font-bold shadow-lg shadow-primary/10"
                        onClick={() => {
                            router.push("/login");
                            close();
                        }}
                    >
                        <Shield className="h-4 w-4" />
                        Yönetici Girişi
                    </Button>
                )}
            </div>
        </div>
    );
}
