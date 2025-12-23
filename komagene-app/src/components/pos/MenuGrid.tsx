"use client";

import { usePosStore } from "@/store/usePosStore";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Product } from "@/types";

export function MenuGrid() {
    const { products, addToBasket, categories, activeCategoryId, setActiveCategory, searchQuery } = usePosStore();

    // Mock Categories if empty (TEMPORARY: Needs DB fetch)
    const displayCategories = categories.length > 0 ? categories : [
        { id: '1', name: 'Dürümler', sort_order: 1 },
        { id: '2', name: 'Menüler', sort_order: 2 },
        { id: '3', name: 'İçecekler', sort_order: 3 },
    ];

    // Mock Products if empty (TEMPORARY)
    const displayProducts = products.length > 0 ? products : [
        { id: 'p1', name: 'Mega Dürüm', price: 120, category_id: '1', is_active: true },
        { id: 'p2', name: 'Ultra Dürüm', price: 150, category_id: '1', is_active: true },
        { id: 'p3', name: 'Ayran', price: 20, category_id: '3', is_active: true },
        { id: 'p4', name: 'Öğrenci Menü', price: 110, category_id: '2', is_active: true },
        // Add minimal mocks to visualize
    ];

    const filteredProducts = displayProducts.filter(p => {
        const matchesCategory = activeCategoryId ? p.category_id === activeCategoryId : true;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Categories Bar */}
            <ScrollArea className="w-full whitespace-nowrap pb-2">
                <div className="flex gap-2">
                    <Button
                        variant={activeCategoryId === null ? "default" : "outline"}
                        onClick={() => setActiveCategory(null)}
                        className="rounded-xl h-10 px-6 font-bold"
                    >
                        Tümü
                    </Button>
                    {displayCategories.sort((a, b) => a.sort_order - b.sort_order).map(cat => (
                        <Button
                            key={cat.id}
                            variant={activeCategoryId === cat.id ? "default" : "outline"}
                            onClick={() => setActiveCategory(cat.id)}
                            className={cn(
                                "rounded-xl h-10 px-6 font-bold border-2 transition-all",
                                activeCategoryId === cat.id
                                    ? "shadow-md scale-105 border-primary"
                                    : "border-transparent bg-white dark:bg-white/5 hover:bg-slate-100"
                            )}
                        >
                            {cat.name}
                        </Button>
                    ))}
                </div>
            </ScrollArea>

            {/* Products Grid */}
            <ScrollArea className="flex-1 pr-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
                    {filteredProducts.map(product => (
                        <Card
                            key={product.id}
                            className="group relative cursor-pointer overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-white/5 hover:-translate-y-1 rounded-2xl"
                            onClick={() => addToBasket(product as Product)}
                        >
                            <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/5 dark:to-white/10 relative">
                                {/* Image placeholder */}
                                <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-20 group-hover:opacity-30 transition-opacity">
                                    🌮
                                </div>
                                <Button
                                    size="icon"
                                    className="absolute bottom-2 right-2 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <CardContent className="p-4">
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-primary transition-colors">
                                    {product.name}
                                </h3>
                                <p className="text-lg font-black text-primary mt-1">
                                    {product.price} ₺
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
