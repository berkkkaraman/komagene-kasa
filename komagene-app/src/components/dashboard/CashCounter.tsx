"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, RotateCcw, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";

const DENOMINATIONS = [
    { value: 200, label: "200₺", color: "bg-violet-500" },
    { value: 100, label: "100₺", color: "bg-emerald-500" },
    { value: 50, label: "50₺", color: "bg-amber-500" },
    { value: 20, label: "20₺", color: "bg-sky-500" },
    { value: 10, label: "10₺", color: "bg-rose-500" },
    { value: 5, label: "5₺", color: "bg-orange-500" },
    { value: 1, label: "1₺", color: "bg-slate-500" },
    { value: 0.5, label: "50kr", color: "bg-zinc-400" },
    { value: 0.25, label: "25kr", color: "bg-zinc-300" },
];

export function CashCounter() {
    const [counts, setCounts] = useState<Record<number, number>>({});

    const handleCountChange = (denomination: number, count: string) => {
        const num = parseInt(count) || 0;
        setCounts(prev => ({ ...prev, [denomination]: num }));
    };

    const total = DENOMINATIONS.reduce((sum, d) => {
        return sum + (counts[d.value] || 0) * d.value;
    }, 0);

    const reset = () => setCounts({});

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);

    return (
        <Card className="border-2 border-primary/20 shadow-xl bg-card/80 backdrop-blur-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                            <Calculator className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black uppercase italic tracking-tight">
                                Kasa <span className="text-primary not-italic">Sayım</span>
                            </CardTitle>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                Hızlı para sayım asistanı
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={reset}
                        className="gap-2 font-bold text-xs rounded-xl"
                    >
                        <RotateCcw className="h-4 w-4" /> Sıfırla
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                {/* Denomination Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {DENOMINATIONS.map((d) => (
                        <div
                            key={d.value}
                            className="space-y-2 p-3 rounded-xl bg-accent/30 border border-accent hover:border-primary/30 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <div className={cn("w-3 h-3 rounded-full", d.color)} />
                                <Label className="text-xs font-black uppercase tracking-wider opacity-70">
                                    {d.label}
                                </Label>
                            </div>
                            <Input
                                type="number"
                                min={0}
                                className="h-10 text-center font-black text-lg bg-background/50 border-2 focus:border-primary rounded-lg"
                                value={counts[d.value] || ""}
                                onChange={(e) => handleCountChange(d.value, e.target.value)}
                                placeholder="0"
                            />
                            {counts[d.value] > 0 && (
                                <p className="text-[10px] text-center font-bold text-muted-foreground">
                                    = {formatCurrency(counts[d.value] * d.value)}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Total Display */}
                <div className={cn(
                    "p-6 rounded-2xl text-center transition-all",
                    total > 0
                        ? "bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30"
                        : "bg-accent/20 border-2 border-dashed border-accent"
                )}>
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <Banknote className={cn("h-6 w-6", total > 0 ? "text-primary" : "text-muted-foreground")} />
                        <span className="text-xs font-black uppercase tracking-widest opacity-60">
                            Toplam Kasa
                        </span>
                    </div>
                    <p className={cn(
                        "text-4xl font-black tracking-tight",
                        total > 0 ? "text-primary" : "text-muted-foreground"
                    )}>
                        {formatCurrency(total)}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
