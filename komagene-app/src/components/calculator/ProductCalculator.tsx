"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trash2, Plus, Minus, Receipt, Calculator, ShoppingCart, X } from "lucide-react";
import { toast } from "sonner";

interface ProductCalculatorProps {
    products?: any[];
}

const CATEGORY_COLORS: Record<string, string> = {
    'Dürümler': 'bg-orange-500',
    'Soslu Dürümler': 'bg-red-600',
    'Yan Ürünler': 'bg-amber-500',
    'İçecekler': 'bg-blue-600',
    'Tatlılar': 'bg-pink-500',
    'Default': 'bg-zinc-700'
};

interface CartItem {
    id: string;
    name: string;
    price: number;
    category?: string;
    quantity: number;
}

export function ProductCalculator({ products = [] }: ProductCalculatorProps) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [manualAmount, setManualAmount] = useState<string>("0");

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, {
                id: product.id,
                name: product.name,
                price: product.price,
                category: product.category,
                quantity: 1
            }];
        });
        toast.success(`${product.name} eklendi`);
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + Number(manualAmount);

    const handleNumpad = (val: string) => {
        if (val === "C") {
            setManualAmount("0");
            return;
        }
        if (manualAmount === "0") {
            setManualAmount(val);
        } else {
            setManualAmount(prev => prev + val);
        }
    };

    const clearAll = () => {
        setCart([]);
        setManualAmount("0");
        toast.info("Tüm hesap temizlendi");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full max-h-[800px]">
            {/* Left side: Product Grid & Numpad */}
            <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
                    {products.map(product => (
                        <Button
                            key={product.id}
                            onClick={() => addToCart(product)}
                            className={cn(
                                "h-28 rounded-[2rem] flex flex-col items-center justify-center gap-1 border-none transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/20 text-white",
                                CATEGORY_COLORS[product.category] || CATEGORY_COLORS['Default']
                            )}
                        >
                            <span className="font-black italic text-base tracking-tighter uppercase line-clamp-2 px-4">{product.name}</span>
                            <span className="text-xs font-bold opacity-80">₺{product.price}</span>
                        </Button>
                    ))}
                    {products.length === 0 && (
                        <div className="col-span-full h-28 flex items-center justify-center border-2 border-dashed border-border/20 rounded-[2rem] text-muted-foreground font-bold italic opacity-40">
                            Menüde kayıtlı ürün bulunamadı.
                        </div>
                    )}
                </div>

                <Card className="border-none bg-secondary/30 backdrop-blur-xl rounded-[2.5rem] flex-1">
                    <CardHeader className="p-6 pb-2">
                        <div className="flex items-center gap-2 text-muted-foreground uppercase text-[10px] font-black tracking-widest opacity-60">
                            <Calculator className="w-4 h-4" /> Manuel Tutar Girişi
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        <div className="bg-background/40 rounded-[2rem] p-6 mb-6 text-right border border-border/10">
                            <span className="text-4xl font-black italic tracking-tighter">₺{manualAmount}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", "00", "C"].map((num) => (
                                <Button
                                    key={num}
                                    variant="secondary"
                                    onClick={() => handleNumpad(num)}
                                    className={cn(
                                        "h-16 rounded-2xl font-black text-xl hover:bg-primary hover:text-white transition-all",
                                        num === "C" ? "text-red-500" : ""
                                    )}
                                >
                                    {num}
                                </Button>
                            ))}
                            <Button
                                variant="default"
                                className="h-16 rounded-2xl font-black text-xl col-span-4 mt-2"
                                onClick={() => {
                                    if (Number(manualAmount) > 0) {
                                        toast.success("Tutar eklendi");
                                    }
                                }}
                            >
                                EKLE
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right side: Receipt / Running Total */}
            <Card className="lg:col-span-4 border-none bg-background/50 backdrop-blur-3xl rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden">
                <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary rounded-xl text-white">
                                <Receipt className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-xl font-black italic uppercase tracking-tighter">ADİSYON</CardTitle>
                        </div>
                        <Button variant="ghost" size="icon" onClick={clearAll} className="hover:bg-red-500/10 hover:text-red-500 rounded-xl">
                            <Trash2 className="w-5 h-5" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                    {cart.length === 0 && Number(manualAmount) === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-20 py-20 gap-4">
                            <ShoppingCart className="w-16 h-16" />
                            <p className="font-black italic uppercase text-xs tracking-widest text-center">Sepet Boş</p>
                        </div>
                    ) : (
                        <>
                            {cart.map(item => (
                                <div key={item.id} className="flex items-center justify-between group animate-in slide-in-from-right-4 duration-300">
                                    <div className="flex flex-col">
                                        <span className="font-black italic uppercase text-sm tracking-tight">{item.name}</span>
                                        <span className="text-[10px] font-bold text-muted-foreground">₺{item.price} x {item.quantity}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center bg-secondary/50 rounded-lg p-1">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-primary"><Minus className="w-3 h-3" /></button>
                                            <span className="px-2 text-xs font-black">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-primary"><Plus className="w-3 h-3" /></button>
                                        </div>
                                        <span className="font-black italic text-sm min-w-[60px] text-right">₺{item.price * item.quantity}</span>
                                    </div>
                                </div>
                            ))}
                            {Number(manualAmount) > 0 && (
                                <div className="flex items-center justify-between pt-4 border-t border-dashed border-border/50 text-sky-500">
                                    <span className="font-black italic uppercase text-sm tracking-tight">Manuel Giriş</span>
                                    <span className="font-black italic text-sm">₺{manualAmount}</span>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>

                <div className="p-8 bg-zinc-900/50 border-t border-border/10">
                    <div className="flex justify-between items-end mb-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Toplam Ödenecek</span>
                        <span className="text-5xl font-black italic text-primary tracking-tighter">₺{total}</span>
                    </div>
                    <Button
                        disabled={total === 0}
                        className="w-full h-16 rounded-[2rem] bg-emerald-500 hover:bg-emerald-600 text-white font-black italic text-xl uppercase tracking-tighter shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                        onClick={() => {
                            toast.success("Sipariş Onaylandı!");
                            clearAll();
                        }}
                    >
                        HESABI KAPAT
                    </Button>
                </div>
            </Card>
        </div>
    );
}
