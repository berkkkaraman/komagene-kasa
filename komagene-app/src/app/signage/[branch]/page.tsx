"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenuManager } from "@/components/calculator/MenuManager";
import { Button } from "@/components/ui/button";
import { Settings2, Calculator, List } from "lucide-react";
import { ProductCalculator } from "@/components/calculator/ProductCalculator";

export default function SignagePage() {
    const params = useParams();
    const branchId = params.branch as string;
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        if (!branchId) return;
        loadProducts();

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
                () => {
                    loadProducts();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [branchId]);

    const loadProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('branch_id', branchId)
                .eq('is_active', true)
                .order('category', { ascending: true })
                .order('price', { ascending: true });

            if (data) setProducts(data as Product[]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const grouped = products.reduce((acc, product) => {
        const cat = product.category || 'Diğer';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(product);
        return acc;
    }, {} as Record<string, Product[]>);

    const ticker = "KOMAGENE • Taze Lezzetler • Gerçek Lezzet • %100 Doğal • Hijyenik Üretim • Afiyet Olsun!";

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary text-4xl animate-pulse font-black italic">YÜKLENİYOR...</div>;

    return (
        <div className="min-h-screen bg-background text-foreground font-sans overflow-hidden flex flex-col relative">
            {/* Header */}
            <div className="bg-primary px-10 py-6 flex justify-between items-center shadow-2xl z-20 relative border-b border-primary/20">
                <div className="flex items-center gap-6">
                    <h1 className="text-6xl font-black tracking-tighter uppercase italic text-primary-foreground drop-shadow-lg">KOMAGENE</h1>
                    <div className="h-10 w-1 bg-white/20 rounded-full" />
                    <div className="text-xl font-black bg-white/10 px-6 py-2 rounded-2xl backdrop-blur-md text-white border border-white/10 uppercase italic">
                        Lezzet & Hız Merkezi
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Tabs defaultValue="menu" className="bg-black/20 p-1.5 rounded-2xl backdrop-blur-xl border border-white/10">
                        <TabsList className="bg-transparent h-12 gap-1 px-1">
                            <TabsTrigger value="menu" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:text-primary font-black text-xs uppercase tracking-widest italic transition-all">
                                <List className="w-4 h-4 mr-2" /> Menü Gösterim
                            </TabsTrigger>
                            <TabsTrigger value="calc" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:text-primary font-black text-xs uppercase tracking-widest italic transition-all">
                                <Calculator className="w-4 h-4 mr-2" /> Kasa / Hesap
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsEditMode(true)}
                        className="bg-white/10 hover:bg-white/20 text-white rounded-xl h-12 w-12 border border-white/10"
                    >
                        <Settings2 className="w-6 h-6" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 relative">
                <Tabs defaultValue="menu" className="h-full">
                    <TabsContent value="menu" className="absolute inset-0 p-10 bg-background overflow-hidden m-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 h-full content-start overflow-y-auto custom-scrollbar">
                            {Object.entries(grouped).map(([category, items]) => (
                                <div key={category} className="bg-secondary/30 backdrop-blur-xl border border-border/10 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group hover:border-primary/30 transition-all duration-500">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[4rem] -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors" />
                                    <div className="flex items-center gap-4 mb-8 border-b border-primary/10 pb-4">
                                        <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                                        <h2 className="text-4xl font-black text-primary uppercase italic tracking-tighter">{category}</h2>
                                    </div>
                                    <div className="space-y-6">
                                        {items.map((item) => (
                                            <div key={item.id} className="flex justify-between items-end group/item">
                                                <div className="flex-1 border-b-[2px] border-border/5 pb-2 border-dashed group-hover/item:border-primary/20 transition-all">
                                                    <div className="text-3xl font-black tracking-tighter mb-1 uppercase italic opacity-90 group-hover/item:text-primary transition-colors">
                                                        {item.name}
                                                    </div>
                                                </div>
                                                <div className="text-4xl font-black text-primary bg-primary/5 px-5 py-2 rounded-2xl ml-6 whitespace-nowrap italic tracking-tighter border border-primary/10 shadow-lg shadow-primary/5">
                                                    {item.price} <span className="text-xl not-italic opacity-50 ml-1">₺</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="calc" className="absolute inset-0 p-12 bg-background flex items-center justify-center m-0">
                        <div className="w-full max-w-7xl h-full">
                            <ProductCalculator products={products} />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Footer / Ticker */}
            <div className="bg-primary py-3 overflow-hidden whitespace-nowrap z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.3)] border-t border-white/10">
                <div className="animate-marquee inline-block text-white/95 font-black uppercase tracking-[0.2em] text-2xl italic">
                    {ticker} &nbsp; • &nbsp; {ticker} &nbsp; • &nbsp; {ticker} &nbsp; • &nbsp; {ticker}
                </div>
            </div>

            {/* Menu Manager Modal Overlay */}
            {isEditMode && (
                <div className="fixed inset-0 z-[100] p-12 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-5xl mx-auto h-full overflow-hidden">
                        <MenuManager
                            branchId={branchId}
                            products={products}
                            onRefresh={loadProducts}
                            onClose={() => setIsEditMode(false)}
                        />
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(var(--primary), 0.2);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
