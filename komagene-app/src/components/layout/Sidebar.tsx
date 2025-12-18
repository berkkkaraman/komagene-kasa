"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PinPad } from "@/components/auth/PinPad";
import { LayoutDashboard, BarChart3, Settings, Menu, Shield, Lock } from "lucide-react";
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
    const [loginOpen, setLoginOpen] = useState(false);

    const handleAdminClick = () => {
        setLoginOpen(true);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b">
                <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                    <span className="text-3xl">🥙</span> KOMAGENE
                </h1>
                <p className="text-xs font-bold text-foreground/60 mt-1 uppercase tracking-wider">Büyükdere Şubesi</p>
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
            </nav>

            <div className="p-4 border-t mt-auto">
                <Button variant="outline" className="w-full gap-2 text-muted-foreground border-dashed" onClick={handleAdminClick}>
                    <Shield className="h-4 w-4" />
                    Yönetici Girişi
                </Button>
            </div>

            <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                <DialogContent className="sm:max-w-xs border-none bg-transparent shadow-none p-0">
                    <div className="sr-only">
                        <DialogTitle>Yönetici Girişi</DialogTitle>
                        <DialogDescription>PIN kodunuzu girerek yönetici paneline erişebilirsiniz.</DialogDescription>
                    </div>
                    <PinPad
                        correctPin="1234"
                        onSuccess={() => {
                            sessionStorage.setItem("admin_auth", "true");
                            toast.success("Giriş yapıldı");
                            setLoginOpen(false);
                            close();
                            router.push("/admin");
                        }}
                        onCancel={() => setLoginOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
