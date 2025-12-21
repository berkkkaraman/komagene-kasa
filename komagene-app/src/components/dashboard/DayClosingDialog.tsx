"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DailyRecord } from "@/types";
import { Lock, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, Wallet, RefreshCcw, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { AudioRecorder } from "./AudioRecorder";

interface DayClosingDialogProps {
    record: DailyRecord;
    onConfirm: (record: DailyRecord) => void;
}

export function DayClosingDialog({ record, onConfirm }: DayClosingDialogProps) {
    const [open, setOpen] = useState(false);
    const [staffName, setStaffName] = useState("");
    const [audioNote, setAudioNote] = useState<string | undefined>(undefined);

    const onlineTotal = Object.values(record.income.online).reduce((a, b) => a + (b || 0), 0);
    const totalCiro = (record.income.cash || 0) + (record.income.creditCard || 0) + onlineTotal;
    const totalExpense = record.expenses.reduce((a, b) => a + (b.amount || 0), 0);
    const netResult = totalCiro - totalExpense;
    const shiftDiff = record.shift.cashOnEnd - record.shift.cashOnStart;

    const handleCloseDay = () => {
        if (!staffName.trim()) {
            toast.error("Lütfen personel adınızı girin!");
            return;
        }

        const updatedRecord: DailyRecord = {
            ...record,
            isClosed: true,
            isSynced: false,
            shift: {
                ...record.shift,
                closedBy: staffName.trim(),
                note: audioNote // Ses kaydını buraya ekliyoruz (Types update gerekebilir ama JSONB esnek)
            }
        };

        onConfirm(updatedRecord);
        setOpen(false);
        setStaffName("");
        setAudioNote(undefined);
        toast.success(`Gün ${staffName} tarafından kapatıldı ve kilitlendi.`);
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
                    {record.isClosed ? (
                        record.shift.closedBy ? `${record.shift.closedBy} KAPATTI` : "GÜN KAPATILDI"
                    ) : "GÜNÜ KAPAT"}
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
                    {/* Personnel Name Input */}
                    <div className="p-3 bg-primary/5 rounded-xl border-2 border-primary/20">
                        <label className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-wider mb-2">
                            <User className="h-4 w-4" /> Kapatan Personel
                        </label>
                        <Input
                            placeholder="Adınızı girin..."
                            value={staffName}
                            onChange={(e) => setStaffName(e.target.value)}
                            className="font-bold border-primary/20 focus:border-primary"
                        />
                    </div>

                    {/* Gelir Özeti */}
                    <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                            <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Toplam Gelir</span>
                        </div>
                        <span className="font-black text-emerald-700 dark:text-emerald-400">{formatCurrency(totalCiro)}</span>
                    </div>

                    {/* Gider Özeti */}
                    <div className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-100 dark:border-rose-900/50">
                        <div className="flex items-center gap-3">
                            <TrendingDown className="h-5 w-5 text-rose-600" />
                            <span className="text-sm font-bold text-rose-800 dark:text-rose-300">Toplam Gider</span>
                        </div>
                        <span className="font-black text-rose-700 dark:text-rose-400">{formatCurrency(totalExpense)}</span>
                    </div>

                    {/* Net Sonuç */}
                    <div className={cn(
                        "flex items-center justify-between p-4 rounded-xl border-2 shadow-sm",
                        netResult >= 0 ? "bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800" : "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
                    )}>
                        <div className="flex items-center gap-3">
                            <Wallet className={cn("h-6 w-6", netResult >= 0 ? "text-sky-600" : "text-orange-600")} />
                            <span className={cn("font-black uppercase tracking-wider", netResult >= 0 ? "text-sky-800 dark:text-sky-300" : "text-orange-800 dark:text-orange-300")}>NET KASA</span>
                        </div>
                        <span className={cn("text-xl font-black", netResult >= 0 ? "text-sky-700 dark:text-sky-400" : "text-orange-700 dark:text-orange-400")}>{formatCurrency(netResult)}</span>
                    </div>

                    {/* Vardiya Farkı */}
                    <div className={cn(
                        "flex items-center justify-between p-3 rounded-xl border border-dashed",
                        shiftDiff === 0 ? "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700" : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
                    )}>
                        <div className="flex items-center gap-3">
                            <RefreshCcw className="h-4 w-4 text-slate-500" />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Vardiya Devir Farkı</span>
                        </div>
                        <span className={cn("text-sm font-bold", shiftDiff !== 0 && "text-amber-600")}>
                            {shiftDiff > 0 ? "+" : ""}{shiftDiff.toFixed(2)} ₺
                        </span>
                    </div>
                </div>

                <DialogFooter className="mt-8">
                    <Button onClick={() => setOpen(false)} variant="ghost" className="font-bold">Vazgeç</Button>
                    <Button
                        onClick={handleCloseDay}
                        disabled={!staffName.trim()}
                        className="bg-orange-600 hover:bg-orange-700 font-black gap-2 px-8 shadow-lg shadow-orange-200 disabled:opacity-50"
                    >
                        <CheckCircle2 className="h-5 w-5" /> ŞİMDİ KAPAT
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
