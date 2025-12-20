"use client";

import { useStore } from "@/store/useStore";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, TrendingUp, Wallet, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function LivePulse() {
    const { records } = useStore();
    const [todayRecord, setTodayRecord] = useState<any>(null);
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        // Bugünü bul
        const todayStr = new Date().toISOString().split('T')[0];
        const record = records.find(r => r.date === todayStr);

        if (record) {
            setTodayRecord(record);
            // Veri değiştiğinde efekt ver
            setPulse(true);
            const t = setTimeout(() => setPulse(false), 1000);
            return () => clearTimeout(t);
        }
    }, [records]);

    if (!todayRecord) return null; // Bugün veri yoksa gösterme veya boş göster

    // Toplam Ciro Hesapla
    const cash = todayRecord.income.cash || 0;
    const credit = todayRecord.income.creditCard || 0;
    const online = Object.values(todayRecord.income.online as Record<string, number>).reduce((a, b) => a + b, 0);
    const total = cash + credit + online;

    return (
        <Card className="border-l-4 border-l-[#D71920] shadow-lg animate-in slide-in-from-top-4 duration-700">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                        </div>
                        <span className="font-bold text-red-600 tracking-widest text-sm uppercase">Canlı Akış (Live)</span>
                    </div>
                    <Activity className={cn("h-5 w-5 text-gray-400 transition-all", pulse && "text-red-500 scale-125")} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Toplam Ciro (Büyük) */}
                    <div className="col-span-2">
                        <p className="text-sm text-muted-foreground font-medium">Anlık Toplam Ciro</p>
                        <h2 className={cn("text-4xl font-black text-slate-900 dark:text-white transition-all duration-300", pulse && "scale-105 text-[#D71920]")}>
                            {total.toLocaleString('tr-TR')} ₺
                        </h2>
                    </div>

                    {/* Detay: Nakit */}
                    <div className="border-l pl-4 hidden md:block">
                        <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
                            <Wallet className="h-3 w-3" /> Nakit
                        </div>
                        <p className="font-bold text-lg">{cash.toLocaleString('tr-TR')}</p>
                    </div>

                    {/* Detay: Kart */}
                    <div className="border-l pl-4 hidden md:block">
                        <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
                            <CreditCard className="h-3 w-3" /> Kredi Kartı
                        </div>
                        <p className="font-bold text-lg">{credit.toLocaleString('tr-TR')}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
