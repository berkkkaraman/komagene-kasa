"use client";

import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import { generateForecast } from "@/services/forecastService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, TrendingDown, Minus, Sparkles, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

export function ForecastCard() {
    const { records } = useStore();

    const forecast = useMemo(() => {
        return generateForecast(records);
    }, [records]);

    if (!forecast) return null;

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);

    return (
        <Card className="border-none shadow-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-widest text-violet-100">
                        <BrainCircuit className="h-5 w-5" />
                        Gelecek Tahmini
                    </CardTitle>
                    <p className="text-xs text-violet-200/60 font-medium">Yapay Zeka Destekli 7 Günlük Projeksiyon</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                    Güven Skoru: %{forecast.confidence}
                </div>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Stats */}
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm font-medium text-violet-200 uppercase tracking-wider mb-1">Beklenen Haftalık Ciro</p>
                            <div className="flex items-baseline gap-3">
                                <span className="text-4xl sm:text-5xl font-black tracking-tighter">
                                    {formatCurrency(forecast.predictedRevenue)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm bg-white/10 border border-white/10",
                                forecast.trend === 'up' && "text-emerald-300 bg-emerald-500/20 border-emerald-500/30",
                                forecast.trend === 'down' && "text-rose-300 bg-rose-500/20 border-rose-500/30"
                            )}>
                                {forecast.trend === 'up' && <TrendingUp className="h-5 w-5" />}
                                {forecast.trend === 'down' && <TrendingDown className="h-5 w-5" />}
                                {forecast.trend === 'stable' && <Minus className="h-5 w-5" />}
                                <span className="font-bold uppercase tracking-wide">
                                    {forecast.trend === 'up' ? "Yükseliş Trendi" : forecast.trend === 'down' ? "Düşüş Trendi" : "Stabil Seyir"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Mini Chart */}
                    <div className="h-[120px] w-full mt-4 md:mt-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={forecast.nextWeekData}>
                                <defs>
                                    <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="white" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="white" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" hide />
                                <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                                <Tooltip
                                    contentStyle={{ background: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', color: '#000' }}
                                    itemStyle={{ color: '#6d28d9', fontWeight: 'bold' }}
                                    formatter={(value: any) => [formatCurrency(value || 0), 'Tahmin']}
                                    labelStyle={{ color: '#666' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="white"
                                    strokeWidth={3}
                                    fill="url(#forecastGradient)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-[10px] text-violet-200/40">
                    <Sparkles className="h-3 w-3" />
                    <span>Linear Regression algoritması kullanılarak hesaplanmıştır. Kesinlik garanti edilmez.</span>
                </div>
            </CardContent>
        </Card>
    );
}
