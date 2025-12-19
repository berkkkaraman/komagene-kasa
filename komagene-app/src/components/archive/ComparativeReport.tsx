"use client";

import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startOfWeek, subWeeks, format, isWithinInterval, endOfWeek } from "date-fns";
import { tr } from "date-fns/locale";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ComparativeReport() {
    const { records } = useStore();

    const comparison = useMemo(() => {
        const today = new Date();

        // Current week range
        const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 });
        const thisWeekEnd = endOfWeek(today, { weekStartsOn: 1 });

        // Previous week range
        const lastWeekStart = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
        const lastWeekEnd = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });

        const thisWeekRecords = records.filter(r => {
            const date = new Date(r.date);
            return isWithinInterval(date, { start: thisWeekStart, end: thisWeekEnd });
        });

        const lastWeekRecords = records.filter(r => {
            const date = new Date(r.date);
            return isWithinInterval(date, { start: lastWeekStart, end: lastWeekEnd });
        });

        const calculateTotals = (recs: typeof records) => {
            let income = 0;
            let expense = 0;
            recs.forEach(r => {
                const onlineTotal = Object.values(r.income.online).reduce((a, b) => a + (b || 0), 0);
                income += (r.income.cash || 0) + (r.income.creditCard || 0) + onlineTotal;
                expense += r.expenses.reduce((a, b) => a + (b.amount || 0), 0);
            });
            return { income, expense, net: income - expense, days: recs.length };
        };

        const thisWeek = calculateTotals(thisWeekRecords);
        const lastWeek = calculateTotals(lastWeekRecords);

        const calcChange = (curr: number, prev: number) => {
            if (prev === 0) return curr > 0 ? 100 : 0;
            return ((curr - prev) / prev) * 100;
        };

        return {
            thisWeek,
            lastWeek,
            incomeChange: calcChange(thisWeek.income, lastWeek.income),
            expenseChange: calcChange(thisWeek.expense, lastWeek.expense),
            netChange: calcChange(thisWeek.net, lastWeek.net),
            thisWeekLabel: `${format(thisWeekStart, "dd MMM", { locale: tr })} - ${format(thisWeekEnd, "dd MMM", { locale: tr })}`,
            lastWeekLabel: `${format(lastWeekStart, "dd MMM", { locale: tr })} - ${format(lastWeekEnd, "dd MMM", { locale: tr })}`
        };
    }, [records]);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);

    const ChangeIndicator = ({ value, inverted = false }: { value: number; inverted?: boolean }) => {
        const isPositive = inverted ? value < 0 : value > 0;
        const isNegative = inverted ? value > 0 : value < 0;

        return (
            <div className={cn(
                "flex items-center gap-1 text-sm font-black px-2 py-1 rounded-lg",
                isPositive && "text-emerald-600 bg-emerald-100 dark:bg-emerald-950/30",
                isNegative && "text-rose-600 bg-rose-100 dark:bg-rose-950/30",
                !isPositive && !isNegative && "text-slate-500 bg-slate-100 dark:bg-slate-800/30"
            )}>
                {isPositive && <TrendingUp className="h-4 w-4" />}
                {isNegative && <TrendingDown className="h-4 w-4" />}
                {!isPositive && !isNegative && <Minus className="h-4 w-4" />}
                {value > 0 ? "+" : ""}{value.toFixed(1)}%
            </div>
        );
    };

    return (
        <Card className="border-2 border-slate-200 dark:border-white/10 shadow-lg bg-white dark:bg-slate-900/40 backdrop-blur-xl overflow-hidden rounded-2xl">
            <CardHeader className="border-b-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 py-4">
                <CardTitle className="text-xs font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" /> Haftalık Karşılaştırma
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Gelir Karşılaştırma */}
                    <div className="space-y-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/30">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Gelir</span>
                            <ChangeIndicator value={comparison.incomeChange} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Bu hafta</span>
                                <span className="font-black text-emerald-600">{formatCurrency(comparison.thisWeek.income)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Geçen hafta</span>
                                <span className="font-bold text-muted-foreground">{formatCurrency(comparison.lastWeek.income)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Gider Karşılaştırma */}
                    <div className="space-y-3 p-4 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-800/30">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">Gider</span>
                            <ChangeIndicator value={comparison.expenseChange} inverted />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Bu hafta</span>
                                <span className="font-black text-rose-600">{formatCurrency(comparison.thisWeek.expense)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Geçen hafta</span>
                                <span className="font-bold text-muted-foreground">{formatCurrency(comparison.lastWeek.expense)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Net Karşılaştırma */}
                    <div className="space-y-3 p-4 bg-sky-50 dark:bg-sky-950/20 rounded-xl border border-sky-200 dark:border-sky-800/30">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">Net Kâr</span>
                            <ChangeIndicator value={comparison.netChange} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Bu hafta</span>
                                <span className={cn("font-black", comparison.thisWeek.net >= 0 ? "text-sky-600" : "text-rose-600")}>
                                    {formatCurrency(comparison.thisWeek.net)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Geçen hafta</span>
                                <span className="font-bold text-muted-foreground">{formatCurrency(comparison.lastWeek.net)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Week Labels */}
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/30 flex justify-between text-xs text-muted-foreground">
                    <div>
                        <span className="font-bold">Bu Hafta:</span> {comparison.thisWeekLabel} ({comparison.thisWeek.days} gün veri)
                    </div>
                    <div>
                        <span className="font-bold">Geçen Hafta:</span> {comparison.lastWeekLabel} ({comparison.lastWeek.days} gün veri)
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
