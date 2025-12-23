"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { format, startOfWeek, startOfMonth, isWithinInterval, subDays } from "date-fns";
import { tr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Wallet, FileSpreadsheet, Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight, CircleDollarSign, Receipt, Coins, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComparativeReport } from "./ComparativeReport";
import { ForecastCard } from "./ForecastCard";


export function ArchiveView() {
    const { records } = useStore();
    const [filter, setFilter] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('weekly');

    const getFilteredRecords = () => {
        const now = new Date();
        if (filter === 'daily') {
            return records.filter(r => r.date === format(now, "yyyy-MM-dd"));
        }
        if (filter === 'weekly') {
            const start = startOfWeek(now, { weekStartsOn: 1 });
            return records.filter(r => new Date(r.date) >= start);
        }
        if (filter === 'monthly') {
            const start = startOfMonth(now);
            return records.filter(r => new Date(r.date) >= start);
        }
        if (filter === 'all') {
            return records;
        }
        return records;
    };

    const filteredData = getFilteredRecords().sort((a, b) => a.date.localeCompare(b.date));

    // Aggregate Calculations
    const totalGelir = filteredData.reduce((acc, r) => {
        const onlineTotal = Object.values(r.income.online).reduce((a, b) => a + (b || 0), 0);
        return acc + (r.income.cash || 0) + (r.income.creditCard || 0) + onlineTotal;
    }, 0);

    const totalGider = filteredData.reduce((acc, r) => {
        return acc + r.expenses.reduce((a, b) => a + (b.amount || 0), 0);
    }, 0);

    const netDurum = totalGelir - totalGider;

    const chartData = filteredData.map(r => {
        const onlineTotal = Object.values(r.income.online).reduce((a, b) => a + (b || 0), 0);
        const totalIncome = (r.income.cash || 0) + (r.income.creditCard || 0) + onlineTotal;
        const totalExpense = r.expenses.reduce((a, b) => a + (b.amount || 0), 0);
        return {
            tarih: format(new Date(r.date), "dd MMM", { locale: tr }),
            gelir: totalIncome,
            gider: totalExpense,
            net: totalIncome - totalExpense
        };
    });

    // Expense Category Pie Chart Data
    const categoryLabels: Record<string, string> = {
        supplier: 'Tedarikçi',
        staff: 'Personel',
        bills: 'Faturalar',
        tax: 'Vergi',
        other: 'Diğer'
    };
    const categoryColors: Record<string, string> = {
        supplier: '#f97316',
        staff: '#8b5cf6',
        bills: '#06b6d4',
        tax: '#ef4444',
        other: '#64748b'
    };
    const expenseByCategory = filteredData.reduce((acc, r) => {
        r.expenses.forEach(exp => {
            const cat = exp.category || 'other';
            acc[cat] = (acc[cat] || 0) + exp.amount;
        });
        return acc;
    }, {} as Record<string, number>);
    const pieData = Object.entries(expenseByCategory).map(([key, value]) => ({
        name: categoryLabels[key] || key,
        value,
        color: categoryColors[key] || '#64748b'
    }));

    const downloadExcel = () => {
        const filterNames: Record<string, string> = {
            'daily': 'Gunluk',
            'weekly': 'Haftalik',
            'monthly': 'Aylik',
            'all': 'Tum_Zamanlar'
        };

        // CSV headers
        const headers = ['Tarih', 'Nakit', 'Kredi Karti', 'Yemeksepeti', 'Getir', 'Trendyol', 'Gelal', 'Toplam Gelir', 'Toplam Gider', 'Net Kar/Zarar'];

        // Build CSV rows from filtered data
        const rows = filteredData.map(record => {
            const onlineTotal = Object.values(record.income.online).reduce((a, b) => a + (b || 0), 0);
            const totalIncome = (record.income.cash || 0) + (record.income.creditCard || 0) + onlineTotal;
            const totalExpense = record.expenses.reduce((a, b) => a + (b.amount || 0), 0);
            const netProfit = totalIncome - totalExpense;

            return [
                record.date,
                record.income.cash || 0,
                record.income.creditCard || 0,
                record.income.online.yemeksepeti || 0,
                record.income.online.getir || 0,
                record.income.online.trendyol || 0,
                record.income.online.gelal || 0,
                totalIncome,
                totalExpense,
                netProfit
            ].join(';');
        });

        // Add summary row
        const summaryRow = ['TOPLAM', '', '', '', '', '', '', totalGelir, totalGider, netDurum].join(';');

        // Combine all
        const csvContent = [headers.join(';'), ...rows, '', summaryRow].join('\n');

        // Add BOM for Excel Turkish character support
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Gunkasa_Rapor_${filterNames[filter]}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };


    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Oracle Forecast - AI Prediction */}
            <ForecastCard />

            {/* Comparative Report - Week over Week */}
            <ComparativeReport />

            {/* Header & Filters */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-2">
                <div className="space-y-1 text-center lg:text-left">
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase">VERİ <span className="text-primary not-italic">ARŞİVİ</span></h2>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">Geçmiş performans ve kayıt yönetimi</p>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-card/30 p-1.5 rounded-2xl border-2 border-slate-200 dark:border-white/10 shadow-md">
                    <Tabs value={filter} onValueChange={(v: any) => setFilter(v)} className="w-full sm:w-auto">
                        <TabsList className="bg-transparent h-10 gap-1">
                            {['daily', 'weekly', 'monthly', 'all'].map((f) => (
                                <TabsTrigger
                                    key={f}
                                    value={f}
                                    className="rounded-xl px-5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg font-bold text-xs uppercase transition-all"
                                >
                                    {f === 'daily' ? 'Gün' : f === 'weekly' ? 'Hafta' : f === 'monthly' ? 'Ay' : 'Tümü'}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                    <div className="w-[1px] h-6 bg-slate-300 dark:bg-white/10 mx-1" />
                    <Button variant="ghost" size="icon" onClick={downloadExcel} className="h-10 w-10 rounded-xl hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors" title="Excel olarak indir">
                        <FileSpreadsheet className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-2 border-emerald-200 dark:border-emerald-500/20 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-500/10 dark:to-emerald-500/5 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 rounded-2xl">
                    <div className="absolute top-[-10%] right-[-5%] opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
                        <TrendingUp size={120} />
                    </div>
                    <CardHeader className="pb-2 relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                                <CircleDollarSign className="h-5 w-5" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Periyot Geliri</p>
                        </div>
                        <CardTitle className="text-3xl font-black tracking-tighter text-emerald-600 dark:text-emerald-400">{formatCurrency(totalGelir)}</CardTitle>
                    </CardHeader>
                </Card>

                <Card className="border-2 border-rose-200 dark:border-rose-500/20 bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-500/10 dark:to-rose-500/5 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 rounded-2xl">
                    <div className="absolute top-[-10%] right-[-5%] opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
                        <TrendingDown size={120} />
                    </div>
                    <CardHeader className="pb-2 relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30">
                                <Receipt className="h-5 w-5" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Periyot Gideri</p>
                        </div>
                        <CardTitle className="text-3xl font-black tracking-tighter text-rose-600 dark:text-rose-400">{formatCurrency(totalGider)}</CardTitle>
                    </CardHeader>
                </Card>

                <Card className={cn(
                    "border-2 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 rounded-2xl",
                    netDurum >= 0
                        ? "border-sky-200 dark:border-primary/20 bg-gradient-to-br from-sky-50 to-sky-100 dark:from-primary/10 dark:to-primary/5"
                        : "border-orange-200 dark:border-orange-500/20 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-500/10 dark:to-orange-500/5"
                )}>
                    <div className="absolute top-[-10%] right-[-5%] opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
                        <Coins size={120} />
                    </div>
                    <CardHeader className="pb-2 relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={cn(
                                "p-2.5 rounded-xl border",
                                netDurum >= 0
                                    ? "bg-sky-500/20 text-sky-600 dark:text-primary border-sky-300 dark:border-primary/30"
                                    : "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-500/30"
                            )}>
                                <Coins className="h-5 w-5" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Net Performans</p>
                        </div>
                        <CardTitle className={cn(
                            "text-3xl font-black tracking-tighter",
                            netDurum >= 0 ? "text-sky-600 dark:text-primary" : "text-orange-600 dark:text-orange-400"
                        )}>{formatCurrency(netDurum)}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Performance Chart */}
            <Card className="border-2 border-slate-200 dark:border-white/10 shadow-lg bg-white dark:bg-slate-900/40 backdrop-blur-xl overflow-hidden rounded-2xl">
                <CardHeader className="border-b-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 py-4">
                    <CardTitle className="text-xs font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" /> Gelir & Gider Analizi
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <defs>
                                    <linearGradient id="lineGelir" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="lineGider" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,100,100,0.15)" />
                                <XAxis dataKey="tarih" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} tickFormatter={(v) => `₺${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '2px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                                    labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
                                />
                                <Line type="monotone" dataKey="gelir" name="Gelir" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: "#10b981", strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 10, strokeWidth: 0, fill: '#10b981' }} />
                                <Line type="monotone" dataKey="gider" name="Gider" stroke="#ef4444" strokeWidth={3} strokeDasharray="8 6" dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} />
                                <Line type="monotone" dataKey="net" name="Net" stroke="#3b82f6" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Income Distribution (Reports Merge) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-2 border-slate-200 dark:border-white/10 shadow-lg bg-white dark:bg-slate-900/40 backdrop-blur-xl overflow-hidden rounded-2xl">
                    <CardHeader className="border-b-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 py-4">
                        <CardTitle className="text-xs font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                            <Wallet className="h-4 w-4" /> Gelir Kaynakları
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Nakit', value: totalGelir > 0 ? filteredData.reduce((s, r) => s + (r.income.cash || 0), 0) : 0, color: '#10b981' },
                                            { name: 'Kredi Kartı', value: totalGelir > 0 ? filteredData.reduce((s, r) => s + (r.income.creditCard || 0), 0) : 0, color: '#3b82f6' },
                                            { name: 'Online', value: totalGelir > 0 ? filteredData.reduce((s, r) => s + Object.values(r.income.online).reduce((a, b) => a + (b || 0), 0), 0) : 0, color: '#f59e0b' }
                                        ].filter(d => d.value > 0)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell fill="#10b981" />
                                        <Cell fill="#3b82f6" />
                                        <Cell fill="#f59e0b" />
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Expense Category Pie Chart */}
            {pieData.length > 0 && (
                <Card className="border-2 border-slate-200 dark:border-white/10 shadow-lg bg-white dark:bg-slate-900/40 backdrop-blur-xl overflow-hidden rounded-2xl">
                    <CardHeader className="border-b-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 py-4">
                        <CardTitle className="text-xs font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                            <Receipt className="h-4 w-4" /> Gider Dağılımı (Kategorilere Göre)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        innerRadius={50}
                                        fill="#8884d8"
                                        dataKey="value"
                                        paddingAngle={2}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => formatCurrency(Number(value ?? 0))}
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '2px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Detailed History Table/List */}
            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest opacity-40 px-2 pb-2">Kayıt Detayları</h3>
                <div className="grid grid-cols-1 gap-3">
                    {chartData.slice().reverse().map((row, i) => (
                        <Card key={i} className="border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-card/30 hover:bg-slate-50 dark:hover:bg-card/50 transition-all group overflow-hidden shadow-md rounded-2xl">
                            <CardContent className="p-0">
                                <div className="flex flex-col sm:flex-row items-center divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-white/5">
                                    <div className="p-6 sm:w-48 text-center sm:text-left bg-slate-50 dark:bg-white/5 shrink-0">
                                        <p className="text-[10px] font-black uppercase opacity-40 mb-1">Tarih</p>
                                        <span className="text-lg font-black italic text-slate-700 dark:text-white">{row.tarih}</span>
                                    </div>
                                    <div className="p-6 flex-1 text-center">
                                        <p className="text-[10px] font-black uppercase opacity-40 mb-1">Gelir</p>
                                        <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-black">
                                            <ArrowUpRight className="h-4 w-4" />
                                            <span className="text-xl tracking-tighter">{formatCurrency(row.gelir)}</span>
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1 text-center">
                                        <p className="text-[10px] font-black uppercase opacity-40 mb-1">Gider</p>
                                        <div className="flex items-center justify-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
                                            <ArrowDownRight className="h-4 w-4" />
                                            <span className="text-xl tracking-tighter">{formatCurrency(row.gider)}</span>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "p-6 sm:w-64 text-center shrink-0 transition-colors",
                                        row.net >= 0
                                            ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                            : "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500"
                                    )}>
                                        <p className="text-[10px] font-black uppercase opacity-60 mb-1">Net Durum</p>
                                        <span className="text-2xl font-black italic tracking-tighter">{formatCurrency(row.net)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {chartData.length === 0 && (
                        <div className="py-20 text-center space-y-4 border-2 border-dashed border-white/5 rounded-3xl">
                            <div className="mx-auto w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                                <CalendarIcon className="h-8 w-8 opacity-20" />
                            </div>
                            <p className="text-sm font-black uppercase tracking-widest opacity-30 italic">
                                Seçili periyotta kayıt bulunamadı
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


