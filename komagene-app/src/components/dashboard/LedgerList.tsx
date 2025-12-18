"use client";

import { useState, useEffect } from "react";
import { LedgerItem } from "@/types";
import { StorageService } from "@/services/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, Trash2, History, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { SupabaseService } from "@/services/supabase";

interface LedgerListProps {
    onPaymentProcessed: (amount: number) => void;
}

export function LedgerList({ onPaymentProcessed }: LedgerListProps) {
    const [items, setItems] = useState<LedgerItem[]>([]);
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [showHistory, setShowHistory] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLedger = async () => {
            try {
                const cloudLedger = await SupabaseService.getLedger();
                if (cloudLedger.length > 0) {
                    setItems(cloudLedger);
                    StorageService.saveLedger(cloudLedger);
                } else {
                    setItems(StorageService.getLedger());
                }
            } catch (error) {
                console.error("Ledger cloud fetch failed:", error);
                setItems(StorageService.getLedger());
            } finally {
                setLoading(false);
            }
        };
        loadLedger();
    }, []);

    const handleAdd = async () => {
        if (!name || !amount) {
            toast.error("Lütfen isim ve tutar girin");
            return;
        }

        const newItem: LedgerItem = {
            id: crypto.randomUUID(),
            customerName: name,
            amount: parseFloat(amount),
            date: new Date().toISOString(),
            isPaid: false
        };

        const updated = [...items, newItem];
        setItems(updated);
        StorageService.saveLedger(updated);

        try {
            await SupabaseService.saveLedgerItem(newItem);
            toast.success("Veresiye buluta kaydedildi");
        } catch (error) {
            console.error("Ledger save failed:", error);
            toast.error("Buluta kaydedilemedi, yerel kayıt yapıldı.");
        }

        setName("");
        setAmount("");
    };

    const handlePay = async (id: string) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const updatedItem = { ...item, isPaid: true, paidAt: new Date().toISOString() };
        const updatedItems = items.map(i => i.id === id ? updatedItem : i);

        setItems(updatedItems);
        StorageService.saveLedger(updatedItems);

        try {
            await SupabaseService.saveLedgerItem(updatedItem);
            onPaymentProcessed(item.amount);
            toast.success(`${item.customerName} ödemesi alındı ve buluta işlendi`);
        } catch (error) {
            console.error("Ledger pay update failed:", error);
            onPaymentProcessed(item.amount);
            toast.warning("Ödeme sadece yerel olarak işlendi (Bulut hatası)");
        }
    };

    const handleDelete = async (id: string) => {
        const updated = items.filter(i => i.id !== id);
        setItems(updated);
        StorageService.saveLedger(updated);

        try {
            await SupabaseService.deleteLedgerItem(id);
            toast.info("Kayıt buluttan silindi");
        } catch (error) {
            console.error("Ledger delete failed:", error);
            toast.info("Kayıt sadece yerelden silindi");
        }
    };

    const activeDebts = items.filter(i => !i.isPaid);
    const paidHistory = items.filter(i => i.isPaid).sort((a, b) => b.paidAt!.localeCompare(a.paidAt!));

    return (
        <div className="space-y-6">
            {/* Add New Debt */}
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Plus className="h-5 w-5 text-primary" /> Yeni Veresiye Ekle
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Müşteri Adı"
                                className="pl-9 bg-white dark:bg-card"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="sm:w-32 relative">
                            <Input
                                type="number"
                                placeholder="Tutar"
                                className="bg-white dark:bg-card pl-7"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₺</span>
                        </div>
                        <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90">Ekle</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Active Debts List */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h3 className="font-bold text-primary flex items-center gap-2">
                        <History className="h-4 w-4" /> Bekleyen Ödemeler
                        <Badge variant="secondary" className="ml-1">{activeDebts.length}</Badge>
                    </h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHistory(!showHistory)}
                        className="text-muted-foreground h-8"
                    >
                        {showHistory ? "Listeye Dön" : "Geçmişi Gör"}
                    </Button>
                </div>

                {!showHistory ? (
                    <div className="grid gap-3">
                        {activeDebts.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed rounded-2xl text-muted-foreground">
                                Bekleyen veresiye kaydı yok
                            </div>
                        ) : (
                            activeDebts.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 border rounded-2xl bg-card hover:border-primary/30 transition-all shadow-sm">
                                    <div className="space-y-1">
                                        <p className="font-bold text-lg">{item.customerName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {format(new Date(item.date), 'd MMMM yyyy', { locale: tr })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xl font-black text-primary">
                                            ₺{item.amount.toLocaleString('tr-TR')}
                                        </span>
                                        <div className="flex gap-2">
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-10 w-10 border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl"
                                                onClick={() => handlePay(item.id)}
                                            >
                                                <Check className="h-5 w-5 stroke-[3px]" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-10 w-10 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-xl"
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {paidHistory.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">Henüz ödeme geçmişi yok</div>
                        ) : (
                            paidHistory.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 border rounded-xl bg-muted/30 opacity-75">
                                    <div className="flex flex-col">
                                        <span className="font-medium">{item.customerName}</span>
                                        <span className="text-[10px] text-muted-foreground">Ödeme: {format(new Date(item.paidAt!), 'HH:mm - d MMM')}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-emerald-600">₺{item.amount}</span>
                                        <Badge variant="outline" className="border-emerald-200 text-emerald-600 bg-emerald-50/50">ÖDENDİ</Badge>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
