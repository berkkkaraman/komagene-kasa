import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Wallet, Eye, EyeOff, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <div className="space-y-4">
            <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                    const text = `📅 *Komagene Raporu*\n\n💵 *Ciro:* ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(income)}\n📉 *Gider:* ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(expense)}\n✅ *Net:* ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(income - expense)}\n\n_Hayırlı işler!_`;
                    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                    window.open(url, '_blank');
                }} className="text-emerald-600 gap-2 border-emerald-200">
                    <Share2 className="h-4 w-4" />
                    Patrona Raporla
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setHidden(!hidden)} className="text-muted-foreground">
                    {hidden ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />}
                    {hidden ? "Göster" : "Gizle"}
                </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
                        <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600 tracking-tight">
                            {formatVal(income)}
                        </div>
                        <p className="text-xs text-muted-foreground">Günlük ciro</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
                        <ArrowDownIcon className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600 tracking-tight">
                            {formatVal(expense)}
                        </div>
                        <p className="text-xs text-muted-foreground">Günlük harcama</p>
                    </CardContent>
                </Card>

                <Card className={net < 0 ? "border-red-200 bg-red-50 dark:bg-red-950/20" : "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20"}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Kasa</CardTitle>
                        <Wallet className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold tracking-tight ${net < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {formatVal(net)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {net >= 0 ? 'Kârdasınız 🎉' : 'Dikkat: Zarar'}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
