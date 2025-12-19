"use client";

import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import { detectAnomalies } from "@/services/anomalyService";
import { AlertTriangle, TrendingDown, ArrowUpRight, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AnomalyAlerts() {
    const { records } = useStore();

    const alerts = useMemo(() => {
        return detectAnomalies(records);
    }, [records]);

    if (alerts.length === 0) return null;

    return (
        <div className="space-y-4 animate-in slide-in-from-top-4 fade-in duration-700">
            {alerts.map((alert) => (
                <div
                    key={alert.id}
                    className={cn(
                        "relative overflow-hidden rounded-xl border p-4 shadow-lg flex items-start gap-4",
                        alert.severity === 'critical' ? "bg-rose-600 text-white border-rose-700" :
                            alert.severity === 'high' ? "bg-orange-500 text-white border-orange-600" :
                                "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/40 dark:text-amber-100 dark:border-amber-800"
                    )}
                >
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 p-12 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                    <div className={cn(
                        "p-2 rounded-lg bg-white/20 backdrop-blur-sm",
                        alert.severity === 'critical' ? "text-white" : "text-amber-900 dark:text-amber-100"
                    )}>
                        {alert.type === 'income_drop' && <TrendingDown className="h-6 w-6" />}
                        {alert.type === 'expense_spike' && <ArrowUpRight className="h-6 w-6" />}
                        {alert.type === 'shift_shortage' && <AlertTriangle className="h-6 w-6" />}
                        {alert.type === 'consecutive_low' && <ShieldAlert className="h-6 w-6" />}
                    </div>

                    <div className="flex-1 z-10">
                        <h4 className="font-black text-lg uppercase tracking-tight flex items-center gap-2">
                            Anormallik Algılandı
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-bold tracking-widest uppercase">
                                {alert.severity}
                            </span>
                        </h4>
                        <p className="font-medium opacity-90 text-sm mt-1">
                            {alert.message}
                        </p>
                        <div className="flex gap-4 mt-2 text-xs font-bold opacity-75 uppercase tracking-wide">
                            <span>Tespit: {alert.value.toLocaleString('tr-TR')}</span>
                            <span>Beklenen: {Math.round(alert.expected).toLocaleString('tr-TR')}</span>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8 bg-white/10 hover:bg-white/20 text-white border border-white/10"
                    >
                        İncele
                    </Button>
                </div>
            ))}
        </div>
    );
}
