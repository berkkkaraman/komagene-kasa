"use client";

import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, Wallet, Building2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BossPage() {
    const { records } = useStore();
    const [stats, setStats] = useState({ revenue: 0, expense: 0, profit: 0, cash: 0 });

    useEffect(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const today = records.find(r => r.date === todayStr);

        if (today) {
            const online = Object.values(today.income.online).reduce((a, b) => a + (b || 0), 0);
            const revenue = (today.income.cash || 0) + (today.income.creditCard || 0) + online;
            const expense = today.expenses.reduce((a, b) => a + (b.amount || 0), 0);
            const cash = today.income.cash || 0;

            setStats({ revenue, expense, profit: revenue - expense, cash });
        }
    }, [records]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-50 p-4 md:p-8 font-sans">
            {/* Header */}
            <div className="max-w-md mx-auto mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-slate-500" />
                        Yönetici Özeti
                    </h1>
                    <p className="text-sm text-slate-500">Bugünün Finansal Durumu</p>
                </div>
                <Link href="/" className="text-xs font-medium text-slate-500 hover:text-primary transition-colors">
                    Dashboard &rarr;
                </Link>
            </div>

            <div className="max-w-md mx-auto space-y-4">
                {/* Main Revenue Card */}
                <Card className="border-none shadow-xl bg-white dark:bg-zinc-900">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                            Toplam Günlük Ciro
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {stats.revenue.toLocaleString('tr-TR')} <span className="text-2xl font-normal text-slate-400">₺</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                    {/* Expense Card */}
                    <Card className="border-none shadow-lg bg-white dark:bg-zinc-900">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg text-red-600">
                                    <TrendingDown className="h-4 w-4" />
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase">Giderler</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                {stats.expense.toLocaleString('tr-TR')} ₺
                            </div>
                        </CardContent>
                    </Card>

                    {/* Net Profit Card */}
                    <Card className="border-none shadow-lg bg-white dark:bg-zinc-900">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={cn("p-2 rounded-lg text-emerald-600", stats.profit >= 0 ? "bg-emerald-100 dark:bg-emerald-900/20" : "bg-red-100 dark:bg-red-900/20 text-red-600")}>
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase">Net Kâr</span>
                            </div>
                            <div className={cn("text-2xl font-bold", stats.profit >= 0 ? "text-slate-900 dark:text-white" : "text-red-500")}>
                                {stats.profit.toLocaleString('tr-TR')} ₺
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Cash in Drawer */}
                <Card className="border-none shadow-lg bg-slate-900 dark:bg-black text-white">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs uppercase font-bold mb-1">Kasadaki Nakit</p>
                            <div className="text-3xl font-bold tracking-tight">
                                {stats.cash.toLocaleString('tr-TR')} ₺
                            </div>
                        </div>
                        <div className="h-12 w-12 bg-slate-800 rounded-full flex items-center justify-center">
                            <Wallet className="h-6 w-6 text-emerald-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="text-center mt-8 text-xs text-slate-400">
                Veriler anlık olarak güncellenmektedir.
            </div>
        </div>
    );
}
