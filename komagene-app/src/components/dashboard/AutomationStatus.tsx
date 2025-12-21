"use client";

import { CheckCircle2, AlertCircle, Mail, Globe, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

interface IntegrationStatus {
    name: string;
    icon: React.ReactNode;
    status: 'connected' | 'pending' | 'error';
    label: string;
}

export function AutomationStatus() {
    const integrations: IntegrationStatus[] = [
        {
            name: "Email",
            icon: <Mail className="h-4 w-4" />,
            status: 'connected',
            label: "Z-Raporu Aktif"
        },
        {
            name: "Yemeksepeti",
            icon: <Globe className="h-4 w-4" />,
            status: 'connected',
            label: "Bağlı"
        },
        {
            name: "Getir",
            icon: <Globe className="h-4 w-4" />,
            status: 'pending',
            label: "Bekleniyor"
        }
    ];

    return (
        <div className="flex flex-wrap gap-3 py-2">
            {integrations.map((item) => (
                <div
                    key={item.name}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all",
                        item.status === 'connected'
                            ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                    )}
                >
                    {item.icon}
                    <span className="uppercase tracking-tight">{item.name}: {item.label}</span>
                    <div className={cn(
                        "h-1.5 w-1.5 rounded-full animate-pulse",
                        item.status === 'connected' ? "bg-green-500" : "bg-amber-500"
                    )} />
                </div>
            ))}

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold bg-primary/5 border border-primary/10 text-primary uppercase tracking-tight">
                <Wifi className="h-4 w-4" />
                <span>Anlık Senkronizasyon: %100</span>
            </div>
        </div>
    );
}
