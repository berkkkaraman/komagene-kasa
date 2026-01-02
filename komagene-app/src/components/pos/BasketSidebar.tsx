"use client";

import { usePosStore } from "@/store/usePosStore";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Minus, Calculator, Banknote, Coins, Delete, CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product, DailyRecord } from "@/types";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function BasketSidebar() {
    const { basket, addToBasket, updateBasketItemQuantity, getBasketTotal, clearBasket } = usePosStore();
    const { records, addRecord, updateRecord, userProfile } = useStore();
    const total = getBasketTotal();
    const [amountGiven, setAmountGiven] = useState<string>("");
    const [manualAmount, setManualAmount] = useState<string>("");
    const [activeTab, setActiveTab] = useState("cart");
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
    const [isProcessing, setIsProcessing] = useState(false);

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
        setActiveTab("cart");
    };

    const handleCompleteSale = async () => {
        if (basket.length === 0 || !userProfile?.branch_id) {
            toast.error("Sepet boş veya oturum açılmamış!");
            return;
        }

        setIsProcessing(true);
        const todayStr = new Date().toISOString().split('T')[0];

        try {
            // 1. Create Order in Database
            const orderItems = basket.map(item => ({
                product_id: item.product.id,
                name: item.product.name,
                quantity: item.quantity,
                unit_price: item.product.price,
                total: item.totalPrice,
                variants: item.selectedVariants
            }));

            const { error: orderError } = await supabase.from('orders').insert({
                branch_id: userProfile.branch_id,
                table_no: 'POS',
                items: orderItems,
                total_amount: total,
                status: 'completed',
                source: 'manual'
            });

            if (orderError) {
                console.error("Order insert error:", orderError);
                // Continue anyway, we want to update local state
            }

            // 2. Update or Create Today's Record
            let todayRecord = records.find(r => r.date === todayStr);

            if (todayRecord) {
                // Update existing record
                const updatedRecord: DailyRecord = {
                    ...todayRecord,
                    income: {
                        ...todayRecord.income,
                        cash: paymentMethod === 'cash' ? (todayRecord.income.cash || 0) + total : todayRecord.income.cash,
                        creditCard: paymentMethod === 'card' ? (todayRecord.income.creditCard || 0) + total : todayRecord.income.creditCard,
                    },
                    isSynced: false
                };
                updateRecord(updatedRecord);
            } else {
                // Create new record for today
                const newRecord: DailyRecord = {
                    id: crypto.randomUUID(),
                    branch_id: userProfile.branch_id,
                    date: todayStr,
                    income: {
                        cash: paymentMethod === 'cash' ? total : 0,
                        creditCard: paymentMethod === 'card' ? total : 0,
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

            // 3. Success!
            toast.success(`₺${total.toFixed(2)} satış kaydedildi!`, {
                description: paymentMethod === 'cash' ? 'Nakit Ödeme' : 'Kredi Kartı'
            });

            clearBasket();
            setAmountGiven("");

        } catch (error: any) {
            console.error("Sale completion error:", error);
            toast.error("Satış kaydedilemedi: " + (error.message || "Bilinmeyen hata"));
        } finally {
            setIsProcessing(false);
        }
    };

    const change = Number(amountGiven) - total;

    return (
        <div className="h-full flex flex-col bg-transparent overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-primary/5 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-2xl shadow-glow-sm shadow-primary/20 animate-pulse-glow">
                        <Calculator className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-display font-black tracking-tight uppercase">Sipariş</CardTitle>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Canlı Kasa Oturumu</p>
                    </div>
                </div>
                {basket.length > 0 && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={clearBasket}
                        className="text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                    >
                        <Trash2 className="h-5 w-5" />
                    </Button>
                )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 pt-4 shrink-0">
                    <TabsList className="grid w-full grid-cols-2 p-1.5 bg-muted/20 backdrop-blur-md rounded-2xl border border-white/5 h-14">
                        <TabsTrigger
                            value="cart"
                            className="rounded-xl font-display font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                        >
                            Sepet ({basket.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="numpad"
                            className="rounded-xl font-display font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                        >
                            Manuel Giriş
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="cart" className="flex-1 overflow-hidden flex flex-col mt-0 data-[state=inactive]:hidden">
                    <ScrollArea className="flex-1 px-6">
                        {basket.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 py-20 grayscale opacity-50">
                                <div className="p-6 bg-muted/20 rounded-full mb-4">
                                    <Coins className="h-16 w-16" />
                                </div>
                                <p className="font-display font-black text-sm uppercase tracking-widest">Sepetiniz Boş</p>
                                <p className="text-xs font-bold mt-1">Lütfen ürün ekleyin</p>
                            </div>
                        ) : (
                            <div className="space-y-4 py-4 pr-2">
                                {basket.map((item, index) => (
                                    <div key={index} className="group relative glass-card p-5 rounded-3xl border-white/5 hover:border-primary/20 transition-all duration-300 animate-in fade-in slide-in-from-right-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 space-y-1">
                                                <h4 className="font-display font-black text-sm tracking-tight">{item.product.name}</h4>
                                                {item.selectedVariants.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {item.selectedVariants.map((v, i) => (
                                                            <span key={i} className="text-[9px] font-black uppercase tracking-tighter bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                                {v.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="pt-2 text-xs font-black text-gradient-gold">
                                                    {(item.totalPrice / item.quantity).toFixed(2)} ₺
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-3">
                                                <div className="flex items-center gap-2 bg-muted/20 p-1 rounded-2xl border border-white/5">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-xl hover:bg-rose-500/20 hover:text-rose-500 transition-colors"
                                                        onClick={() => updateBasketItemQuantity(index, -1)}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-xl hover:bg-emerald-500/20 hover:text-emerald-500 transition-colors"
                                                        onClick={() => updateBasketItemQuantity(index, 1)}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <span className="font-display font-black text-base">{item.totalPrice.toFixed(2)} ₺</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="numpad" className="flex-1 p-6 mt-0 data-[state=inactive]:hidden flex flex-col gap-6">
                    <div className="glass-panel p-6 rounded-3xl text-right border-white/10 shadow-glow-sm shadow-primary/5">
                        <span className="text-4xl font-display font-black tracking-tighter text-gradient">
                            {manualAmount || "0"} <span className="text-xl text-muted-foreground tracking-normal font-sans">₺</span>
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 flex-1 px-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <Button key={num} variant="outline" className="h-full text-2xl font-display font-bold rounded-2xl glass-card hover:bg-primary hover:text-white transition-all duration-300" onClick={() => handleNumpadPress(num.toString())}>
                                {num}
                            </Button>
                        ))}
                        <Button variant="outline" className="h-full text-2xl font-display font-bold rounded-2xl glass-card" onClick={() => handleNumpadPress('.')}>.</Button>
                        <Button variant="outline" className="h-full text-2xl font-display font-bold rounded-2xl glass-card" onClick={() => handleNumpadPress('0')}>0</Button>
                        <Button variant="outline" className="h-full rounded-2xl glass-card text-rose-500 hover:bg-rose-500 hover:text-white transition-all" onClick={() => handleNumpadPress('back')}>
                            <Delete className="h-7 w-7" />
                        </Button>
                    </div>
                    <Button
                        size="lg"
                        className="w-full text-lg font-display font-black h-16 rounded-3xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                        onClick={addManualItem}
                        disabled={!manualAmount}
                    >
                        Sepete Ekle
                    </Button>
                </TabsContent>
            </Tabs>

            {/* Smart Calculator Section (Fixed Bottom) */}
            <div className="p-8 bg-black/40 backdrop-blur-3xl border-t border-white/10 space-y-6 shrink-0 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

                {/* Total Display */}
                <div className="flex items-center justify-between relative">
                    <div className="space-y-0.5">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Ödenecek Tutar</span>
                        <div className="h-1 w-8 bg-primary rounded-full" />
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-display font-black tracking-tighter text-gradient-gold">{total.toFixed(2)}</span>
                        <span className="text-lg font-bold text-muted-foreground">₺</span>
                    </div>
                </div>

                {/* Payment Method Selector */}
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                        className={cn(
                            "h-14 rounded-3xl font-display font-bold gap-3 transition-all duration-500",
                            paymentMethod === 'cash'
                                ? "bg-primary text-white shadow-glow-sm shadow-primary/40 border-primary"
                                : "glass-card border-white/5 hover:bg-white/10"
                        )}
                        onClick={() => setPaymentMethod('cash')}
                    >
                        <Banknote className="h-6 w-6" /> Nakit
                    </Button>
                    <Button
                        variant={paymentMethod === 'card' ? 'default' : 'outline'}
                        className={cn(
                            "h-14 rounded-3xl font-display font-bold gap-3 transition-all duration-500",
                            paymentMethod === 'card'
                                ? "bg-primary text-white shadow-glow-sm shadow-primary/40 border-primary"
                                : "glass-card border-white/5 hover:bg-white/10"
                        )}
                        onClick={() => setPaymentMethod('card')}
                    >
                        <CreditCard className="h-6 w-6" /> Kart
                    </Button>
                </div>

                {/* Calculator Input (Only for Cash) */}
                {paymentMethod === 'cash' && (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                        <ScrollArea className="w-full whitespace-nowrap">
                            <div className="flex gap-2 pb-1">
                                {[5, 10, 20, 50, 100, 200].map((val) => (
                                    <Button
                                        key={val}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleQuickAmount(val)}
                                        className="h-10 px-4 rounded-xl font-black text-xs glass-card border-white/5 hover:bg-primary/20 hover:text-primary transition-all"
                                    >
                                        +{val}₺
                                    </Button>
                                ))}
                                <Button variant="ghost" size="sm" onClick={() => setAmountGiven("")} className="h-10 px-4 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-all">
                                    Sıfırla
                                </Button>
                            </div>
                        </ScrollArea>

                        <div className="relative group">
                            <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                type="number"
                                placeholder="Alınan Miktar"
                                className="pl-12 h-14 rounded-2xl glass-panel border-white/10 font-display font-black text-xl tracking-tight focus-visible:ring-primary/20"
                                value={amountGiven}
                                onChange={(e) => setAmountGiven(e.target.value)}
                            />
                        </div>

                        {/* Change Display */}
                        <div className={cn(
                            "p-5 rounded-3xl border-2 transition-all duration-500 flex flex-col relative overflow-hidden",
                            change >= 0
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : "bg-primary/10 border-primary/20 text-primary"
                        )}>
                            <div className="flex justify-between items-center relative z-10">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Para Üstü</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-display font-black tracking-tighter">{change >= 0 ? change.toFixed(2) : "0.00"}</span>
                                    <span className="text-base font-bold">₺</span>
                                </div>
                            </div>
                            {change < 0 && amountGiven && (
                                <p className="text-[10px] font-black mt-2 opacity-80 text-right animate-pulse tracking-wide uppercase">
                                    {(Math.abs(change)).toFixed(2)} ₺ EKSİK
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Confirm Button */}
                <Button
                    className="w-full h-16 text-xl font-display font-black rounded-3xl shadow-2xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all duration-300 gap-3 group relative overflow-hidden"
                    disabled={basket.length === 0 || isProcessing}
                    onClick={handleCompleteSale}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-rose-500 to-primary bg-[length:200%_100%] animate-gradient" />
                    <div className="relative flex items-center justify-center gap-3">
                        {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Plus className="h-6 w-6" />}
                        <span>{isProcessing ? 'İŞLENİYOR' : 'SATIŞI TAMAMLA'}</span>
                    </div>
                </Button>
            </div>
        </div>
    );
}
