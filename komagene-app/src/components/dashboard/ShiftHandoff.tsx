"use client";

import { useState } from "react";
import { DailyRecord, ShiftReport } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Info, CheckCircle2, LayoutList, Wallet } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";

const HANDOFF_ITEMS = [
    { id: "clean_prep", label: "Hazırlık tezgahı temizlendi" },
    { id: "clean_floor", label: "Zeminler süpürüldü ve silindi" },
    { id: "pos_roll", label: "POS rulosu kontrol edildi (Yedek var)" },
    { id: "trash", label: "Çöpler boşaltıldı" },
    { id: "security", label: "Kapı ve pencereler kilitlendi" },
    { id: "machines", label: "Gereksiz makineler kapatıldı" }
];

interface ShiftHandoffProps {
    currentRecord: DailyRecord;
    onComplete: (report: ShiftReport) => void;
}

export function ShiftHandoff({ currentRecord, onComplete }: ShiftHandoffProps) {
    const [checklist, setChecklist] = useState(
        HANDOFF_ITEMS.map(item => ({ ...item, completed: false }))
    );
    const [note, setNote] = useState("");

    const toggleItem = (id: string) => {
        setChecklist(prev => prev.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        ));
    };

    const isAllCompleted = checklist.every(item => item.completed);

    const handleHandoff = () => {
        if (!isAllCompleted) {
            toast.warning("Lütfen tüm maddeleri tamamlayın");
            return;
        }

        const report: ShiftReport = {
            completedAt: new Date().toISOString(),
            checklist: checklist,
            closingNote: note
        };

        onComplete(report);
        toast.success("Vardiya teslim raporu kaydedildi");
    };

    // Calculate daily totals for summary
    const totalIncome = (currentRecord.income.cash || 0) + (currentRecord.income.creditCard || 0) +
        Object.values(currentRecord.income.mealCard).reduce((a, b) => a + b, 0) +
        Object.values(currentRecord.income.online).reduce((a, b) => a + b, 0);

    return (
        <Card className="border-primary/20 bg-card overflow-hidden shadow-xl max-w-2xl mx-auto">
            <CardHeader className="bg-primary/5 border-b pb-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-black text-primary flex items-center gap-2">
                            <ClipboardCheck className="h-6 w-6" /> Vardiya Teslimi
                        </CardTitle>
                        <CardDescription>Kapatmadan önce son kontrolleri yapın</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
                {/* Financial Summary Snippet */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-muted/30 border border-dashed text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Günlük Ciro</p>
                        <p className="text-xl font-black text-emerald-600">₺{totalIncome.toLocaleString('tr-TR')}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-muted/30 border border-dashed text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Giderler</p>
                        <p className="text-xl font-black text-red-600">
                            ₺{currentRecord.expenses.reduce((a, b) => a + b.amount, 0).toLocaleString('tr-TR')}
                        </p>
                    </div>
                </div>

                {/* Checklist Section */}
                <div className="space-y-4">
                    <h3 className="font-bold text-sm flex items-center gap-2 text-muted-foreground">
                        <LayoutList className="h-4 w-4" /> OPERASYON KONTROL LİSTESİ
                    </h3>
                    <div className="grid gap-3">
                        {checklist.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => toggleItem(item.id)}
                                className={cn(
                                    "flex items-center space-x-3 p-4 rounded-2xl border-2 transition-all cursor-pointer",
                                    item.completed
                                        ? "border-emerald-200 bg-emerald-50/50"
                                        : "border-muted hover:border-primary/20"
                                )}
                            >
                                <Checkbox
                                    checked={item.completed}
                                    onCheckedChange={() => toggleItem(item.id)}
                                    className="h-5 w-5 rounded-full border-2 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                />
                                <span className={cn(
                                    "text-sm font-medium select-none flex-1",
                                    item.completed ? "text-emerald-800" : "text-foreground"
                                )}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Staff Note */}
                <div className="space-y-4">
                    <h3 className="font-bold text-sm flex items-center gap-2 text-muted-foreground">
                        <Info className="h-4 w-4" /> KAPANIŞ NOTU (Opsiyonel)
                    </h3>
                    <Textarea
                        placeholder="Yöneticiye iletmek istediğiniz bir not var mı? (Örn: Masa 3 kolu sallanıyor)"
                        className="min-h-[100px] rounded-2xl border-2 focus-visible:ring-primary focus-visible:border-primary bg-white dark:bg-muted"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t p-6">
                <Button
                    className="w-full h-10 text-base font-bold rounded-xl gap-2 shadow-lg transition-all active:scale-[0.98]"
                    disabled={!isAllCompleted}
                    onClick={handleHandoff}
                >
                    <CheckCircle2 className="h-5 w-5" /> Vardiyayı Tamamla ve Kaydet
                </Button>
            </CardFooter>
        </Card>
    );
}
