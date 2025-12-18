"use client";

import { useEffect, useState } from "react";
import { StorageService } from "@/services/storage";
import { SupabaseService } from "@/services/supabase";
import { DailyRecord } from "@/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";
import { format, subDays, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

const COLORS = ['#10b981', '#3b82f6', '#f97316', '#a855f7']; // Green, Blue, Orange, Purple

export default function ReportsPage() {
    const [records, setRecords] = useState<DailyRecord[]>([]);
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
        const loadRecords = async () => {
            try {
                const cloudData = await SupabaseService.getRecords();
                if (cloudData.length > 0) {
                    setRecords(cloudData);
                    StorageService.saveRecords(cloudData);
                } else {
                    setRecords(StorageService.getRecords());
                }
            } catch (error) {
                console.error("Reports cloud fetch failed:", error);
                setRecords(StorageService.getRecords());
            } finally {
                setLoading(false);
            }
        };
        loadRecords();
    }, []);

    if (!mounted) return null;

    // Process Data for Trend Chart (Last 7 Days)
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(today, 6 - i);
        return format(d, 'yyyy-MM-dd');
    });

    const trendData = last7Days.map(dateStr => {
        const rec = records.find(r => r.date === dateStr);
        let income = 0;
        let expense = 0;
        if (rec) {
            income = (rec.income.cash || 0) + (rec.income.creditCard || 0) +
                Object.values(rec.income.mealCard).reduce((a, b) => a + b, 0) +
                Object.values(rec.income.online).reduce((a, b) => a + b, 0);
            expense = rec.expenses.reduce((a, b) => a + b.amount, 0);
        }
        return {
            date: format(parseISO(dateStr), 'd MMM', { locale: tr }),
            Gelir: income,
            Gider: expense
        };
    });

    // Process Data for Pie Chart (All Time or Last 30 Days?) 
    // User said "Gelir Dağılımı". Usually for the selected period.
    // Let's do aggregation of ALL visible records or Last 30 Days default.
    // I'll calculate from ALL loaded records for distribution overview.

    let totalCash = 0;
    let totalCC = 0;
    let totalOnline = 0;
    let totalMeal = 0;

    records.forEach(rec => {
        totalCash += rec.income.cash || 0;
        totalCC += rec.income.creditCard || 0;
        totalOnline += Object.values(rec.income.online).reduce((a, b) => a + b, 0);
        totalMeal += Object.values(rec.income.mealCard).reduce((a, b) => a + b, 0);
    });

    const pieData = [
        { name: 'Nakit', value: totalCash },
        { name: 'Kredi Kartı', value: totalCC },
        { name: 'Online', value: totalOnline },
        { name: 'Yemek Kartı', value: totalMeal },
    ].filter(d => d.value > 0);

    // Online Platform Performance Aggregation
    const platformTotals = { yemeksepeti: 0, getir: 0, trendyol: 0, gelal: 0 };
    records.forEach(rec => {
        platformTotals.yemeksepeti += rec.income.online.yemeksepeti || 0;
        platformTotals.getir += rec.income.online.getir || 0;
        platformTotals.trendyol += rec.income.online.trendyol || 0;
        platformTotals.gelal += rec.income.online.gelal || 0;
    });

    const onlinePlatformData = [
        { name: 'Yemeksepeti', value: platformTotals.yemeksepeti, color: '#ff0000' },
        { name: 'Getir', value: platformTotals.getir, color: '#5d3891' },
        { name: 'Trendyol', value: platformTotals.trendyol, color: '#f27a1a' },
        { name: 'Gel-Al', value: platformTotals.gelal, color: '#10b981' },
    ].filter(d => d.value > 0).sort((a, b) => b.value - a.value);

    return (
        <div className="space-y-6 pt-4 pb-20 container mx-auto">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-primary">Raporlar</h2>
                <p className="text-muted-foreground">Finansal analiz ve grafikler</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trend Chart */}
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Son 7 Günlük Hareket</CardTitle>
                        <CardDescription>Gelir ve Gider Karşılaştırması</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorGelir" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorGider" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="Gelir" stroke="#10b981" fillOpacity={1} fill="url(#colorGelir)" />
                                    <Area type="monotone" dataKey="Gider" stroke="#ef4444" fillOpacity={1} fill="url(#colorGider)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Gelir Dağılımı (Genel)</CardTitle>
                        <CardDescription>Ödeme yöntemlerine göre dağılım</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <div className="h-[300px] w-full max-w-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(value))} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Stats or Table? */}
                {/* Online Platform Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Online Platform Performansı</CardTitle>
                        <CardDescription>Platform bazlı ciro dağılımı</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={onlinePlatformData} layout="vertical" margin={{ left: 40, right: 40 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                                    <Tooltip formatter={(value) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(value))} />
                                    <Bar dataKey="value" name="Ciro" radius={[0, 4, 4, 0]}>
                                        {onlinePlatformData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Genel Özet & Karlılık</CardTitle>
                        <CardDescription>Tüm zamanların finansal özeti</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm text-muted-foreground">Kayıtlı Gün Sayısı</span>
                            <span className="font-bold">{records.length}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm text-muted-foreground">Brüt Gelir</span>
                            <span className="font-bold text-emerald-600">
                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(pieData.reduce((a, b) => a + b.value, 0))}
                            </span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm text-muted-foreground">Toplam Gider</span>
                            <span className="font-bold text-red-600">
                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(records.reduce((a, b) => a + b.expenses.reduce((s, e) => s + e.amount, 0), 0))}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-sm font-bold uppercase tracking-wider">Net Kar / Zarar</span>
                            {(() => {
                                const income = pieData.reduce((a, b) => a + b.value, 0);
                                const expense = records.reduce((a, b) => a + b.expenses.reduce((s, e) => s + e.amount, 0), 0);
                                const net = income - expense;
                                return (
                                    <span className={cn("text-xl font-black", net >= 0 ? "text-emerald-600" : "text-red-600")}>
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(net)}
                                    </span>
                                );
                            })()}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
