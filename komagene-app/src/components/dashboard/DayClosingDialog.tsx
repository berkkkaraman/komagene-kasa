"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DailyRecord } from "@/types";
import { Lock, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, Wallet, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

interface DayClosingDialogProps {
    record: DailyRecord;
    onConfirm: (record: DailyRecord) => void;
}

export function DayClosingDialog({ record, onConfirm }: DayClosingDialogProps) {
    const [open, setOpen] = useState(false);

    const onlineTotal = Object.values(record.income.online).reduce((a, b) => a + (b || 0), 0);
    const totalCiro = (record.income.cash || 0) + (record.income.creditCard || 0) + onlineTotal;
    const totalExpense = record.expenses.reduce((a, b) => a + (b.amount || 0), 0);
    const netResult = totalCiro - totalExpense;
    const shiftDiff = record.shift.cashOnEnd - record.shift.cashOnStart;

    const handleCloseDay = () => {
        onConfirm({ ...record, isClosed: true, isSynced: false });
        setOpen(false);
        toast.success("Gün başarıyla kapatıldı ve kilitlendi.");
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    disabled={record.isClosed}
                    className={cn(
                        "gap-2 font-black shadow-lg transition-all",
                        record.isClosed
                            ? "bg-slate-200 text-slate-500 border-none cursor-not-allowed"
                            : "bg-orange-500 hover:bg-orange-600 shadow-orange-200 animate-pulse hover:animate-none"
                    )}
                >
                    {record.isClosed ? <Lock className="h-4 w-4" /> : <RefreshCcw className="h-4 w-4" />}
                    {record.isClosed ? "GÜN KAPATILDI" : "GÜNÜ KAPAT"}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md border-none shadow-2xl bg-card/95 backdrop-blur-xl">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="h-6 w-6 text-orange-600" />
                    </div>
                    <DialogTitle className="text-center text-2xl font-black italic tracking-tight">GÜN KAPANIŞ ÖZETİ</DialogTitle>
                    <DialogDescription className="text-center font-medium">
                        Bu işlemden sonra veriler kilitlenecektir. Lütfen özet bilgileri onaylayın.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 mt-4">
                    {/* Gelir Özeti */}
                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                            <span className="text-sm font-bold text-emerald-800">Toplam Gelir</span>
                        </div>
                        <span className="font-black text-emerald-700">{formatCurrency(totalCiro)}</span>
                    </div>

                    {/* Gider Özeti */}
                    <div className="flex items-center justify-between p-3 bg-rose-50 rounded-xl border border-rose-100">
                        <div className="flex items-center gap-3">
                            <TrendingDown className="h-5 w-5 text-rose-600" />
                            <span className="text-sm font-bold text-rose-800">Toplam Gider</span>
                        </div>
                        <span className="font-black text-rose-700">{formatCurrency(totalExpense)}</span>
                    </div>

                    {/* Net Sonuç */}
                    <div className={cn(
                        "flex items-center justify-between p-4 rounded-xl border-2 shadow-sm",
                        netResult >= 0 ? "bg-sky-50 border-sky-200" : "bg-orange-50 border-orange-200"
                    )}>
                        <div className="flex items-center gap-3">
                            <Wallet className={cn("h-6 w-6", netResult >= 0 ? "text-sky-600" : "text-orange-600")} />
                            <span className={cn("font-black uppercase tracking-wider", netResult >= 0 ? "text-sky-800" : "text-orange-800")}>NET KASA</span>
                        </div>
                        <span className={cn("text-xl font-black", netResult >= 0 ? "text-sky-700" : "text-orange-700")}>{formatCurrency(netResult)}</span>
                    </div>

                    {/* Vardiya Farkı */}
                    <div className={cn(
                        "flex items-center justify-between p-3 rounded-xl border border-dashed",
                        shiftDiff === 0 ? "bg-slate-50 border-slate-200" : "bg-amber-50 border-amber-200"
                    )}>
                        <div className="flex items-center gap-3">
                            <RefreshCcw className="h-4 w-4 text-slate-500" />
                            <span className="text-xs font-bold text-slate-600">Vardiya Devir Farkı</span>
                        </div>
                        <span className={cn("text-sm font-bold", shiftDiff !== 0 && "text-amber-600")}>
                            {shiftDiff > 0 ? "+" : ""}{shiftDiff.toFixed(2)} ₺
                        </span>
                    </div>
                </div>

                <DialogFooter className="mt-8">
                    <Button onClick={() => setOpen(false)} variant="ghost" className="font-bold">Vazgeç</Button>
                    <Button onClick={handleCloseDay} className="bg-orange-600 hover:bg-orange-700 font-black gap-2 px-8 shadow-lg shadow-orange-200">
                        <CheckCircle2 className="h-5 w-5" /> ŞİMDİ KAPAT
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
