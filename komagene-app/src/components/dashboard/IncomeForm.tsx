"use client";

import { useState, useEffect } from "react";
import { DailyIncome } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Calculator, Wallet, CreditCard, Globe, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

import { ZReportCapture } from "./ZReportCapture";

interface IncomeFormProps {
    initialData: DailyIncome;
    initialImage?: string;
    onSave: (data: DailyIncome, image?: string) => void;
}

export function IncomeForm({ initialData, initialImage, onSave }: IncomeFormProps) {
    const [data, setData] = useState<DailyIncome>(initialData);
    const [image, setImage] = useState<string | undefined>(initialImage);

    useEffect(() => {
        setData(initialData);
        setImage(initialImage);
    }, [initialData, initialImage]);

    const handleChange = (field: keyof DailyIncome, value: string) => {
        setData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    };

    const handleDeepChange = (category: 'mealCard' | 'online', field: string, value: string) => {
        setData(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: parseFloat(value) || 0
            }
        }));
    };

    const addAmount = (curVal: number, setVal: (n: number) => void, addValStr: string) => {
        const toAdd = parseFloat(addValStr) || 0;
        if (toAdd !== 0) {
            setVal(curVal + toAdd);
        }
    };

    const handleSave = () => {
        // Anomaly Detection
        const allValues = [
            data.cash,
            data.creditCard,
            ...Object.values(data.online),
            ...Object.values(data.mealCard)
        ];

        const hasAnomaly = allValues.some(val => val > 20000);

        if (hasAnomaly) {
            if (!confirm("⚠️ DİKKAT: 20.000 TL üzerinde bir giriş yaptınız. Bu tutar doğru mu? Yanlışlıkla fazla sıfır atmış olabilirsiniz.")) {
                return;
            }
        }

        onSave(data, image);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CASH SECTION */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="cash" className="text-emerald-600 font-bold flex items-center gap-2">
                            <Wallet className="w-4 h-4" /> Nakit Kasa
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="cash"
                                type="number"
                                value={data.cash || ''}
                                onChange={e => handleChange('cash', e.target.value)}
                                placeholder="0.00"
                                className="text-lg font-mono flex-1 border-emerald-200 focus-visible:ring-emerald-500"
                            />
                            <AdderPopover
                                title="Nakit Ekle"
                                onAdd={(v) => addAmount(data.cash || 0, (n) => handleChange('cash', n.toString()), v)}
                                color="bg-emerald-600"
                            />
                        </div>
                    </div>

                    <div className="bg-muted/10 border rounded-lg p-3">
                        <Label className="mb-2 block text-xs font-semibold text-muted-foreground">Z-RAPORU FOTOĞRAFI</Label>
                        <ZReportCapture existingImage={image} onSave={setImage} />
                    </div>
                </div>

                {/* CREDIT CARD SECTION */}
                <div className="space-y-2">
                    <Label htmlFor="creditCard" className="text-blue-600 font-bold flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> Kredi Kartı / POS
                    </Label>
                    <div className="flex gap-2">
                        <Input
                            id="creditCard"
                            type="number"
                            value={data.creditCard || ''}
                            onChange={e => handleChange('creditCard', e.target.value)}
                            placeholder="0.00"
                            className="text-lg font-mono flex-1 border-blue-200 focus-visible:ring-blue-500"
                        />
                        <AdderPopover
                            title="POS Çekimi Ekle"
                            onAdd={(v) => addAmount(data.creditCard || 0, (n) => handleChange('creditCard', n.toString()), v)}
                            color="bg-blue-600"
                        />
                    </div>
                </div>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
                {/* ONLINE SECTION */}
                <Card className="bg-orange-50/50 dark:bg-orange-950/10 border-orange-100 shadow-sm">
                    <CardContent className="pt-4 space-y-4">
                        <h4 className="font-semibold text-orange-700 text-sm flex items-center gap-2">
                            <Globe className="w-4 h-4" /> Online Siparişler
                        </h4>
                        <div className="space-y-3">
                            {Object.entries(data.online).map(([key, val]) => (
                                <div key={key} className="flex items-center gap-2">
                                    <Label className="w-24 capitalize text-xs">{key}</Label>
                                    <Input
                                        type="number"
                                        className="h-8 font-mono text-sm"
                                        value={val || ''}
                                        onChange={e => handleDeepChange('online', key, e.target.value)}
                                    />
                                    <AdderPopover
                                        small
                                        title={`${key} Ekle`}
                                        onAdd={(v) => addAmount(val, (n) => handleDeepChange('online', key, n.toString()), v)}
                                        color="bg-orange-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* MEAL CARD SECTION */}
                <Card className="bg-purple-50/50 dark:bg-purple-950/10 border-purple-100 shadow-sm">
                    <CardContent className="pt-4 space-y-4">
                        <h4 className="font-semibold text-purple-700 text-sm flex items-center gap-2">
                            <Utensils className="w-4 h-4" /> Yemek Kartları
                        </h4>
                        <div className="space-y-3">
                            {Object.entries(data.mealCard).map(([key, val]) => (
                                <div key={key} className="flex items-center gap-2">
                                    <Label className="w-24 capitalize text-xs">{key}</Label>
                                    <Input
                                        type="number"
                                        className="h-8 font-mono text-sm"
                                        value={val || ''}
                                        onChange={e => handleDeepChange('mealCard', key, e.target.value)}
                                    />
                                    <AdderPopover
                                        small
                                        title={`${key} Ekle`}
                                        onAdd={(v) => addAmount(val, (n) => handleDeepChange('mealCard', key, n.toString()), v)}
                                        color="bg-purple-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                💾 Kaydet ve Güncelle
            </Button>
        </div>
    );
}

function AdderPopover({ title, onAdd, color = "bg-primary", small = false }: { title: string, onAdd: (val: string) => void, color?: string, small?: boolean }) {
    const [val, setVal] = useState('');
    const [open, setOpen] = useState(false);

    const handleAdd = () => {
        onAdd(val);
        setVal('');
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className={cn("shrink-0 aspect-square border-dashed border-2 hover:border-solid", small ? "h-8 w-8" : "h-10 w-10")}
                    title="Üzerine Ekle"
                >
                    <Plus className={cn("text-muted-foreground", small ? "h-3 w-3" : "h-5 w-5")} />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-3" side="top">
                <div className="space-y-3">
                    <h4 className="font-medium text-sm leading-none">{title}</h4>
                    <p className="text-xs text-muted-foreground">Mevcut tutarın üzerine eklenecek.</p>
                    <div className="flex gap-2">
                        <Input
                            autoFocus
                            placeholder="Miktar"
                            type="number"
                            value={val}
                            onChange={e => setVal(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAdd()}
                        />
                        <Button size="icon" onClick={handleAdd} className={color}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
