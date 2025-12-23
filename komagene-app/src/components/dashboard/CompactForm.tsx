"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DailyRecord, ExpenseItem, IncomeData, LedgerItem, InventoryItem, ShiftData } from "@/types";
import { Plus, Trash2, Save, ShoppingBag, CreditCard, Users, Package, RefreshCcw, CheckCircle2, XCircle, Banknote, Calendar, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { format, differenceInDays, parseISO, isValid } from "date-fns";

interface CompactFormProps {
    initialData: DailyRecord;
    onSave: (record: DailyRecord) => void;
    disabled?: boolean;
}

export function CompactForm({ initialData, onSave, disabled }: CompactFormProps) {
    // Global ledger store
    const { globalLedgers, addLedger: addGlobalLedger, removeLedger, payLedger } = useStore();

    const [income, setIncome] = useState<IncomeData>(initialData.income);
    const [expenses, setExpenses] = useState<ExpenseItem[]>(initialData.expenses);
    const [inventory, setInventory] = useState<InventoryItem[]>(initialData.inventory || []);
    const [shift, setShift] = useState<ShiftData>(initialData.shift || { cashOnStart: 0, cashOnEnd: 0, difference: 0 });
    const [note, setNote] = useState(initialData.note || "");

    const handleIncomeChange = (field: string, value: string) => {
        const num = parseFloat(value) || 0;
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            if (parent === 'online') {
                setIncome(prev => ({
                    ...prev,
                    online: {
                        ...prev.online,
                        [child]: num
                    }
                }));
            }
        } else {
            setIncome(prev => ({ ...prev, [field]: num }));
        }
    };

    const addExpense = () => {
        const newExpense: ExpenseItem = {
            id: crypto.randomUUID(),
            amount: 0,
            category: 'other',
            description: ''
        };
        setExpenses([...expenses, newExpense]);
    };

    const addNewLedger = () => {
        const newItem: LedgerItem = {
            id: crypto.randomUUID(),
            customer: '',
            amount: 0,
            description: '',
            isPaid: false,
            createdDate: format(new Date(), 'yyyy-MM-dd')
        };
        addGlobalLedger(newItem);
    };

    const addInventory = () => {
        const newItem: InventoryItem = {
            id: crypto.randomUUID(),
            name: '',
            quantity: 0,
            unit: 'adet'
        };
        setInventory([...inventory, newItem]);
    };

    const handleSave = () => {
        onSave({
            ...initialData,
            income,
            expenses,
            ledgers: [], // Ledgers are now global
            inventory,
            shift: {
                ...shift,
                difference: shift.cashOnEnd - shift.cashOnStart
            },
            note,
            isSynced: false
        });
        toast.success("Tüm veriler kaydedildi!");
    };

    const handlePayLedger = (ledgerId: string) => {
        payLedger(ledgerId, initialData.date);
        toast.success("Veresiye ödendi ve gelire eklendi!");
    };

    return (
        <Card className="border-none shadow-xl bg-card/80 backdrop-blur-md">
            <CardContent className="p-6">
                <Tabs defaultValue="main" className="space-y-6">
                    <TabsList className="grid grid-cols-3 w-full max-w-2xl mx-auto h-12">
                        <TabsTrigger value="main" className="gap-2 text-sm font-bold">
                            <ShoppingBag className="h-4 w-4" /> Gelir & Gider
                        </TabsTrigger>
                        <TabsTrigger value="ledger" className="gap-2 text-sm font-bold">
                            <Users className="h-4 w-4" /> Veresiyeler
                        </TabsTrigger>
                        <TabsTrigger value="shift" className="gap-2 text-sm font-bold">
                            <RefreshCcw className="h-4 w-4" /> Vardiya & Stok
                        </TabsTrigger>
                    </TabsList>

                    {/* ANA GELİR GİDER */}
                    <TabsContent value="main" className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
                        {/* 1. ÜST KISIM: GELİR */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 border-b-2 border-emerald-500/10 pb-4">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                                    <CreditCard className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-emerald-500 uppercase italic tracking-tight">GÜNLÜK GELİR (CİRO)</h3>
                                    <p className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-widest leading-none">Satış ve ödeme kanalları dökümü</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                                <Card className="bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-200 dark:border-emerald-500/20 shadow-sm rounded-2xl">
                                    <CardContent className="p-4 space-y-3">
                                        <Label className="text-[10px] font-black uppercase opacity-60 tracking-wider">Nakit Ciro</Label>
                                        <Input
                                            type="number"
                                            disabled={disabled}
                                            className="h-12 text-xl font-black border-2 border-emerald-300 dark:border-emerald-500/30 focus:border-emerald-500 bg-white dark:bg-background/50 rounded-xl"
                                            value={income.cash || ""}
                                            onChange={(e) => handleIncomeChange('cash', e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </CardContent>
                                </Card>
                                <Card className="bg-blue-50 dark:bg-blue-500/10 border-2 border-blue-200 dark:border-blue-500/20 shadow-sm rounded-2xl">
                                    <CardContent className="p-4 space-y-3">
                                        <Label className="text-[10px] font-black uppercase opacity-60 tracking-wider">Banka POS</Label>
                                        <Input
                                            type="number"
                                            disabled={disabled}
                                            className="h-12 text-xl font-black border-2 border-blue-300 dark:border-blue-500/30 focus:border-blue-500 bg-white dark:bg-background/50 rounded-xl"
                                            value={income.creditCard || ""}
                                            onChange={(e) => handleIncomeChange('creditCard', e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </CardContent>
                                </Card>
                                <Card className="bg-orange-50 dark:bg-orange-500/10 border-2 border-orange-200 dark:border-orange-500/20 shadow-sm rounded-2xl">
                                    <CardContent className="p-4">
                                        <Label className="text-[10px] font-bold uppercase opacity-60 mb-2 block">Online Platformlar Toplamı</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['yemeksepeti', 'getir', 'trendyol', 'gelal'].map((platform) => (
                                                <div key={platform} className="flex items-center gap-1">
                                                    <span className="text-[9px] font-black uppercase opacity-40 w-12">{platform.slice(0, 5)}</span>
                                                    <Input
                                                        type="number"
                                                        disabled={disabled}
                                                        className="h-8 text-[11px] font-black bg-white dark:bg-background/50 border-2 border-orange-300 dark:border-orange-500/20 rounded-lg"
                                                        value={(income.online as Record<string, number>)[platform] || ""}
                                                        onChange={(e) => handleIncomeChange(`online.${platform}`, e.target.value)}
                                                        placeholder="0"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* 2. ALT KISIM: GİDERLER (DETAYLI LİSTE) */}
                        <div className="space-y-6 pt-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-rose-500/10 pb-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
                                        <Trash2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-rose-500 uppercase italic tracking-tight">GİDERLER & HARCAMALAR</h3>
                                        <p className="text-[10px] font-bold text-rose-500/50 uppercase tracking-widest leading-none">İşletme giderleri ve ödeme kalemleri</p>
                                    </div>
                                    <span className="bg-rose-500/10 text-rose-500 text-[10px] font-black px-2 py-1 rounded-lg border border-rose-500/20 uppercase tracking-tighter">
                                        {expenses.length} KALEM
                                    </span>
                                </div>
                                <Button onClick={addExpense} disabled={disabled} className="bg-rose-600 hover:bg-rose-700 text-white gap-2 font-black shadow-lg shadow-rose-600/20 rounded-xl h-11 px-6">
                                    <Plus className="h-5 w-5" /> YENİ GİDER EKLE
                                </Button>
                            </div>


                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {expenses.map((expense) => (
                                    <Card key={expense.id} className="border-2 border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/5 hover:bg-rose-100 dark:hover:bg-rose-500/10 transition-colors shadow-sm group relative overflow-hidden rounded-2xl">
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex-1 space-y-1">
                                                    <Label className="text-[10px] font-black uppercase opacity-60 tracking-wider">Tutar</Label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-rose-500">₺</span>
                                                        <Input
                                                            type="number"
                                                            disabled={disabled}
                                                            className="h-10 pl-7 font-black text-rose-600 border-2 border-rose-300 dark:border-rose-500/30 bg-white dark:bg-background/50 rounded-xl"
                                                            value={expense.amount || ""}
                                                            onChange={(e) => setExpenses(prev => prev.map(ex => ex.id === expense.id ? { ...ex, amount: parseFloat(e.target.value) || 0 } : ex))}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <Label className="text-[10px] font-black uppercase opacity-60 tracking-wider">Kategori</Label>
                                                    <Select
                                                        disabled={disabled}
                                                        value={expense.category}
                                                        onValueChange={(val) => setExpenses(prev => prev.map(ex => ex.id === expense.id ? { ...ex, category: val as any } : ex))}
                                                    >
                                                        <SelectTrigger className="h-10 font-bold bg-white dark:bg-background/50 border-2 border-rose-300 dark:border-rose-500/30 rounded-xl">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="supplier">Malzeme Alımı</SelectItem>
                                                            <SelectItem value="staff">Personel Maaş</SelectItem>
                                                            <SelectItem value="bills">Kira - Fatura</SelectItem>
                                                            <SelectItem value="tax">Vergi & Muhasebe</SelectItem>
                                                            <SelectItem value="other">Diğer</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-black uppercase opacity-60 tracking-wider">Açıklama</Label>
                                                <Input
                                                    disabled={disabled}
                                                    className="h-10 text-sm font-bold bg-white dark:bg-background/50 border-2 border-rose-300 dark:border-rose-500/30 rounded-xl"
                                                    value={expense.description}
                                                    onChange={(e) => setExpenses(prev => prev.map(ex => ex.id === expense.id ? { ...ex, description: e.target.value } : ex))}
                                                    placeholder="Örn: Et ödemesi, Kira, Maaş..."
                                                />
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={disabled}
                                                onClick={() => setExpenses(prev => prev.filter(ex => ex.id !== expense.id))}
                                                className="w-full text-rose-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-500/10 h-8 mt-2 transition-colors font-bold text-xs rounded-xl"
                                            >
                                                <Trash2 className="h-3.5 w-3.5 mr-2" /> BU GİDERİ SİL
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}

                                {expenses.length === 0 && (
                                    <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-rose-100 rounded-3xl bg-rose-50/5">
                                        <div className="p-4 bg-rose-100 rounded-full mb-3">
                                            <Trash2 className="h-8 w-8 text-rose-400" />
                                        </div>
                                        <p className="text-rose-400 font-black uppercase tracking-widest text-sm">Henüz gider eklenmedi</p>
                                        <Button onClick={addExpense} variant="link" className="text-rose-600 font-bold mt-2">
                                            İlk giderini eklemek için tıkla
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>


                    {/* VERESİYE TAKİBİ - GLOBAL */}
                    <TabsContent value="ledger" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-violet-500/20 pb-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-violet-500/10 rounded-2xl text-violet-500 border border-violet-300 dark:border-violet-500/30">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-violet-600 dark:text-violet-400 uppercase italic tracking-tight">VERESİYE TAKİBİ</h3>
                                    <p className="text-xs font-bold text-violet-500/60 uppercase tracking-widest">Tüm zamanlar - Ödeme bekleyen hesaplar</p>
                                </div>
                                <span className="bg-violet-500/10 text-violet-600 dark:text-violet-400 text-sm font-black px-3 py-1 rounded-xl border border-violet-300 dark:border-violet-500/30">
                                    {globalLedgers.filter(l => !l.isPaid).length} AKTİF
                                </span>
                            </div>
                            <Button onClick={addNewLedger} disabled={disabled} className="bg-violet-600 hover:bg-violet-700 text-white gap-2 font-black shadow-lg shadow-violet-600/20 rounded-xl h-12 px-8 text-base">
                                <Plus className="h-5 w-5" /> YENİ VERESİYE
                            </Button>
                        </div>

                        {globalLedgers.filter(l => !l.isPaid).length === 0 ? (
                            <div className="py-16 text-center space-y-4 border-2 border-dashed border-violet-200 dark:border-violet-500/20 rounded-2xl bg-violet-50/50 dark:bg-violet-500/5">
                                <div className="mx-auto w-16 h-16 bg-violet-100 dark:bg-violet-500/10 rounded-full flex items-center justify-center">
                                    <Users className="h-8 w-8 text-violet-400" />
                                </div>
                                <p className="text-lg font-black text-violet-400 uppercase tracking-wide">
                                    Bekleyen Veresiye Yok
                                </p>
                                <p className="text-sm text-violet-400/60">Yeni veresiye eklemek için yukarıdaki butonu kullanın</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {globalLedgers.filter(l => !l.isPaid).map((item) => {
                                    // Calculate due date status
                                    const today = new Date();
                                    let dueStatus: 'overdue' | 'soon' | 'ok' | 'none' = 'none';
                                    let daysUntilDue = 0;

                                    if (item.dueDate) {
                                        const dueDate = parseISO(item.dueDate);
                                        if (isValid(dueDate)) {
                                            daysUntilDue = differenceInDays(dueDate, today);
                                            if (daysUntilDue < 0) dueStatus = 'overdue';
                                            else if (daysUntilDue <= 3) dueStatus = 'soon';
                                            else dueStatus = 'ok';
                                        }
                                    }

                                    return (
                                        <Card key={item.id} className="border-2 border-violet-200 dark:border-violet-500/20 bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-500/10 dark:to-violet-500/5 shadow-md rounded-2xl overflow-hidden">
                                            <CardContent className="p-5 space-y-4">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex-1">
                                                        <Label className="text-xs font-black uppercase opacity-50 tracking-wider">Müşteri</Label>
                                                        <Input
                                                            disabled={disabled}
                                                            className="border-2 border-violet-300 dark:border-violet-500/30 bg-white dark:bg-background/50 font-bold text-xl h-12 mt-1 rounded-xl"
                                                            value={item.customer}
                                                            onChange={(e) => {
                                                                const updatedLedger = { ...item, customer: e.target.value };
                                                                useStore.setState(state => ({
                                                                    globalLedgers: state.globalLedgers.map(l => l.id === item.id ? updatedLedger : l)
                                                                }));
                                                            }}
                                                            placeholder="Müşteri Adı"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label className="text-xs font-black uppercase opacity-50 tracking-wider">Tutar</Label>
                                                        <div className="relative mt-1">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-500 font-black text-xl">₺</span>
                                                            <Input
                                                                type="number"
                                                                disabled={disabled}
                                                                className="border-2 border-violet-300 dark:border-violet-500/30 bg-white dark:bg-background/50 font-black text-2xl h-14 pl-8 rounded-xl text-violet-600 dark:text-violet-400"
                                                                value={item.amount || ""}
                                                                onChange={(e) => {
                                                                    const updatedLedger = { ...item, amount: parseFloat(e.target.value) || 0 };
                                                                    useStore.setState(state => ({
                                                                        globalLedgers: state.globalLedgers.map(l => l.id === item.id ? updatedLedger : l)
                                                                    }));
                                                                }}
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs font-black uppercase opacity-50 tracking-wider flex items-center gap-2">
                                                            <Calendar className="h-3 w-3" /> Son Ödeme Tarihi
                                                        </Label>
                                                        <Input
                                                            type="date"
                                                            disabled={disabled}
                                                            className={cn(
                                                                "border-2 bg-white dark:bg-background/50 font-bold h-14 mt-1 rounded-xl",
                                                                dueStatus === 'overdue' ? "border-rose-500 text-rose-600" :
                                                                    dueStatus === 'soon' ? "border-amber-500 text-amber-600" :
                                                                        "border-violet-300 dark:border-violet-500/30"
                                                            )}
                                                            value={item.dueDate || ""}
                                                            onChange={(e) => {
                                                                const updatedLedger = { ...item, dueDate: e.target.value };
                                                                useStore.setState(state => ({
                                                                    globalLedgers: state.globalLedgers.map(l => l.id === item.id ? updatedLedger : l)
                                                                }));
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                {/* Due Date Alert */}
                                                {dueStatus !== 'none' && dueStatus !== 'ok' && (
                                                    <div className={cn(
                                                        "flex items-center gap-2 p-2 rounded-lg text-sm font-bold",
                                                        dueStatus === 'overdue' ? "bg-rose-100 dark:bg-rose-950/30 text-rose-600" :
                                                            "bg-amber-100 dark:bg-amber-950/30 text-amber-600"
                                                    )}>
                                                        <AlertTriangle className="h-4 w-4" />
                                                        {dueStatus === 'overdue'
                                                            ? `⚠️ Vadesi ${Math.abs(daysUntilDue)} gün geçti!`
                                                            : `⏰ Vade ${daysUntilDue} gün sonra`
                                                        }
                                                    </div>
                                                )}
                                                <div>
                                                    <Label className="text-xs font-black uppercase opacity-50 tracking-wider">Açıklama</Label>
                                                    <Input
                                                        disabled={disabled}
                                                        className="border-2 border-violet-300 dark:border-violet-500/30 bg-white dark:bg-background/50 font-bold h-12 mt-1 rounded-xl"
                                                        value={item.description}
                                                        onChange={(e) => {
                                                            const updatedLedger = { ...item, description: e.target.value };
                                                            useStore.setState(state => ({
                                                                globalLedgers: state.globalLedgers.map(l => l.id === item.id ? updatedLedger : l)
                                                            }));
                                                        }}
                                                        placeholder="Not..."
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between pt-2 border-t border-violet-200 dark:border-violet-500/20">
                                                    <span className="text-xs font-bold text-violet-400 opacity-60">
                                                        Eklenme: {item.createdDate || 'Bilinmiyor'}
                                                    </span>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={disabled}
                                                            onClick={() => removeLedger(item.id)}
                                                            className="text-rose-500 border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 h-9 px-4 font-bold rounded-xl"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-1" /> Sil
                                                        </Button>
                                                        <Button
                                                            disabled={disabled || !item.customer || !item.amount}
                                                            onClick={() => handlePayLedger(item.id)}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-5 font-black rounded-xl shadow-lg"
                                                        >
                                                            <Banknote className="h-4 w-4 mr-2" /> ÖDENDİ
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </TabsContent>


                    {/* VARDİYA VE ENVANTER */}
                    <TabsContent value="shift" className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Vardiya Devri */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 border-b-2 border-amber-500/10 pb-4">
                                    <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                                        <RefreshCcw className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-amber-500 uppercase italic tracking-tight">VARDİYA TESLİM</h3>
                                        <p className="text-[10px] font-bold text-amber-500/50 uppercase tracking-widest leading-none">Kasa devir ve kapanış işlemleri</p>
                                    </div>
                                </div>
                                <div className="space-y-4 p-6 bg-amber-50/30 rounded-2xl border border-amber-100">
                                    <div className="space-y-2">
                                        <Label className="font-black text-xs uppercase opacity-60 tracking-widest">Devir Alınan (Açılış)</Label>
                                        <Input
                                            type="number"
                                            disabled={disabled}
                                            className="h-12 text-lg font-black bg-background/50 border-amber-500/30"
                                            value={shift.cashOnStart || ""}
                                            onChange={(e) => setShift(prev => ({ ...prev, cashOnStart: parseFloat(e.target.value) || 0 }))}
                                            placeholder="₺"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-black text-xs uppercase opacity-60 tracking-widest">Kasada Kalan (Kapanış)</Label>
                                        <Input
                                            type="number"
                                            disabled={disabled}
                                            className="h-12 text-lg font-black bg-background/50 border-amber-500/30"
                                            value={shift.cashOnEnd || ""}
                                            onChange={(e) => setShift(prev => ({ ...prev, cashOnEnd: parseFloat(e.target.value) || 0 }))}
                                            placeholder="₺"
                                        />
                                    </div>
                                    <div className={cn(
                                        "p-4 rounded-xl flex justify-between items-center transition-all",
                                        (shift.cashOnEnd - shift.cashOnStart) >= 0 ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                                    )}>
                                        <span className="font-bold uppercase tracking-wider text-xs">Fark</span>
                                        <span className="text-2xl font-black">
                                            {(shift.cashOnEnd - shift.cashOnStart).toFixed(2)} ₺
                                        </span>
                                    </div>
                                </div>

                                {/* Cash Counter removed */}
                            </div>

                            {/* Envanter Listesi */}
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-sky-500/10 pb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-sky-500/10 rounded-2xl text-sky-500">
                                            <Package className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-sky-500 uppercase italic tracking-tight">KRİTİK ENVANTER</h3>
                                            <p className="text-[10px] font-bold text-sky-500/50 uppercase tracking-widest leading-none">Stok ve ürün yönetimi</p>
                                        </div>
                                    </div>
                                    <Button onClick={addInventory} disabled={disabled} className="bg-sky-600 hover:bg-sky-700 text-white gap-2 font-black shadow-lg shadow-sky-600/20 rounded-xl h-11 px-6">
                                        <Plus className="h-4 w-4" /> ÜRÜN EKLE
                                    </Button>
                                </div>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {inventory.map((item) => (
                                        <div key={item.id} className="flex gap-2 group">
                                            <Input
                                                disabled={disabled}
                                                className="flex-[2] bg-accent/20"
                                                value={item.name}
                                                onChange={(e) => setInventory(prev => prev.map(i => i.id === item.id ? { ...i, name: e.target.value } : i))}
                                                placeholder="Ürün adı"
                                            />
                                            <Input
                                                type="number"
                                                disabled={disabled}
                                                className="flex-1 bg-accent/20"
                                                value={item.quantity || ""}
                                                onChange={(e) => setInventory(prev => prev.map(i => i.id === item.id ? { ...i, quantity: parseFloat(e.target.value) || 0 } : i))}
                                                placeholder="Adet"
                                            />
                                            <Input
                                                disabled={disabled}
                                                className="w-16 bg-accent/20"
                                                value={item.unit}
                                                onChange={(e) => setInventory(prev => prev.map(i => i.id === item.id ? { ...i, unit: e.target.value } : i))}
                                                placeholder="Birim"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                disabled={disabled}
                                                onClick={() => setInventory(prev => prev.filter(i => i.id !== item.id))}
                                                className="text-muted-foreground hover:text-red-500"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {inventory.length === 0 && (
                                        <p className="text-center text-xs text-muted-foreground italic py-8">Stok takibi için ürün ekleyin.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="space-y-4 pt-8 border-t mt-8">
                    <Label className="text-sm font-black uppercase opacity-60">Günlük Genel Not & Hatırlatıcılar</Label>
                    <Input
                        value={note}
                        disabled={disabled}
                        className="h-12 bg-accent/10 border-dashed"
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Örn: Bugün paket yoğunluğu vardı, marul siparişi verildi..."
                    />
                </div>

                <div className="flex justify-center pt-8">
                    <Button onClick={handleSave} disabled={disabled} size="lg" className="gap-3 font-black px-16 py-8 text-xl rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                        <Save className="h-6 w-6" /> TÜM VERİLERİ KAYDET
                    </Button>
                </div>
            </CardContent>
        </Card >
    );
}
