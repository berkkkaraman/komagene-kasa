"use client";

import { useStore } from "@/store/useStore";
import { format, subDays, parseISO, startOfWeek, startOfMonth } from "date-fns";
import { tr } from "date-fns/locale";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Target, Zap, FileSpreadsheet, BarChart3, Receipt, CircleDollarSign, Coins } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { ArchiveView } from "@/components/archive/ArchiveView";

import { useSearchParams } from "next/navigation";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

export default function ReportsArchivePage() {
    const { user, loading } = useAuth();
    const { records } = useStore();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') as 'analytics' | 'history' || 'analytics';
    const [activeTab, setActiveTab] = useState<'analytics' | 'history'>(initialTab);

    if (loading) return null;

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <h2 className="text-2xl font-bold">Erişim İçin Giriş Yapın</h2>
                <Button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}>
                    Google ile Giriş Yap
                </Button>
            </div>
        );
    }

    // Process Data for Trend Chart (Last 14 Days)
    const last14Days = Array.from({ length: 14 }, (_, i) => {
        const d = subDays(new Date(), 13 - i);
        return format(d, 'yyyy-MM-dd');
    });

    const trendData = last14Days.map(dateStr => {
        const rec = records.find(r => r.date === dateStr);
        let income = 0;
        let expense = 0;
        if (rec) {
            income = (rec.income.cash || 0) + (rec.income.creditCard || 0) +
                Object.values(rec.income.online).reduce((a, b) => a + (b || 0), 0);
            expense = rec.expenses.reduce((a, b) => a + (b.amount || 0), 0);
        }
        return {
            date: format(parseISO(dateStr), 'd MMM', { locale: tr }),
            Gelir: income,
            Gider: expense
        };
    });

    // Aggregations
    let totalIncome = 0;
    let totalExpense = 0;
    records.forEach(r => {
        totalIncome += (r.income.cash || 0) + (r.income.creditCard || 0) +
            Object.values(r.income.online).reduce((a, b) => a + (b || 0), 0);
        totalExpense += r.expenses.reduce((a, b) => a + (b.amount || 0), 0);
    });

    const pieData = [
        { name: 'Nakit', value: records.reduce((s, r) => s + (r.income.cash || 0), 0) },
        { name: 'POS', value: records.reduce((s, r) => s + (r.income.creditCard || 0), 0) },
        { name: 'Online', value: records.reduce((s, r) => s + Object.values(r.income.online).reduce((a, b) => a + (b || 0), 0), 0) },
    ].filter(d => d.value > 0);

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-700">
            {/* Header section with tab switcher */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                        Analitik <span className="text-primary not-italic">&</span> Arşiv
                    </h2>
                    <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest opacity-70">
                        İşletme performansı ve veri kütüphanesi
                    </p>
                </div>

                <div className="bg-secondary/50 p-1 rounded-2xl border border-border/50 backdrop-blur-sm">
                    <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
                        <TabsList className="bg-transparent h-11 gap-1">
                            <TabsTrigger value="analytics" className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-tight transition-all">
                                <BarChart3 className="w-4 h-4 mr-2" /> Görsel Rapor
                            </TabsTrigger>
                            <TabsTrigger value="history" className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-tight transition-all">
                                <FileSpreadsheet className="w-4 h-4 mr-2" /> Kayıt Arşivi
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {activeTab === 'analytics' ? (
                <div className="space-y-10">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="border-none bg-emerald-500/10 text-emerald-500 rounded-3xl overflow-hidden relative group">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-emerald-500/10 rounded-xl"><CircleDollarSign className="h-5 w-5" /></div>
                                    <TrendingUp className="h-4 w-4 opacity-50" />
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Toplam Ciro</div>
                                <div className="text-2xl font-black italic">₺{totalIncome.toLocaleString('tr-TR')}</div>
                            </CardContent>
                        </Card>

                        <Card className="border-none bg-rose-500/10 text-rose-500 rounded-3xl overflow-hidden relative">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-rose-500/10 rounded-xl"><Receipt className="h-5 w-5" /></div>
                                    <TrendingDown className="h-4 w-4 opacity-50" />
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Toplam Gider</div>
                                <div className="text-2xl font-black italic">₺{totalExpense.toLocaleString('tr-TR')}</div>
                            </CardContent>
                        </Card>

                        <Card className="border-none bg-sky-500/10 text-sky-500 rounded-3xl overflow-hidden relative">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-sky-500/10 rounded-xl"><Coins className="h-5 w-5" /></div>
                                    <Target className="h-4 w-4 opacity-50" />
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Net Kar</div>
                                <div className="text-2xl font-black italic">₺{(totalIncome - totalExpense).toLocaleString('tr-TR')}</div>
                            </CardContent>
                        </Card>

                        <Card className="border-none bg-primary/10 text-primary rounded-3xl overflow-hidden relative">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-primary/10 rounded-xl"><Zap className="h-5 w-5" /></div>
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Kayıtlı Gün</div>
                                <div className="text-2xl font-black italic">{records.length} Gün</div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 border-none bg-secondary/30 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="px-8 pt-8 pb-2">
                                <CardTitle className="text-sm font-black uppercase tracking-widest opacity-40">Gelir & Gider Akışı</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trendData}>
                                            <defs>
                                                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.05} />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.4, fontSize: 10, fontWeight: 'bold' }} />
                                            <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₺${v}`} tick={{ fill: 'currentColor', opacity: 0.4, fontSize: 10, fontWeight: 'bold' }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '24px', border: '1px solid hsl(var(--border))', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)' }}
                                            />
                                            <Area type="monotone" dataKey="Gelir" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorIn)" />
                                            <Area type="monotone" dataKey="Gider" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorOut)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none bg-secondary/30 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="px-8 pt-8 pb-2">
                                <CardTitle className="text-sm font-black uppercase tracking-widest opacity-40">Tip Dağılımı</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 flex flex-col items-center justify-center">
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={8}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {pieData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                                    {pieData.map((d, i) => (
                                        <div key={d.name} className="bg-background/40 p-3 rounded-2xl border border-border/10">
                                            <div className="text-[9px] font-black uppercase opacity-40">{d.name}</div>
                                            <div className="text-sm font-black">₺{d.value.toLocaleString('tr-TR')}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                    <ArchiveView />
                </div>
            )}
        </div>
    );
}
