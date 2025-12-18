import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Wallet, Eye, EyeOff, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
    income: number;
    expense: number;
}

export function StatsCards({ income, expense }: StatsCardsProps) {
    const [hidden, setHidden] = useState(false);
    const net = income - expense;

    const formatVal = (val: number) => {
        if (hidden) return "••••••";
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold tracking-tight">Finansal Özet</h3>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                        const text = `📅 *Komagene Raporu*\n\n💵 *Ciro:* ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(income)}\n📉 *Gider:* ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(expense)}\n✅ *Net:* ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(income - expense)}\n\n_Hayırlı işler!_`;
                        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                        window.open(url, '_blank');
                    }} className="text-emerald-600 gap-2 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 transition-all active:scale-95 shadow-sm">
                        <Share2 className="h-4 w-4" />
                        Patrona Raporla
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setHidden(!hidden)} className="text-muted-foreground hover:bg-accent/50">
                        {hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="glass-card shadow-sm border border-border group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-foreground/70 group-hover:text-emerald-700 transition-colors">Toplam Gelir</CardTitle>
                        <div className="p-2 bg-emerald-600/10 rounded-xl group-hover:scale-110 transition-transform">
                            <ArrowUpIcon className="h-5 w-5 text-emerald-700" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-emerald-600 tracking-tight">
                            {formatVal(income)}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Günlük Ciro</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card shadow-sm border border-border group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-foreground/70 group-hover:text-red-700 transition-colors">Toplam Gider</CardTitle>
                        <div className="p-2 bg-red-600/10 rounded-xl group-hover:scale-110 transition-transform">
                            <ArrowDownIcon className="h-5 w-5 text-red-700" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-red-600 tracking-tight">
                            {formatVal(expense)}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Harcamalar</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className={cn(
                    "glass-card shadow-md border-2 group",
                    net < 0 ? "border-red-500/30 bg-red-50/20" : "border-emerald-500/30 bg-emerald-50/20"
                )}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-foreground/80">Net Kasa Durumu</CardTitle>
                        <div className={cn(
                            "p-2 rounded-xl group-hover:scale-110 transition-transform",
                            net < 0 ? "bg-red-600/20" : "bg-emerald-600/20"
                        )}>
                            <Wallet className={cn("h-5 w-5", net < 0 ? "text-red-700" : "text-emerald-700")} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={cn(
                            "text-3xl font-extrabold tracking-tight",
                            net < 0 ? 'text-red-600' : 'text-emerald-600'
                        )}>
                            {formatVal(net)}
                        </div>
                        <p className={cn(
                            "text-xs font-semibold mt-1",
                            net >= 0 ? 'text-emerald-600/80' : 'text-red-600/80'
                        )}>
                            {net >= 0 ? 'Kârdasınız 🎉' : 'Dikkat: Zarar Durumu'}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
