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
import { TrendingUp, TrendingDown, Target, Zap, FileSpreadsheet, BarChart3, Receipt, CircleDollarSign, Coins, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArchiveView } from "@/components/archive/ArchiveView";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

function ReportsContent() {
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
        <div className="space-y-10 pb-24 relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -z-10 animate-pulse-glow" />

            {/* Header section with tab switcher */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
                <div className="space-y-3">
                    <h2 className="text-5xl font-display font-black tracking-tighter text-foreground uppercase animate-in slide-in-from-left duration-700">
                        Analitik <span className="text-primary">&</span> Arşiv
                    </h2>
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-12 bg-primary rounded-full" />
                        <p className="text-muted-foreground font-display font-bold uppercase text-[10px] tracking-widest opacity-70">
                            Performans Kütüphanesi
                        </p>
                    </div>
                </div>

                <div className="glass-panel p-1.5 rounded-2xl border-white/10 shadow-xl backdrop-blur-2xl">
                    <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
                        <TabsList className="bg-transparent h-12 gap-2">
                            <TabsTrigger
                                value="analytics"
                                className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg font-display font-bold text-xs uppercase tracking-tight transition-all duration-300"
                            >
                                <BarChart3 className="w-4 h-4 mr-2" /> Görsel Rapor
                            </TabsTrigger>
                            <TabsTrigger
                                value="history"
                                className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg font-display font-bold text-xs uppercase tracking-tight transition-all duration-300"
                            >
                                <FileSpreadsheet className="w-4 h-4 mr-2" /> Kayıt Arşivi
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {activeTab === 'analytics' ? (
                <div className="space-y-12 animate-in fade-in duration-1000">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Toplam Ciro', value: totalIncome, icon: CircleDollarSign, color: 'emerald', trend: TrendingUp },
                            { label: 'Toplam Gider', value: totalExpense, icon: Receipt, color: 'rose', trend: TrendingDown },
                            { label: 'Net Kar', value: totalIncome - totalExpense, icon: Coins, color: 'sky', trend: Target },
                            { label: 'Kayıtlı Gün', value: records.length, isCount: true, icon: Zap, color: 'primary' }
                        ].map((stat, idx) => (
                            <Card key={idx} className={cn(
                                "border-none rounded-[2rem] overflow-hidden group hover-lift shadow-2xl transition-all duration-500",
                                `bg-${stat.color === 'primary' ? 'primary' : stat.color + '-500'}/10`
                            )}>
                                <CardContent className="p-8 relative">
                                    <div className={cn(
                                        "absolute top-0 right-0 w-24 h-24 blur-3xl opacity-20 -z-10 transition-all duration-500 group-hover:scale-150 group-hover:opacity-40",
                                        `bg-${stat.color === 'primary' ? 'primary' : stat.color + '-500'}`
                                    )} />
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={cn(
                                            "p-4 rounded-2xl shadow-glow-sm transition-all duration-500 group-hover:rotate-12",
                                            `bg-${stat.color === 'primary' ? 'primary' : stat.color + '-500'}/20`,
                                            `text-${stat.color === 'primary' ? 'primary' : stat.color + '-500'}`
                                        )}>
                                            <stat.icon className="h-6 w-6" />
                                        </div>
                                        {stat.trend && <stat.trend className="h-5 w-5 opacity-30 mt-2" />}
                                    </div>
                                    <div className="text-[10px] font-display font-black uppercase tracking-[0.2em] opacity-50 mb-1">{stat.label}</div>
                                    <div className={cn(
                                        "text-3xl font-display font-black tracking-tighter truncate",
                                        `text-${stat.color === 'primary' ? 'primary' : stat.color + '-500'}`
                                    )}>
                                        {stat.isCount ? stat.value : '₺' + stat.value.toLocaleString('tr-TR')}
                                    </div>
                                    <div className="h-1 w-full bg-muted/20 rounded-full mt-4 overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-1000 delay-300",
                                                `bg-${stat.color === 'primary' ? 'primary' : stat.color + '-500'}`)}
                                            style={{ width: '70%' }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Card className="lg:col-span-2 border-none glass-panel rounded-[3rem] overflow-hidden shadow-2xl animate-in slide-in-from-left duration-1000">
                            <CardHeader className="p-10 pb-0">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xs font-display font-black uppercase tracking-[0.3em] opacity-40">Performans Dalgalanması</CardTitle>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                            <span className="text-[10px] font-bold opacity-60 uppercase">Gelir</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                            <span className="text-[10px] font-bold opacity-60 uppercase">Gider</span>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-10 pt-6">
                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trendData}>
                                            <defs>
                                                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#D71920" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#D71920" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.03} />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.3, fontSize: 11, fontWeight: 'bold' }} />
                                            <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₺${v}`} tick={{ fill: 'currentColor', opacity: 0.3, fontSize: 11, fontWeight: 'bold' }} />
                                            <Tooltip
                                                cursor={{ stroke: '#ffffff10', strokeWidth: 2 }}
                                                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 30px 60px -10px rgba(0,0,0,0.6)' }}
                                            />
                                            <Area type="monotone" dataKey="Gelir" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#colorIn)" />
                                            <Area type="monotone" dataKey="Gider" stroke="#D71920" strokeWidth={5} fillOpacity={1} fill="url(#colorOut)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none glass-panel rounded-[3rem] overflow-hidden shadow-2xl animate-in slide-in-from-right duration-1000">
                            <CardHeader className="p-10 pb-0 text-center">
                                <CardTitle className="text-xs font-display font-black uppercase tracking-[0.3em] opacity-40 text-center">Tahsilat Türleri</CardTitle>
                            </CardHeader>
                            <CardContent className="p-10 pt-6 flex flex-col h-full">
                                <div className="h-[280px] w-full shrink-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                innerRadius={70}
                                                outerRadius={100}
                                                paddingAngle={12}
                                                dataKey="value"
                                                stroke="none"
                                                animationBegin={500}
                                                animationDuration={1500}
                                            >
                                                {pieData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-6 flex-1 flex flex-col justify-center space-y-4">
                                    {pieData.map((d, i) => (
                                        <div key={d.name} className="flex items-center justify-between p-4 rounded-3xl glass-card border-white/5 group hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="h-3 w-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                                <div className="text-[10px] font-display font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{d.name}</div>
                                            </div>
                                            <div className="text-sm font-display font-black tracking-tight">₺{d.value.toLocaleString('tr-TR')}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="animate-in slide-in-from-bottom-8 duration-700">
                    <ArchiveView />
                </div>
            )}
        </div>
    );
}

import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function ReportsArchivePage() {
    return (
        <ErrorBoundary name="Raporlar">
            <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin h-8 w-8 text-primary/50" /></div>}>
                <ReportsContent />
            </Suspense>
        </ErrorBoundary>
    );
}
