"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle, Calculator } from "lucide-react";
import { DailyRecord } from "@/types";
import { format } from "date-fns";

interface ReconcileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    record: DailyRecord;
    onSave: (count: number, diff: number) => void;
}

export function ReconcileDialog({ open, onOpenChange, record, onSave }: ReconcileDialogProps) {
    const [countedCash, setCountedCash] = useState("");
    const [result, setResult] = useState<{ diff: number, status: 'match' | 'missing' | 'surplus' } | null>(null);

    // Calculate expected cash: (Income.cash - Expenses(categorized as paid from cash?))
    // Simplification: Assume all expenses are paid from Cash unless likely otherwise.
    // For now, let's assume Net Cash = Cash Income - Total Expenses (often expenses are cash).
    // If credit card expenses exist, this logic might need refinement.
    const expectedCash = (record.income.cash || 0) - record.expenses.reduce((a, b) => a + b.amount, 0);

    const handleCheck = () => {
        const actual = parseFloat(countedCash) || 0;
        const diff = actual - expectedCash;

        let status: 'match' | 'missing' | 'surplus' = 'match';
        if (diff < -5) status = 'missing'; // Tolerance of 5 TL
        if (diff > 5) status = 'surplus';

        setResult({ diff, status });
    };

    const handleConfirm = () => {
        if (result) {
            onSave(parseFloat(countedCash), result.diff);
            onOpenChange(false);
            setResult(null);
            setCountedCash("");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Kasa Gün Sonu Sayımı</DialogTitle>
                    <DialogDescription>
                        Lütfen kasadaki **fiziksel nakit parayı** sayıp giriniz. Sistem otomatik karşılaştırma yapacaktır.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {!result ? (
                        <div className="space-y-2">
                            <Label>Saydığınız Nakit Tutar</Label>
                            <div className="relative">
                                <Calculator className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-9 text-lg"
                                    placeholder="0.00"
                                    type="number"
                                    value={countedCash}
                                    onChange={(e) => setCountedCash(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <Button onClick={handleCheck} className="w-full mt-2">
                                Kontrol Et
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4 text-center anim-in fade-in zoom-in duration-300">
                            <div className={`mx-auto rounded-full p-3 w-fit ${result.status === 'match' ? 'bg-green-100 text-green-600' :
                                    result.status === 'missing' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                }`}>
                                {result.status === 'match' ? <CheckCircle className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
                            </div>

                            <div className="space-y-1">
                                <h3 className="font-bold text-xl">
                                    {result.status === 'match' ? 'Kasa Tamam!' :
                                        result.status === 'missing' ? 'Kasa Eksik!' : 'Kasa Fazla!'}
                                </h3>
                                <p className="text-muted-foreground">
                                    {result.status === 'match'
                                        ? "Tebrikler, hesaplar tutuyor."
                                        : `Fark: ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Math.abs(result.diff))}`
                                    }
                                </p>
                            </div>

                            <div className="bg-muted p-3 rounded-lg text-sm text-left space-y-1">
                                <div className="flex justify-between">
                                    <span>Beklenen:</span>
                                    <span className="font-mono">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(expectedCash)}</span>
                                </div>
                                <div className="flex justify-between font-bold">
                                    <span>Sayılı:</span>
                                    <span className="font-mono">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(parseFloat(countedCash))}</span>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setResult(null)}>Tekrar Say</Button>
                                <Button onClick={handleConfirm} className={result.status === 'match' ? 'bg-green-600 hover:bg-green-700' : 'bg-primary'}>
                                    Kaydet ve Bitir
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
