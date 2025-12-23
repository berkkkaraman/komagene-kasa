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
    const { setProducts, setSearchQuery } = usePosStore();
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
        <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6 max-w-[1600px] mx-auto overflow-hidden">
            {/* Left: Menu Grid (Products) */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                {/* Search Bar */}
                <div className="relative shrink-0">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Menüde ara..."
                        className="pl-12 h-14 rounded-2xl bg-white/60 dark:bg-zinc-800/60 border-none shadow-sm text-lg"
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center flex-1">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <MenuGrid />
                )}
            </div>

            {/* Right: Basket & Calculator */}
            <div className="w-full md:w-[400px] shrink-0 h-full">
                <BasketSidebar />
            </div>
        </div>
    );
}
