"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";
import { ProductService } from "@/services/productService";
import { MoveRight } from "lucide-react";

export default function SignagePage() {
    const params = useParams();
    const branchId = params.branch as string;
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!branchId) return;
        loadProducts();

        // Realtime Subscription (Fiyat anlık değişsin)
        const channel = supabase
            .channel(`public_signage_${branchId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'products',
                    filter: `branch_id=eq.${branchId}`
                },
                (payload) => {
                    console.log("Signage Update:", payload);
                    loadProducts(); // Basit update: Her değişiklikte yeniden çek
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [branchId]);

    const loadProducts = async () => {
        try {
            // Note: We might need a public wrapper in service if RLS blocks, 
            // but our RLS allows 'true' for select, so it should work.
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('branch_id', branchId)
                .eq('is_active', true) // Sadece aktifleri göster
                .order('category', { ascending: true })
                .order('price', { ascending: true }); // Önce ucuzlar

            if (data) setProducts(data as Product[]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Group by Category
    const grouped = products.reduce((acc, product) => {
        const cat = product.category || 'Diğer';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(product);
        return acc;
    }, {} as Record<string, Product[]>);

    const ticker = "KOMAGENE • Taze Lezzetler • Gerçek Lezzet • %100 Doğal • Hijyenik Üretim • Afiyet Olsun!";

    if (loading) return <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center text-primary text-4xl animate-pulse">Komagene Menü Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white font-sans overflow-hidden">
            {/* Header */}
            <div className="bg-[#D71920] px-8 py-6 flex justify-between items-center shadow-2xl z-10 relative">
                <h1 className="text-6xl font-black tracking-tighter uppercase italic text-white">KOMAGENE</h1>
                <div className="text-3xl font-bold bg-white/20 px-6 py-2 rounded-full backdrop-blur-sm text-white">
                    MENÜ & FİYAT LİSTESİ
                </div>
            </div>

            {/* Grid Content */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 h-[calc(100vh-140px)] content-start">
                {Object.entries(grouped).map(([category, items]) => (
                    <div key={category} className="bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 backdrop-blur-sm shadow-sm">
                        <div className="flex items-center gap-3 mb-6 border-b border-primary/10 pb-4">
                            <div className="h-3 w-3 rounded-full bg-[#D71920]" />
                            <h2 className="text-4xl font-bold text-[#D71920] uppercase">{category}</h2>
                        </div>
                        <div className="space-y-5">
                            {items.map((item) => (
                                <div key={item.id} className="flex justify-between items-end group">
                                    <div className="flex-1 border-b border-slate-100 dark:border-zinc-800 pb-1 border-dashed">
                                        <div className="text-3xl font-semibold mb-1 group-hover:text-primary transition-colors">
                                            {item.name}
                                        </div>
                                        {item.description && (
                                            <div className="text-xl text-slate-500 dark:text-zinc-500 font-medium">{item.description}</div>
                                        )}
                                    </div>
                                    <div className="text-4xl font-bold text-[#D71920] bg-primary/5 px-3 py-1 rounded ml-4 whitespace-nowrap">
                                        {item.price} <span className="text-2xl">₺</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer / Ticker */}
            <div className="absolute bottom-0 w-full bg-[#D71920] py-2 overflow-hidden whitespace-nowrap">
                <div className="animate-marquee inline-block text-white/90 font-bold uppercase tracking-widest text-xl">
                    {ticker} &nbsp; • &nbsp; {ticker} &nbsp; • &nbsp; {ticker} &nbsp; • &nbsp; {ticker}
                </div>
            </div>

            <style jsx global>{`
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                }
            `}</style>
        </div>
    );
}
