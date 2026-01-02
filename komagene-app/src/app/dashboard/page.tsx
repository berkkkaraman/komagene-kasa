"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
    Banknote, CreditCard, ShoppingBag, Truck, Users, Receipt, FileText,
    Plus, Minus, Loader2, TrendingUp, TrendingDown, Wallet,
    ShoppingCart, BarChart3, Settings, Monitor, ArrowRight,
    CircleDollarSign, Coins, Activity, Clock
} from "lucide-react";
import { DailyRecord, ExpenseItem } from "@/types";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/components/auth/AuthProvider";

const EXPENSE_CATEGORIES = [
    { id: 'supplier', label: 'Tedarikçi', icon: Truck },
    { id: 'staff', label: 'Personel', icon: Users },
    { id: 'bills', label: 'Faturalar', icon: Receipt },
    { id: 'tax', label: 'Vergi', icon: FileText },
    { id: 'other', label: 'Diğer', icon: ShoppingBag },
];

function DashboardContent() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { records, addRecord, updateRecord, userProfile } = useStore();
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    // Dialogs
    const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
    const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

    // Get today's record
    const todayRecord = records.find(r => r.date === todayStr);

    // Income form state
    const [cashIncome, setCashIncome] = useState<string>("");
    const [cardIncome, setCardIncome] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    // Expense form state
    const [expenseAmount, setExpenseAmount] = useState<string>("");
    const [expenseCategory, setExpenseCategory] = useState<string>("supplier");
    const [expenseDescription, setExpenseDescription] = useState<string>("");

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.replace("/login");
        }
    }, [user, authLoading, router]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const getTotalIncome = () => {
        if (!todayRecord) return 0;
        const online = Object.values(todayRecord.income.online).reduce((a, b) => a + (b || 0), 0);
        return (todayRecord.income.cash || 0) + (todayRecord.income.creditCard || 0) + online;
    };

    const getTotalExpense = () => {
        if (!todayRecord) return 0;
        return todayRecord.expenses.reduce((a, b) => a + (b.amount || 0), 0);
    };

    const netProfit = getTotalIncome() - getTotalExpense();

    const handleAddIncome = () => {
        if (!userProfile?.branch_id) {
            toast.error("Oturum açılmamış!");
            return;
        }

        const cashVal = parseFloat(cashIncome) || 0;
        const cardVal = parseFloat(cardIncome) || 0;

        if (cashVal === 0 && cardVal === 0) {
            toast.error("En az bir gelir girmelisiniz.");
            return;
        }

        setIsLoading(true);

        if (todayRecord) {
            const updated: DailyRecord = {
                ...todayRecord,
                income: {
                    ...todayRecord.income,
                    cash: (todayRecord.income.cash || 0) + cashVal,
                    creditCard: (todayRecord.income.creditCard || 0) + cardVal,
                },
                isSynced: false
            };
            updateRecord(updated);
        } else {
            const newRecord: DailyRecord = {
                id: crypto.randomUUID(),
                branch_id: userProfile.branch_id,
                date: todayStr,
                income: {
                    cash: cashVal,
                    creditCard: cardVal,
                    online: { yemeksepeti: 0, getir: 0, trendyol: 0, gelal: 0 },
                    source: 'manual'
                },
                expenses: [],
                ledgers: [],
                inventory: [],
                shift: { cashOnStart: 0, cashOnEnd: 0, difference: 0 },
                note: '',
                isSynced: false,
                isClosed: false
            };
            addRecord(newRecord);
        }

        setCashIncome("");
        setCardIncome("");
        setIncomeDialogOpen(false);
        toast.success("Gelir eklendi!");
        setIsLoading(false);
    };

    const handleAddExpense = () => {
        if (!userProfile?.branch_id) {
            toast.error("Oturum açılmamış!");
            return;
        }

        const amount = parseFloat(expenseAmount);
        if (!amount || amount <= 0) {
            toast.error("Geçerli bir tutar girin.");
            return;
        }

        setIsLoading(true);

        const newExpense: ExpenseItem = {
            id: crypto.randomUUID(),
            amount,
            category: expenseCategory as ExpenseItem['category'],
            description: expenseDescription || EXPENSE_CATEGORIES.find(c => c.id === expenseCategory)?.label || 'Gider'
        };

        if (todayRecord) {
            const updated: DailyRecord = {
                ...todayRecord,
                expenses: [...todayRecord.expenses, newExpense],
                isSynced: false
            };
            updateRecord(updated);
        } else {
            const newRecord: DailyRecord = {
                id: crypto.randomUUID(),
                branch_id: userProfile.branch_id,
                date: todayStr,
                income: {
                    cash: 0,
                    creditCard: 0,
                    online: { yemeksepeti: 0, getir: 0, trendyol: 0, gelal: 0 },
                    source: 'manual'
                },
                expenses: [newExpense],
                ledgers: [],
                inventory: [],
                shift: { cashOnStart: 0, cashOnEnd: 0, difference: 0 },
                note: '',
                isSynced: false,
                isClosed: false
            };
            addRecord(newRecord);
        }

        setExpenseAmount("");
        setExpenseDescription("");
        setExpenseDialogOpen(false);
        toast.success("Gider eklendi!");
        setIsLoading(false);
    };

    // Get recent transactions for activity feed
    const getRecentActivity = () => {
        const activities: { time: string; type: 'income' | 'expense'; amount: number; description: string }[] = [];

        if (todayRecord) {
            // Add expenses as activities
            todayRecord.expenses.forEach(exp => {
                activities.push({
                    time: 'Bugün',
                    type: 'expense',
                    amount: exp.amount,
                    description: exp.description
                });
            });
        }

        return activities.slice(0, 5);
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background">
            {/* Header */}
            <header className="sticky top-0 z-50 glass-panel border-b border-white/10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/90 rounded-xl shadow-glow-sm transition-transform hover:scale-105 duration-300 shadow-primary/20">
                            <Coins className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-display font-black text-xl tracking-tight text-gradient">GÜNKASA</h1>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold opacity-70">
                                {format(today, 'd MMMM yyyy', { locale: tr })}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 space-y-8 animate-fade-in">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="glass-card border-emerald-500/20 bg-emerald-500/5 hover-lift relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300 ring-1 ring-emerald-500/30">
                                    <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <span className="text-xs font-bold uppercase text-emerald-600/70 dark:text-emerald-400/70 tracking-wider">Bugünkü Gelir</span>
                            </div>
                            <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-display animate-count-up">
                                ₺{getTotalIncome().toLocaleString('tr-TR')}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-rose-500/20 bg-rose-500/5 hover-lift relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-rose-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300 ring-1 ring-rose-500/30">
                                    <TrendingDown className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                                </div>
                                <span className="text-xs font-bold uppercase text-rose-600/70 dark:text-rose-400/70 tracking-wider">Bugünkü Gider</span>
                            </div>
                            <div className="text-4xl font-black text-rose-600 dark:text-rose-400 tracking-tight font-display animate-count-up delay-100">
                                ₺{getTotalExpense().toLocaleString('tr-TR')}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={cn(
                        "glass-card hover-lift relative overflow-hidden group border-2",
                        netProfit >= 0
                            ? "border-sky-500/20 bg-sky-500/5"
                            : "border-orange-500/20 bg-orange-500/5"
                    )}>
                        <div className={cn(
                            "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                            netProfit >= 0 ? "from-sky-500/10" : "from-orange-500/10"
                        )} />
                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={cn("p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-300 ring-1",
                                    netProfit >= 0 ? "bg-sky-500/20 ring-sky-500/30" : "bg-orange-500/20 ring-orange-500/30")}>
                                    <Wallet className={cn("h-5 w-5", netProfit >= 0 ? "text-sky-600 dark:text-sky-400" : "text-orange-600 dark:text-orange-400")} />
                                </div>
                                <span className={cn("text-xs font-bold uppercase tracking-wider", netProfit >= 0 ? "text-sky-600/70 dark:text-sky-400/70" : "text-orange-600/70 dark:text-orange-400/70")}>Net Durum</span>
                            </div>
                            <div className={cn("text-4xl font-black tracking-tight font-display animate-count-up delay-200", netProfit >= 0 ? "text-sky-600 dark:text-sky-400" : "text-orange-600 dark:text-orange-400")}>
                                ₺{netProfit.toLocaleString('tr-TR')}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {/* Income Dialog */}
                    <Dialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen}>
                        <DialogTrigger asChild>
                            <Card className="glass-card hover:border-emerald-500/40 cursor-pointer group hover-glow">
                                <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4">
                                    <div className="p-4 bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300 ring-1 ring-emerald-500/20">
                                        <Plus className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <span className="font-bold text-sm tracking-wide">Gelir Ekle</span>
                                </CardContent>
                            </Card>
                        </DialogTrigger>
                        <DialogContent className="glass-panel sm:max-w-md border-emerald-500/20">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-display text-xl">
                                    <TrendingUp className="h-6 w-6" />
                                    Gelir Ekle
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                                        <Banknote className="h-4 w-4" /> Nakit
                                    </Label>
                                    <Input
                                        type="number"
                                        placeholder="0.00 ₺"
                                        value={cashIncome}
                                        onChange={(e) => setCashIncome(e.target.value)}
                                        className="h-14 text-xl font-bold bg-white/50 dark:bg-black/20 border-emerald-500/20 focus:border-emerald-500 focus:ring-emerald-500/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                                        <CreditCard className="h-4 w-4" /> Kredi Kartı
                                    </Label>
                                    <Input
                                        type="number"
                                        placeholder="0.00 ₺"
                                        value={cardIncome}
                                        onChange={(e) => setCardIncome(e.target.value)}
                                        className="h-14 text-xl font-bold bg-white/50 dark:bg-black/20 border-emerald-500/20 focus:border-emerald-500 focus:ring-emerald-500/20"
                                    />
                                </div>
                                <Button
                                    onClick={handleAddIncome}
                                    disabled={isLoading || (!cashIncome && !cardIncome)}
                                    className="w-full h-12 text-lg font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98]"
                                >
                                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2" />}
                                    Kaydet
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Expense Dialog */}
                    <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
                        <DialogTrigger asChild>
                            <Card className="glass-card hover:border-rose-500/40 cursor-pointer group hover-glow">
                                <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4">
                                    <div className="p-4 bg-rose-500/10 rounded-2xl group-hover:bg-rose-500/20 group-hover:scale-110 transition-all duration-300 ring-1 ring-rose-500/20">
                                        <Minus className="h-8 w-8 text-rose-600 dark:text-rose-400" />
                                    </div>
                                    <span className="font-bold text-sm tracking-wide">Gider Ekle</span>
                                </CardContent>
                            </Card>
                        </DialogTrigger>
                        <DialogContent className="glass-panel sm:max-w-md border-rose-500/20">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-display text-xl">
                                    <TrendingDown className="h-6 w-6" />
                                    Gider Ekle
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Tutar</Label>
                                    <Input
                                        type="number"
                                        placeholder="0.00 ₺"
                                        value={expenseAmount}
                                        onChange={(e) => setExpenseAmount(e.target.value)}
                                        className="h-14 text-xl font-bold bg-white/50 dark:bg-black/20 border-rose-500/20 focus:border-rose-500 focus:ring-rose-500/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Kategori</Label>
                                    <Select value={expenseCategory} onValueChange={setExpenseCategory}>
                                        <SelectTrigger className="h-12 bg-white/50 dark:bg-black/20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {EXPENSE_CATEGORIES.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    <div className="flex items-center gap-2">
                                                        <cat.icon className="h-4 w-4" />
                                                        {cat.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Açıklama</Label>
                                    <Input
                                        placeholder="Opsiyonel..."
                                        value={expenseDescription}
                                        onChange={(e) => setExpenseDescription(e.target.value)}
                                        className="h-12 bg-white/50 dark:bg-black/20"
                                    />
                                </div>
                                <Button
                                    onClick={handleAddExpense}
                                    disabled={isLoading || !expenseAmount}
                                    className="w-full h-12 text-lg font-bold rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 shadow-lg shadow-rose-500/25 transition-all active:scale-[0.98]"
                                >
                                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Minus className="mr-2" />}
                                    Kaydet
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* POS Button */}
                    <Card
                        className="glass-card hover:border-primary/40 cursor-pointer group hover-glow"
                        onClick={() => router.push('/pos')}
                    >
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4">
                            <div className="p-4 bg-primary/10 rounded-2xl group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 ring-1 ring-primary/20 shadow-glow-sm">
                                <ShoppingCart className="h-8 w-8 text-primary" />
                            </div>
                            <span className="font-bold text-sm tracking-wide">Satış Yap</span>
                        </CardContent>
                    </Card>

                    {/* Reports Button */}
                    <Card
                        className="glass-card hover:border-sky-500/40 cursor-pointer group hover-glow"
                        onClick={() => router.push('/reports')}
                    >
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4">
                            <div className="p-4 bg-sky-500/10 rounded-2xl group-hover:bg-sky-500/20 group-hover:scale-110 transition-all duration-300 ring-1 ring-sky-500/20">
                                <BarChart3 className="h-8 w-8 text-sky-600 dark:text-sky-400" />
                            </div>
                            <span className="font-bold text-sm tracking-wide">Raporlar</span>
                        </CardContent>
                    </Card>
                </div>

                {/* Today's Activity */}
                <Card className="glass-card overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-white/5 py-4 backdrop-blur-sm">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 opacity-70">
                            <Activity className="h-4 w-4" />
                            Bugünkü İşlemler
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {todayRecord && todayRecord.expenses.length > 0 ? (
                            <div className="divide-y divide-white/5">
                                {todayRecord.expenses.map((exp, i) => {
                                    const cat = EXPENSE_CATEGORIES.find(c => c.id === exp.category);
                                    const Icon = cat?.icon || ShoppingBag;
                                    return (
                                        <div key={exp.id || i} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 bg-rose-500/10 rounded-xl group-hover:bg-rose-500/20 transition-colors">
                                                    <Icon className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm group-hover:text-primary transition-colors">{exp.description}</p>
                                                    <p className="text-xs text-muted-foreground font-medium">{cat?.label}</p>
                                                </div>
                                            </div>
                                            <span className="font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">-₺{exp.amount.toLocaleString('tr-TR')}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-4">
                                <div className="p-4 bg-muted/50 rounded-full animate-bounce-subtle">
                                    <Clock className="h-8 w-8 opacity-40" />
                                </div>
                                <div>
                                    <p className="font-bold text-lg">Henüz işlem yok</p>
                                    <p className="text-sm opacity-60">Günün ilk işlemini yaparak başlayın.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Navigation Footer */}
                <div className="grid grid-cols-2 gap-6">
                    <Card
                        className="glass-card hover:bg-muted/30 cursor-pointer group"
                        onClick={() => router.push('/signage/demo')}
                    >
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2 bg-muted rounded-lg group-hover:scale-105 transition-transform">
                                <Monitor className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <span className="font-bold text-sm text-foreground/80">Dijital Menü</span>
                            <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-muted-foreground" />
                        </CardContent>
                    </Card>
                    <Card
                        className="glass-card hover:bg-muted/30 cursor-pointer group"
                        onClick={() => router.push('/settings')}
                    >
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-2 bg-muted rounded-lg group-hover:scale-105 transition-transform">
                                <Settings className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <span className="font-bold text-sm text-foreground/80">Ayarlar</span>
                            <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-muted-foreground" />
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <ErrorBoundary name="Dashboard">
            <DashboardContent />
        </ErrorBoundary>
    );
}
