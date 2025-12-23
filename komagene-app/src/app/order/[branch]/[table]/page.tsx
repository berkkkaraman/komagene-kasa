"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ChevronRight, Info, Plus, Minus, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function OrderPage() {
    const params = useParams();
    const branchId = params.branch as string;
    const tableId = params.table as string;

    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<{ product: Product, quantity: number }[]>([]);
    const [activeCategory, setActiveCategory] = useState("Hepsi");

    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await supabase
                .from('products')
                .select('*')
                .eq('branch_id', branchId)
                .eq('is_active', true);
            if (data) setProducts(data);
        };
        fetchProducts();
    }, [branchId]);

    const categories: string[] = ["Hepsi", ...Array.from(new Set(products.map(p => p.category_id).filter(Boolean))) as string[]];

    const filteredProducts = activeCategory === "Hepsi"
        ? products
        : products.filter(p => p.category_id === activeCategory);

    const updateCart = (product: Product, delta: number) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                const newQuantity = existing.quantity + delta;
                if (newQuantity <= 0) return prev.filter(item => item.product.id !== product.id);
                return prev.map(item => item.product.id === product.id ? { ...item, quantity: newQuantity } : item);
            }
            if (delta > 0) return [...prev, { product, quantity: 1 }];
            return prev;
        });
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    const submitOrder = async () => {
        if (cart.length === 0) return;

        const { error } = await supabase.from('orders').insert({
            branch_id: branchId,
            table_no: tableId,
            items: cart.map(item => ({
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity
            })),
            total_amount: totalAmount,
            status: 'pending'
        });

        if (error) {
            toast.error("Sipariş gönderilemedi: " + error.message);
        } else {
            toast.success("Siparişiniz alındı! Hazırlanıyor...");
            setCart([]);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-100 font-sans pb-32">
            {/* Header */}
            <div className="bg-white dark:bg-zinc-900 px-6 py-8 shadow-sm border-b">
                <h1 className="text-2xl font-black italic text-primary uppercase tracking-tighter">KOMAGENE</h1>
                <p className="text-sm font-bold text-slate-500 mt-1">{tableId} • Hoş Geldiniz</p>
            </div>

            {/* Category Slider */}
            <div className="sticky top-0 z-20 bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 py-4 flex gap-2 overflow-x-auto no-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                            "px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap border",
                            activeCategory === cat
                                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-500"
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Product List */}
            <div className="px-4 mt-4 space-y-4">
                {filteredProducts.map(product => {
                    const cartItem = cart.find(item => item.product.id === product.id);
                    return (
                        <Card key={product.id} className="border-none shadow-md overflow-hidden bg-white dark:bg-zinc-900">
                            <CardContent className="p-0 flex h-32">
                                <div className="flex-1 p-4 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight dark:text-white">{product.name}</h3>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{product.description}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-lg font-black">{product.price.toLocaleString('tr-TR')} ₺</span>

                                        {/* Counter UI */}
                                        <div className="flex items-center gap-3 bg-slate-100 dark:bg-zinc-800 py-1 px-3 rounded-full">
                                            {cartItem ? (
                                                <>
                                                    <button onClick={() => updateCart(product, -1)} className="p-1"><Minus className="h-4 w-4 text-primary" /></button>
                                                    <span className="font-bold text-sm min-w-[1rem] text-center">{cartItem.quantity}</span>
                                                    <button onClick={() => updateCart(product, 1)} className="p-1"><Plus className="h-4 w-4 text-primary" /></button>
                                                </>
                                            ) : (
                                                <button onClick={() => updateCart(product, 1)} className="p-1 flex items-center gap-1">
                                                    <Plus className="h-4 w-4 text-primary" />
                                                    <span className="text-xs font-bold uppercase tracking-tight text-primary">Ekle</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {product.image_url && (
                                    <div className="w-32 bg-slate-200 shrink-0">
                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Floating Order Bar */}
            {cart.length > 0 && (
                <div className="fixed bottom-6 left-4 right-4 z-50">
                    <Button
                        onClick={submitOrder}
                        className="w-full h-16 bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/40 rounded-2xl flex items-center justify-between px-8"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <ShoppingBag className="h-6 w-6" />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] uppercase font-bold opacity-80">Sipariş Ver</p>
                                <p className="text-lg font-black leading-tight italic">{totalAmount.toLocaleString('tr-TR')} ₺</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 font-bold">
                            Tamamla <ChevronRight className="h-5 w-5" />
                        </div>
                    </Button>
                </div>
            )}
        </div>
    );
}
