"use client";

import { useState } from "react";
import { ExpenseItem, ExpenseCategory } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Assuming I installed textarea or use standard Input
import { Plus } from "lucide-react";

interface ExpenseFormProps {
    onAdd: (expense: Omit<ExpenseItem, 'id'>) => void;
}

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
    { value: 'supplies', label: 'Malzeme Alımı' },
    { value: 'staff', label: 'Personel / Maaş' },
    { value: 'rent', label: 'Kira / Fatura' },
    { value: 'tax', label: 'Vergi / Muhasebe' },
    { value: 'other', label: 'Diğer Giderler' },
];

export function ExpenseForm({ onAdd }: ExpenseFormProps) {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<ExpenseCategory>('supplies');
    const [tag, setTag] = useState('');
    const [note, setNote] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount) return;

        onAdd({
            amount: parseFloat(amount),
            category,
            tag: tag.trim() || undefined,
            note: note.trim() || undefined
        });

        // Reset
        setAmount('');
        setTag('');
        setNote('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-1">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Tutar</Label>
                    <Input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="text-lg font-mono"
                        required
                        step="0.01"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Kategori</Label>
                    <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORIES.map(c => (
                                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Etiket (Opsiyonel)</Label>
                <Input
                    placeholder="Örn: Elektrik, Domates, Ahmet Avans..."
                    value={tag}
                    onChange={e => setTag(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label>Not</Label>
                <Input
                    placeholder="Detaylı açıklama..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                />
            </div>

            <Button type="submit" className="w-full" variant="destructive">
                <Plus className="mr-2 h-4 w-4" /> Gider Ekle
            </Button>
        </form>
    );
}
