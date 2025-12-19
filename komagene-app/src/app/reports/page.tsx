"use client";

import { useStore } from "@/store/useStore";
import { format, subDays, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Target, Zap } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

export default function ReportsPage() {
    const { user, loading } = useAuth();
    const { records } = useStore();

    if (loading) return null;

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <h2 className="text-2xl font-bold">Raporlar İçin Giriş Yapın</h2>
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

    const platformData = [
        { name: 'Yemeksepeti', value: records.reduce((s, r) => s + (r.income.online.yemeksepeti || 0), 0) },
        { name: 'Getir', value: records.reduce((s, r) => s + (r.income.online.getir || 0), 0) },
        { name: 'Trendyol', value: records.reduce((s, r) => s + (r.income.online.trendyol || 0), 0) },
        { name: 'Gelal', value: records.reduce((s, r) => s + (r.income.online.gelal || 0), 0) },
    ].filter(d => d.value > 0);

    const expenseCategories = {
        supplier: 'Malzeme Alımı',
        staff: 'Personel Maaş',
        bills: 'Kira - Fatura',
        tax: 'Vergi & Muhasebe',
        other: 'Diğer'
    };

    const categoryDataMap: Record<string, number> = {};
    records.forEach(r => {
        r.expenses.forEach(e => {
            const label = expenseCategories[e.category as keyof typeof expenseCategories] || 'Diğer';
            categoryDataMap[label] = (categoryDataMap[label] || 0) + (e.amount || 0);
        });
    });

    const expensePieData = Object.entries(categoryDataMap)
        .map(([name, value]) => ({ name, value }))
        .filter(d => d.value > 0)
        .sort((a, b) => b.value - a.value);

    const EXPENSE_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#06b6d4'];

    return (
        <div className="space-y-12 pb-20 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-primary uppercase italic">Performans Raporu</h2>
                    <p className="text-muted-foreground font-medium">İşletmenizin finansal durum analizi ve trendler.</p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-none shadow-lg bg-emerald-600 text-white">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xs font-bold uppercase opacity-80">Toplam Ciro</CardTitle>
                        <TrendingUp className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">₺{totalIncome.toLocaleString('tr-TR')}</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-lg bg-rose-600 text-white">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xs font-bold uppercase opacity-80">Toplam Gider</CardTitle>
                        <TrendingDown className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">₺{totalExpense.toLocaleString('tr-TR')}</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-lg bg-sky-600 text-white">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xs font-bold uppercase opacity-80">Net Kar/Zarar</CardTitle>
                        <Target className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">₺{(totalIncome - totalExpense).toLocaleString('tr-TR')}</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-lg bg-primary text-primary-foreground">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xs font-bold uppercase opacity-80">Kayıtlı Gün</CardTitle>
                        <Zap className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{records.length}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-none shadow-xl bg-card/50 backdrop-blur-md overflow-hidden">
                    <CardHeader className="border-b border-white/10 bg-white/5 py-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black uppercase italic tracking-tighter">GELİR & GİDER AKIŞI</CardTitle>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Son 14 günlük hareket grafiği</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[400px] w-full">
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
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 10, fontWeight: 'bold' }} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₺${v}`} tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 10, fontWeight: 'bold' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="Gelir" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorIn)" />
                                    <Area type="monotone" dataKey="Gider" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorOut)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-card/50 backdrop-blur-md overflow-hidden">
                    <CardHeader className="border-b border-white/10 bg-white/5 py-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                                <Target className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black uppercase italic tracking-tighter">GELİR KANALLARI</CardTitle>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Ödeme yöntemleri dağılımı</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={70}
                                        outerRadius={100}
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
                        <div className="mt-6 pt-6 border-t border-dashed space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-widest opacity-40">Online Platformlar</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {platformData.map((p, i) => (
                                    <div key={p.name} className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                            <span className="text-[10px] font-bold uppercase opacity-60">{p.name}</span>
                                        </div>
                                        <span className="text-sm font-black">₺{p.value.toLocaleString('tr-TR')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 border-none shadow-xl bg-card/50 backdrop-blur-md overflow-hidden">
                    <CardHeader className="border-b border-white/10 bg-rose-500/5 py-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
                                <TrendingDown className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black uppercase italic tracking-tighter">GİDER ANALİZİ & DAĞILIMI</CardTitle>
                                <p className="text-[10px] font-bold text-rose-500/50 uppercase tracking-widest opacity-60">Harcamaların kategorilere göre dökümü</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="lg:col-span-1 h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={expensePieData}
                                            innerRadius={60}
                                            outerRadius={85}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {expensePieData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="lg:col-span-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full content-center">
                                    {expensePieData.map((item, index) => (
                                        <div key={item.name} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-4 h-4 rounded-full shadow-lg" style={{ backgroundColor: EXPENSE_COLORS[index % EXPENSE_COLORS.length] }} />
                                                <div>
                                                    <p className="text-[10px] font-black uppercase opacity-50 tracking-tighter">{item.name}</p>
                                                    <p className="text-lg font-black italic">₺{item.value.toLocaleString('tr-TR')}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-black px-2 py-1 bg-white/10 rounded-lg opacity-60">
                                                    %{((item.value / totalExpense) * 100).toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {expensePieData.length === 0 && (
                                        <div className="col-span-full py-10 text-center opacity-40 font-bold uppercase italic tracking-widest">
                                            Henüz gider verisi bulunamadı
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

