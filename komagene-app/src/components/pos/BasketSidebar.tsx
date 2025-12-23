"use client";

import { usePosStore } from "@/store/usePosStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Minus, Calculator, CreditCard, Banknote, Coins, Delete, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product } from "@/types";

export function BasketSidebar() {
    const { basket, addToBasket, removeFromBasket, updateBasketItemQuantity, getBasketTotal, clearBasket } = usePosStore();
    const total = getBasketTotal();
    const [amountGiven, setAmountGiven] = useState<string>("");
    const [manualAmount, setManualAmount] = useState<string>("");
    const [activeTab, setActiveTab] = useState("cart");

    const handleQuickAmount = (val: number) => {
        setAmountGiven((prev) => (Number(prev || 0) + val).toString());
    };

    const handleNumpadPress = (val: string) => {
        if (val === 'C') {
            setManualAmount("");
            return;
        }
        if (val === 'back') {
            setManualAmount(prev => prev.slice(0, -1));
            return;
        }
        if (val === '.' && manualAmount.includes('.')) return;
        setManualAmount(prev => prev + val);
    };

    const addManualItem = () => {
        const price = parseFloat(manualAmount);
        if (!price || price <= 0) return;

        const manualProduct: Product = {
            id: `manual-${Date.now()}`,
            name: 'Genel Satış',
            category_id: 'manual',
            price: price,
            is_active: true
        };

        addToBasket(manualProduct, 1);
        setManualAmount("");
        setActiveTab("cart"); // Switch back to see item
    };

    const change = Number(amountGiven) - total;

    return (
        <div className="h-full flex flex-col bg-white dark:bg-zinc-900/50 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Calculator className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-bold">Kasa</CardTitle>
                </div>
                {basket.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearBasket} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <div className="px-4 pt-2">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="cart">Sepet ({basket.length})</TabsTrigger>
                        <TabsTrigger value="numpad">Manuel Giriş</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="cart" className="flex-1 overflow-hidden flex flex-col mt-0 data-[state=inactive]:hidden">
                    <ScrollArea className="flex-1 p-4">
                        {basket.length === 0 ? (
                            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-2">
                                <Coins className="h-10 w-10" />
                                <p className="font-medium text-sm">Sepet Boş</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {basket.map((item, index) => (
                                    <div key={index} className="flex items-start justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{item.product.name}</h4>
                                            {item.selectedVariants.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {item.selectedVariants.map((v, i) => (
                                                        <span key={i} className="text-[10px] bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded-md text-slate-600 dark:text-slate-400">
                                                            {v.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="mt-2 text-xs font-bold text-primary">
                                                {(item.totalPrice / item.quantity).toFixed(2)} ₺
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-1 bg-white dark:bg-black/20 rounded-lg p-0.5 shadow-sm border border-slate-100 dark:border-white/5">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 rounded-md hover:bg-slate-100 dark:hover:bg-white/10"
                                                    onClick={() => updateBasketItemQuantity(index, -1)}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 rounded-md hover:bg-slate-100 dark:hover:bg-white/10"
                                                    onClick={() => updateBasketItemQuantity(index, 1)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <span className="font-bold text-sm">{item.totalPrice.toFixed(2)} ₺</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="numpad" className="flex-1 p-4 mt-0 data-[state=inactive]:hidden flex flex-col gap-4">
                    <div className="bg-slate-100 dark:bg-black/20 p-4 rounded-2xl text-right mb-2">
                        <span className="text-3xl font-black tracking-tighter text-slate-800 dark:text-white">
                            {manualAmount || "0"} <span className="text-lg text-muted-foreground">₺</span>
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 flex-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <Button key={num} variant="outline" className="h-full text-2xl font-bold rounded-xl" onClick={() => handleNumpadPress(num.toString())}>
                                {num}
                            </Button>
                        ))}
                        <Button variant="outline" className="h-full text-2xl font-bold rounded-xl" onClick={() => handleNumpadPress('.')}>.</Button>
                        <Button variant="outline" className="h-full text-2xl font-bold rounded-xl" onClick={() => handleNumpadPress('0')}>0</Button>
                        <Button variant="outline" className="h-full rounded-xl text-red-500" onClick={() => handleNumpadPress('back')}>
                            <Delete className="h-6 w-6" />
                        </Button>
                    </div>
                    <Button
                        size="lg"
                        className="w-full text-lg font-bold h-14 bg-emerald-600 hover:bg-emerald-700"
                        onClick={addManualItem}
                        disabled={!manualAmount}
                    >
                        Sepete Ekle
                    </Button>
                </TabsContent>
            </Tabs>

            {/* Smart Calculator Section (Fixed Bottom) */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-900 border-t border-slate-200 dark:border-white/10 space-y-4">

                {/* Total Display */}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Toplam Tutar</span>
                    <span className="text-3xl font-black text-primary">{total.toFixed(2)} ₺</span>
                </div>

                <Separator className="bg-slate-200 dark:bg-white/10" />

                {/* Calculator Input */}
                <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-2">
                        {[5, 10, 20, 50, 100, 200].map((val) => (
                            <Button
                                key={val}
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickAmount(val)}
                                className="text-xs font-bold border-slate-200 dark:border-white/10 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                            >
                                +{val}₺
                            </Button>
                        ))}
                        <Button variant="destructive" size="sm" onClick={() => setAmountGiven("")} className="text-xs col-span-2">
                            Sıfırla
                        </Button>
                    </div>

                    <div className="relative">
                        <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="number"
                            placeholder="Alınan Miktar"
                            className="pl-9 h-11 bg-white dark:bg-black/20 font-bold text-lg"
                            value={amountGiven}
                            onChange={(e) => setAmountGiven(e.target.value)}
                        />
                    </div>

                    {/* Change Display */}
                    <div className={`p-3 rounded-xl border-2 transition-all ${change >= 0
                        ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                        : "bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20 text-orange-700 dark:text-orange-400"
                        }`}>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold uppercase tracking-wider">Para Üstü</span>
                            <span className="text-xl font-black">{change >= 0 ? change.toFixed(2) : "0.00"} ₺</span>
                        </div>
                        {change < 0 && amountGiven && (
                            <p className="text-[10px] font-bold mt-1 opacity-80 text-right">
                                {(Math.abs(change)).toFixed(2)} ₺ daha gerekli
                            </p>
                        )}
                    </div>
                </div>

                {/* Confirm Button */}
                <Button className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all" disabled={basket.length === 0}>
                    Satışı Tamamla
                </Button>
            </div>
        </div>
    );
}
