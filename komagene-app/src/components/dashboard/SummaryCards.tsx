import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyRecord } from "@/types";
import { DollarSign, Wallet, ShoppingCart, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardsProps {
    record: DailyRecord;
}

export function SummaryCards({ record }: SummaryCardsProps) {
    const onlineTotal = Object.values(record.income.online).reduce((a, b) => a + (b || 0), 0);
    const totalCiro = (record.income.cash || 0) + (record.income.creditCard || 0) + onlineTotal;
    const totalExpense = record.expenses.reduce((a, b) => a + (b.amount || 0), 0);
    const netCiro = totalCiro - totalExpense;

    // Low stock detection
    const lowStockItems = record.inventory?.filter(item => item.quantity <= 1) || [];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
    };

    return (
        <div className="space-y-4">
            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
                <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
                    <div className="p-3 bg-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-black text-amber-700 dark:text-amber-400 uppercase tracking-wide">Kritik Stok Uyarısı!</p>
                        <p className="text-xs text-amber-600/80 dark:text-amber-300/70 mt-0.5">
                            {lowStockItems.map(i => i.name).join(', ')} — stok azaldı veya tükendi.
                        </p>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-none shadow-lg bg-emerald-600 text-white overflow-hidden relative group transition-all hover:translate-y-[-4px] duration-300">
                    <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                        <div className="p-3 bg-white/10 rounded-full backdrop-blur-md border border-white/10 mb-1 shadow-inner">
                            <DollarSign className="h-5 w-5" />
                        </div>
                        <p className="text-[10px] font-black opacity-80 uppercase tracking-[0.2em]">Toplam Gelir</p>
                        <div className="text-3xl font-black tracking-tighter drop-shadow-md">{formatCurrency(totalCiro)}</div>
                        <div className="h-1 w-8 bg-white/20 rounded-full mt-1" />
                        <p className="text-[9px] opacity-60 font-bold uppercase tracking-tight mt-1">Günü Birlik Brüt</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-rose-600 text-white overflow-hidden relative group transition-all hover:translate-y-[-4px] duration-300">
                    <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                        <div className="p-3 bg-white/10 rounded-full backdrop-blur-md border border-white/10 mb-1 shadow-inner">
                            <ShoppingCart className="h-5 w-5" />
                        </div>
                        <p className="text-[10px] font-black opacity-80 uppercase tracking-[0.2em]">Toplam Gider</p>
                        <div className="text-3xl font-black tracking-tighter drop-shadow-md">{formatCurrency(totalExpense)}</div>
                        <div className="h-1 w-8 bg-white/20 rounded-full mt-1" />
                        <p className="text-[9px] opacity-60 font-bold uppercase tracking-tight mt-1">{record.expenses.length} Kayıtlı Harcama</p>
                    </CardContent>
                </Card>

                <Card className={cn(
                    "border-none shadow-lg text-white overflow-hidden relative group transition-all hover:translate-y-[-4px] duration-300",
                    netCiro >= 0 ? "bg-emerald-600" : "bg-rose-600"
                )}>
                    <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                        <div className="p-3 bg-white/10 rounded-full backdrop-blur-md border border-white/10 mb-1 shadow-inner">
                            <Wallet className="h-5 w-5" />
                        </div>
                        <p className="text-[10px] font-black opacity-80 uppercase tracking-[0.2em]">{netCiro >= 0 ? "Net Kâr" : "Net Zarar"}</p>
                        <div className="text-3xl font-black tracking-tighter drop-shadow-md">{formatCurrency(Math.abs(netCiro))}</div>
                        <div className="h-1 w-8 bg-white/20 rounded-full mt-1" />
                        <p className="text-[9px] opacity-60 font-bold uppercase tracking-tight mt-1">{netCiro >= 0 ? "Günlük Kazanç ✓" : "Günlük Kayıp ✗"}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
