"use client";

import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, Wallet, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function BossPage() {
    const { records } = useStore();
    const [stats, setStats] = useState({ revenue: 0, expense: 0, profit: 0, cash: 0 });

    useEffect(() => {
        // Hesaplamalar (Tüm Zamanlar veya Aylık? Boss Mode genelde "Bugün" veya "Bu Ay" ı merak eder)
        // Şimdilik "Bugün"ü gösterelim, patron anlık durumu görsün.
        const todayStr = new Date().toISOString().split('T')[0];
        const today = records.find(r => r.date === todayStr);

        if (today) {
            const online = Object.values(today.income.online).reduce((a, b) => a + (b || 0), 0);
            const revenue = (today.income.cash || 0) + (today.income.creditCard || 0) + online;
            const expense = today.expenses.reduce((a, b) => a + (b.amount || 0), 0);
            const cash = today.income.cash || 0; // Kasadaki nakit önemli

            setStats({ revenue, expense, profit: revenue - expense, cash });
        }
    }, [records]);

    return (
        <div className="min-h-screen bg-black text-white p-6 flex flex-col justify-between font-mono">
            {/* Header */}
            <div className="flex items-center justify-between opacity-50">
                <span className="text-xs uppercase tracking-[0.3em]">BOSS MODE</span>
                <Link href="/">
                    <LogOut className="h-5 w-5" />
                </Link>
            </div>

            {/* Main Stats */}
            <div className="space-y-12">
                <div className="space-y-2">
                    <p className="text-sm text-gray-500 uppercase">Bugünkü Ciro</p>
                    <h1 className="text-6xl font-black text-green-500 tracking-tighter loading-in">
                        {stats.revenue.toLocaleString('tr-TR')}
                    </h1>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <p className="text-xs text-gray-500 uppercase mb-1 flex items-center gap-1">
                            <ArrowDown className="h-3 w-3" /> Gider
                        </p>
                        <p className="text-2xl font-bold text-red-500">
                            {stats.expense.toLocaleString('tr-TR')}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase mb-1 flex items-center gap-1">
                            <ArrowUp className="h-3 w-3" /> Net
                        </p>
                        <p className={cn("text-2xl font-bold", stats.profit >= 0 ? "text-white" : "text-red-500")}>
                            {stats.profit.toLocaleString('tr-TR')}
                        </p>
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <div className="flex items-center gap-3 mb-2">
                        <Wallet className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-bold text-gray-400">Kasadaki Nakit</span>
                    </div>
                    <p className="text-4xl font-bold text-white">
                        {stats.cash.toLocaleString('tr-TR')} ₺
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center opacity-30 text-[10px] uppercase">
                Günkasa Executive View • {new Date().toLocaleTimeString()}
            </div>
        </div>
    );
}
