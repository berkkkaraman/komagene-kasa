"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Archive, Settings, Menu, Package, Info, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const routes = [
    {
        label: "Panel",
        icon: LayoutDashboard,
        href: "/",
        color: "text-sky-500",
    },
    {
        label: "Raporlar",
        icon: BarChart3,
        href: "/reports",
        color: "text-emerald-500",
    },
    {
        label: "Arşiv",
        icon: Archive,
        href: "/archive",
        color: "text-violet-500",
    },
    {
        label: "Ayarlar",
        icon: Settings,
        href: "/settings",
        color: "text-gray-500",
    },
    {
        label: "Dijital Menü",
        icon: Menu,
        href: "/admin/products",
        color: "text-red-500",
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const [open, setOpen] = React.useState(false);

    return (
        <div className="flex items-center p-4">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden lg:flex">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 bg-background w-72">
                    <div className="space-y-4 py-4 flex flex-col h-full">
                        <div className="px-6 py-2">
                            <SheetHeader>
                                <div className="flex items-center gap-x-2">
                                    <div className="p-1 bg-primary rounded-lg">
                                        <Package className="h-6 w-6 text-primary-foreground" />
                                    </div>
                                    <SheetTitle className="text-xl font-bold">Günkasa</SheetTitle>
                                </div>
                            </SheetHeader>
                        </div>
                        <div className="px-3 flex-1">
                            <div className="space-y-1">
                                {routes.map((route) => (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        onClick={() => setOpen(false)}
                                        className={cn(
                                            "text-sm group flex p-4 w-full justify-start font-bold cursor-pointer hover:bg-white/5 rounded-2xl transition-all duration-300 relative overflow-hidden",
                                            pathname === route.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-white"
                                        )}
                                    >
                                        <div className="flex items-center flex-1 z-10">
                                            <div className={cn(
                                                "p-2 rounded-xl mr-4 transition-transform group-hover:scale-110 duration-500",
                                                pathname === route.href ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-white/5"
                                            )}>
                                                <route.icon className="h-5 w-5" />
                                            </div>
                                            {route.label}
                                        </div>
                                        {pathname === route.href && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                                        )}
                                    </Link>
                                ))}

                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
