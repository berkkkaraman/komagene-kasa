"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { usePosStore } from "@/store/usePosStore";
import { productService } from "@/services/productService";
import { MenuGrid } from "@/components/pos/MenuGrid";
import { BasketSidebar } from "@/components/pos/BasketSidebar";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function MenuPage() {
    const { userProfile } = useStore();
    const { setProducts, setCategories, setSearchQuery } = usePosStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (userProfile?.branch_id) {
            loadData();
        }
    }, [userProfile?.branch_id]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [productsData, categoriesData] = await Promise.all([
                productService.fetchProducts(userProfile!.branch_id),
                productService.fetchCategories(userProfile!.branch_id)
            ]);

            setProducts(productsData);
            setCategories(categoriesData);
        } catch (error: any) {
            toast.error("Menü verileri yüklenemedi: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-5rem)] flex flex-col md:flex-row gap-6 mx-auto overflow-hidden animate-fade-in px-4 pb-4">
            {/* Left: Menu Grid (Products) */}
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                {/* Search Bar & Categories (Future) */}
                <div className="relative shrink-0 group">
                    <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Ürün, kategori veya içerik ara..."
                        className="pl-14 h-16 rounded-3xl glass-panel border-white/10 shadow-lg text-lg focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all placeholder:text-muted-foreground/60"
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Grid Area */}
                <div className="flex-1 overflow-hidden relative">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <div className="relative">
                                <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-primary/10 animate-pulse" />
                            </div>
                            <p className="text-sm font-bold text-muted-foreground animate-pulse tracking-widest uppercase">Menü Yükleniyor</p>
                        </div>
                    ) : (
                        <div className="h-full custom-scrollbar overflow-y-auto pr-2">
                            <MenuGrid />
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Basket & Calculator */}
            <div className="w-full md:w-[420px] shrink-0 h-full relative">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent blur-3xl opacity-50 -z-10" />
                <div className="h-full glass-panel border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
                    <BasketSidebar />
                </div>
            </div>
        </div>
    );
}
